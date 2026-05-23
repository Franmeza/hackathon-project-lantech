export type ColId = "action" | "overdue" | "sub" | "other" | "invoice";

export type SenderType = "client" | "boss" | "colleague" | "auto" | "unknown";

export interface Card {
  id: string;
  col: ColId;
  sender: string;
  senderType: SenderType;
  time: string;
  task: string;
  reason: string;
  deadline: string | null;
  reply: string | null;
  archived: boolean;
  gmailMsgId: string | null;
  createdAt: string;
}

export interface ColConfig {
  label: string;
  accent: string;
  bg: string;
  border: string;
  dot: string;
  pillBg: string;
  pillText: string;
  pillBorder: string;
}

export type ColConfigMap = Record<ColId, ColConfig>;

// Dashboard tile definition — groups one or more ColIds into a single summary tile
export interface TileDefinition {
  id: string;
  label: string;
  subtitle: string;
  cols: ColId[];           // which ColIds feed into this tile
  accentTop: string;       // Tailwind border-t color class
  countColor: string;      // Tailwind text color for the big count
  icon: string;            // emoji icon
}

export interface ClassifyResult {
  col: ColId;
  task: string;
  reason: string;
  deadline: string | null;
  reply: string | null;
  senderType: SenderType;
}
