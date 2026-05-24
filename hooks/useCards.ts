"use client";

import { useEffect, useRef } from "react";
import useSWR from "swr";
import { createClient } from "@supabase/supabase-js";
import type { Card } from "@/types";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch cards");
    return res.json() as Promise<Card[]>;
  });

interface UseCardsReturn {
  cards: Card[];
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? "";
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Realtime is only available when the anon key is configured
const realtimeEnabled = Boolean(supabaseUrl && supabaseAnon);

export function useCards(initialData?: Card[]): UseCardsReturn {
  const { data, error, isLoading, mutate } = useSWR<Card[]>(
    "/api/cards",
    fetcher,
    {
      fallbackData: initialData,
      // Safety-net poll — only fires if the Realtime WebSocket misses an event.
      // With Realtime enabled this almost never triggers; without it, ~30s is acceptable.
      refreshInterval: realtimeEnabled ? 60_000 : 30_000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  // Subscribe to Supabase Realtime INSERT/UPDATE/DELETE on the Card table.
  // When the webhook saves a new card this fires within ~1s — no polling needed.
  const mutateRef = useRef(mutate);
  mutateRef.current = mutate;

  useEffect(() => {
    if (!realtimeEnabled) return;

    const supabase = createClient(supabaseUrl, supabaseAnon);

    const channel = supabase
      .channel("cards-realtime")
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "postgres_changes" as any,
        {
          event: "*",          // INSERT, UPDATE, DELETE
          schema: "public",
          table: "Card",
        },
        () => {
          // Re-fetch from our own API so auth + serialisation is consistent
          mutateRef.current();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []); // run once on mount

  return {
    cards: data ?? [],
    isLoading,
    error: error as Error | undefined,
    mutate,
  };
}
