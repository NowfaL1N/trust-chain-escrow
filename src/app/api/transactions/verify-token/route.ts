import { NextResponse } from "next/server";
import { verifyTransactionToken } from "@/lib/auth";

type VerifyBody = {
  token?: string;
  role?: "buyer" | "seller";
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VerifyBody;
    const rawToken = (body.token || "").trim();
    const expectedRole = body.role;

    if (!rawToken) {
      return NextResponse.json({ valid: false, error: "TOKEN_REQUIRED" }, { status: 400 });
    }

    const payload = verifyTransactionToken<Record<string, unknown>>(rawToken);
    if (!payload) {
      return NextResponse.json({ valid: false, error: "INVALID_OR_EXPIRED" }, { status: 400 });
    }

    if (expectedRole && typeof payload.role === "string" && payload.role !== expectedRole) {
      return NextResponse.json({ valid: false, error: "ROLE_MISMATCH" }, { status: 400 });
    }

    return NextResponse.json({ valid: true, payload });
  } catch (err) {
    console.error("Verify transaction token error:", err);
    return NextResponse.json({ valid: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}

