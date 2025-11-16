import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCookie } from "cookies-next";

// Middleware is now a pass-through - all routes are publicly accessible
export function middleware(request: NextRequest) {
  const userId = getCookie("userId", { req: request });

  if (!userId && request.url !== "http://localhost:3000/" && !request.url.includes("/login") && !request.url.includes("/register")) {
    // User is not authenticated; you can redirect them to login if needed
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
