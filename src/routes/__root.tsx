import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFFDF5] px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-[#3D2B1F]">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-[#3D2B1F]">Page not found</h2>
        <p className="mt-2 text-sm text-[#6B5B3F]">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-[#1E40AF] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#1E3A8A]"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFFDF5] px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-[#3D2B1F]">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-[#6B5B3F]">
          Something went wrong. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-xl bg-[#1E40AF] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#1E3A8A]"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-[#D4CBB8] bg-white px-4 py-2 text-sm font-bold text-[#3D2B1F] transition-colors hover:bg-[#FEF9E7]"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: "MedScribe IM — Internal Medicine AI Prescription Generator" },
        {
          name: "description",
          content:
            "AI-assisted prescription generator for Internal Medicine, Cardiology, Pulmonology, Nephrology, Endocrinology and more. Powered by Groq LLaMA-3.3-70B.",
        },
        { name: "author", content: "MedScribe IM" },
        { property: "og:title", content: "MedScribe IM — Internal Medicine AI" },
        {
          property: "og:description",
          content:
            "Generate evidence-based internal medicine prescriptions in seconds with AI.",
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      ],
    }),
    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  }
);

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
