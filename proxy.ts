import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);


export default auth((req) => {
  // Bypass login untuk sementara
  return null;
  
  const isLoggedIn = !!req.auth;
  // ... rest of the code is effectively disabled
});


export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
