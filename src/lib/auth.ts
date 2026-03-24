import jwt from "jsonwebtoken";

function getJwtSecret(): string {
  const value = process.env.JWT_SECRET;
  if (!value) {
    throw new Error("Missing required environment variable: JWT_SECRET");
  }
  return value;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: "buyer" | "seller";
  companyId?: string;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as JWTPayload;
  } catch {
    return null;
  }
}

export function generateTransactionToken(payload: Record<string, unknown>): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "30d" });
}

export function verifyTransactionToken<T extends Record<string, unknown> = Record<string, unknown>>(
  token: string
): T | null {
  try {
    return jwt.verify(token, getJwtSecret()) as T;
  } catch {
    return null;
  }
}

type PasswordResetPayload = {
  email: string;
  otpHash: string;
};

export function generatePasswordResetToken(payload: PasswordResetPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "10m" });
}

export function verifyPasswordResetToken(token: string): PasswordResetPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as PasswordResetPayload;
  } catch {
    return null;
  }
}
