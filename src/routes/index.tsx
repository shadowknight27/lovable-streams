import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getHomeRows } from "@/lib/tmdb.functions";
import { HeroCarousel } from "@/components/HeroCarousel";
import { Row } from "@/components/Row";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["home"],
    queryFn: () => getHomeRows(),
  });

  if (isLoading) return <LoadingScreen />;
  if (error || !data) return <ErrorScreen msg={(error as Error)?.message} />;

  return (
    <div className="pb-20">
      <HeroCarousel items={data.hero} />
      <div className="mt-8">
        {data.rows.map((r) => (
          <Row key={r.id} title={r.title} items={r.items} />
        ))}
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
    </div>
  );
}

function ErrorScreen({ msg }: { msg?: string }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2 px-8 text-center">
      <h2 className="text-2xl font-bold text-primary">Couldn't load library</h2>
      <p className="text-muted-foreground">{msg || "TMDB request failed. Check your TMDB_API_KEY."}</p>
    </div>
  );
}
