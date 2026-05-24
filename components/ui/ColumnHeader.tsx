import { DotIndicator } from "@/components/ui/DotIndicator";
import { Pill } from "@/components/ui/Pill";
import { typography } from "@/lib/ui-tokens";

interface ColumnHeaderProps {
  label: string;
  count: number;
  dotClass?: string;
  pillBg?: string;
  pillText?: string;
  pillBorder?: string;
  showDot?: boolean;
  className?: string;
  right?: React.ReactNode;
}

export function ColumnHeader({
  label,
  count,
  dotClass = "",
  pillBg = "",
  pillText = "",
  pillBorder = "",
  showDot = true,
  className = "",
  right,
}: ColumnHeaderProps) {
  return (
    <div
      className={`flex items-center gap-2 mb-3.5 pb-3 border-b border-gray-100 ${className}`.trim()}
    >
      {showDot && dotClass && <DotIndicator colorClass={dotClass} />}
      <span className={typography.columnLabel}>{label}</span>
      <Pill bg={pillBg} text={pillText} border={pillBorder}>
        {count}
      </Pill>
      {right && <span className="ml-auto flex items-center gap-2">{right}</span>}
    </div>
  );
}
