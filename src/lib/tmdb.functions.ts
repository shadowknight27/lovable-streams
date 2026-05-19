import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const BASE = "https://api.themoviedb.org/3";

async function tmdb(path: string, params: Record<string, string | number> = {}) {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error("TMDB_API_KEY not configured");
  const url = new URL(BASE + path);
  url.searchParams.set("api_key", key);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${await res.text()}`);
  return res.json();
}

export type TmdbItem = {
  id: number;
  title: string;
  overview: string;
  poster: string | null;
  backdrop: string | null;
  year: string;
  rating: number;
  mediaType: "movie" | "tv";
};

function mapItem(r: any, forceType?: "movie" | "tv"): TmdbItem {
  const mediaType = (forceType ?? r.media_type ?? (r.title ? "movie" : "tv")) as "movie" | "tv";
  return {
    id: r.id,
    title: r.title || r.name || "Untitled",
    overview: r.overview || "",
    poster: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : null,
    backdrop: r.backdrop_path ? `https://image.tmdb.org/t/p/original${r.backdrop_path}` : null,
    year: (r.release_date || r.first_air_date || "").slice(0, 4),
    rating: Math.round((r.vote_average || 0) * 10) / 10,
    mediaType,
  };
}

export const getHomeRows = createServerFn({ method: "GET" }).handler(async () => {
  const [bolly, marvel, action, hero] = await Promise.all([
    tmdb("/discover/movie", {
      with_origin_country: "IN",
      with_original_language: "hi",
      sort_by: "popularity.desc",
    }),
    tmdb("/discover/movie", {
      with_companies: "420,2", // Marvel Studios (420), Disney (2)
      sort_by: "popularity.desc",
    }),
    tmdb("/discover/movie", {
      with_genres: "28",
      with_original_language: "en",
      sort_by: "popularity.desc",
      language: "hi-IN",
      include_adult: "false",
    }),
    tmdb("/trending/movie/week"),
  ]);

  return {
    hero: (hero.results || []).slice(0, 6).map((r: any) => mapItem(r, "movie")),
    rows: [
      { id: "bolly", title: "Trending Bollywood", items: (bolly.results || []).map((r: any) => mapItem(r, "movie")) },
      { id: "marvel", title: "Marvel & Disney Blockbusters", items: (marvel.results || []).map((r: any) => mapItem(r, "movie")) },
      { id: "action", title: "Latest Action Dubbed", items: (action.results || []).map((r: any) => mapItem(r, "movie")) },
    ],
  };
});

export const getMovies = createServerFn({ method: "GET" }).handler(async () => {
  const [popular, top, upcoming] = await Promise.all([
    tmdb("/movie/popular"),
    tmdb("/movie/top_rated"),
    tmdb("/movie/upcoming"),
  ]);
  return {
    rows: [
      { id: "popular", title: "Popular Movies", items: (popular.results || []).map((r: any) => mapItem(r, "movie")) },
      { id: "top", title: "Top Rated", items: (top.results || []).map((r: any) => mapItem(r, "movie")) },
      { id: "upcoming", title: "Coming Soon", items: (upcoming.results || []).map((r: any) => mapItem(r, "movie")) },
    ],
  };
});

export const getTvShows = createServerFn({ method: "GET" }).handler(async () => {
  const [popular, top, airing] = await Promise.all([
    tmdb("/tv/popular"),
    tmdb("/tv/top_rated"),
    tmdb("/tv/on_the_air"),
  ]);
  return {
    rows: [
      { id: "popular", title: "Popular Shows", items: (popular.results || []).map((r: any) => mapItem(r, "tv")) },
      { id: "top", title: "Top Rated Shows", items: (top.results || []).map((r: any) => mapItem(r, "tv")) },
      { id: "airing", title: "On The Air", items: (airing.results || []).map((r: any) => mapItem(r, "tv")) },
    ],
  };
});

export const getHindiDubs = createServerFn({ method: "GET" }).handler(async () => {
  const [hollywoodDub, southDub, animeDub] = await Promise.all([
    tmdb("/discover/movie", { language: "hi-IN", with_original_language: "en", sort_by: "popularity.desc", with_genres: "28" }),
    tmdb("/discover/movie", { language: "hi-IN", with_original_language: "te", sort_by: "popularity.desc" }),
    tmdb("/discover/movie", { language: "hi-IN", with_original_language: "ja", sort_by: "popularity.desc", with_genres: "16" }),
  ]);
  return {
    rows: [
      { id: "holly", title: "Hollywood Hindi Dubbed", items: (hollywoodDub.results || []).map((r: any) => mapItem(r, "movie")) },
      { id: "south", title: "South Indian Hits", items: (southDub.results || []).map((r: any) => mapItem(r, "movie")) },
      { id: "anime", title: "Anime Hindi Dubbed", items: (animeDub.results || []).map((r: any) => mapItem(r, "movie")) },
    ],
  };
});

export const getDetails = createServerFn({ method: "GET" })
  .inputValidator((d: { id: number; type: "movie" | "tv" }) => d)
  .handler(async ({ data }) => {
    const r = await tmdb(`/${data.type}/${data.id}`);
    const item = mapItem(r, data.type);
    return {
      ...item,
      runtime: r.runtime || (r.episode_run_time?.[0] ?? null),
      genres: (r.genres || []).map((g: any) => g.name),
      tagline: r.tagline || "",
    };
  });

// TMDB genre IDs for movies
export const GENRES = {
  action: 28,
  romance: 10749,
  comedy: 35,
  scifi: 878,
  thriller: 53,
  horror: 27,
  animation: 16,
  drama: 18,
} as const;

export const getByGenre = createServerFn({ method: "GET" })
  .inputValidator((d: { genreId: number }) =>
    z.object({ genreId: z.number().int().min(1).max(99999) }).parse(d),
  )
  .handler(async ({ data }) => {
    const res = await tmdb("/discover/movie", {
      with_genres: data.genreId,
      sort_by: "popularity.desc",
      "vote_count.gte": 100,
    });
    return { items: (res.results || []).map((r: any) => mapItem(r, "movie")) };
  });

export const searchTmdb = createServerFn({ method: "GET" })
  .inputValidator((d: { query: string }) =>
    z.object({ query: z.string().trim().min(1).max(100) }).parse(d),
  )
  .handler(async ({ data }) => {
    const res = await tmdb("/search/multi", {
      query: data.query,
      include_adult: "false",
    });
    const items: TmdbItem[] = (res.results || [])
      .filter((r: any) => r.media_type === "movie" || r.media_type === "tv")
      .filter((r: any) => r.poster_path)
      .map((r: any) => mapItem(r));
    return { items };
  });
