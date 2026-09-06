import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast: "bg-card text-card-foreground border-border font-sans",
        },
      }}
    />
  );
}
