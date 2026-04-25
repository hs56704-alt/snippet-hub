import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(db),

  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({user}){
        if (!user.email) return false;
        return true;
    },

    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        
      const dbUser = user as {
        username?: string | null;
        email: string;
        id: string;
      };
      if (!dbUser.username){
        const baseUsername = dbUser.email
          .split("@")[0]
          .toLowerCase()
          .replace(/[^a-z0-9]/g,"");

          const existingUsername = await db.user.findUnique({
            where: { username: baseUsername },
          });

          const finalUsername = existingUsername
            ? `${baseUsername}${Math.floor(1000 + Math.random() * 9000)}`
            : baseUsername;

          await db.user.update({
            where: { id: dbUser.id },
            data : { username : finalUsername },
          });

          session.user.username = finalUsername;
      } else {
        session.user.username = dbUser.username;
      }
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
};

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);