type ButtonVariant = "primary" | "secondary" | "ghost" | "inline" | "toolbar";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "text-[13px] font-medium px-4 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
  secondary:
    "flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-1.5 rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors",
  ghost:
    "text-[13px] px-3.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors",
  inline:
    "text-[10px] px-2 py-0.5 rounded-md border border-gray-200 text-gray-500 font-medium hover:border-gray-300 hover:text-gray-700 transition-colors",
  toolbar:
    "inline-flex items-center justify-center h-7 px-2.5 text-[11px] font-medium rounded-md bg-gray-700 text-white border border-gray-700 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0",
};

export function Button({
  variant = "secondary",
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`${variantClasses[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
