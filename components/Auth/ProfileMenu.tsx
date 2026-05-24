"use client";

import { useEffect, useRef, useState } from "react";
import { signOutAction } from "@/app/actions/auth";
import { sidebarLayout } from "@/lib/ui-tokens";

interface ProfileMenuProps {
  userName?: string;
  userEmail?: string;
  className?: string;
  onOpenChange?: (open: boolean) => void;
}

function getDisplayName(userName?: string, userEmail?: string): string {
  if (userName?.trim()) return userName.trim();
  if (userEmail) return userEmail.split("@")[0];
  return "User";
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function ProfileMenu({
  userName,
  userEmail,
  className = "",
  onOpenChange,
}: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const displayName = getDisplayName(userName, userEmail);

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className={"relative " + className}>
      {open && (
        <div className={sidebarLayout.profileMenu} role="menu">
          <div className={sidebarLayout.profileMenuHeader}>
            <p className={sidebarLayout.profileMenuName}>{displayName}</p>
            {userEmail && (
              <p className={sidebarLayout.profileMenuEmail}>{userEmail}</p>
            )}
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              role="menuitem"
              className={sidebarLayout.profileMenuItem}
            >
              Log out
            </button>
          </form>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        title={displayName}
        aria-label="Profile menu"
        aria-expanded={open}
        aria-haspopup="menu"
        className={sidebarLayout.profileButton}
      >
        <span className={sidebarLayout.profileAvatar}>
          {getInitials(displayName)}
        </span>
      </button>
    </div>
  );
}
