"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { layout, sidebarLayout } from "@/lib/ui-tokens";
import { ProfileMenu } from "@/components/Auth/ProfileMenu";

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

  // Index used by the sliding active pill
  const activeIdx = NAV_ITEMS.findIndex((item) => item.id === view);

  function handleMouseEnter() {
    if (mode === "expand-on-hover") setHoverExpanded(true);
  }

  function handleMouseLeave() {
    if (mode === "expand-on-hover" && !menuOpen && !profileMenuOpen) {
      setHoverExpanded(false);
    }
  }

  return (
    <>
    <style>{`
      @keyframes menuIn {
        from { opacity: 0; transform: translateY(6px) scale(0.97); }
        to   { opacity: 1; transform: translateY(0)   scale(1);    }
      }
    `}</style>
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
      <nav className={sidebarLayout.navList + " relative"}>
        {/* Sliding active pill — moves between items with a spring easing */}
        <div
          aria-hidden
          className="absolute inset-x-2 h-9 rounded-xl bg-zinc-700 pointer-events-none"
          style={{
            transform: `translateY(${activeIdx * 40}px)`,
            transition: "transform 240ms cubic-bezier(0.34, 1.4, 0.64, 1)",
          }}
        />

        {NAV_ITEMS.map((item) => {
          const isActive = view === item.id;
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
              className={[
                sidebarLayout.navButtonBase,
                navSizeClass,
                "relative z-10 transition-transform active:scale-[0.96]",
                !isActive ? "hover:bg-zinc-700/50" : "",
              ].filter(Boolean).join(" ")}
            >
              <Icon name={item.icon} size="md" className={iconClass} />

              {/* Label fades + slides with max-width so it doesn't jump */}
              <span
                className={`${sidebarLayout.navLabel} ${labelClass} overflow-hidden whitespace-nowrap`}
                style={{
                  maxWidth: isExpanded ? "120px" : "0px",
                  opacity: isExpanded ? 1 : 0,
                  transition: "max-width 200ms ease, opacity 150ms ease",
                }}
              >
                {item.label}
              </span>

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
            <div
              className={sidebarLayout.controlMenu}
              role="menu"
              style={{
                animation: "menuIn 140ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
              }}
            >
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
    </>
  );
}
