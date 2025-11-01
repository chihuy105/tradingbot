import PriceTicker from "@/components/layout/PriceTicker";
import AccountValueChart from "@/components/chart/AccountValueChart";
import { Suspense } from "react";
import RightTabsContainer from "@/components/tabs/RightTabsContainer";

export default function Home() {
  return (
    <main className="w-full terminal-scan flex flex-col h-[calc(100vh-var(--header-h))]">
      <PriceTicker />
      <section className="grid grid-cols-1 gap-3 p-3 overflow-hidden lg:grid-cols-3 lg:gap-3 lg:p-3 h-[calc(100vh-var(--header-h)-var(--ticker-h))]">
        <div className="lg:col-span-2 h-full">
          <AccountValueChart />
        </div>
        <div className="lg:col-span-1 h-full overflow-hidden">
          <Suspense
            fallback={
              <div className="mb-2 text-xs text-zinc-500">Loading tabs…</div>
            }
          >
            <RightTabsContainer />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
