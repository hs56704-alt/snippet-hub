"use server";

import { requireAuth } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export async function createSnippet(formData: FormData) {
 
  const session = await requireAuth();

  const title = formData.get("title") as string;
  const code = formData.get("code") as string;

  const snippet = await db.snippet.create({
    data: {
      title,
      code,
      language: "typescript",
      authorId: session.user.id, 
    },
  });

  return snippet;
}