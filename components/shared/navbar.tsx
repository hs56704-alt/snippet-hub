"use client";

import { useSession } from "next-auth/react";

export function Navbar() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-16 animate-pulse bg-muted" />;
  }

  if (status === "unauthenticated") {
    return <nav><a href="/login">Sign In</a></nav>;
  }

  return (
    <nav>
      <span>Hello, {session?.user?.name}</span>
      <span>@{session?.user?.username}</span>
    </nav>
  );
}