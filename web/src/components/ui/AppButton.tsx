"use client";
import { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

export default function AppButton({
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  disabled,
  className,
  children,
  ...props
}: AppButtonProps) {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const baseClasses = clsx(
    "rounded border font-medium transition-all",
    "focus:outline-none focus:ring-2 focus:ring-offset-1",
    "disabled:cursor-not-allowed disabled:opacity-50",
    sizeClasses[size],
    fullWidth && "w-full",
    className
  );

  const getVariantStyles = () => {
    const isDisabled = disabled || isLoading;

    switch (variant) {
      case "primary":
        return {
          borderColor: "var(--panel-border)",
          background: isDisabled ? "var(--muted-bg)" : "var(--btn-active-bg)",
          color: isDisabled ? "var(--muted-text)" : "var(--btn-active-fg)",
        };

      case "secondary":
        return {
          borderColor: "var(--panel-border)",
          background: isDisabled ? "transparent" : "var(--panel-bg)",
          color: isDisabled ? "var(--muted-text)" : "var(--foreground)",
        };

      case "outline":
        return {
          borderColor: "var(--panel-border)",
          background: "transparent",
          color: isDisabled ? "var(--muted-text)" : "var(--foreground)",
        };

      case "ghost":
        return {
          borderColor: "transparent",
          background: "transparent",
          color: isDisabled ? "var(--muted-text)" : "var(--foreground)",
        };

      case "danger":
        return {
          borderColor: isDisabled ? "var(--panel-border)" : "#ef4444",
          background: isDisabled ? "transparent" : "#ef4444",
          color: isDisabled ? "var(--muted-text)" : "#ffffff",
        };

      default:
        return {};
    }
  };

  return (
    <button
      className={baseClasses}
      style={getVariantStyles()}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <LoadingSpinner size={size} />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

function LoadingSpinner({ size }: { size: "sm" | "md" | "lg" }) {
  const spinnerSize = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <svg
      className={clsx("animate-spin", spinnerSize[size])}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
