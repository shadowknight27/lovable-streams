import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { getDetails } from "@/lib/tmdb.functions";

export const Route = createFileRoute("/watch/$type/$id")({
  component: Watch,
});

function Watch() {
  const { type, id } = Route.useParams();
  const mediaType = (type === "tv" ? "tv" : "movie") as "movie" | "tv";
  const numId = Number(id);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ["details", mediaType, numId],
    queryFn: () => getDetails({ data: { id: numId, type: mediaType } }),
    enabled: !Number.isNaN(numId),
  });

  const embedUrl =
    mediaType === "movie"
      ? `https://vidsrc.cc/v2/embed/movie/${numId}`
      : `https://vidsrc.cc/v2/embed/tv/${numId}`;

  // Attempt native fullscreen; harmless if browser blocks
  useEffect(() => {
    const el = containerRef.current;
    if (el && document.fullscreenEnabled && !document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    }
    return () => {
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    };
  }, []);

  // Backspace / Escape => exit
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Backspace" || e.keyCode === 8) {
        e.preventDefault();
        router.history.back();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-[60] bg-black">
      <Link
        to="/"
        data-focusable
        autoFocus
        className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-lg bg-card/80 px-4 py-2 text-sm font-semibold text-foreground backdrop-blur"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <iframe
        src={embedUrl}
        title={data?.title || "Player"}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="origin"
        className="h-full w-full border-0"
      />
    </div>
  );
}
