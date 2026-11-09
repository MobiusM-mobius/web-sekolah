import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

const credentialsSchema = z.object({
  email: z.email().transform((email) => email.toLowerCase().trim()),
  password: z.string().min(1).max(128),
});
const dummyPasswordHash = "$2b$12$8owK3bo5f2Emc9qxzp.5z.2wA1JBQ1YPjoPMptEs3TtHX2RxlgpR2";

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/admin/login" },
  providers: [
    CredentialsProvider({
      credentials: { email: {}, password: { type: "password" } },
      async authorize(input, request) {
        const parsed = credentialsSchema.safeParse(input);
        if (!parsed.success) return null;
        const ip = request.headers?.["x-real-ip"] ?? request.headers?.["x-forwarded-for"] ?? "unknown";
        const limit = await checkRateLimit(`admin-login:${ip}:${parsed.data.email}`, 10, 15 * 60 * 1000);
        if (!limit.allowed) return null;
        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
          include: { role: true },
        });
        const passwordMatches = await compare(parsed.data.password, user?.passwordHash ?? dummyPasswordHash);
        if (!user?.active || !passwordMatches) return null;
        return { id: user.id, name: user.name, email: user.email, role: user.role.name };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as import("@prisma/client").AppRole;
      }
      return session;
    },
  },
};

export function auth() {
  return getServerSession(authOptions);
}
