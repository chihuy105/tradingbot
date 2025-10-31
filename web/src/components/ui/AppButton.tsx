"use client";
import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

export interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
  asChild?: boolean;
}

const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        className={clsx(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium",
          "ring-offset-background transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)] focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "cursor-pointer",
          {
            // Variant styles
            "bg-[var(--btn-active-bg)] text-[var(--btn-active-fg)] border border-[var(--panel-border)] hover:brightness-90 active:brightness-75":
              variant === "default",
            "bg-red-500 text-white border border-red-600 hover:bg-red-600 active:bg-red-700":
              variant === "destructive",
            "border border-[var(--panel-border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--panel-border)]/10 active:bg-[var(--panel-border)]/20":
              variant === "outline",
            "bg-[var(--panel-bg)] text-[var(--foreground)] border border-[var(--panel-border)] hover:brightness-95 active:brightness-90":
              variant === "secondary",
            "border-none hover:bg-[var(--foreground)]/5 active:bg-[var(--foreground)]/10":
              variant === "ghost",
            "text-[var(--brand-accent)] underline-offset-4 hover:underline border-none":
              variant === "link",
          },
          {
            // Size styles
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3 text-xs": size === "sm",
            "h-11 rounded-md px-8": size === "lg",
            "h-10 w-10 p-0": size === "icon",
          },
          className
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {isLoading ? (
          <>
            <LoadingSpinner />
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

AppButton.displayName = "AppButton";

export default AppButton;

function LoadingSpinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
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
