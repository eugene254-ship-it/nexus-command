import { useEffect, useState } from "react";
import { AlertTriangle, Globe2, Radio, ShieldAlert } from "lucide-react";

export function TopCommandBar() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const utc = time.toISOString().replace("T", " ").slice(0, 19);

  return (
    <header className="h-14 border-b border-border bg-[var(--gradient-panel)] backdrop-blur-md flex items-center px-4 gap-6 relative z-20">
      <div className="flex items-center gap-3">
        <div className="relative w-9 h-9 rounded-md grid place-items-center bg-primary/10 border border-primary/30">
          <Globe2 className="w-5 h-5 text-primary" />
          <span className="absolute inset-0 rounded-md ring-1 ring-primary/40 spin-slow" />
        </div>
        <div className="leading-tight">
          <div className="font-display text-sm font-semibold tracking-wide text-foreground">
            CORE NEXUS
          </div>
          <div className="telemetry-label text-[0.6rem]">Planetary Operations · v0.1</div>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-card/50">
        <Radio className="w-3.5 h-3.5 text-emerald" style={{ color: "var(--color-emerald)" }} />
        <span className="telemetry-label text-foreground/80">Uplink</span>
        <span className="font-mono text-xs text-emerald" style={{ color: "var(--color-emerald)" }}>NOMINAL</span>
      </div>

      <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-card/50">
        <span className="telemetry-label">AI Mesh</span>
        <span className="font-mono text-xs text-primary">12,402 active</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="text-right leading-tight">
          <div className="telemetry-label">UTC SYNC</div>
          <div className="font-mono text-xs text-foreground">{utc}Z</div>
        </div>

        <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-amber/40 bg-amber/10 hover:bg-amber/20 transition-colors"
          style={{ borderColor: "color-mix(in oklab, var(--color-amber) 40%, transparent)", background: "color-mix(in oklab, var(--color-amber) 10%, transparent)" }}>
          <ShieldAlert className="w-3.5 h-3.5" style={{ color: "var(--color-amber)" }} />
          <span className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--color-amber)" }}>DEFCON 4</span>
        </button>

        <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border bg-destructive/10 hover:bg-destructive/20 transition-colors"
          style={{ borderColor: "color-mix(in oklab, var(--color-crimson) 50%, transparent)" }}>
          <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
          <span className="text-xs font-mono uppercase tracking-wider text-destructive">Emergency</span>
        </button>
      </div>
    </header>
  );
}
