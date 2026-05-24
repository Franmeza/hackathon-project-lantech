import type { ColId } from "@/types";

export type BulkFilter = {
  cols?: ColId[];
  archived?: boolean;
};

export type BulkUpdates = {
  archived?: boolean;
  col?: ColId;
};

export type BulkUpdatePayload =
  | { ids: string[]; updates: BulkUpdates; filter?: never }
  | { filter: BulkFilter; updates: BulkUpdates; ids?: never }
  | { ids: string[]; filter: BulkFilter; updates: BulkUpdates };

async function fetchJson<T>(url: string, init: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = (await res.json().catch(() => ({}))) as unknown;
  if (!res.ok) {
    const msg =
      typeof data === "object" && data !== null && "error" in data
        ? String((data as { error?: unknown }).error ?? "Request failed")
        : "Request failed";
    throw new Error(msg);
  }
  return data as T;
}

export async function bulkUpdateCards(
  payload: BulkUpdatePayload
): Promise<{ updated: number }> {
  return fetchJson<{ updated: number }>("/api/cards/bulk", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function bulkArchive(target: { ids: string[] } | { filter: BulkFilter }) {
  return bulkUpdateCards({
    ...(("ids" in target && { ids: target.ids }) || {}),
    ...(("filter" in target && { filter: target.filter }) || {}),
    updates: { archived: true },
  } as BulkUpdatePayload);
}

export function bulkRestore(target: { ids: string[] } | { filter: BulkFilter }) {
  return bulkUpdateCards({
    ...(("ids" in target && { ids: target.ids }) || {}),
    ...(("filter" in target && { filter: target.filter }) || {}),
    updates: { archived: false },
  } as BulkUpdatePayload);
}

export function bulkReclassify(
  target: { ids: string[] } | { filter: BulkFilter },
  col: ColId
) {
  return bulkUpdateCards({
    ...(("ids" in target && { ids: target.ids }) || {}),
    ...(("filter" in target && { filter: target.filter }) || {}),
    updates: { col },
  } as BulkUpdatePayload);
}

