import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authenticate } from "../server/authenticate";

export const authConfig = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: {
    signIn: "/login",
  },
  providers: (["STUDENT", "ADMIN"] as const).map((role) =>
    Credentials({
      id: role === "ADMIN" ? "admin-credentials" : "student-credentials",
      name: role === "ADMIN" ? "Admin" : "Student",
      credentials: {
        email: { label: "Email or username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: (credentials) => authenticate(credentials, role),
    }),
  ),
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as typeof user & { role?: string }).role;
        token.authVersion = (user as typeof user & { authVersion?: number }).authVersion;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || "";
        session.user.authVersion = typeof token.authVersion === "number" ? token.authVersion : -1;
        session.user.role = (token.role as string) || "STUDENT";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
