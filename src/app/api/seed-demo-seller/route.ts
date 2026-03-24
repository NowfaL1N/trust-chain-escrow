import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseServer } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const SELLER_EMAIL = "sreeharisreehari611@gmail.com";
const SELLER_PASSWORD = "Seller@123";

function isSeedAuthorized(request: Request): boolean {
  const key = (process.env.SEED_ADMIN_KEY || "").trim();
  if (!key) return process.env.NODE_ENV !== "production";
  return request.headers.get("x-admin-key") === key;
}

export async function POST(request: Request) {
  try {
    if (!isSeedAuthorized(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const supabase = getSupabaseServer();

    const { data: existingUser, error: findErr } = await supabase
      .from("users")
      .select("id, company_id")
      .eq("email", SELLER_EMAIL)
      .maybeSingle();

    if (findErr) {
      console.error("Seed find user:", findErr);
      return NextResponse.json({ error: "Failed to create seller" }, { status: 500 });
    }

    if (existingUser) {
      if (existingUser.company_id) {
        await supabase
          .from("companies")
          .update({
            company_legal_name: "TrustChain Verified Supplier",
            company_email: SELLER_EMAIL,
            representative_name: "Verified Seller",
            representative_role: "Owner",
            business_address: "Verified Supplier Address",
            country: "India",
            cin: "VERIFIED-CIN-001",
            gstin: "VERIFIED-GSTIN-001",
            pan: "VERIFIEDPAN001",
            phone: "+919876543210",
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingUser.company_id);
      }
      await supabase.from("users").update({ name: "Verified Seller" }).eq("id", existingUser.id);
      return NextResponse.json({
        success: true,
        message: "Seller already exists; updated to verified supplier.",
        email: SELLER_EMAIL,
      });
    }

    const { data: company, error: compErr } = await supabase
      .from("companies")
      .insert({
        company_legal_name: "TrustChain Verified Supplier",
        cin: "VERIFIED-CIN-001",
        gstin: "VERIFIED-GSTIN-001",
        pan: "VERIFIEDPAN001",
        business_address: "Verified Supplier Address",
        country: "India",
        company_email: SELLER_EMAIL,
        representative_name: "Verified Seller",
        representative_role: "Owner",
        phone: "+919876543210",
        verified: false,
      })
      .select("id")
      .single();

    if (compErr || !company) {
      console.error("Seed company:", compErr);
      return NextResponse.json({ error: "Failed to create seller" }, { status: 500 });
    }

    const hashedPassword = await bcrypt.hash(SELLER_PASSWORD, 12);
    const { error: userErr } = await supabase.from("users").insert({
      email: SELLER_EMAIL,
      password: hashedPassword,
      name: "Verified Seller",
      role: "seller",
      company_id: company.id,
    });

    if (userErr) {
      console.error("Seed user:", userErr);
      return NextResponse.json({ error: "Failed to create seller" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Seller created. Use this account to sign in and receive JWT/verification emails.",
      email: SELLER_EMAIL,
      password: SELLER_PASSWORD,
    });
  } catch (err) {
    console.error("Seed seller error:", err);
    return NextResponse.json({ error: "Failed to create seller" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  if (!isSeedAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    message: "POST to this URL to create or update the seller (sreeharisreehari611@gmail.com).",
    email: SELLER_EMAIL,
  });
}
