interface EmptyStateProps {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "large";
}

export function EmptyState({
  children,
  className = "",
  size = "default",
}: EmptyStateProps) {
  const sizeClasses =
    size === "large"
      ? "text-center py-16 text-sm text-gray-300 border border-dashed border-gray-200 rounded-2xl"
      : "text-center py-8 text-xs text-gray-300 border border-dashed border-gray-200 rounded-xl";

  return (
    <div className={`${sizeClasses} ${className}`.trim()}>{children}</div>
  );
}
