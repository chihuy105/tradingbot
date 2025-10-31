"use client";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useAccountTotals } from "@/lib/api/hooks/useAccountTotals";
import { usePositions } from "@/lib/api/hooks/usePositions";
import { useTrades } from "@/lib/api/hooks/useTrades";
import { fmtUSD, pnlClass } from "@/lib/utils/formatters";
import { getModelName } from "@/lib/model/meta";
import { useTheme } from "@/store/useTheme";

export default function ModelDetailsPanel({
  modelId: propModelId,
}: {
  modelId?: string;
}) {
  // Use CSS variables via styles instead of theme branching
  const search = useSearchParams();
  const urlModel = search.get("model") || undefined;
  const modelId = (propModelId || urlModel || "").trim();

  const { data: totalsData } = useAccountTotals();
  const { positionsByModel } = usePositions();
  const { trades } = useTrades();

  const latest = useMemo(() => {
    const list: any[] =
      totalsData && (totalsData as any).accountTotals
        ? (totalsData as any).accountTotals
        : [];
    // Find latest entry for modelId
    let row: any | undefined;
    for (let i = list.length - 1; i >= 0; i--) {
      const r = list[i];
      if (r?.model_id === modelId || r?.id === modelId) {
        row = r;
        break;
      }
    }
    if (!row && list.length) row = list[list.length - 1];
    return row;
  }, [totalsData, modelId]);

  const positions = useMemo(() => {
    const found = positionsByModel.find((m) => m.id === modelId);
    return found ? Object.values(found.positions || {}) : [];
  }, [positionsByModel, modelId]);

  const recentTrades = useMemo(
    () =>
      trades
        .filter((t) => t.model_id === modelId)
        .slice(-5)
        .reverse(),
    [trades, modelId],
  );

  if (!modelId)
    return (
      <div className="text-xs" style={{ color: "var(--muted-text)" }}>
        Please select a model (use the `Model` filter in the top right).
      </div>
    );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div
          className={`text-sm font-semibold`}
          style={{ color: "var(--foreground)" }}
        >
          {getModelName(modelId)}
        </div>
        <div className={`text-xs`} style={{ color: "var(--muted-text)" }}>
          Model ID: {modelId}
        </div>
      </div>

      <div
        className={`grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]`}
        style={{ color: "var(--muted-text)" }}
      >
        <div>
          Equity:
          <span className="tabular-nums">
            {fmtUSD(
              latest?.dollar_equity ?? latest?.equity ?? latest?.account_value,
            )}
          </span>
        </div>
        <div>
          Cumulative return:
          <span className={pnlClass(latest?.cum_pnl_pct)}>
            {latest?.cum_pnl_pct != null
              ? `${latest.cum_pnl_pct.toFixed(2)}%`
              : "—"}
          </span>
        </div>
        <div>
          Realized PnL:
          <span className={pnlClass(latest?.realized_pnl)}>
            {fmtUSD(latest?.realized_pnl)}
          </span>
        </div>
        <div>
          Unrealized PnL:
          <span className={pnlClass(latest?.total_unrealized_pnl)}>
            {fmtUSD(latest?.total_unrealized_pnl)}
          </span>
        </div>
      </div>

      <div
        className={`rounded-md border`}
        style={{ borderColor: "var(--panel-border)" }}
      >
        <div
          className={`border-b px-3 py-2 text-xs`}
          style={{
            borderColor: "var(--panel-border)",
            color: "var(--muted-text)",
          }}
        >
          Current positions
        </div>
        <div className="max-h-64 overflow-auto">
          <table className="w-full text-left text-[11px]">
            <thead style={{ color: "var(--muted-text)" }}>
              <tr
                className={`border-b`}
                style={{ borderColor: "var(--panel-border)" }}
              >
                <th className="py-1.5 pr-3">Side</th>
                <th className="py-1.5 pr-3">Symbol</th>
                <th className="py-1.5 pr-3">Leverage</th>
                <th className="py-1.5 pr-3">Entry price</th>
                <th className="py-1.5 pr-3">Current price</th>
                <th className="py-1.5 pr-3">Unrealized PnL</th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--foreground)" }}>
              {positions.length ? (
                positions.map((p: any, i: number) => {
                  const side = p.quantity > 0 ? "LONG" : "SHORT";
                  return (
                    <tr
                      key={i}
                      className={`border-b`}
                      style={{
                        borderColor:
                          "color-mix(in oklab, var(--panel-border) 50%, transparent)",
                      }}
                    >
                      <td className="py-1.5 pr-3">{side}</td>
                      <td className="py-1.5 pr-3">{p.symbol}</td>
                      <td className="py-1.5 pr-3">{p.leverage}x</td>
                      <td className="py-1.5 pr-3 tabular-nums">
                        {fmtUSD(p.entry_price)}
                      </td>
                      <td className="py-1.5 pr-3 tabular-nums">
                        {fmtUSD(p.current_price)}
                      </td>
                      <td
                        className={`py-1.5 pr-3 tabular-nums ${pnlClass(p.unrealized_pnl)}`}
                      >
                        {fmtUSD(p.unrealized_pnl)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    className={`p-3 text-xs`}
                    style={{ color: "var(--muted-text)" }}
                    colSpan={6}
                  >
                    No open positions
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className={`rounded-md border`}
        style={{ borderColor: "var(--panel-border)" }}
      >
        <div
          className={`border-b px-3 py-2 text-xs`}
          style={{
            borderColor: "var(--panel-border)",
            color: "var(--muted-text)",
          }}
        >
          Recent trades
        </div>
        <div className="max-h-48 overflow-auto">
          <table className="w-full text-left text-[11px]">
            <thead style={{ color: "var(--muted-text)" }}>
              <tr
                className={`border-b`}
                style={{ borderColor: "var(--panel-border)" }}
              >
                <th className="py-1.5 pr-3">Symbol</th>
                <th className="py-1.5 pr-3">Side</th>
                <th className="py-1.5 pr-3">Leverage</th>
                <th className="py-1.5 pr-3">Net PnL</th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--foreground)" }}>
              {recentTrades.length ? (
                recentTrades.map((t: any) => (
                  <tr
                    key={t.id}
                    className={`border-b`}
                    style={{
                      borderColor:
                        "color-mix(in oklab, var(--panel-border) 50%, transparent)",
                    }}
                  >
                    <td className="py-1.5 pr-3">{t.symbol}</td>
                    <td className="py-1.5 pr-3">{t.side?.toUpperCase()}</td>
                    <td className="py-1.5 pr-3">{t.leverage}x</td>
                    <td
                      className={`py-1.5 pr-3 tabular-nums ${pnlClass(t.realized_net_pnl)}`}
                    >
                      {fmtUSD(t.realized_net_pnl)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className={`p-3 text-xs`}
                    style={{ color: "var(--muted-text)" }}
                    colSpan={4}
                  >
                    No trades yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
