"use client";

import useSWR from "swr";
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

export function useCards(initialData?: Card[]): UseCardsReturn {
  const { data, error, isLoading, mutate } = useSWR<Card[]>(
    "/api/cards",
    fetcher,
    {
      refreshInterval: 15_000,
      fallbackData: initialData,
      revalidateOnFocus: false,
    }
  );

  return {
    cards: data ?? [],
    isLoading,
    error: error as Error | undefined,
    mutate,
  };
}
