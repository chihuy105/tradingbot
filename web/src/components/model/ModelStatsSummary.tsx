"use client";
import { useMemo } from "react";
import { useAccountTotals } from "@/lib/api/hooks/useAccountTotals";
import { useAnalyticsMap } from "@/lib/api/hooks/useAnalyticsMap";
import { usePositions } from "@/lib/api/hooks/usePositions";
import { useTrades } from "@/lib/api/hooks/useTrades";
import { fmtUSD } from "@/lib/utils/formatters";
import Tooltip from "@/components/ui/Tooltip";

export default function ModelStatsSummary({ modelId }: { modelId: string }) {
  const { data: totalsData } = useAccountTotals();
  const { map: analytics } = useAnalyticsMap();
  const { positionsByModel } = usePositions();
  const { trades } = useTrades();

  const latest = useMemo(() => {
    const arr = totalsData?.accountTotals ?? [];
    for (let i = arr.length - 1; i >= 0; i--) {
      const r = arr[i] as any;
      const id = String(r.model_id || r.id || "");
      if (id === modelId) return r as any;
    }
    return undefined;
  }, [totalsData, modelId]);

  const open = useMemo(() => {
    const found = positionsByModel.find((m) => m.id === modelId);
    return Object.values(found?.positions || {});
  }, [positionsByModel, modelId]);

  const a = analytics[modelId] || {};
  const fees = a?.fee_pnl_moves_breakdown_table?.total_fees_paid;
  const biggestWin = a?.fee_pnl_moves_breakdown_table?.biggest_net_gain;
  const biggestLoss = a?.fee_pnl_moves_breakdown_table?.biggest_net_loss;
  const avgConf = a?.signals_breakdown_table?.avg_confidence; // 0-1

  // Total PnL and net realized:
  // - Prefer overall_pnl_with_fees when available, otherwise (realized_pnl + unrealized_pnl)
  // Total PnL aligns with the leaderboard definition = latest equity − starting capital ($10,000)
  const BASE = 10000;
  const latestEquity =
    latest?.dollar_equity ?? latest?.equity ?? latest?.account_value;
  const totalPnl =
    typeof latestEquity === "number" ? latestEquity - BASE : undefined;

  // Net realized PnL: sum over trades to avoid snapshot inconsistencies
  const netRealized = useMemo(() => {
    const my = trades.filter((t) => t.model_id === modelId);
    return my.reduce((acc, t) => acc + (Number(t.realized_net_pnl) || 0), 0);
  }, [trades, modelId]);
  const totalAccountValue =
    latest?.dollar_equity ?? latest?.equity ?? latest?.account_value;

  // Estimated available cash: equity − total margin on open positions
  const sumMargin = open.reduce(
    (acc: number, p: any) => acc + (p.margin || 0),
    0,
  );
  const availableCash =
    typeof totalAccountValue === "number"
      ? totalAccountValue - sumMargin
      : undefined;

  // Average leverage: prefer analytics-derived numbers, fall back to recent trades
  const modelTrades = useMemo(
    () => trades.filter((t) => t.model_id === modelId),
    [trades, modelId],
  );
  const avgLev = useMemo(() => {
    // 1) Prefer overall_trades_overview_table.avg_convo_leverage
    const fromOverall = (
      analytics[modelId]?.overall_trades_overview_table as any
    )?.avg_convo_leverage;
    if (typeof fromOverall === "number" && fromOverall > 0) return fromOverall;
    // 2) Next prefer signals_breakdown_table.avg_leverage
    const fromSignals = (analytics[modelId]?.signals_breakdown_table as any)
      ?.avg_leverage;
    if (typeof fromSignals === "number" && fromSignals > 0) return fromSignals;
    // 3) Fallback: average leverage from recent trades
    if (!modelTrades.length) return undefined;
    const sum = modelTrades.reduce(
      (acc, t) => acc + (Number(t.leverage) || 0),
      0,
    );
    return sum / modelTrades.length;
  }, [analytics, modelId, modelTrades]);

  // Hold times: derived from the latest N=200 trades with weighted durations
  const holdTimes = useMemo(() => {
    const last = modelTrades
      .slice()
      .sort(
        (a, b) => (b.exit_time || b.entry_time) - (a.exit_time || a.entry_time),
      )
      .slice(0, 200);
    type Interval = { s: number; e: number };
    const longI: Interval[] = [];
    const shortI: Interval[] = [];
    for (const t of last) {
      const s = (t.entry_time || 0) * 1000;
      const e = (t.exit_time || t.entry_time || 0) * 1000;
      if (!s || !e || e <= s) continue;
      (t.side === "long" ? longI : shortI).push({ s, e });
    }
    if (!longI.length && !shortI.length)
      return { longPct: 0, shortPct: 0, flatPct: 100 };
    const minS = Math.min(...[...longI, ...shortI].map((x) => x.s));
    const maxE = Math.max(...[...longI, ...shortI].map((x) => x.e));
    const totalRange = Math.max(1, maxE - minS);
    const unionLen = (arr: Interval[]) => {
      if (!arr.length) return 0;
      const sorted = arr.slice().sort((a, b) => a.s - b.s);
      let curS = sorted[0].s,
        curE = sorted[0].e,
        sum = 0;
      for (let i = 1; i < sorted.length; i++) {
        const it = sorted[i];
        if (it.s <= curE) curE = Math.max(curE, it.e);
        else {
          sum += curE - curS;
          curS = it.s;
          curE = it.e;
        }
      }
      sum += curE - curS;
      return sum;
    };
    const longU = unionLen(longI);
    const shortU = unionLen(shortI);
    const anyU = unionLen([...longI, ...shortI]);
    const flat = Math.max(0, 1 - anyU / totalRange);
    const remain = 1 - flat;
    const sumLS = longU + shortU;
    const long = sumLS > 0 ? (longU / sumLS) * remain : 0;
    const short = sumLS > 0 ? (shortU / sumLS) * remain : 0;
    return {
      longPct: Math.max(0, Math.min(long * 100, 100)),
      shortPct: Math.max(0, Math.min(short * 100, 100)),
      flatPct: Math.max(0, Math.min(flat * 100, 100)),
    };
  }, [modelTrades]);

  return (
    <div className="space-y-3">
      {/* Part 1: wider summary block */}
      <div
        className="rounded-md border p-4 relative"
        style={{
          background: "var(--panel-bg)",
          borderColor: "var(--panel-border)",
        }}
      >
        {/* Muted text in the top-right corner */}
        <div
          className="absolute right-3 top-2 ui-sans text-[11px] whitespace-nowrap"
          style={{ color: "var(--muted-text)" }}
        >
          Excludes funding fees and rebates
        </div>
        {/* Highlight the most important metrics first */}
        <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Stat
            label="Total account equity"
            value={fmtUSD(totalAccountValue)}
            tip={<div>Definition: Account equity from the latest snapshot (includes unrealized PnL).</div>}
          />
          <Stat
            label="Total PnL"
            value={fmtUSD(totalPnl)}
            tone="pnl"
            num={totalPnl}
            tip={
              <div>
                Definition: Prefer analytics overall PnL (fees included); otherwise realized + unrealized PnL.
              </div>
            }
          />
          <Stat
            label="Realized PnL"
            value={fmtUSD(netRealized)}
            tone="pnl"
            num={netRealized}
            tip={<div>Definition: Net profit from closed trades.</div>}
          />
        </div>
        {/* Secondary metrics */}
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <Stat
            label="Available cash (est.)"
            value={fmtUSD(availableCash)}
            tip={<div>Estimate: Total equity − margin tied to open positions.</div>}
          />
          <Stat
            label="Total fees"
            value={fmtUSD(fees)}
            tip={<div>Definition: Total execution fees from closed trades.</div>}
          />
        </div>
      </div>

      {/* Part 2: additional metrics */}
      <div
        className="rounded-md border p-4"
        style={{
          background: "var(--panel-bg)",
          borderColor: "var(--panel-border)",
        }}
      >
        <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
          <Stat
            label="Average leverage"
            value={avgLev != null ? `${avgLev.toFixed(1)}` : "—"}
            tip={
              <div>
                Definition: Prefer overall_trades_overview_table.avg_convo_leverage, fall back to signals.avg_leverage, otherwise use the average from recent trades.
              </div>
            }
          />
          <Stat
            label="Average confidence"
            value={avgConf != null ? `${(avgConf * 100).toFixed(1)}%` : "—"}
            tip={<div>Definition: Arithmetic mean of signal confidence.</div>}
          />
          <Stat
            label="Max gain"
            value={fmtUSD(biggestWin)}
            tone="pnl"
            num={biggestWin}
            tip={<div>Definition: Largest net profit from a closed trade.</div>}
          />
          <Stat
            label="Max loss"
            value={fmtUSD(biggestLoss)}
            tone="pnl"
            num={biggestLoss}
            tip={<div>Definition: Largest net loss from a closed trade.</div>}
          />
        </div>
        <div className="mt-3">
          <div
            className="ui-sans text-xs"
            style={{ color: "var(--muted-text)" }}
          >
            Hold time breakdown
          </div>
          <div className="mt-1 grid grid-cols-3 gap-2 text-sm">
            <div>
              Long:
              <span className="tabular-nums">
                {holdTimes.longPct.toFixed(1)}%
              </span>
            </div>
            <div>
              Short:
              <span className="tabular-nums">
                {holdTimes.shortPct.toFixed(1)}%
              </span>
            </div>
            <div>
              Flat:
              <span className="tabular-nums">
                {holdTimes.flatPct.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
  num,
  tip,
}: {
  label: string;
  value?: string;
  tone?: "pnl";
  num?: number | null | undefined;
  tip?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <div className="ui-sans text-xs" style={{ color: "var(--muted-text)" }}>
        {tip ? (
          <Tooltip content={tip}>
            <span style={{ cursor: "help" }}>{label}</span>
          </Tooltip>
        ) : (
          label
        )}
      </div>
      <div
        className="tabular-nums text-base font-semibold"
        style={{
          color:
            tone === "pnl"
              ? num == null || Number.isNaN(num)
                ? "var(--muted-text)"
                : num > 0
                  ? "#22c55e"
                  : num < 0
                    ? "#ef4444"
                    : "var(--muted-text)"
              : "var(--foreground)",
        }}
      >
        {value ?? "—"}
      </div>
    </div>
  );
}
