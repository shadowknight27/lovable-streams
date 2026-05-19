import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Search as SearchIcon } from "lucide-react";
import { searchTmdb } from "@/lib/tmdb.functions";
import { MovieCard } from "@/components/MovieCard";

const searchSchema = z.object({ q: z.string().optional().default("") });

export const Route = createFileRoute("/search")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({ meta: [{ title: "Search — StreamFlix" }] }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: "/search" });
  const [value, setValue] = useState(q || "");

  // Debounce typing -> update URL query
  useEffect(() => {
    const t = setTimeout(() => {
      const trimmed = value.trim().slice(0, 100);
      if (trimmed !== q) {
        navigate({ search: { q: trimmed }, replace: true });
      }
    }, 250);
    return () => clearTimeout(t);
  }, [value, q, navigate]);

  const cleanQuery = (q || "").trim();
  const { data, isFetching } = useQuery({
    queryKey: ["search", cleanQuery],
    queryFn: () => searchTmdb({ data: { query: cleanQuery } }),
    enabled: cleanQuery.length > 0,
  });

  return (
    <div className="min-h-screen px-8 pt-12 pb-20">
      <h1 className="mb-6 text-4xl font-black">Search</h1>

      <div className="relative mb-10 max-w-2xl">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, 100))}
          placeholder="Search movies & TV shows…"
          maxLength={100}
          data-focusable
          className="w-full rounded-full border border-border bg-card py-4 pl-12 pr-5 text-base text-foreground placeholder:text-muted-foreground focus:border-primary"
        />
      </div>

      {cleanQuery.length === 0 && (
        <p className="text-muted-foreground">Type a title to find what to watch.</p>
      )}

      {cleanQuery.length > 0 && isFetching && (
        <p className="text-muted-foreground">Searching for "{cleanQuery}"…</p>
      )}

      {cleanQuery.length > 0 && !isFetching && data?.items.length === 0 && (
        <p className="text-muted-foreground">No results for "{cleanQuery}".</p>
      )}

      {data && data.items.length > 0 && (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {data.items.map((it) => (
            <div key={`${it.mediaType}-${it.id}`} className="w-full">
              <MovieCard item={it} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
