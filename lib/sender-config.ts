import type { SenderType } from "@/types";

export const SENDER_TYPE_LABEL: Record<SenderType, string> = {
  client: "Client",
  boss: "Manager",
  colleague: "Colleague",
  auto: "Automated",
  unknown: "Unknown",
};

export const SENDER_TYPE_BADGE: Record<SenderType, string> = {
  client: "bg-blue-100 text-blue-700",
  boss: "bg-red-100 text-red-700",
  colleague: "bg-emerald-100 text-emerald-700",
  auto: "bg-gray-100 text-gray-500",
  unknown: "bg-gray-100 text-gray-500",
};
