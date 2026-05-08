import {
  Activity, AlertOctagon, Bot, ChevronRight, Coins, FileText,
  Globe, Lock, Network, Radar, Settings, ShieldCheck, Sparkles, Vote,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

const items = [
  { id: "global", label: "Global Overview", icon: Globe, badge: null, role: "viewer" },
  { id: "ai", label: "AI Orchestration", icon: Bot, badge: "12.4k", role: "operator" },
  { id: "crisis", label: "Crisis Operations", icon: AlertOctagon, badge: "4", danger: true, role: "operator" },
  { id: "treasury", label: "Treasury", icon: Coins, badge: null, role: "admin" },
  { id: "verify", label: "Verification", icon: ShieldCheck, badge: null, role: "viewer" },
  { id: "gov", label: "Governance", icon: Vote, badge: "7", role: "operator" },
  { id: "sensors", label: "Sensor Network", icon: Radar, badge: null, role: "viewer" },
  { id: "regions", label: "Regional Nodes", icon: Network, badge: null, role: "viewer" },
  { id: "reports", label: "Reports", icon: FileText, badge: null, role: "viewer" },
  { id: "sim", label: "Simulations", icon: Sparkles, badge: null, role: "operator" },
  { id: "security", label: "Security", icon: Lock, badge: null, role: "admin" },
  { id: "settings", label: "Settings", icon: Settings, badge: null, role: "admin" },
] as const;

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

type Props = {
  onRegionSelect?: (region: string) => void;
  activeRegion?: string | null;
};

export function LeftNav({ onRegionSelect, activeRegion }: Props) {
  const [active, setActive] = useState("global");
  const { roles, hasRole } = useAuth();

  const allowed = (req: string) => {
    if (req === "viewer") return true;
    if (req === "operator") return hasRole("operator") || hasRole("admin");
    if (req === "admin") return hasRole("admin");
    return false;
  };

  return (
    <aside className="w-64 border-r border-border bg-[var(--gradient-panel)] backdrop-blur-md flex flex-col overflow-hidden">
      <div className="p-3 border-b border-border">
        <div className="telemetry-label mb-2 flex items-center justify-between">
          <span>Command Modules</span>
          <span className="text-primary">{roles[0]?.toUpperCase() ?? "VIEWER"}</span>
        </div>
        <nav className="space-y-0.5">
          {items.map((it) => {
            const Icon = it.icon;
            const isActive = active === it.id;
            const ok = allowed(it.role);
            return (
              <button
                key={it.id}
                onClick={() => ok && setActive(it.id)}
                disabled={!ok}
                title={!ok ? `Requires ${it.role.toUpperCase()} clearance` : undefined}
                className={`group w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-xs transition-colors ${
                  !ok
                    ? "text-muted-foreground/40 cursor-not-allowed"
                    : isActive
                      ? "bg-primary/10 text-primary border border-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50 border border-transparent"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="flex-1 text-left font-medium">{it.label}</span>
                {!ok && <Lock className="w-2.5 h-2.5" />}
                {ok && it.badge && (
                  <span
                    className={`font-mono text-[0.6rem] px-1.5 py-0.5 rounded ${
                      "danger" in it && it.danger
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
            <button
              key={r.name}
              onClick={() => onRegionSelect?.(r.name)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-xs transition-colors ${
                activeRegion === r.name
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "hover:bg-accent/40 border border-transparent"
              }`}
            >
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
              <span className="flex-1 text-left text-foreground/80">{r.name}</span>
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
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
