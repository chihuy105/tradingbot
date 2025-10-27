import ModelSelectorBar from "@/components/model/ModelSelectorBar";
import ModelsIndexRedirect from "@/components/model/ModelsIndexRedirect";

export default function ModelsIndexPage() {
  return (
    <main className="min-h-screen w-full px-3 py-3 sm:px-4 sm:py-4 lg:px-8 lg:py-6">
      <div className="mx-auto w-full max-w-7xl space-y-3">
        {/* Keep only the selector at the top; redirect to the first model by default */}
        <ModelSelectorBar />
        <ModelsIndexRedirect />
        <div
          className="rounded-md border p-3 text-xs"
          style={{
            background: "var(--panel-bg)",
            borderColor: "var(--panel-border)",
            color: "var(--muted-text)",
          }}
        >
          Selecting the first model for you…
        </div>
      </div>
    </main>
  );
}
