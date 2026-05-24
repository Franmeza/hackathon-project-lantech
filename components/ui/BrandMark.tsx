import { Icon } from "@/components/ui/Icon";

interface BrandMarkProps {
  iconClassName?: string;
}

export function BrandMark({ iconClassName = "" }: BrandMarkProps) {
  return (
    <div
      className="flex items-center justify-center h-8 w-8 shrink-0"
      aria-hidden="true"
    >
      <Icon name="mail-ai" size="brandLogo" className={iconClassName} />
    </div>
  );
}
