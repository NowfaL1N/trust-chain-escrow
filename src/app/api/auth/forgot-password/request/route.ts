import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseServer } from "@/lib/supabase";
import { sendPasswordResetOtpEmail } from "@/lib/email";
import { generatePasswordResetToken } from "@/lib/auth";
import { clientIpFromRequest, isRateLimited } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

function generateOtp(): string {
  return String(crypto.randomInt(100000, 999999));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }
    if (isRateLimited(`forgot-request:${clientIpFromRequest(req)}:${email}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
    }

    const supabase = getSupabaseServer();
    const { data: user, error: userErr } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();

    if (userErr) {
      console.error("Forgot password user lookup error:", userErr);
      return NextResponse.json({ error: "Failed to process request." }, { status: 500 });
    }

    // Do not reveal whether user exists.
    if (!user) {
      return NextResponse.json({ success: true, message: "If the email exists, an OTP has been sent." });
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const resetToken = generatePasswordResetToken({ email, otpHash });

    await sendPasswordResetOtpEmail(email, otp);
    return NextResponse.json({
      success: true,
      message: "If the email exists, an OTP has been sent.",
      resetToken,
    });
  } catch (err) {
    console.error("Forgot password request error:", err);
    return NextResponse.json({ error: "Failed to process request." }, { status: 500 });
  }
}
