import { NextResponse } from "next/server";
import { generateTransactionToken } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";

const DEMO_EMAIL = "sreeharisreehari611@gmail.com";

/**
 * Sends a test verification email to the demo seller address so you can
 * confirm JWT/token emails are being delivered.
 * GET or POST /api/test-verification-email
 * Add ?check=1 to see if SMTP_* env vars are loaded (no values shown).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("check") === "1") {
    return NextResponse.json({
      env: {
        SMTP_HOST: !!(process.env.SMTP_HOST || "").trim(),
        SMTP_PORT: !!(process.env.SMTP_PORT || "").trim(),
        SMTP_USER: !!(process.env.SMTP_USER || "").trim(),
        SMTP_PASS: !!(process.env.SMTP_PASS || "").trim(),
        SMTP_FROM: !!(process.env.SMTP_FROM || "").trim(),
      },
      hint: "All true = .env.local is loaded. Any false = add that key to .env.local in project root and restart the server.",
    });
  }
  return sendTestEmail();
}

export async function POST() {
  return sendTestEmail();
}

async function sendTestEmail() {
  try {
    const token = generateTransactionToken({
      transactionId: "TXN-TEST-DEMO",
      role: "seller",
      email: DEMO_EMAIL,
    });
    await sendVerificationEmail(DEMO_EMAIL, token, "seller");
    return NextResponse.json({
      success: true,
      message: `Test verification email sent to ${DEMO_EMAIL}. Check the inbox (and spam).`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Test verification email error:", err);
    return NextResponse.json(
      {
        error: "Failed to send test email.",
        detail: message,
        hint: "Check .env.local (SMTP_*), restart the dev server, and ensure your SMTP provider (e.g. Gmail) allows sending from this account.",
      },
      { status: 500 }
    );
  }
}
