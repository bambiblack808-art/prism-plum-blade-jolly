import { Link } from "@tanstack/react-router";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function AuthSlot() {
  const { user, isPending } = useCurrentUserState();

  if (isPending) {
    return <Skeleton className="h-11 w-36 rounded-full" />;
  }

  if (user) {
    return (
      <div className="auth-chip flex min-h-11 max-w-[min(100%,18rem)] items-center rounded-full border border-border bg-card px-3 py-1 text-sm">
        <UserButton />
      </div>
    );
  }

  return (
    <Button asChild variant="outline" size="sm" className="rounded-full px-4">
      <Link to="/login">Sign in</Link>
    </Button>
  );
}
