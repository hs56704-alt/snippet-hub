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

        try{
            const existingUser = await db.user.findUnique({
                where : { email : user.email},
            });

            if(existingUser && !existingUser.username){
                const baseUsername = user.email
                .split("@")[0]
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "");
            

            const existingUsername = await db.user.findUnique({
                where: { username : baseUsername },
            });

            const finalUsername = existingUsername
                                  ? `${baseUsername}${Math.floor(1000 + Math.random() * 9000)}`
                                  : baseUsername;

            await db.user.update({
                where : { email: user.email },
                data: { username : finalUsername },
            })
        }
        return true;
    } catch (error) {
        console.error("SignIn callback error:", error);
        return false;
    }
},
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.username = (user as { username : string }).username;
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