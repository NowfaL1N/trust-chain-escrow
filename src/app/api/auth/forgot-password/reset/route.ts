import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { getSupabaseServer } from "@/lib/supabase";
import { verifyPasswordResetToken } from "@/lib/auth";
import { clientIpFromRequest, isRateLimited } from "@/lib/rate-limit";
import { isStrongPassword } from "@/lib/security";

export const dynamic = "force-dynamic";

function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const otp = typeof body?.otp === "string" ? body.otp.trim() : "";
    const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";
    const resetToken = typeof body?.resetToken === "string" ? body.resetToken.trim() : "";

    if (!email || !otp || !newPassword || !resetToken) {
      return NextResponse.json({ error: "Email, OTP, reset token, and new password are required." }, { status: 400 });
    }
    if (isRateLimited(`forgot-reset:${clientIpFromRequest(req)}:${email}`, 10, 15 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
    }
    if (!isStrongPassword(newPassword)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character." },
        { status: 400 }
      );
    }

    const payload = verifyPasswordResetToken(resetToken);
    if (!payload || payload.email !== email) {
      return NextResponse.json({ error: "Invalid or expired OTP." }, { status: 400 });
    }

    const isOtpValid = hashOtp(otp) === payload.otpHash;
    if (!isOtpValid) {
      return NextResponse.json({ error: "Invalid or expired OTP." }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    const hashed = await bcrypt.hash(newPassword, 12);
    const { error: updateErr } = await supabase.from("users").update({ password: hashed }).eq("email", email);
    if (updateErr) {
      console.error("Forgot password user update error:", updateErr);
      return NextResponse.json({ error: "Failed to reset password." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Password updated successfully." });
  } catch (err) {
    console.error("Forgot password reset error:", err);
    return NextResponse.json({ error: "Failed to reset password." }, { status: 500 });
  }
}
