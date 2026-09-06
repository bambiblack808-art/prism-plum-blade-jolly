import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { Aperture } from "lucide-react";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending } = useCurrentUserState();

  if (!isPending && user) {
    return <Navigate to="/" />;
  }

  return (
    <main className="booth-shell grid min-h-dvh place-items-center px-4 py-10">
      <div className="relative z-10 w-full max-w-sm">
        <div className="booth-frame rounded-xl p-6 sm:p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <span className="mb-4 grid size-12 place-items-center rounded-lg bg-secondary text-primary">
              <Aperture className="size-6" strokeWidth={1.7} />
            </span>
            <h1 className="font-display text-3xl font-semibold tracking-tight">Flashframe</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Sign in to keep your photo strip private and available on every device.
            </p>
          </div>

          {authEnabled ? (
            <div className="flex flex-col gap-2">
              {GROK_PROVIDERS.map((provider) => (
                <Button
                  key={provider.providerId}
                  type="button"
                  variant="outline"
                  className="h-12 w-full"
                  onClick={() => signIn(provider.providerId, { callbackURL: "/" })}
                >
                  Continue with {provider.label}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">Sign-in is disabled.</p>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Or{" "}
            <Link to="/" className="text-primary underline-offset-4 hover:underline">
              use the booth as a guest
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
