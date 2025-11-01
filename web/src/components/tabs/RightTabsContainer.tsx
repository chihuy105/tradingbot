"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PositionsPanel } from "@/components/tabs/PositionsPanel";
import TradesTable from "@/components/trades/TradesTable";
import AnalyticsPanel from "@/components/analytics/AnalyticsPanel";
import ReadmePanel from "@/components/tabs/ReadmePanel";
import ModelChatPanel from "@/components/chat/ModelChatPanel";

export default function RightTabsContainer() {
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tab = search.get("tab") || "positions";

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(search.toString());
    if (value === "positions") {
      params.delete("tab");
    } else {
      params.set("tab", value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Tabs value={tab} onValueChange={handleTabChange} className="h-full flex flex-col">
      <TabsList className="mb-2">
        <TabsTrigger value="positions" className="text-xs">
          Positions
        </TabsTrigger>
        <TabsTrigger value="chat" className="text-xs">
          Model Chat
        </TabsTrigger>
        <TabsTrigger value="trades" className="text-xs">
          Executions
        </TabsTrigger>
        <TabsTrigger value="analytics" disabled className="text-xs">
          Analytics
        </TabsTrigger>
        <TabsTrigger value="readme" className="text-xs">
          README.md
        </TabsTrigger>
      </TabsList>

      <div className="flex-1 overflow-y-auto pr-1">
        <TabsContent value="positions" className="h-full">
          <PositionsPanel />
        </TabsContent>
        <TabsContent value="chat" className="h-full">
          <ModelChatPanel />
        </TabsContent>
        <TabsContent value="trades" className="h-full">
          <TradesTable />
        </TabsContent>
        <TabsContent value="analytics" className="h-full">
          <AnalyticsPanel />
        </TabsContent>
        <TabsContent value="readme" className="h-full">
          <ReadmePanel />
        </TabsContent>
      </div>
    </Tabs>
  );
}
