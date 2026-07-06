import { createFileRoute } from "@tanstack/react-router";
import App from "../App";

// No head() here: inherits title/meta from __root.tsx
// Title and OG tags are managed centrally in __root.tsx
export const Route = createFileRoute("/")(
  { component: App }
);
