import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        email: string;
        role: string;
      };

      if (decoded.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};