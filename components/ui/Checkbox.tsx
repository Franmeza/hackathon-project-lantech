"use client";

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
}

export function Checkbox({ checked, onChange, label }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label ?? "Select"}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={[
        "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors",
        checked
          ? "bg-gray-900 border-gray-900"
          : "bg-white border-gray-200 hover:border-gray-300",
      ].join(" ")}
    >
      {checked && <span className="text-white text-[10px] leading-none">✓</span>}
    </button>
  );
}

