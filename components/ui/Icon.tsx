import type { ComponentType } from "react";
import {
  IconArchive,
  IconBell,
  IconBolt,
  IconBrandGoogle,
  IconBulb,
  IconCheckbox,
  IconChevronLeft,
  IconClipboardText,
  IconClock,
  IconInbox,
  IconLayoutSidebar,
  IconLoader2,
  IconLock,
  IconLogout,
  IconMail,
  IconMailAi,
  IconMessageReply,
  IconReceipt,
  IconRobot,
  IconSparkles,
  IconTrash,
  type IconProps as TablerIconProps,
} from "@tabler/icons-react";
import { iconSizes } from "@/lib/ui-tokens";

export type IconName =
  | "archive"
  | "bell"
  | "bolt"
  | "brand-google"
  | "bulb"
  | "checkbox"
  | "chevron-left"
  | "clipboard-text"
  | "clock"
  | "inbox"
  | "layout-sidebar"
  | "loader"
  | "lock"
  | "logout"
  | "mail"
  | "mail-ai"
  | "message-reply"
  | "receipt"
  | "robot"
  | "sparkles"
  | "trash";

export type IconSize = keyof typeof iconSizes;

export type TileIconId = "action" | "invoice" | "other" | "sub";

const ICON_MAP: Record<
  IconName,
  ComponentType<TablerIconProps>
> = {
  archive: IconArchive,
  bell: IconBell,
  bolt: IconBolt,
  "brand-google": IconBrandGoogle,
  bulb: IconBulb,
  checkbox: IconCheckbox,
  "chevron-left": IconChevronLeft,
  "clipboard-text": IconClipboardText,
  clock: IconClock,
  inbox: IconInbox,
  "layout-sidebar": IconLayoutSidebar,
  loader: IconLoader2,
  lock: IconLock,
  logout: IconLogout,
  mail: IconMail,
  "mail-ai": IconMailAi,
  "message-reply": IconMessageReply,
  receipt: IconReceipt,
  robot: IconRobot,
  sparkles: IconSparkles,
  trash: IconTrash,
};

const TILE_ICON: Record<TileIconId, IconName> = {
  action: "bell",
  invoice: "receipt",
  other: "bulb",
  sub: "mail",
};

interface IconProps {
  name: IconName;
  size?: IconSize;
  className?: string;
  stroke?: number;
}

export function Icon({
  name,
  size = "sm",
  className = "",
  stroke = 1.75,
}: IconProps) {
  const TablerIcon = ICON_MAP[name];
  return (
    <TablerIcon
      size={iconSizes[size]}
      stroke={stroke}
      aria-hidden="true"
      className={"shrink-0 " + className}
    />
  );
}

interface TileIconProps {
  tileId: TileIconId;
  size?: IconSize;
  className?: string;
  stroke?: number;
}

export function TileIcon({
  tileId,
  size = "sm",
  className = "",
  stroke = 1.75,
}: TileIconProps) {
  return (
    <Icon
      name={TILE_ICON[tileId]}
      size={size}
      stroke={stroke}
      className={className}
    />
  );
}
