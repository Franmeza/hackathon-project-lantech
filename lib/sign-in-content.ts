import type { IconName } from "@/components/ui/Icon";

export const SIGN_IN_FEATURES: {
  icon: IconName;
  title: string;
  desc: string;
}[] = [
  {
    icon: "bolt",
    title: "Instant triage",
    desc: "Every new email is read and classified in seconds.",
  },
  {
    icon: "mail-ai",
    title: "Read full email",
    desc: "Open any card to load the original message on demand.",
  },
  {
    icon: "receipt",
    title: "Invoice tracking",
    desc: "Bills and payment requests surface automatically.",
  },
  {
    icon: "lock",
    title: "Reply in Gmail",
    desc: "Jump to Gmail to respond — Smart Inbox does not send emails.",
  },
  {
    icon: "trash",
    title: "Delete from the board",
    desc: "Move messages to Gmail Trash without leaving the app.",
  },
];

export const SIGN_IN_TRUST_BADGES: { icon: IconName; label: string }[] = [
  { icon: "lock", label: "No send" },
  { icon: "mail", label: "Open in Gmail" },
  { icon: "trash", label: "Trash from app" },
];