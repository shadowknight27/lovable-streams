import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Play, Info } from "lucide-react";
import type { TmdbItem } from "@/lib/tmdb.functions";

export function HeroCarousel({ items }: { items: TmdbItem[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setI((p) => (p + 1) % items.length), 6500);
    return () => clearInterval(t);
  }, [items.length]);

  if (!items.length) return null;
  const cur = items[i];

  return (
    <div className="relative h-[70vh] min-h-[460px] w-full overflow-hidden">
      {items.map((it, idx) => (
        <div
          key={it.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${idx === i ? "opacity-100" : "opacity-0"}`}
        >
          {it.backdrop && (
            <img src={it.backdrop} alt={it.title} className="h-full w-full object-cover" />
          )}
          <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
          <div className="absolute inset-0" style={{ background: "var(--gradient-hero-left)" }} />
        </div>
      ))}

      <div className="relative z-10 flex h-full max-w-2xl flex-col justify-end px-8 pb-20 md:px-16">
        <span className="mb-3 inline-flex w-fit items-center rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          Trending Now
        </span>
        <h1 className="mb-4 text-4xl font-black leading-tight text-foreground md:text-6xl">
          {cur.title}
        </h1>
        <p className="mb-6 line-clamp-3 max-w-xl text-base text-muted-foreground md:text-lg">
          {cur.overview}
        </p>
        <div className="flex items-center gap-3">
          <Link
            to="/watch/$type/$id"
            params={{ type: cur.mediaType, id: String(cur.id) }}
            data-focusable
            className="inline-flex items-center gap-2 rounded-lg px-7 py-3 text-base font-bold text-primary-foreground transition-transform"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Play className="h-5 w-5 fill-current" /> Watch Now
          </Link>
          <Link
            to="/watch/$type/$id"
            params={{ type: cur.mediaType, id: String(cur.id) }}
            data-focusable
            className="inline-flex items-center gap-2 rounded-lg bg-card/80 px-6 py-3 text-base font-semibold text-foreground backdrop-blur hover:bg-card"
          >
            <Info className="h-5 w-5" /> More Info
          </Link>
        </div>
      </div>

      <div className="absolute bottom-6 right-8 z-10 flex gap-2">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`Slide ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all ${idx === i ? "w-8 bg-primary" : "w-4 bg-foreground/30"}`}
          />
        ))}
      </div>
    </div>
  );
}
