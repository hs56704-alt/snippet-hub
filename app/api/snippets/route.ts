import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
 
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json() as { title: string; code: string };

  const snippet = await db.snippet.create({
    data: {
      title: body.title,
      code: body.code,
      language: "typescript",
      authorId: session.user.id,
    },
  });

  return NextResponse.json(snippet, { status: 201 });
}