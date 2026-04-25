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
