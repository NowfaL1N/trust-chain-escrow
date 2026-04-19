import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseServer } from "@/lib/supabase";
import { generateToken } from "@/lib/auth";
import { friendlyMissingTableError, isUniqueViolation } from "@/lib/db-map";
import { isStrongPassword } from "@/lib/security";
import { clientIpFromRequest, isRateLimited } from "@/lib/rate-limit";
import { validateLEI, getCountryConfig, validateCountryIdentifier } from "@/lib/country-identifiers";
import { verifyAndUpdateLEI } from "@/lib/lei-verification";

export const dynamic = "force-dynamic";

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export async function POST(req: Request) {
  try {
    const preview = await req.clone().json().catch(() => ({} as { email?: string }));
    const emailKey = typeof preview.email === "string" ? preview.email.trim().toLowerCase() : "unknown";
    const rlKey = `register:${clientIpFromRequest(req)}:${emailKey}`;
    if (isRateLimited(rlKey, 6, 15 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many registration attempts. Try again later." }, { status: 429 });
    }

    const supabase = getSupabaseServer();
    const body = await req.json();
    const rawEmail = body.email;
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
    const password = body.password;
    const name = body.name;
    const role = body.role === "seller" ? "seller" : "buyer";
    const companyDetails = body.companyDetails;

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!isStrongPassword(String(password))) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character." },
        { status: 400 }
      );
    }

    const { data: existingUser, error: existingErr } = await supabase.from("users").select("id").eq("email", email).maybeSingle();
    const missingUsers = friendlyMissingTableError(existingErr);
    if (missingUsers) {
      return NextResponse.json({ error: missingUsers }, { status: 503 });
    }
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    let companyId: string | null = null;
    if (role === "seller" || role === "buyer") {
      const cd = companyDetails && typeof companyDetails === "object" ? companyDetails : {};
      const companyLegalName = (cd.companyLegalName != null ? String(cd.companyLegalName) : "").trim();
      const cin = (cd.cin != null ? String(cd.cin) : "").trim();
      const gstin = (cd.gstin != null ? String(cd.gstin) : "").trim();
      const pan = (cd.pan != null ? String(cd.pan) : "").trim();
      const businessAddress = (cd.businessAddress != null ? String(cd.businessAddress) : "").trim();
      const country = (cd.country != null ? String(cd.country) : "").trim() || "India";
      const representativeName = (cd.representativeName != null ? String(cd.representativeName) : "").trim();
      const phone = (cd.phone != null ? String(cd.phone) : "").trim();

      // New country-based identifier fields
      const lei = (cd.lei != null ? String(cd.lei) : "").trim().toUpperCase();
      const primaryIdentifier = (cd.primaryIdentifier != null ? String(cd.primaryIdentifier) : "").trim();
      const secondaryIdentifier = (cd.secondaryIdentifier != null ? String(cd.secondaryIdentifier) : "").trim();
      const identifierType = (cd.identifierType != null ? String(cd.identifierType) : "").trim() || country;

      // Validate new country-based identifier fields
      const countryConfig = getCountryConfig(country);
      
      // LEI validation (optional but must be valid if provided)
      if (lei && !validateLEI(lei)) {
        return NextResponse.json(
          { error: "Invalid LEI format. LEI must be exactly 20 alphanumeric characters." },
          { status: 400 }
        );
      }

      // Primary identifier is required
      if (!isNonEmptyString(primaryIdentifier)) {
        const primaryLabel = countryConfig?.primary || "Primary business identifier";
        return NextResponse.json(
          { error: `${primaryLabel} is required.` },
          { status: 400 }
        );
      }

      // Validate primary identifier format
      if (countryConfig?.primaryPattern && !validateCountryIdentifier(primaryIdentifier, countryConfig.primaryPattern)) {
        return NextResponse.json(
          { error: `Invalid ${countryConfig.primary} format.` },
          { status: 400 }
        );
      }

      // Validate secondary identifier format (if provided)
      if (secondaryIdentifier && countryConfig?.secondaryPattern && !validateCountryIdentifier(secondaryIdentifier, countryConfig.secondaryPattern)) {
        return NextResponse.json(
          { error: `Invalid ${countryConfig.secondary} format.` },
          { status: 400 }
        );
      }

      // Basic required field validation (keeping existing for backward compatibility)
      if (
        !isNonEmptyString(companyLegalName) ||
        !isNonEmptyString(businessAddress) ||
        !isNonEmptyString(representativeName) ||
        !isNonEmptyString(phone)
      ) {
        return NextResponse.json(
          {
            error: "Please fill all required company fields: Legal name, Business address, Representative name, and Phone.",
          },
          { status: 400 }
        );
      }

      const { data: company, error: companyErr } = await supabase
        .from("companies")
        .insert({
          company_legal_name: companyLegalName,
          // Legacy fields for backward compatibility (now optional)
          cin: secondaryIdentifier || cin || null,
          gstin: primaryIdentifier || gstin || null,
          pan: pan || null,
          // New country-based identifier fields
          lei: lei || null,
          lei_verified: false,
          identifier_type: identifierType,
          primary_identifier: primaryIdentifier,
          secondary_identifier: secondaryIdentifier || null,
          // Other fields
          business_address: businessAddress,
          country,
          company_email: email,
          website: cd.website ? String(cd.website).trim() : null,
          email_domain: cd.emailDomain ? String(cd.emailDomain).trim() : null,
          representative_name: representativeName,
          representative_role: cd.representativeRole ? String(cd.representativeRole).trim() : null,
          phone,
          verified: false,
        })
        .select("id")
        .single();

      if (companyErr) {
        const missing = friendlyMissingTableError(companyErr);
        if (missing) {
          return NextResponse.json({ error: missing }, { status: 503 });
        }
        if (isUniqueViolation(companyErr)) {
          return NextResponse.json(
            { error: "A company with this CIN, GSTIN, or PAN is already registered." },
            { status: 400 }
          );
        }
        console.error("Company insert:", companyErr);
        return NextResponse.json({ error: companyErr.message || "Invalid company details." }, { status: 400 });
      }
      companyId = company!.id;

      // Optional: Verify LEI if provided (runs in background, doesn't block registration)
      if (lei) {
        verifyAndUpdateLEI(supabase, companyId, lei).catch(error => {
          console.warn("LEI verification failed:", error);
          // Don't fail registration if LEI verification fails
        });
      }
    }

    const { data: user, error: userErr } = await supabase
      .from("users")
      .insert({
        email,
        password: hashedPassword,
        name,
        role,
        company_id: companyId,
      })
      .select("id, email, name, role, company_id")
      .single();

    if (userErr || !user) {
      const missing = friendlyMissingTableError(userErr);
      if (missing) {
        return NextResponse.json({ error: missing }, { status: 503 });
      }
      console.error("User insert:", userErr);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as "buyer" | "seller",
      companyId: user.company_id ?? undefined,
    });

    const userRole = user.role === "seller" ? "seller" : "buyer";
    const response = NextResponse.json(
      {
        token,
        user: {
          id: String(user.id),
          email: String(user.email),
          name: String(user.name ?? ""),
          role: userRole,
          companyId: user.company_id ? String(user.company_id) : undefined,
        },
      },
      { status: 201 }
    );
    response.cookies.set("escrow_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });
    return response;
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
