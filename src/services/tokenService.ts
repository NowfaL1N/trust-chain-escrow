/**
 * Token Service
 * Generates and verifies escrow transaction tokens.
 *
 * Activate this when MongoDB backend is connected:
 * - Replace localStorage with JWT generation via jsonwebtoken
 * - Store tokens in transactions collection
 * - Add expiry logic server-side
 */

export type EscrowTokens = {
  buyerToken: string;
  sellerToken: string;
  createdAt: string;
  transactionId: string;
};

const STORAGE_KEY = "escrow_tokens";

function generateSegment(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let seg = "";
  for (let i = 0; i < 4; i++) {
    seg += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return seg;
}

function generateToken(): string {
  return `ESCROW-${generateSegment()}-${generateSegment()}-${generateSegment()}`;
}

export function generateTokenPair(): EscrowTokens {
  const tokens: EscrowTokens = {
    buyerToken: generateToken(),
    sellerToken: generateToken(),
    createdAt: new Date().toISOString(),
    transactionId: `TXN-${Date.now()}`,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  return tokens;
}

export function getStoredTokens(): EscrowTokens | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function verifyBuyerToken(input: string): boolean {
  const tokens = getStoredTokens();
  if (!tokens) return false;
  return tokens.buyerToken === input.trim();
}

export function verifySellerToken(input: string): boolean {
  const tokens = getStoredTokens();
  if (!tokens) return false;
  return tokens.sellerToken === input.trim();
}

export function clearTokens(): void {
  localStorage.removeItem(STORAGE_KEY);
}
