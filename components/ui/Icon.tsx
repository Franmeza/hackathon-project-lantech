import type { ComponentType } from "react";
import {
  IconArchive,
  IconBell,
  IconBrandGoogle,
  IconBulb,
  IconChevronLeft,
  IconClipboardText,
  IconClock,
  IconInbox,
  IconLayoutSidebar,
  IconLogout,
  IconMail,
  IconMessageReply,
  IconReceipt,
  IconSparkles,
  type IconProps as TablerIconProps,
} from "@tabler/icons-react";
import { iconSizes } from "@/lib/ui-tokens";

export type IconName =
  | "archive"
  | "bell"
  | "brand-google"
  | "bulb"
  | "chevron-left"
  | "clipboard-text"
  | "clock"
  | "inbox"
  | "layout-sidebar"
  | "logout"
  | "mail"
  | "message-reply"
  | "receipt"
  | "sparkles";

export type IconSize = keyof typeof iconSizes;

export type TileIconId = "action" | "invoice" | "other" | "sub";

const ICON_MAP: Record<
  IconName,
  ComponentType<TablerIconProps>
> = {
  archive: IconArchive,
  bell: IconBell,
  "brand-google": IconBrandGoogle,
  bulb: IconBulb,
  "chevron-left": IconChevronLeft,
  "clipboard-text": IconClipboardText,
  clock: IconClock,
  inbox: IconInbox,
  "layout-sidebar": IconLayoutSidebar,
  logout: IconLogout,
  mail: IconMail,
  "message-reply": IconMessageReply,
  receipt: IconReceipt,
  sparkles: IconSparkles,
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
