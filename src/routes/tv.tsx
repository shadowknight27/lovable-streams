import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getTvShows } from "@/lib/tmdb.functions";
import { Row } from "@/components/Row";

export const Route = createFileRoute("/tv")({
  head: () => ({ meta: [{ title: "TV Shows — StreamFlix" }] }),
  component: TvPage,
});

function TvPage() {
  const { data, isLoading } = useQuery({ queryKey: ["tv"], queryFn: () => getTvShows() });
  return (
    <div className="pt-16 pb-20">
      <h1 className="mb-8 px-8 text-4xl font-black">TV Shows</h1>
      {isLoading && <div className="px-8 text-muted-foreground">Loading…</div>}
      {data?.rows.map((r) => <Row key={r.id} title={r.title} items={r.items} />)}
    </div>
  );
}
