import type { NextAuthConfig } from "next-auth";

export const authConfig = {

  providers: [], // Empty for Edge compatibility
  callbacks: {

    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnProtected = nextUrl.pathname.startsWith("/admin") || nextUrl.pathname.startsWith("/kasir");
      if (isOnProtected) {
        if (isLoggedIn) return true;
        return false; // Redirects to /login
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
} satisfies NextAuthConfig;
