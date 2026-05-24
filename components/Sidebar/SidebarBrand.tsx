"use client";

import { APP_NAME } from "@/lib/brand";
import { BrandMark } from "@/components/ui/BrandMark";
import { sidebarLayout } from "@/lib/ui-tokens";

interface SidebarBrandProps {
  isExpanded: boolean;
  onClick?: () => void;
}

export function SidebarBrand({ isExpanded, onClick }: SidebarBrandProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={APP_NAME}
      aria-label={`${APP_NAME} home`}
      className={
        sidebarLayout.brand +
        (isExpanded ? " " + sidebarLayout.brandExpanded : " " + sidebarLayout.brandCollapsed)
      }
    >
      <BrandMark iconClassName={sidebarLayout.brandIcon} />
      {isExpanded && (
        <span className={sidebarLayout.brandLabel}>{APP_NAME}</span>
      )}
    </button>
  );
}
