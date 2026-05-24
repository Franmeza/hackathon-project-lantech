import { surfaces } from "@/lib/ui-tokens";

type CardVariant = "default" | "archived" | "tile";
type CardSurface = "default" | "action";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  borderClass?: string;
  variant?: CardVariant;
  surface?: CardSurface;
  as?: "div" | "button";
  onClick?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const variantClasses: Record<CardVariant, string> = {
  default: "p-3 mb-2 font-sans",
  archived: "p-3 mb-2 opacity-85 font-sans",
  tile: "p-4 mb-0 flex flex-col h-full w-full font-sans",
};

function buildCardClassName(
  borderClass: string,
  variant: CardVariant,
  surface: CardSurface,
  className: string
): string {
  const bgClass = surface === "action" ? surfaces.actionTile : surfaces.card;
  return [
    bgClass,
    "rounded-xl border",
    borderClass,
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function Card({
  children,
  className = "",
  borderClass = surfaces.cardBorder,
  variant = "default",
  surface = "default",
  as = "div",
  onClick,
  draggable,
  onDragStart,
  onDragEnd,
  onMouseEnter,
  onMouseLeave,
}: CardProps) {
  const base = buildCardClassName(borderClass, variant, surface, className);

  if (as === "button") {
    return (
      <button type="button" onClick={onClick} className={base}>
        {children}
      </button>
    );
  }

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={base}
    >
      {children}
    </div>
  );
}
