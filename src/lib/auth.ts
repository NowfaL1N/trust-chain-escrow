import jwt from "jsonwebtoken";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const JWT_SECRET = getRequiredEnv("JWT_SECRET");

export interface JWTPayload {
  userId: string;
  email: string;
  role: "buyer" | "seller";
  companyId?: string;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function generateTransactionToken(payload: Record<string, unknown>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyTransactionToken<T extends Record<string, unknown> = Record<string, unknown>>(
  token: string
): T | null {
  try {
    return jwt.verify(token, JWT_SECRET) as T;
  } catch {
    return null;
  }
}

type PasswordResetPayload = {
  email: string;
  otpHash: string;
};

export function generatePasswordResetToken(payload: PasswordResetPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "10m" });
}

export function verifyPasswordResetToken(token: string): PasswordResetPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as PasswordResetPayload;
  } catch {
    return null;
  }
}
