"use client";
import { useState } from "react";
import { useAnalyticsMap } from "@/lib/api/hooks/useAnalyticsMap";
import { fmtUSD } from "@/lib/utils/formatters";
import { AppButton } from "@/components/ui";

export default function ModelAnalyticsDetails({
  modelId,
}: {
  modelId: string;
}) {
  const { map } = useAnalyticsMap();
  const a: any = map[modelId] || {};
  const [open, setOpen] = useState(false);

  if (!a || Object.keys(a).length === 0) return null;

  const t = a.overall_trades_overview_table || {};
  const w = a.winners_losers_breakdown_table || {};
  const f = a.fee_pnl_moves_breakdown_table || {};
  const s = a.signals_breakdown_table || {};
  const inv = a.invocation_breakdown_table || {};
  const ls = a.longs_shorts_breakdown_table || {};

  return (
    <div
      className="rounded-md border"
      style={{
        background: "var(--panel-bg)",
        borderColor: "var(--panel-border)",
      }}
    >
      <div className="flex items-center justify-between px-3 py-2">
        <div
          className="ui-sans text-sm font-semibold"
          style={{ color: "var(--foreground)" }}
        >
          Analytics details
        </div>
        <AppButton
          variant="outline"
          size="sm"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Collapse" : "Expand"}
        </AppButton>
      </div>
      {open && (
        <div className="px-3 pb-3">
          {/* Top KPI strip: compact four-column grid with right-aligned finance style */}
          <dl
            className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4 lg:grid-cols-8 border-b pb-2"
            style={{ borderColor: "var(--panel-border)" }}
          >
            {kpi("Total trades", intFmt(t.total_trades))}
            {kpi("Avg hold time", minsCompact(t.avg_holding_period_mins))}
            {kpi("Avg leverage", numFmt(t.avg_convo_leverage, 1))}
            {kpi("Avg notional", fmtUSD(t.avg_size_of_trade_notional))}
            {kpi("Win rate", pctFmt(w.win_rate))}
            {kpi("Total fees", fmtUSD(f.total_fees_paid))}
            {kpiColored(
              "Max gain",
              fmtUSD(f.biggest_net_gain),
              f.biggest_net_gain,
            )}
            {kpiColored(
              "Max loss",
              fmtUSD(f.biggest_net_loss),
              f.biggest_net_loss,
            )}
          </dl>

          {/* Single-column groups rendered with subheadings and a three-column grid */}
          <Subhead title="Trade overview" />
          <StatGrid>
            {stat("Median hold time", minsCompact(t.median_holding_period_mins))}
            {stat("Hold time std dev", minsCompact(t.std_holding_period_mins))}
            {stat("Median session leverage", numFmt(t.median_convo_leverage, 1))}
            {stat("Median notional", fmtUSD(t.median_size_of_trade_notional))}
            {stat("Notional std dev", fmtUSD(t.std_size_of_trade_notional))}
          </StatGrid>

          <Subhead title="Winners vs. losers" />
          <StatGrid>
            {statColored(
              "Avg net PnL (wins)",
              fmtUSD(w.avg_winners_net_pnl),
              w.avg_winners_net_pnl,
            )}
            {statColored(
              "Avg net PnL (losses)",
              fmtUSD(w.avg_losers_net_pnl),
              w.avg_losers_net_pnl,
            )}
            {stat("Avg hold (wins)", minsCompact(w.avg_winners_holding_period))}
            {stat("Avg hold (losses)", minsCompact(w.avg_losers_holding_period))}
            {stat("Avg notional (wins)", fmtUSD(w.avg_winners_notional))}
            {stat("Avg notional (losses)", fmtUSD(w.avg_losers_notional))}
          </StatGrid>

          <Subhead title="Signal stats" />
          <StatGrid>
            {stat("Total signals", intFmt(s.total_signals))}
            {stat("Long/short/hold/close mix", percentMix(s))}
            {stat("Flat time share", pctFmt(s.pct_mins_flat_combined))}
            {stat("Avg confidence (overall)", pctFrom0to1(s.avg_confidence))}
            {stat("Avg confidence (long)", pctFrom0to1(s.avg_confidence_long))}
            {stat("Avg confidence (close)", pctFrom0to1(s.avg_confidence_close))}
          </StatGrid>

          <Subhead title="Invocation cadence" />
          <StatGrid>
            {stat("Invocation count", intFmt(inv.num_invocations))}
            {stat("Avg interval", minsCompact(inv.avg_invocation_break_mins))}
            {stat(
              "Min/Max interval",
              rangeFmt(
                inv.min_invocation_break_mins,
                inv.max_invocation_break_mins,
              ),
            )}
          </StatGrid>

          <Subhead title="Long/short breakdown" />
          <StatGrid>
            {stat(
              "Long/short trade count",
              `${intFmt(ls.num_long_trades)} / ${intFmt(ls.num_short_trades)}`,
            )}
            {statColored(
              "Avg net PnL (long)",
              fmtUSD(ls.avg_longs_net_pnl),
              ls.avg_longs_net_pnl,
            )}
            {statColored(
              "Avg net PnL (short)",
              fmtUSD(ls.avg_shorts_net_pnl),
              ls.avg_shorts_net_pnl,
            )}
            {stat(
              "Avg hold (long/short)",
              `${minsCompact(ls.avg_longs_holding_period)} / ${minsCompact(ls.avg_shorts_holding_period)}`,
            )}
          </StatGrid>
        </div>
      )}
    </div>
  );
}

function Subhead({ title }: { title: string }) {
  return (
    <div
      className="ui-sans mt-2 mb-1 border-b pb-1 text-[11px] tracking-wide"
      style={{ borderColor: "var(--panel-border)", color: "var(--muted-text)" }}
    >
      {title}
    </div>
  );
}

function StatGrid({ children }: { children: React.ReactNode }) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-1 md:grid-cols-3 lg:grid-cols-4">
      {children}
    </dl>
  );
}

function kpi(label: string, value?: string) {
  return (
    <div key={label} className="flex items-baseline justify-between">
      <dt
        className="ui-sans text-[11px]"
        style={{ color: "var(--muted-text)" }}
      >
        {label}
      </dt>
      <dd
        className="terminal-text tabular-nums text-[12px]"
        style={{ color: "var(--foreground)" }}
      >
        {value ?? "—"}
      </dd>
    </div>
  );
}

function kpiColored(label: string, value?: string, num?: number) {
  return (
    <div key={label} className="flex items-baseline justify-between">
      <dt
        className="ui-sans text-[11px]"
        style={{ color: "var(--muted-text)" }}
      >
        {label}
      </dt>
      <dd
        className="terminal-text tabular-nums text-[12px]"
        style={{ color: pnlColor(num) }}
      >
        {value ?? "—"}
      </dd>
    </div>
  );
}

function stat(label: string, value?: string) {
  return (
    <div key={label} className="flex items-baseline justify-between">
      <dt
        className="ui-sans text-[11px]"
        style={{ color: "var(--muted-text)" }}
      >
        {label}
      </dt>
      <dd
        className="terminal-text tabular-nums text-[12px]"
        style={{ color: "var(--foreground)" }}
      >
        {value ?? "—"}
      </dd>
    </div>
  );
}

function statColored(label: string, value?: string, num?: number) {
  return (
    <div key={label} className="flex items-baseline justify-between">
      <dt
        className="ui-sans text-[11px]"
        style={{ color: "var(--muted-text)" }}
      >
        {label}
      </dt>
      <dd
        className="terminal-text tabular-nums text-[12px]"
        style={{ color: pnlColor(num) }}
      >
        {value ?? "—"}
      </dd>
    </div>
  );
}

function pnlColor(n?: number | null) {
  if (n == null || Number.isNaN(n)) return "var(--muted-text)";
  return n > 0 ? "#22c55e" : n < 0 ? "#ef4444" : "var(--muted-text)";
}

function intFmt(n?: number) {
  if (n == null || Number.isNaN(n)) return "—";
  return Number(n).toLocaleString();
}

function numFmt(n?: number, d = 1) {
  if (n == null || Number.isNaN(n)) return "—";
  return String(Number(n).toFixed(d));
}

function pctFmt(n?: number) {
  if (n == null || Number.isNaN(n)) return "—";
  return `${Number(n).toFixed(1)}%`;
}

function pctFrom0to1(n?: number) {
  if (n == null || Number.isNaN(n)) return "—";
  return `${(Number(n) * 100).toFixed(1)}%`;
}

function minsCompact(n?: number) {
  if (n == null || Number.isNaN(n)) return "—";
  const m = Math.round(n);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h >= 24) {
    const d = Math.floor(h / 24);
    const hh = h % 24;
    return `${d}d${hh}h`;
  }
  return h ? `${h}h${String(mm).padStart(2, "0")}m` : `${mm}m`;
}

function rangeFmt(a?: number, b?: number) {
  const A = minsCompact(a);
  const B = minsCompact(b);
  if (A === "—" && B === "—") return "—";
  return `${A}/${B}`;
}

function percentMix(s: any) {
  const L = s.long_signal_pct,
    S = s.short_signal_pct,
    H = s.hold_signal_pct,
    C = s.close_signal_pct;
  const parts: string[] = [];
  if (L != null) parts.push(`Long ${L.toFixed(1)}%`);
  if (S != null) parts.push(`Short ${S.toFixed(1)}%`);
  if (H != null) parts.push(`Hold ${H.toFixed(1)}%`);
  if (C != null) parts.push(`Close ${C.toFixed(1)}%`);
  return parts.length ? parts.join(" · ") : "—";
}
