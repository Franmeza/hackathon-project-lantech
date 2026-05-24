interface DotIndicatorProps {
  colorClass: string;
  className?: string;
}

export function DotIndicator({ colorClass, className = "" }: DotIndicatorProps) {
  return (
    <span
      className={`w-2 h-2 rounded-full flex-shrink-0 inline-block ${colorClass} ${className}`.trim()}
    />
  );
}
