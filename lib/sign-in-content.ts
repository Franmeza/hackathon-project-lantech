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
    icon: "receipt",
    title: "Invoice tracking",
    desc: "Bills and payment requests surface automatically.",
  },
  {
    icon: "lock",
    title: "Secure access",
    desc: "Your emails stay in Gmail — we never send on your behalf.",
  },
  {
    icon: "sparkles",
    title: "GPT-5-mini powered",
    desc: "Draft replies and action items extracted with context.",
  },
];

export const SIGN_IN_TRUST_BADGES: { icon: IconName; label: string }[] = [
  { icon: "lock", label: "Read-only" },
  { icon: "mail", label: "New only" },
  { icon: "trash", label: "No storage" },
];