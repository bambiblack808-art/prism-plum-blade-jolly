import { createFileRoute } from "@tanstack/react-router";
import { PhotoBooth } from "@/components/booth/photo-booth";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <PhotoBooth />;
}
