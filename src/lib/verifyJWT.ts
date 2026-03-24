import { verifyToken } from "./auth";
import type { JWTPayload } from "./auth";

export async function verifyJWT(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Unauthorized", status: 401 };
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return { error: "Invalid or expired token", status: 401 };
  }

  return { user: decoded };
}

export function checkRole(user: JWTPayload, roles: string[]) {
  if (!roles.includes(user.role)) {
    return { error: "Forbidden: Insufficient permissions", status: 403 };
  }
  return null;
}
