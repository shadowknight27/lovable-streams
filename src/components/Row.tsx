import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MovieCard } from "./MovieCard";
import type { TmdbItem } from "@/lib/tmdb.functions";

export function Row({ title, items }: { title: string; items: TmdbItem[] }) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    ref.current?.scrollBy({ left: dir * (ref.current.clientWidth * 0.8), behavior: "smooth" });
  };

  if (!items?.length) return null;

  return (
    <section className="relative mb-10">
      <div className="mb-3 flex items-end justify-between px-8">
        <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">{title}</h2>
        <div className="hidden gap-2 md:flex">
          <button
            onClick={() => scroll(-1)}
            aria-label="Scroll left"
            className="rounded-full bg-muted p-2 text-muted-foreground hover:text-primary"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll(1)}
            aria-label="Scroll right"
            className="rounded-full bg-muted p-2 text-muted-foreground hover:text-primary"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div ref={ref} className="row-scroll flex gap-4 overflow-x-auto px-8 pb-4 pt-2">
        {items.map((it) => (
          <div key={`${it.mediaType}-${it.id}`} className="w-44 shrink-0 sm:w-52 md:w-56">
            <MovieCard item={it} />
          </div>
        ))}
      </div>
    </section>
  );
}
