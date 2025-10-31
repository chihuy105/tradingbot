"use client";
import { ReactNode, useEffect } from "react";
import AppButton from "./AppButton";

export default function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0"
        style={{ background: "var(--header-bg)" }}
        onClick={onClose}
      />
      <div
        className="relative z-[101] w-full max-w-lg rounded-md border p-4 shadow-xl"
        style={{
          borderColor: "var(--panel-border)",
          background: "var(--panel-bg)",
        }}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            {title ?? "Details"}
          </h3>
          <AppButton
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            Close
          </AppButton>
        </div>
        <div className="text-sm" style={{ color: "var(--foreground)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
