import { typography } from "@/lib/ui-tokens";

interface PillProps {
  children: React.ReactNode;
  bg?: string;
  text?: string;
  border?: string;
  className?: string;
  small?: boolean;
}

export function Pill({
  children,
  bg = "",
  text = "",
  border = "",
  className = "",
  small = false,
}: PillProps) {
  const base = small ? typography.pillSmall : typography.pill;
  return (
    <span className={`${base} ${bg} ${text} ${border} ${className}`.trim()}>
      {children}
    </span>
  );
}
