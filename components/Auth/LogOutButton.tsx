"use client";

import { signOutAction } from "@/app/actions/auth";
import { Icon } from "@/components/ui/Icon";
import { sidebarLayout } from "@/lib/ui-tokens";

interface LogOutButtonProps {
  variant?: "text" | "icon" | "sidebar-row";
  className?: string;
}

export function LogOutButton({
  variant = "text",
  className = "",
}: LogOutButtonProps) {
  if (variant === "icon") {
    return (
      <form action={signOutAction}>
        <button
          type="submit"
          title="Log out"
          aria-label="Log out"
          className={
            "w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors " +
            className
          }
        >
          <Icon name="logout" size="sm" />
        </button>
      </form>
    );
  }

  if (variant === "sidebar-row") {
    return (
      <form action={signOutAction} className={className}>
        <button
          type="submit"
          className={
            sidebarLayout.navButtonBase +
            " " +
            sidebarLayout.navButtonExpanded +
            " " +
            sidebarLayout.navButtonInactive +
            " w-full text-gray-500 hover:text-gray-700"
          }
        >
          <Icon name="logout" size="sm" />
          <span className={sidebarLayout.navLabel + " " + sidebarLayout.navLabelInactive}>
            Log out
          </span>
        </button>
      </form>
    );
  }

  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className={
          "text-[13px] font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 hover:text-gray-900 transition-colors " +
          className
        }
      >
        Log out
      </button>
    </form>
  );
}
