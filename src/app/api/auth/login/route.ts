import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseServer } from "@/lib/supabase";
import { generateToken } from "@/lib/auth";
import { clientIpFromRequest, isRateLimited } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const emailFromBody = await req.clone().json().catch(() => ({} as { email?: string }));
    const emailKey = typeof emailFromBody.email === "string" ? emailFromBody.email.trim().toLowerCase() : "unknown";
    const rlKey = `login:${clientIpFromRequest(req)}:${emailKey}`;
    if (isRateLimited(rlKey, 8, 15 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many login attempts. Try again later." }, { status: 429 });
    }

    const supabase = getSupabaseServer();
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, password, name, role, company_id")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("Login query:", error);
      return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: "USER_NOT_FOUND", message: "Account does not exist" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as "buyer" | "seller",
      companyId: user.company_id ?? undefined,
    });

    const role = user.role === "seller" ? "seller" : "buyer";
    const response = NextResponse.json({
      token,
      user: {
        id: String(user.id),
        email: String(user.email),
        name: String(user.name ?? ""),
        role,
        companyId: user.company_id ? String(user.company_id) : undefined,
      },
    });
    response.cookies.set("escrow_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });
    return response;
  } catch (error) {
    console.error("Auth API Error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
