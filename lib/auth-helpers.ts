import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import type { User } from "@prisma/client";

export async function getServerSession() {
  const session = await auth();
  return session;
};

export async function getCurrentUser(): Promise<User | null> {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  return user;
}

export async function requireAuth(){
    const session = await auth();

    if(!session?.user){
        redirect("/login");
    }

    return session;
}

export async function requireAuthWithUser(): Promise<User> {
    const session = await requireAuth();

    const user = await db.user.findUnique({
        where: { id : session.user.id }
    });

    if(!user) {
        redirect("/login");
    }

    return user;
}

