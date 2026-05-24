"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { layout, sidebarLayout } from "@/lib/ui-tokens";
import { ProfileMenu } from "@/components/Auth/ProfileMenu";
import { SidebarBrand } from "@/components/Sidebar/SidebarBrand";

export type ViewId = "inbox" | "archive";
export type SidebarMode = "expanded" | "collapsed" | "expand-on-hover";

interface SidebarProps {
  view: ViewId;
  onNavigate: (view: ViewId) => void;
  archiveCount: number;
  userName?: string;
  userEmail?: string;
}

const STORAGE_KEY = "sidebar-mode";

const MODE_OPTIONS: { id: SidebarMode; label: string }[] = [
  { id: "expanded", label: "Expanded" },
  { id: "collapsed", label: "Collapsed" },
  { id: "expand-on-hover", label: "Expand on hover" },
];

const NAV_ITEMS: { id: ViewId; label: string; icon: "inbox" | "archive" }[] = [
  { id: "inbox", label: "Inbox", icon: "inbox" },
  { id: "archive", label: "Archive", icon: "archive" },
];

function isValidMode(value: string | null): value is SidebarMode {
  return value === "expanded" || value === "collapsed" || value === "expand-on-hover";
}

export function Sidebar({
  view,
  onNavigate,
  archiveCount,
  userName,
  userEmail,
}: SidebarProps) {
  const [mode, setMode] = useState<SidebarMode>("expand-on-hover");
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const controlRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isValidMode(stored)) {
      setMode(stored);
    } else {
      const legacy = localStorage.getItem("sidebar-collapsed");
      if (legacy === "true") setMode("collapsed");
      else if (legacy === "false") setMode("expanded");
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (controlRef.current && !controlRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  function selectMode(next: SidebarMode) {
    setMode(next);
    localStorage.setItem(STORAGE_KEY, next);
    setHoverExpanded(false);
    setMenuOpen(false);
  }

  const isExpanded =
    mode === "expanded" || (mode === "expand-on-hover" && hoverExpanded);

  const widthClass = isExpanded
    ? sidebarLayout.expandedWidth
    : sidebarLayout.collapsedWidth;

  const navSizeClass = isExpanded
    ? sidebarLayout.navButtonExpanded
    : sidebarLayout.navButtonCollapsed;

  function handleMouseEnter() {
    if (mode === "expand-on-hover") setHoverExpanded(true);
  }

  function handleMouseLeave() {
    if (mode === "expand-on-hover" && !menuOpen && !profileMenuOpen) {
      setHoverExpanded(false);
    }
  }

  return (
    <aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={
        layout.sidebar +
        " " +
        widthClass +
        (hydrated ? "" : " " + sidebarLayout.expandedWidth)
      }
    >
      <SidebarBrand
        isExpanded={isExpanded}
        onClick={() => onNavigate("inbox")}
      />
      <nav className={sidebarLayout.navList}>
        {NAV_ITEMS.map((item) => {
          const isActive = view === item.id;
          const stateClass = isActive
            ? sidebarLayout.navButtonActive
            : sidebarLayout.navButtonInactive;
          const labelClass = isActive
            ? sidebarLayout.navLabelActive
            : sidebarLayout.navLabelInactive;
          const iconClass = isActive
            ? sidebarLayout.navIconActive
            : sidebarLayout.navIconInactive;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={!isExpanded ? item.label : undefined}
              aria-label={item.label}
              className={
                sidebarLayout.navButtonBase +
                " " +
                navSizeClass +
                " " +
                stateClass
              }
            >
              <Icon name={item.icon} size="md" className={iconClass} />
              {isExpanded && (
                <span className={sidebarLayout.navLabel + " " + labelClass}>
                  {item.label}
                </span>
              )}
              {item.id === "archive" && archiveCount > 0 && (
                <span
                  className={
                    !isExpanded
                      ? "absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-gray-500 text-white text-[8px] font-bold flex items-center justify-center"
                      : "ml-auto text-[10px] font-semibold min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-gray-500 text-white flex items-center justify-center"
                  }
                >
                  {archiveCount > 9 ? "9+" : archiveCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div
        className={
          sidebarLayout.bottomBar +
          (!isExpanded ? " " + sidebarLayout.bottomBarCollapsed : "")
        }
      >
        <ProfileMenu
          userName={userName}
          userEmail={userEmail}
          onOpenChange={setProfileMenuOpen}
        />
        <div ref={controlRef} className={sidebarLayout.controlWrapper}>
          {menuOpen && (
            <div className={sidebarLayout.controlMenu} role="menu">
              <p className={sidebarLayout.controlMenuTitle}>Sidebar control</p>
              {MODE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={mode === option.id}
                  onClick={() => selectMode(option.id)}
                  className={sidebarLayout.controlMenuItem}
                >
                  {mode === option.id ? (
                    <span className={sidebarLayout.controlMenuDot} />
                  ) : (
                    <span className={sidebarLayout.controlMenuDotPlaceholder} />
                  )}
                  {option.label}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            title="Sidebar control"
            aria-label="Sidebar control"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className={sidebarLayout.toggleButton}
          >
            <Icon name="layout-sidebar" size="sm" />
          </button>
        </div>
      </div>
    </aside>
  );
}
