import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Edge-compatible JWT verify (jsonwebtoken does not work in Edge runtime)
async function verifyTokenEdge(token: string): Promise<{ role?: string } | null> {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing required environment variable: JWT_SECRET");
  }
  try {
    const key = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, key);
    return payload as { role?: string };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("escrow_token")?.value;

    const redirectToLogin = () => {
      const loginUrl = new URL("/login", request.url);
      if (pathname.startsWith("/dashboard/buyer")) loginUrl.searchParams.set("role", "buyer");
      else if (pathname.startsWith("/dashboard/seller")) loginUrl.searchParams.set("role", "seller");
      return NextResponse.redirect(loginUrl);
    };

    if (!token) {
      return redirectToLogin();
    }

    const payload = await verifyTokenEdge(token);
    if (!payload || (payload.role !== "buyer" && payload.role !== "seller")) {
      return redirectToLogin();
    }

    if (pathname.startsWith("/dashboard/buyer") && payload.role !== "buyer") {
      return NextResponse.redirect(new URL("/dashboard/seller", request.url));
    }
    if (pathname.startsWith("/dashboard/seller") && payload.role !== "seller") {
      return NextResponse.redirect(new URL("/dashboard/buyer", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
