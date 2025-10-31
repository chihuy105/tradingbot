"use client";
import { useState, useMemo } from "react";
import { useLeaderboard, LeaderboardRow } from "@/lib/api/hooks/useLeaderboard";
import { useAnalyticsMap } from "@/lib/api/hooks/useAnalyticsMap";
import { useLatestEquityMap } from "@/lib/api/hooks/useModelSnapshots";
import { useTradesCountMap } from "@/lib/api/hooks/useTradesCount";
import { useSharpeMap } from "@/lib/api/hooks/useSharpeMap";
import Tooltip from "@/components/ui/Tooltip";
import { getModelName } from "@/lib/model/meta";
import { ModelLogoChip } from "@/components/shared/ModelLogo";
import { fmtUSD, pnlClass, fmtPct } from "@/lib/utils/formatters";
import ErrorBanner from "@/components/ui/ErrorBanner";
import { SkeletonRow } from "@/components/ui/Skeleton";
import clsx from "clsx";

type SortKey =
  | "equity"
  | "return_pct"
  | "num_trades"
  | "sharpe"
  | "win_rate"
  | "win_dollars"
  | "lose_dollars"
  | "total_pnl";

export default function LeaderboardTable({
  mode = "overall",
}: {
  mode?: "overall" | "advanced";
}) {
  const { rows, isLoading, isError } = useLeaderboard();
  const { map: analytics } = useAnalyticsMap();
  const { map: equityMap } = useLatestEquityMap();
  const { map: tradeCount } = useTradesCountMap();
  const { map: sharpeMap, stats: sharpeStats } = useSharpeMap();
  const [sortKey, setSortKey] = useState<SortKey>("equity");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const data = useMemo(() => {
    // Pre-compute derived metrics and merge in analytics fields
    const arr = rows.map((r) =>
      withDerived(
        r,
        analytics[r.id],
        equityMap[r.id],
        tradeCount[r.id],
        sharpeMap[r.id],
      ),
    );
    const dir = sortDir === "asc" ? 1 : -1;
    arr.sort((a: any, b: any) => {
      const av = a[sortKey] ?? 0;
      const bv = b[sortKey] ?? 0;
      return (Number(av) - Number(bv)) * dir;
    });
    return arr;
  }, [rows, analytics, sortKey, sortDir]);

  return (
    <div
      className={`rounded-md border px-3 py-2 sm:px-3 sm:py-3`}
      style={{
        background: "var(--panel-bg)",
        borderColor: "var(--panel-border)",
      }}
    >
      <div className="mb-2">
        <h2
          className={`ui-sans text-sm font-semibold`}
          style={{ color: "var(--foreground)" }}
        >
          Leaderboard
        </h2>
      </div>
      <ErrorBanner
        message={
          isError ? "Leaderboard data is temporarily unavailable. Please try again later." : undefined
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[11px]">
          <thead className="ui-sans" style={{ color: "var(--muted-text)" }}>
            <tr
              className={`border-b`}
              style={{ borderColor: "var(--panel-border)" }}
            >
              <Th label="#" />
              <Th label="Model" />
              <ThSort
                label="Equity"
                active={sortKey === "equity"}
                dir={sortDir}
                onClick={() => toggleSort("equity")}
              />
              <ThSort
                label="Return"
                active={sortKey === "return_pct"}
                dir={sortDir}
                onClick={() => toggleSort("return_pct")}
              />
              {mode === "advanced" ? (
                <>
                  <ThSort
                    label="Total PnL"
                    active={sortKey === "total_pnl"}
                    dir={sortDir}
                    onClick={() => toggleSort("total_pnl")}
                  />
                  <Th label="Fees" />
                  <ThSort
                    label="Win rate"
                    active={sortKey === "win_rate"}
                    dir={sortDir}
                    onClick={() => toggleSort("win_rate")}
                  />
                  <ThSort
                    label="Max gain"
                    active={sortKey === "win_dollars"}
                    dir={sortDir}
                    onClick={() => toggleSort("win_dollars")}
                  />
                  <ThSort
                    label="Max loss"
                    active={sortKey === "lose_dollars"}
                    dir={sortDir}
                    onClick={() => toggleSort("lose_dollars")}
                  />
                  <Th label="Avg confidence" />
                  <Th label="Median confidence" />
                </>
              ) : null}
              <ThSort
                label="Trades"
                active={sortKey === "num_trades"}
                dir={sortDir}
                onClick={() => toggleSort("num_trades")}
              />
              <ThSort
                label="Sharpe"
                active={sortKey === "sharpe"}
                dir={sortDir}
                onClick={() => toggleSort("sharpe")}
              />
            </tr>
          </thead>
          <tbody style={{ color: "var(--foreground)" }}>
            {isLoading ? (
              <>
                <SkeletonRow cols={6} />
                <SkeletonRow cols={6} />
                <SkeletonRow cols={6} />
              </>
            ) : (
              data.map(
                (
                  r: LeaderboardRow & ReturnType<typeof withDerived>,
                  idx: number,
                ) => (
                  <tr
                    key={r.id}
                    className={clsx("border-b")}
                    style={{
                      borderColor:
                        "color-mix(in oklab, var(--panel-border) 50%, transparent)",
                    }}
                  >
                    <td className="py-1 pr-2 lg:pr-3">{idx + 1}</td>
                    <td className="py-1 pr-2 lg:pr-3">
                      <a
                        className={`inline-flex items-center gap-2 hover:underline`}
                        style={{ color: "inherit" }}
                        onMouseOver={(e) => {
                          (e.currentTarget as HTMLElement).style.color =
                            "var(--link-hover)";
                        }}
                        onMouseOut={(e) => {
                          (e.currentTarget as HTMLElement).style.color = "";
                        }}
                        href={`/models/${encodeURIComponent(r.id)}`}
                      >
                        <ModelLogoChip modelId={r.id} size="sm" />
                        {getModelName(r.id)}
                      </a>
                    </td>
                    <td className="py-1 pr-2 lg:pr-3 tabular-nums">
                      {fmtUSD(r.equity)}
                    </td>
                    <td
                      className={clsx(
                        "py-1 pr-2 lg:pr-3 tabular-nums",
                        pnlClass(r.return_pct),
                      )}
                    >
                      {renderReturnPct(r.return_pct)}
                    </td>
                    {mode === "advanced" ? (
                      <>
                        <td
                          className={clsx(
                            "py-1 pr-2 lg:pr-3 tabular-nums",
                            pnlClass(r.total_pnl),
                          )}
                        >
                          {renderTotalPnl(r.total_pnl)}
                        </td>
                        <td className="py-1 pr-2 lg:pr-3 tabular-nums">
                          {renderFees(r.id, r.total_fees_paid)}
                        </td>
                        <td className="py-1 pr-2 lg:pr-3 tabular-nums">
                          {renderWinRate(r.id, r.win_rate, r.num_trades)}
                        </td>
                        <td
                          className={clsx(
                            "py-1 pr-2 lg:pr-3 tabular-nums",
                            pnlClass(r.win_dollars),
                          )}
                        >
                          {renderExtreme(true, r.win_dollars)}
                        </td>
                        <td
                          className={clsx(
                            "py-1 pr-2 lg:pr-3 tabular-nums",
                            pnlClass(r.lose_dollars),
                          )}
                        >
                          {renderExtreme(false, r.lose_dollars)}
                        </td>
                        <td className="py-1 pr-2 lg:pr-3 tabular-nums">
                          {r.avg_confidence != null
                            ? `${(r.avg_confidence * 100).toFixed(1)}%`
                            : "—"}
                        </td>
                        <td className="py-1 pr-2 lg:pr-3 tabular-nums">
                          {r.median_confidence != null
                            ? `${(r.median_confidence * 100).toFixed(1)}%`
                            : "—"}
                        </td>
                      </>
                    ) : null}
                    <td className="py-1 pr-2 lg:pr-3 tabular-nums">
                      {r.num_trades ?? "—"}
                    </td>
                    <td className="py-1 pr-2 lg:pr-3 tabular-nums">
                      {renderSharpe(r.id, r.sharpe)}
                    </td>
                  </tr>
                ),
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  function toggleSort(k: SortKey) {
    setSortDir((d) => (sortKey === k ? (d === "asc" ? "desc" : "asc") : d));
    setSortKey(k);
  }

  function renderSharpe(id: string, value?: number) {
    const n = sharpeStats?.[id]?.n ?? 0;
    const mean = sharpeStats?.[id]?.mean ?? 0;
    const std = sharpeStats?.[id]?.std ?? 0;
    const s = value != null ? value : sharpeStats?.[id]?.sharpe;
    const content = (
      <div className="space-y-1">
        <div>Sharpe: {s != null ? s.toFixed(3) : "—"}</div>
        <div>Sample days: {n} days</div>
        <div>Excess daily return</div>
        <div className="pl-3">Mean: {fmtPct(mean)}</div>
        <div className="pl-3">Std dev: {fmtPct(std)}</div>
        <div className="opacity-80">{useSharpeHint()}</div>
      </div>
    );
    const muted = n < 3;
    return (
      <Tooltip content={content}>
        <span
          className={clsx(muted ? "text-zinc-400" : undefined)}
          style={{ cursor: "help" }}
        >
          {s != null ? s.toFixed(3) : "—"}
        </span>
      </Tooltip>
    );
  }

  function renderFees(id: string, fees?: number) {
    const a = (analytics as any)?.[id];
    const avg = a?.fee_pnl_moves_breakdown_table?.avg_taker_fee;
    const content = (
      <div className="space-y-1">
        <div>Fees (USD): {fees != null ? fmtUSD(fees) : "—"}</div>
        {avg != null ? <div>Avg fee per trade: {fmtUSD(avg)}</div> : null}
        <div className="opacity-80">
          Definition: Total execution fees from closed trades (including entry and exit taker fees).
        </div>
      </div>
    );
    return (
      <Tooltip content={content}>
        <span style={{ cursor: "help" }}>
          {fees != null ? fmtUSD(fees) : "—"}
        </span>
      </Tooltip>
    );
  }

  function renderWinRate(id: string, rate?: number, trades?: number) {
    const a = (analytics as any)?.[id];
    const wr = rate;
    const content = (
      <div className="space-y-1">
        <div>Win rate: {wr != null ? `${wr.toFixed(1)}%` : "—"}</div>
        <div>Trades: {trades ?? "—"}</div>
        <div className="opacity-80">
          Definition: Closed trades only. Win rate = wins / (wins + losses); open positions excluded.
        </div>
      </div>
    );
    return (
      <Tooltip content={content}>
        <span style={{ cursor: "help" }}>
          {wr != null ? `${wr.toFixed(1)}%` : "—"}
        </span>
      </Tooltip>
    );
  }

  function renderReturnPct(val?: number) {
    const content = (
      <div className="space-y-1">
        <div>Return: {val != null ? `${val.toFixed(2)}%` : "—"}</div>
        <div className="opacity-80">
          Definition: Based on total account equity (includes unrealized PnL) relative to the $10,000 starting capital. Formula: (Equity / Base - 1).
        </div>
      </div>
    );
    return (
      <Tooltip content={content}>
        <span style={{ cursor: "help" }}>
          {val != null ? `${val.toFixed(2)}%` : "—"}
        </span>
      </Tooltip>
    );
  }

  function renderTotalPnl(val?: number) {
    const content = (
      <div className="space-y-1">
        <div>Total PnL: {val != null ? fmtUSD(val) : "—"}</div>
        <div className="opacity-80">
          Definition: Based on total account equity (includes unrealized PnL) relative to the $10,000 starting capital. Formula: Equity − Base.
        </div>
      </div>
    );
    return (
      <Tooltip content={content}>
        <span style={{ cursor: "help" }}>
          {val != null ? fmtUSD(val) : "—"}
        </span>
      </Tooltip>
    );
  }

  function renderExtreme(isWin: boolean, val?: number) {
    const label = isWin ? "Max gain" : "Max loss";
    const content = (
      <div className="space-y-1">
        <div>
          {label}: {val != null ? fmtUSD(val) : "—"}
        </div>
        <div className="opacity-80">
          Definition: Net PnL per trade (including fees), closed trades only.
        </div>
      </div>
    );
    return (
      <Tooltip content={content}>
        <span style={{ cursor: "help" }}>
          {val != null ? fmtUSD(val) : "—"}
        </span>
      </Tooltip>
    );
  }
}

const BASE = 10000; // Starting capital
function withDerived(
  r: LeaderboardRow,
  a?: any,
  latestEquity?: number,
  trades?: number,
  sharpe?: number,
) {
  const winRate = a?.winners_losers_breakdown_table?.win_rate as
    | number
    | undefined;
  // Derive total PnL from return and equity to avoid hard-coding the base capital
  // Use the latest snapshot's dollar_equity to compute equity/return/total PnL
  const equity = latestEquity ?? undefined;
  const totalPnl = equity != null ? equity - BASE : undefined;
  const returnPct = equity != null ? ((equity - BASE) / BASE) * 100 : undefined;
  return {
    ...r,
    equity: equity ?? r.equity,
    return_pct: returnPct ?? r.return_pct,
    win_rate: winRate,
    total_pnl: totalPnl,
    total_fees_paid: a?.fee_pnl_moves_breakdown_table?.total_fees_paid,
    avg_confidence: a?.signals_breakdown_table?.avg_confidence,
    median_confidence: a?.signals_breakdown_table?.median_confidence,
    win_dollars: a?.fee_pnl_moves_breakdown_table?.biggest_net_gain,
    lose_dollars: a?.fee_pnl_moves_breakdown_table?.biggest_net_loss,
    num_trades: trades ?? r.num_trades,
    sharpe: sharpe ?? r.sharpe,
  } as LeaderboardRow & { win_rate?: number; total_pnl?: number };
}

function Th({ label }: { label: string }) {
  return <th className="py-1.5 pr-3 text-xs">{label}</th>;
}

function useSharpeHint() {
  return "Definition: Daily excess returns from closed trades (benchmark: BTC buy & hold), non-annualized, 10% winsorized.";
}

function ThSort({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <th className="py-1.5 pr-3 text-xs">
      <button
        className={clsx("flex items-center gap-1")}
        style={{ color: active ? "var(--foreground)" : "var(--muted-text)" }}
        onClick={onClick}
      >
        {label}
        {active ? (
          <span className="text-[10px]">{dir === "asc" ? "▲" : "▼"}</span>
        ) : null}
      </button>
    </th>
  );
}
