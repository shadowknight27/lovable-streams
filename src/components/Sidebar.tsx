import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Film, Tv, Languages, Play, Search } from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/search", label: "Search", icon: Search },
  { to: "/movies", label: "Movies", icon: Film },
  { to: "/tv", label: "TV Shows", icon: Tv },
  { to: "/hindi-dubs", label: "Hindi Dubs", icon: Languages },
] as const;

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside
      className="group fixed left-0 top-0 z-40 flex h-screen w-20 flex-col items-center border-r border-border bg-[var(--sidebar-bg)] py-6 transition-[width] duration-300 hover:w-56"
    >
      <Link
        to="/"
        className="mb-10 flex h-12 w-12 items-center justify-center rounded-xl"
        style={{ background: "var(--gradient-brand)" }}
        aria-label="Home"
      >
        <Play className="h-6 w-6 fill-primary-foreground text-primary-foreground" />
      </Link>

      <nav className="flex flex-1 flex-col gap-2 w-full px-3">
        {items.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              data-focusable
              className={`flex items-center gap-4 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-6 w-6 shrink-0" />
              <span className="opacity-0 transition-opacity duration-200 group-hover:opacity-100 whitespace-nowrap">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
