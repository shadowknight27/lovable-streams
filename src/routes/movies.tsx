import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getMovies } from "@/lib/tmdb.functions";
import { Row } from "@/components/Row";

export const Route = createFileRoute("/movies")({
  head: () => ({ meta: [{ title: "Movies — StreamFlix" }] }),
  component: Movies,
});

function Movies() {
  const { data, isLoading } = useQuery({ queryKey: ["movies"], queryFn: () => getMovies() });
  return (
    <div className="pt-16 pb-20">
      <h1 className="mb-8 px-8 text-4xl font-black">Movies</h1>
      {isLoading && <div className="px-8 text-muted-foreground">Loading…</div>}
      {data?.rows.map((r) => <Row key={r.id} title={r.title} items={r.items} />)}
    </div>
  );
}
