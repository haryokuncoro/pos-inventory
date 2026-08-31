import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Deliberately a cookie presence check rather than a session lookup: importing
 * lib/auth here would pull the database driver into the middleware bundle,
 * which serverExternalPackages does not cover, breaking PGlite's relative
 * resolution of its wasm assets on the desktop build.
 *
 * This is an optimistic redirect only. Authorization is still validated
 * server-side on every dashboard page via checkPermission().
 */
export function middleware(request: NextRequest) {
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
