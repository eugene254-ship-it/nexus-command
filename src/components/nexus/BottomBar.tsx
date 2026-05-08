import { useEffect, useState } from "react";

const stats = [
  { label: "SYSTEM HEALTH", value: "98.4%", tone: "ok" },
  { label: "ACTIVE AI AGENTS", value: "12,402", tone: "info" },
  { label: "GLOBAL SENSOR UPTIME", value: "99.12%", tone: "ok" },
  { label: "ACTIVE THREATS", value: "4", tone: "warn" },
  { label: "TREASURY", value: "STABLE", tone: "ok" },
  { label: "VERIFICATION CONSENSUS", value: "96%", tone: "info" },
  { label: "REGEN YIELD 24H", value: "+3.2%", tone: "ok" },
  { label: "GOVERNANCE QUEUE", value: "7", tone: "info" },
  { label: "EDGE LATENCY", value: "42ms", tone: "ok" },
];

const toneColor: Record<string, string> = {
  ok: "var(--color-emerald)",
  info: "var(--color-cyan)",
  warn: "var(--color-amber)",
  bad: "var(--color-crimson)",
};

export function BottomBar() {
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPulse((p) => (p + 1) % 100), 800);
    return () => clearInterval(id);
  }, []);

  const row = (key: string) => (
    <div key={key} className="flex items-center gap-6 pr-10">
      {stats.map((s, i) => (
        <div key={`${key}-${i}`} className="flex items-center gap-2 shrink-0">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: toneColor[s.tone], boxShadow: `0 0 8px ${toneColor[s.tone]}` }}
          />
          <span className="telemetry-label">{s.label}</span>
          <span className="font-mono text-xs" style={{ color: toneColor[s.tone] }}>
            {s.value}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <footer className="h-10 border-t border-border bg-[var(--gradient-panel)] backdrop-blur-md flex items-center overflow-hidden relative">
      <div className="px-4 h-full flex items-center gap-2 border-r border-border shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-primary glow-cyan" />
        <span className="telemetry-label text-primary">NEXUS BUS</span>
        <span className="font-mono text-[0.65rem] text-muted-foreground">{pulse.toString().padStart(2, "0")}</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex ticker-track whitespace-nowrap py-1">
          {row("a")}
          {row("b")}
        </div>
      </div>
      <div className="px-4 h-full flex items-center gap-2 border-l border-border shrink-0">
        <span className="telemetry-label">CHANNEL</span>
        <span className="font-mono text-[0.65rem] text-foreground">SECURE-Ω</span>
      </div>
    </footer>
  );
}
