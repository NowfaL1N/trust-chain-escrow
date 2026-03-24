import { NextResponse } from "next/server";
import { sendSupportContactEmail } from "@/lib/email";
import { clientIpFromRequest, isRateLimited } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type ContactBody = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

export async function POST(request: Request) {
  try {
    if (isRateLimited(`support:${clientIpFromRequest(request)}`, 8, 15 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many messages. Try again later." }, { status: 429 });
    }
    const body = (await request.json()) as ContactBody;
    const name = (body.name || "").trim();
    const email = (body.email || "").trim();
    const subject = (body.subject || "").trim();
    const message = (body.message || "").trim();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (name.length > 120 || email.length > 320 || subject.length > 200 || message.length > 4000) {
      return NextResponse.json({ error: "Input too long." }, { status: 400 });
    }

    await sendSupportContactEmail({ name, email, subject, message });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Support contact API error:", err);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}
