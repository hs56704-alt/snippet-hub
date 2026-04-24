import { LoginForm } from "@/components/auth/LoginForm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

interface LoginPageProps {
    searchParams: Promise<{
        error?: string;
        callbackUrl?: string;
    }>
}

export default async function LoginPage({ searchParams } : LoginPageProps) {
    const session = await auth();
    if (session?.user){
        redirect("/feed");
    }

    const params = await searchParams;
    const callbackUrl = params.callbackUrl ?? "/feed";

    const errorMessages : Record<string , string> = {
        OAuthSignin : "Error starting the sign-in process.Please try again.",
        OAuthCallback : "Error during OAuth callback. Please try again.",
        OAuthAccountNotLinked : "This email is already linked to another provider.Sign in with the original provider.",
        default : "An unexpected error occurred.Please try again.",
    };

    const errorMessage = params.error ? (errorMessages[params.error] ?? errorMessages.default) : null;

    return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-4">
        
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome to SnippetHub
          </h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to share and discover code snippets
          </p>
        </div>

        
        {errorMessage && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4">
            <p className="text-sm text-destructive text-center">
              {errorMessage}
            </p>
          </div>
        )}

       
        <LoginForm callbackUrl={callbackUrl} />

        <p className="text-center text-xs text-muted-foreground">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}