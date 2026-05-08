import { Sparkles, TrendingUp, ChevronRight } from "lucide-react";
import type { AlertRow } from "@/hooks/use-alerts";

const sevColor: Record<string, string> = {
  low: "var(--color-emerald)",
  medium: "var(--color-amber)",
  high: "var(--color-amber)",
  critical: "var(--color-crimson)",
};

const statusLabel: Record<string, string> = {
  open: "Pending",
  approved: "Approved",
  hold: "Hold",
  escalated: "Escalated",
  resolved: "Resolved",
};

type Props = {
  alerts: AlertRow[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

export function RightPanel({ alerts, selectedId, onSelect }: Props) {
  return (
    <aside className="w-80 flex flex-col gap-2 p-2 overflow-hidden">
      <div className="panel flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="panel-header">
          <span className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full pulse-dot"
              style={{ color: "var(--color-crimson)", background: "var(--color-crimson)" }}
            />
            Crisis Feed
          </span>
          <span className="font-mono text-[0.65rem] text-primary normal-case tracking-normal">
            {alerts.length} ACTIVE · LIVE
          </span>
        </div>
        <div className="flex-1 overflow-auto scrollbar-thin p-2 space-y-2">
          {alerts.map((a) => {
            const color = sevColor[a.severity];
            const isSel = a.id === selectedId;
            return (
              <button
                key={a.id}
                onClick={() => onSelect(isSel ? null : a.id)}
                className={`w-full text-left rounded border p-2.5 transition-colors ${
                  isSel
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card/40 hover:border-primary/40"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="font-mono text-[0.6rem] px-1.5 py-0.5 rounded uppercase tracking-wider"
                    style={{
                      color,
                      border: `1px solid ${color}`,
                      background: `color-mix(in oklab, ${color} 15%, transparent)`,
                    }}
                  >
                    {a.severity}
                  </span>
                  <span className="font-mono text-[0.6rem] text-muted-foreground">
                    {a.eta_minutes ? `ETA ${a.eta_minutes}m` : statusLabel[a.status]}
                  </span>
                </div>
                <div className="text-xs font-medium text-foreground leading-snug mb-2">
                  {a.title}
                </div>
                <div className="grid grid-cols-3 gap-1 text-[0.6rem] font-mono">
                  <div>
                    <div className="telemetry-label">Conf</div>
                    <div className="text-primary">{a.confidence_score}%</div>
                  </div>
                  <div>
                    <div className="telemetry-label">AI</div>
                    <div className="text-foreground/80 truncate">{a.ai_consensus ?? "—"}</div>
                  </div>
                  <div>
                    <div className="telemetry-label">Status</div>
                    <div
                      className="text-foreground/80"
                      style={{
                        color:
                          a.status === "approved"
                            ? "var(--color-emerald)"
                            : a.status === "escalated"
                              ? "var(--color-crimson)"
                              : a.status === "hold"
                                ? "var(--color-amber)"
                                : undefined,
                      }}
                    >
                      {statusLabel[a.status]}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
          {alerts.length === 0 && (
            <div className="text-center text-xs text-muted-foreground py-8">
              No alerts in stream.
            </div>
          )}
        </div>
      </div>

      <div className="panel p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="telemetry-label flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Planetary Risk Index
          </span>
          <span className="font-mono text-xs" style={{ color: "var(--color-amber)" }}>
            ELEVATED
          </span>
        </div>
        <div className="flex items-end gap-3">
          <div className="font-display text-3xl font-bold text-foreground">62.4</div>
          <div
            className="flex items-center gap-1 text-[0.65rem] font-mono pb-1.5"
            style={{ color: "var(--color-crimson)" }}
          >
            <TrendingUp className="w-3 h-3" /> +1.8 24h
          </div>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden flex">
          <div className="h-full" style={{ width: "30%", background: "var(--color-emerald)" }} />
          <div className="h-full" style={{ width: "32%", background: "var(--color-amber)" }} />
          <div className="h-full" style={{ width: "20%", background: "var(--color-crimson)" }} />
          <div className="h-full" style={{ width: "18%", background: "oklch(0.30 0.05 280)" }} />
        </div>
        <button className="mt-3 w-full text-[0.65rem] font-mono uppercase tracking-wider py-1.5 rounded border border-border hover:border-primary/40 hover:text-primary text-muted-foreground flex items-center justify-center gap-1">
          Open Full Briefing <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </aside>
  );
}
