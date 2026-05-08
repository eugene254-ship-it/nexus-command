import { Bot, CheckCircle2, ChevronRight, Sparkles, TrendingUp } from "lucide-react";

const alerts = [
  {
    sev: "SEVERE",
    color: "var(--color-crimson)",
    title: "East Africa Water Risk Escalation",
    confidence: 92,
    consensus: "Confirmed",
    human: "Pending",
    eta: "12m",
  },
  {
    sev: "HIGH",
    color: "var(--color-amber)",
    title: "South Asia Grid Strain — Mumbai Cluster",
    confidence: 81,
    consensus: "2/3 agents",
    human: "Reviewing",
    eta: "27m",
  },
  {
    sev: "MED",
    color: "var(--color-amber)",
    title: "Arctic Sensor Drift Anomaly",
    confidence: 67,
    consensus: "Inconclusive",
    human: "Queued",
    eta: "1h 4m",
  },
  {
    sev: "LOW",
    color: "var(--color-emerald)",
    title: "Amazon Regen Yield +3.2% Week-over-Week",
    confidence: 99,
    consensus: "Confirmed",
    human: "Acknowledged",
    eta: "—",
  },
];

const aiDecisions = [
  { agent: "ORACLE-Δ4", action: "Reroute humanitarian convoy via NBO-3", risk: "Low" },
  { agent: "ATLAS-K9", action: "Throttle Sahel solar farm to grid stability", risk: "Med" },
  { agent: "GAIA-07", action: "Deploy verification swarm to Kenya basin", risk: "Low" },
];

export function RightPanel() {
  return (
    <aside className="w-80 flex flex-col gap-2 p-2 overflow-hidden">
      {/* Crisis feed */}
      <div className="panel flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="panel-header">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ color: "var(--color-crimson)", background: "var(--color-crimson)" }} />
            Crisis Feed
          </span>
          <span className="font-mono text-[0.65rem] text-primary normal-case tracking-normal">LIVE</span>
        </div>
        <div className="flex-1 overflow-auto scrollbar-thin p-2 space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className="rounded border border-border bg-card/40 p-2.5 hover:border-primary/40 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="font-mono text-[0.6rem] px-1.5 py-0.5 rounded uppercase tracking-wider"
                  style={{ color: a.color, borderColor: a.color, border: `1px solid ${a.color}`, background: `color-mix(in oklab, ${a.color} 15%, transparent)` }}
                >
                  {a.sev}
                </span>
                <span className="font-mono text-[0.6rem] text-muted-foreground">ETA {a.eta}</span>
              </div>
              <div className="text-xs font-medium text-foreground leading-snug mb-2">
                {a.title}
              </div>
              <div className="grid grid-cols-3 gap-1 text-[0.6rem] font-mono">
                <div>
                  <div className="telemetry-label">Conf</div>
                  <div className="text-primary">{a.confidence}%</div>
                </div>
                <div>
                  <div className="telemetry-label">AI</div>
                  <div className="text-foreground/80">{a.consensus}</div>
                </div>
                <div>
                  <div className="telemetry-label">Human</div>
                  <div className="text-foreground/80">{a.human}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Decisions */}
      <div className="panel flex flex-col max-h-[40%] overflow-hidden">
        <div className="panel-header">
          <span className="flex items-center gap-2">
            <Bot className="w-3 h-3 text-primary" />
            AI Decisions Awaiting
          </span>
          <span className="font-mono text-[0.65rem] text-primary normal-case">3</span>
        </div>
        <div className="flex-1 overflow-auto scrollbar-thin p-2 space-y-1.5">
          {aiDecisions.map((d, i) => (
            <div key={i} className="rounded border border-border bg-card/40 p-2 group hover:border-primary/40">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[0.6rem] text-primary">{d.agent}</span>
                <span className="font-mono text-[0.55rem] uppercase tracking-wider text-muted-foreground">
                  Risk: {d.risk}
                </span>
              </div>
              <div className="text-[0.7rem] text-foreground/90 leading-snug mb-1.5">
                {d.action}
              </div>
              <div className="flex gap-1">
                <button className="flex-1 text-[0.6rem] font-mono uppercase tracking-wider py-1 rounded bg-primary/15 text-primary hover:bg-primary/25 border border-primary/30 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Approve
                </button>
                <button className="flex-1 text-[0.6rem] font-mono uppercase tracking-wider py-1 rounded bg-muted text-muted-foreground hover:bg-accent border border-border">
                  Hold
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk index */}
      <div className="panel p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="telemetry-label flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Planetary Risk Index
          </span>
          <span className="font-mono text-xs text-amber" style={{ color: "var(--color-amber)" }}>
            ELEVATED
          </span>
        </div>
        <div className="flex items-end gap-3">
          <div className="font-display text-3xl font-bold text-foreground">62.4</div>
          <div className="flex items-center gap-1 text-[0.65rem] font-mono pb-1.5" style={{ color: "var(--color-crimson)" }}>
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
