"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helpers";
import {
  createSnippetSchema,
  updateSnippetSchema,
} from "@/lib/validations/snippet.schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import type { Prisma } from "@prisma/client";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string[]>; message?: string };

export async function createSnippet(
  formData: FormData
): Promise<ActionResult<{ snippetId: string }>> {
  
  const session = await requireAuth()

  const rawData = {
    title: formData.get("title"),
    description: formData.get("description"),
    code: formData.get("code"),
    language: formData.get("language"),
    tags: JSON.parse((formData.get("tags") as string) || "[]"),
  };

  const validated =  createSnippetSchema.safeParse(rawData);

  if(!validated.success){
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      message: "Please fix the errors below.",
    };
  }

  const { title, description, code, language, tags } = validated.data;

  try{
    const snippet = await db.$transaction(async (tx : Prisma.TransactionClient) => {
      const tagRecords = await Promise.all(
        tags.map((tagName) =>
          tx.tag.upsert({
            where: { name: tagName },
            update: {}, 
            create: { name: tagName },
          })
        )
      );

    return tx.snippet.create({
        data: {
          title,
          description,
          code,
          language,
          authorId: session.user.id,
          tags: {
            create: tagRecords.map((tag) => ({
              tag: { connect: { id: tag.id } },
            })),
          },
        },
      });
    });

    revalidatePath("/feed", "layout");
    revalidatePath("/snippets", "layout");
    revalidatePath(`/profile/${session.user.username}`, "page");

    return { success: true, data: { snippetId: snippet.id } };
  }
  catch (error) {
    console.error("[createSnippet] Database error:", error);

    return {
      success: false,
      errors: {},
      message: "Failed to create snippet. Please try again.",
    };
  }
}

export async function updateSnippet(
  id: string,
  formData: FormData
): Promise<ActionResult<{ snippetId: string }>> {
  const session = await requireAuth();

  const existingSnippet = await db.snippet.findUnique({
    where: { id },
    select: { authorId: true }, 
  });

  if (!existingSnippet) {
    return {
      success: false,
      errors: {},
      message: "Snippet not found.",
    };
  }

  if (existingSnippet.authorId !== session.user.id) {
    return {
      success: false,
      errors: {},
      message: "You are not authorized to edit this snippet.",
    };
  }

  const rawData = {
    title: formData.get("title") ?? undefined,
    description: formData.get("description") ?? undefined,
    code: formData.get("code") ?? undefined,
    language: formData.get("language") ?? undefined,
    tags: JSON.parse((formData.get("tags") as string) || "[]"),
  };

  const validated = updateSnippetSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      message: "Please fix the errors below.",
    };
  }

  const { tags, ...snippetData } = validated.data;

  try {
    const snippet = await db.$transaction(async (tx : Prisma.TransactionClient) => {
      if (tags !== undefined) {
        await tx.snippetTag.deleteMany({ where: { snippetId: id } });
        
        const tagRecords = await Promise.all(
          tags.map((tagName) =>
            tx.tag.upsert({
              where: { name: tagName },
              update: {},
              create: { name: tagName },
            })
          )
        );

        return tx.snippet.update({
          where: { id },
          data: {
            ...snippetData,
            tags: {
              create: tagRecords.map((tag) => ({
                tag: { connect: { id: tag.id } },
              })),
            },
          },
        });
      }

      return tx.snippet.update({
        where: { id },
        data: snippetData,
      });
    });

    revalidatePath("/feed", "layout");
    revalidatePath("/snippets", "layout");
    revalidatePath(`/snippets/${id}`, "page");
    revalidatePath(`/profile/${session.user.username}`, "page");

    return { success: true, data: { snippetId: snippet.id } };
  } catch (error) {
    console.error("[updateSnippet] Database error:", error);
    return {
      success: false,
      errors: {},
      message: "Failed to update snippet. Please try again.",
    };
  }
}

export async function deleteSnippet(
  id: string
): Promise<ActionResult> {
  const session = await requireAuth();

  
  const existingSnippet = await db.snippet.findUnique({
    where: { id },
    select: { authorId: true },
  });

  if (!existingSnippet) {
    return { success: false, errors: {}, message: "Snippet not found." };
  }

  if (existingSnippet.authorId !== session.user.id) {
    return {
      success: false,
      errors: {},
      message: "You are not authorized to delete this snippet.",
    };
  }

  try {
    await db.snippet.delete({ where: { id } });

    revalidatePath("/feed", "layout");
    revalidatePath("/snippets", "layout");
    revalidatePath(`/profile/${session.user.username}`, "page");

    redirect("/snippets");
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    console.error("[deleteSnippet] Database error:", error);
    return {
      success: false,
      errors: {},
      message: "Failed to delete snippet. Please try again.",
    };
  }
}





