"use client";

import Image from "next/image";
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
      title="Inbox AI"
      aria-label="Inbox AI home"
      className={
        sidebarLayout.brand +
        (isExpanded ? "" : " " + sidebarLayout.brandCollapsed)
      }
    >
      <span className={sidebarLayout.brandLogoWrap}>
        <Image
          src="/smart-inbox-logo-transparent.svg"
          alt=""
          width={32}
          height={32}
          className={sidebarLayout.brandLogo}
          priority
        />
      </span>
      {isExpanded && (
        <span className={sidebarLayout.brandLabel}>Inbox AI</span>
      )}
    </button>
  );
}
