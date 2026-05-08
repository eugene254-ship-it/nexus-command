import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TopCommandBar } from "@/components/nexus/TopCommandBar";
import { LeftNav } from "@/components/nexus/LeftNav";
import { WorldEngine } from "@/components/nexus/WorldEngine";
import { RightPanel } from "@/components/nexus/RightPanel";
import { BottomBar } from "@/components/nexus/BottomBar";
import { DrillDownPanel } from "@/components/nexus/DrillDownPanel";
import { useAlerts } from "@/hooks/use-alerts";
import { useLiveTelemetry } from "@/hooks/use-telemetry";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Core Nexus — Planetary Operations Command Center" },
      {
        name: "description",
        content:
          "Real-time planetary situational awareness, AI orchestration, crisis coordination, and verification transparency.",
      },
    ],
  }),
  component: CoreNexus,
});

function CoreNexus() {
  const { alerts } = useAlerts();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const { frames, connected } = useLiveTelemetry(alerts.map((a) => a.hotspot_id));

  const selectedAlert = alerts.find((a) => a.id === selectedId) ?? null;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden text-foreground">
      <TopCommandBar streamConnected={connected} />
      <div className="flex-1 flex min-h-0">
        <LeftNav onRegionSelect={setSelectedRegion} activeRegion={selectedRegion} />
        <main className="flex-1 flex min-w-0 relative">
          <WorldEngine
            alerts={alerts}
            telemetry={frames}
            onSelect={setSelectedId}
            selectedId={selectedId}
            highlightRegion={selectedRegion}
          />
          <RightPanel
            alerts={alerts}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          {(selectedAlert || selectedRegion) && (
            <DrillDownPanel
              alert={selectedAlert}
              region={selectedRegion}
              alerts={alerts}
              telemetry={frames}
              onClose={() => {
                setSelectedId(null);
                setSelectedRegion(null);
              }}
            />
          )}
        </main>
      </div>
      <BottomBar />
    </div>
  );
}
