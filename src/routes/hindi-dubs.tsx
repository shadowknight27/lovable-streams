import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getHindiDubs } from "@/lib/tmdb.functions";
import { Row } from "@/components/Row";

export const Route = createFileRoute("/hindi-dubs")({
  head: () => ({ meta: [{ title: "Hindi Dubs — StreamFlix" }] }),
  component: HindiDubs,
});

function HindiDubs() {
  const { data, isLoading } = useQuery({ queryKey: ["hindi-dubs"], queryFn: () => getHindiDubs() });
  return (
    <div className="pt-16 pb-20">
      <h1 className="mb-2 px-8 text-4xl font-black">Hindi Dubs</h1>
      <p className="mb-8 px-8 text-muted-foreground">Blockbusters from across the world — in Hindi.</p>
      {isLoading && <div className="px-8 text-muted-foreground">Loading…</div>}
      {data?.rows.map((r) => <Row key={r.id} title={r.title} items={r.items} />)}
    </div>
  );
}
