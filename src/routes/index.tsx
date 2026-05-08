import { createFileRoute } from "@tanstack/react-router";
import { TopCommandBar } from "@/components/nexus/TopCommandBar";
import { LeftNav } from "@/components/nexus/LeftNav";
import { WorldEngine } from "@/components/nexus/WorldEngine";
import { RightPanel } from "@/components/nexus/RightPanel";
import { BottomBar } from "@/components/nexus/BottomBar";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Core Nexus — Planetary Operations Command Center" },
      {
        name: "description",
        content:
          "Real-time planetary situational awareness, AI orchestration, crisis coordination, and verification transparency.",
      },
      { property: "og:title", content: "Core Nexus — Planetary Operations Command" },
      {
        property: "og:description",
        content: "Mission-critical interface for global infrastructure, AI agents, and ethical governance.",
      },
    ],
  }),
  component: CoreNexus,
});

function CoreNexus() {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden text-foreground">
      <TopCommandBar />
      <div className="flex-1 flex min-h-0">
        <LeftNav />
        <main className="flex-1 flex min-w-0">
          <WorldEngine />
          <RightPanel />
        </main>
      </div>
      <BottomBar />
    </div>
  );
}
