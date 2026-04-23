import type { DefaultSession } from "next-auth";
import type { AdapterUser } from "next-auth/adapters";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
    } & DefaultSession["user"];
  }
}

// Tell NextAuth that AdapterUser also has a username field
declare module "next-auth/adapters" {
  interface AdapterUser {
    username: string;
  }
}