import {
  Activity, AlertOctagon, Bot, ChevronRight, Coins, FileText,
  Globe, Lock, Network, Radar, Settings, ShieldCheck, Sparkles, Vote,
} from "lucide-react";
import { useState } from "react";

const items = [
  { id: "global", label: "Global Overview", icon: Globe, badge: null },
  { id: "ai", label: "AI Orchestration", icon: Bot, badge: "12.4k" },
  { id: "crisis", label: "Crisis Operations", icon: AlertOctagon, badge: "4", danger: true },
  { id: "treasury", label: "Treasury", icon: Coins, badge: null },
  { id: "verify", label: "Verification", icon: ShieldCheck, badge: null },
  { id: "gov", label: "Governance", icon: Vote, badge: "7" },
  { id: "sensors", label: "Sensor Network", icon: Radar, badge: null },
  { id: "regions", label: "Regional Nodes", icon: Network, badge: null },
  { id: "reports", label: "Reports", icon: FileText, badge: null },
  { id: "sim", label: "Simulations", icon: Sparkles, badge: null },
  { id: "security", label: "Security", icon: Lock, badge: null },
  { id: "settings", label: "Settings", icon: Settings, badge: null },
];

const regions = [
  { name: "North America", health: 94 },
  { name: "South America", health: 88 },
  { name: "Europe", health: 91 },
  { name: "Africa", health: 72, alert: true },
  { name: "Middle East", health: 68, alert: true },
  { name: "Asia Pacific", health: 89 },
  { name: "Oceania", health: 96 },
  { name: "Polar Zones", health: 81 },
];

export function LeftNav() {
  const [active, setActive] = useState("global");

  return (
    <aside className="w-64 border-r border-border bg-[var(--gradient-panel)] backdrop-blur-md flex flex-col overflow-hidden">
      <div className="p-3 border-b border-border">
        <div className="telemetry-label mb-2">Command Modules</div>
        <nav className="space-y-0.5">
          {items.map((it) => {
            const Icon = it.icon;
            const isActive = active === it.id;
            return (
              <button
                key={it.id}
                onClick={() => setActive(it.id)}
                className={`group w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-xs transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50 border border-transparent"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="flex-1 text-left font-medium">{it.label}</span>
                {it.badge && (
                  <span
                    className={`font-mono text-[0.6rem] px-1.5 py-0.5 rounded ${
                      it.danger
                        ? "bg-destructive/20 text-destructive"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {it.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-3 flex-1 overflow-auto scrollbar-thin">
        <div className="telemetry-label mb-2 flex items-center gap-1.5">
          <Activity className="w-3 h-3" /> Region Tree
        </div>
        <div className="space-y-1">
          {regions.map((r) => (
            <div
              key={r.name}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent/40 cursor-pointer text-xs"
            >
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
              <span className="flex-1 text-foreground/80">{r.name}</span>
              <div className="w-12 h-1 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full"
                  style={{
                    width: `${r.health}%`,
                    background: r.alert ? "var(--color-amber)" : "var(--color-emerald)",
                  }}
                />
              </div>
              <span className="font-mono text-[0.6rem] text-muted-foreground w-7 text-right">
                {r.health}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 border-t border-border bg-card/40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 grid place-items-center">
            <span className="text-[0.6rem] font-mono text-primary">OP</span>
          </div>
          <div className="leading-tight">
            <div className="text-xs font-medium text-foreground">Operator-07</div>
            <div className="text-[0.6rem] font-mono text-muted-foreground">Tier-3 · CLEARED</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
