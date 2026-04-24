import { requireAuth } from "@/lib/auth-helpers";

export default async function FeedPage() {
  
  const session = await requireAuth();

  return (
    <div>
      <h1>Welcome back, {session.user.name}!</h1>
      <p>Your user ID is: {session.user.id}</p>
      {/* Render feed content here */}
    </div>
  );
}