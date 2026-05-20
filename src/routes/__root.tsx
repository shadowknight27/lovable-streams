import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  Link,
} from "@tanstack/react-router";

import { useEffect } from "react";
import appCss from "../styles.css?url";
import { Sidebar } from "@/components/Sidebar";
import { useSpatialNav, consumeRememberedFocus } from "@/hooks/useSpatialNav";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-black text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <div className="mt-6">
          <Link to="/" className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "StreamFlix — Movies, TV & Hindi Dubs" },
      { name: "description", content: "Stream trending Bollywood, Marvel & Disney blockbusters and Hindi dubbed movies." },
      { property: "og:title", content: "StreamFlix — Movies, TV & Hindi Dubs" },
      { name: "twitter:title", content: "StreamFlix — Movies, TV & Hindi Dubs" },
      { property: "og:description", content: "Stream trending Bollywood, Marvel & Disney blockbusters and Hindi dubbed movies." },
      { name: "twitter:description", content: "Stream trending Bollywood, Marvel & Disney blockbusters and Hindi dubbed movies." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/01b8ed53-f5d7-422b-863b-ab9ffc66d6e9/id-preview-dc013867--4d7d8c99-3dec-40ba-8047-aeeabb5e0cd9.lovable.app-1779251307968.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/01b8ed53-f5d7-422b-863b-ab9ffc66d6e9/id-preview-dc013867--4d7d8c99-3dec-40ba-8047-aeeabb5e0cd9.lovable.app-1779251307968.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useSpatialNav();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    // On any route change (e.g., returning from /watch), restore focus to last card.
    const id = consumeRememberedFocus();
    if (!id) return;
    let tries = 0;
    const tick = () => {
      const el = document.querySelector<HTMLElement>(`[data-focus-id="${id}"]`);
      if (el) {
        el.focus({ preventScroll: true });
        el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
        return;
      }
      if (tries++ < 25) setTimeout(tick, 150);
    };
    tick();
  }, [pathname]);
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="pl-20">
          <Outlet />
        </main>
      </div>
    </QueryClientProvider>
  );
}
