import { Link } from "@tanstack/react-router";
import type { TmdbItem } from "@/lib/tmdb.functions";
import { Star } from "lucide-react";

export function MovieCard({ item }: { item: TmdbItem }) {
  return (
    <Link
      to="/watch/$type/$id"
      params={{ type: item.mediaType, id: String(item.id) }}
      data-focusable
      className="group relative block w-44 shrink-0 sm:w-52 md:w-56"
    >
      <div
        className="relative aspect-[2/3] overflow-hidden rounded-xl bg-muted"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        {item.poster ? (
          <img
            src={item.poster}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/90 to-transparent p-3">
          <span className="text-xs text-white/80">{item.year || "—"}</span>
          <span className="flex items-center gap-1 text-xs text-primary">
            <Star className="h-3 w-3 fill-primary" /> {item.rating || "—"}
          </span>
        </div>
      </div>
      <h3 className="mt-2 line-clamp-1 px-1 text-sm font-medium text-foreground">{item.title}</h3>
    </Link>
  );
}
