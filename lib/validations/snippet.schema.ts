import { z } from "zod";

export const SUPPORTED_LANGUAGES = [
  "typescript",
  "javascript",
  "python",
  "rust",
  "go",
  "java",
  "cpp",
  "c",
  "csharp",
  "php",
  "ruby",
  "swift",
  "kotlin",
  "sql",
  "html",
  "css",
  "bash",
  "json",
  "yaml",
  "markdown",
] as const;

export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const createSnippetSchema = z.object({

    title : z
    .string()
    .trim()
    .min(3, "Title must be atleast 3 characters")
    .max(100, "Title must be under 100 characters"),

    description : z
    .string()
    .trim()
    .max(500, "Description must be under 500 characters")
    .optional()
    .default(""),

    code: z
    .string()
    .min(1, "Code cannot be empty")
    .max(10000, "Code must be under 10,000 characters"),

    language: z.enum(
        [SUPPORTED_LANGUAGES[0], ...SUPPORTED_LANGUAGES.slice(1)]
    ),

    tags : z
    .array(
        z
        .string()
        .trim()
        .toLowerCase()
        .min(1, "Tag cannot be empty")
        .max(20, "Each tag must be under 20 characters")
        .regex(/^[a-z0-9-]+$/, "Tags can only contains letters, numbers, and hyphens")
    )
    .max(5, "You can add at most 5 tags")
    .default([]),
});

export const updateSnippetSchema = createSnippetSchema.partial();

export type CreateSnippetSchema = z.infer<typeof createSnippetSchema>;
export type UpdateSnippetSchema = z.infer<typeof updateSnippetSchema>;