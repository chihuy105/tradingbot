import ModelSelectorBar from "@/components/model/ModelSelectorBar";
import ModelStatsSummary from "@/components/model/ModelStatsSummary";
import ModelOpenPositions from "@/components/model/ModelOpenPositions";
import ModelRecentTradesTable from "@/components/model/ModelRecentTradesTable";
import ModelAnalyticsDetails from "@/components/model/ModelAnalyticsDetails";

export default async function ModelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: raw } = await params;
  const id = decodeURIComponent(raw || "");
  return (
    <main className="min-h-screen w-full px-3 py-3 sm:px-4 sm:py-4 lg:px-8 lg:py-6">
      <div className="mx-auto w-full max-w-7xl space-y-3">
        {/* Model selector buttons at the top (borderless container) */}
        <ModelSelectorBar activeId={id} />

        {/* Summary stats at the top (two sections, full width) */}
        <ModelStatsSummary modelId={id} />

        {/* Analytics details (collapsible) */}
        <ModelAnalyticsDetails modelId={id} />

        {/* Detail sections: current positions and recent trades (stacked vertically) */}
        <div className="space-y-3">
          <div
            className="rounded-md border p-3"
            style={{
              background: "var(--panel-bg)",
              borderColor: "var(--panel-border)",
            }}
          >
            <ModelOpenPositions modelId={id} />
          </div>
          <div
            className="rounded-md border p-3"
            style={{
              background: "var(--panel-bg)",
              borderColor: "var(--panel-border)",
            }}
          >
            <ModelRecentTradesTable modelId={id} />
          </div>
        </div>
      </div>
    </main>
  );
}

// moved imports to top for clarity
