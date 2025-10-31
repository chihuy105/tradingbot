"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthDispatch, useAppSelector } from "@/store/redux/hooks";
import { selectAuthStatus, selectCurrentUser } from "@/store/redux/selectors";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuthDispatch();
  const user = useAppSelector(selectCurrentUser);
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector((state) => state.auth.error);
  const token = useAppSelector((state) => state.auth.token);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loading = status === "loading";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password) return;

    try {
      await auth.dispatch(auth.loginUser({ email, password })).unwrap();

      const redirect = searchParams.get("redirect") || "/";
      router.push(redirect);
    } catch (error) {
      // Error is already handled by Redux state
    }
  };

  const handleFetchUser = () => {
    void auth.dispatch(auth.fetchCurrentUser());
  };

  const handleLogout = () => {
    void auth.dispatch(auth.logoutUser())
      .unwrap()
      .catch(() => {
        auth.dispatch(auth.logout());
      });
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-10">
      <section className="rounded border p-6 shadow-sm" style={{ borderColor: "var(--chip-border)" }}>
        <h1 className="text-xl font-semibold mb-4">Log in</h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col text-sm gap-1">
            <span>Email</span>
            <input
              type="email"
              className="rounded border px-3 py-2 bg-transparent"
              style={{ borderColor: "var(--chip-border)" }}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label className="flex flex-col text-sm gap-1">
            <span>Password</span>
            <input
              type="password"
              className="rounded border px-3 py-2 bg-transparent"
              style={{ borderColor: "var(--chip-border)" }}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          <button
            type="submit"
            className="rounded border px-3 py-2 text-sm chip-btn"
            style={{ borderColor: "var(--chip-border)" }}
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        {error && (
          <div className="mt-4 rounded border border-red-500 px-3 py-2 text-sm text-red-400">
            {error}
          </div>
        )}
      </section>

      <section className="rounded border p-6 shadow-sm" style={{ borderColor: "var(--chip-border)" }}>
        <h2 className="text-lg font-semibold mb-3">Session state</h2>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="font-medium text-muted-foreground">Status</dt>
            <dd>{status}</dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground">Has token</dt>
            <dd>{token ? "yes" : "no"}</dd>
          </div>
        </dl>
        <div className="mt-3">
          <h3 className="font-medium text-sm mb-2">User data</h3>
          {user ? (
            <pre className="rounded border bg-black/20 p-3 text-xs" style={{ borderColor: "var(--chip-border)" }}>
              {JSON.stringify(user, null, 2)}
            </pre>
          ) : (
            <p className="text-sm">No user loaded.</p>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded border px-3 py-2 text-sm chip-btn"
            style={{ borderColor: "var(--chip-border)" }}
            onClick={handleFetchUser}
            disabled={loading || !token}
          >
            {loading ? "Loading…" : "Fetch user"}
          </button>
          <button
            type="button"
            className="rounded border px-3 py-2 text-sm chip-btn"
            style={{ borderColor: "var(--chip-border)" }}
            onClick={handleLogout}
            disabled={loading || !token}
          >
            {loading ? "…" : "Log out"}
          </button>
        </div>
      </section>
    </main>
  );
}
