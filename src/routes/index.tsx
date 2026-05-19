import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getHomeRows, getByGenre, GENRES } from "@/lib/tmdb.functions";
import { HeroCarousel } from "@/components/HeroCarousel";
import { Row } from "@/components/Row";

export const Route = createFileRoute("/")({
  component: Home,
});

const GENRE_ROWS = [
  { key: "action", title: "Action Heroes", id: GENRES.action },
  { key: "romance", title: "Romance & Drama", id: GENRES.romance },
  { key: "comedy", title: "Laugh Out Loud — Comedy", id: GENRES.comedy },
  { key: "scifi", title: "Sci-Fi & Beyond", id: GENRES.scifi },
] as const;

function GenreRow({ title, id }: { title: string; id: number }) {
  const { data } = useQuery({
    queryKey: ["genre", id],
    queryFn: () => getByGenre({ data: { genreId: id } }),
  });
  if (!data) return null;
  return <Row title={title} items={data.items} />;
}

function Home() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["home"],
    queryFn: () => getHomeRows(),
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 px-8 text-center">
        <h2 className="text-2xl font-bold text-primary">Couldn't load library</h2>
        <p className="text-muted-foreground">
          {(error as Error)?.message || "TMDB request failed."}
        </p>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <HeroCarousel items={data.hero} />
      <div className="mt-8">
        {data.rows.map((r) => (
          <Row key={r.id} title={r.title} items={r.items} />
        ))}
        {GENRE_ROWS.map((g) => (
          <GenreRow key={g.key} title={g.title} id={g.id} />
        ))}
      </div>
    </div>
  );
}
