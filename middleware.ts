import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isCashierRoute = nextUrl.pathname.startsWith("/cashier");
  const isAuthRoute = nextUrl.pathname.startsWith("/login");

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return null;
  }

  if (!isLoggedIn && (isAdminRoute || isCashierRoute)) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isAdminRoute && req.auth?.user && (req.auth.user as any).role !== "ADMIN") {
    return NextResponse.redirect(new URL("/cashier", nextUrl));
  }

  return null;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
