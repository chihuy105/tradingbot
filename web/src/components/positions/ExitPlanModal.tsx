"use client";
import Modal from "@/components/ui/Modal";
import { fmtUSD } from "@/lib/utils/formatters";
import type { ExitPlan } from "@/lib/api/types";

export function ExitPlanModal({
  open,
  onClose,
  modelId,
  symbol,
  exitPlan,
}: {
  open: boolean;
  onClose: () => void;
  modelId: string;
  symbol: string;
  exitPlan?: ExitPlan;
}) {
  const hasPlan = !!(
    exitPlan &&
    (exitPlan.profit_target ||
      exitPlan.stop_loss ||
      exitPlan.invalidation_condition)
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Exit plan • ${modelId} • ${symbol}`}
    >
      {hasPlan ? (
        <div className="space-y-2">
          <div
            className="flex items-center justify-between"
            style={{ color: "var(--muted-text)" }}
          >
            <span>Target price</span>
            <span className="tabular-nums">
              {exitPlan?.profit_target != null
                ? fmtUSD(exitPlan?.profit_target)
                : "—"}
            </span>
          </div>
          <div
            className="flex items-center justify-between"
            style={{ color: "var(--muted-text)" }}
          >
            <span>Stop loss</span>
            <span className="tabular-nums">
              {exitPlan?.stop_loss != null ? fmtUSD(exitPlan?.stop_loss) : "—"}
            </span>
          </div>
          <div>
            <div className="mb-1" style={{ color: "var(--muted-text)" }}>
              Invalidation condition
            </div>
            <p
              className="whitespace-pre-wrap"
              style={{ color: "var(--foreground)" }}
            >
              {exitPlan?.invalidation_condition || "—"}
            </p>
          </div>
        </div>
      ) : (
        <div style={{ color: "var(--muted-text)" }}>No exit plan yet.</div>
      )}
    </Modal>
  );
}

export default ExitPlanModal;
