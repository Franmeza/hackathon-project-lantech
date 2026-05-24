import { Icon, type IconSize } from "@/components/ui/Icon";

interface BrandMarkProps {
  iconClassName?: string;
  size?: IconSize;
}

export function BrandMark({
  iconClassName = "",
  size = "sm",
}: BrandMarkProps) {
  return (
    <div
      className="flex items-center justify-center gap-0.5 h-8 w-8 shrink-0"
      aria-hidden="true"
    >
      <Icon name="robot" size={size} className={iconClassName} />
      <Icon name="mail-ai" size={size} className={iconClassName} />
    </div>
  );
}
