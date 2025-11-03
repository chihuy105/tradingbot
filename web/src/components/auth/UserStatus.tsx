"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useAuthDispatch, useAppSelector } from "@/store/redux/hooks";
import {AppButton} from "@/components/ui";

export default function UserStatus() {
  const pathname = usePathname();
  const auth = useAuthDispatch();
  const { user, status, error } = useAppSelector((state) => state.auth);

  const loading = useMemo(() => status === "loading", [status]);

  const loginUrl = useMemo(() => {
    if (pathname === "/login") return "/login";
    return `/login?redirect=${encodeURIComponent(pathname)}`;
  }, [pathname]);

  const handleLogout = () => {
    void auth.dispatch(auth.logoutUser())
      .unwrap()
      .catch(() => {
        auth.dispatch(auth.logout());
      });
  };

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href={loginUrl}
          className="px-3 py-1 text-xs border rounded chip-btn"
          style={{ borderColor: "var(--chip-border)", color: "inherit" }}
        >
          {loading ? "…" : "Log in"}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <span title={user.email}>{user.email}</span>
      <AppButton
        type="button"
        variant="outline"
        size="sm"
        onClick={handleLogout}
        disabled={loading}
      >
        {loading ? "…" : "Logout"}
      </AppButton>
    </div>
  );
}
