import { surfaces } from "@/lib/ui-tokens";
import { Icon } from "@/components/ui/Icon";

interface AiChipProps {
  children: React.ReactNode;
  className?: string;
  /** py-1 for card reason; py-1.5 for tile summary */
  padding?: "default" | "relaxed";
}

export function AiChip({ children, className = "", padding = "default" }: AiChipProps) {
  const py = padding === "relaxed" ? "py-1.5" : "py-1";
  return (
    <div
      className={surfaces.insetChip + " " + py + " " + className}
    >
      <Icon name="sparkles" size="xs" className="opacity-50" />
      <span className="leading-snug">{children}</span>
    </div>
  );
}
