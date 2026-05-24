"use client";

import { signOutAction } from "@/app/actions/auth";

interface LogOutButtonProps {
  variant?: "text" | "icon";
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
          className={`w-9 h-9 rounded-xl flex flex-col items-center justify-center gap-0.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors ${className}`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className="text-[9px] font-medium leading-none">Out</span>
        </button>
      </form>
    );
  }

  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className={`text-[13px] font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 hover:text-gray-900 transition-colors ${className}`}
      >
        Log out
      </button>
    </form>
  );
}
