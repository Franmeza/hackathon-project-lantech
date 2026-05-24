import { DotIndicator } from "@/components/ui/DotIndicator";
import { Pill } from "@/components/ui/Pill";
import { emailCardLayout, typography } from "@/lib/ui-tokens";

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
    <div className={`${emailCardLayout.columnHeaderRow} ${className}`.trim()}>
      {showDot && dotClass && <DotIndicator colorClass={dotClass} />}
      <span className={typography.columnLabel + " min-w-0"}>{label}</span>
      <Pill bg={pillBg} text={pillText} border={pillBorder} className="shrink-0">
        {count}
      </Pill>
      {right && (
        <span className={emailCardLayout.columnHeaderRight}>{right}</span>
      )}
    </div>
  );
}
