import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Play, ArrowLeft, Star, Clock } from "lucide-react";
import { getDetails } from "@/lib/tmdb.functions";

export const Route = createFileRoute("/watch/$type/$id")({
  component: Watch,
});

function Watch() {
  const { type, id } = Route.useParams();
  const mediaType = (type === "tv" ? "tv" : "movie") as "movie" | "tv";
  const numId = Number(id);
  const [playing, setPlaying] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["details", mediaType, numId],
    queryFn: () => getDetails({ data: { id: numId, type: mediaType } }),
    enabled: !Number.isNaN(numId),
  });

  const embedUrl =
    mediaType === "movie"
      ? `https://vidsrc.to/embed/movie/${numId}`
      : `https://vidsrc.to/embed/tv/${numId}`;

  if (isLoading || !data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  if (playing) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <button
          onClick={() => setPlaying(false)}
          data-focusable
          className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-lg bg-card/80 px-4 py-2 text-sm font-semibold text-foreground backdrop-blur hover:bg-card"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <iframe
          src={embedUrl}
          title={data.title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="origin"
          className="h-full w-full border-0"
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Backdrop hero */}
      <div className="relative h-[70vh] min-h-[460px]">
        {data.backdrop && (
          <img src={data.backdrop} alt={data.title} className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero-left)" }} />

        <Link
          to="/"
          data-focusable
          className="absolute left-8 top-8 z-10 inline-flex items-center gap-2 rounded-lg bg-card/80 px-4 py-2 text-sm font-semibold text-foreground backdrop-blur hover:bg-card"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <div className="relative z-10 flex h-full max-w-3xl flex-col justify-end px-8 pb-16 md:px-16">
          {data.tagline && (
            <span className="mb-2 text-sm uppercase tracking-wider text-primary">{data.tagline}</span>
          )}
          <h1 className="mb-4 text-4xl font-black md:text-6xl">{data.title}</h1>

          <div className="mb-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {data.year && <span>{data.year}</span>}
            {data.rating > 0 && (
              <span className="inline-flex items-center gap-1 text-primary">
                <Star className="h-4 w-4 fill-primary" /> {data.rating}
              </span>
            )}
            {data.runtime && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" /> {data.runtime} min
              </span>
            )}
            {data.genres.length > 0 && <span>{data.genres.join(" • ")}</span>}
          </div>

          <p className="mb-8 max-w-2xl text-base text-foreground/80 md:text-lg">{data.overview}</p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setPlaying(true)}
              data-focusable
              autoFocus
              className="inline-flex items-center gap-2 rounded-lg px-8 py-4 text-base font-bold text-primary-foreground"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Play className="h-5 w-5 fill-current" /> Play Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
