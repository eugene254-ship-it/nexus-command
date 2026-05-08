import { useEffect, useState } from "react";
import { AlertTriangle, Globe2, LogOut, Radio, ShieldAlert, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function TopCommandBar({ streamConnected = true }: { streamConnected?: boolean }) {
  const [time, setTime] = useState<string>("");
  const { user, roles, signOut } = useAuth();

  useEffect(() => {
    const fmt = () => new Date().toISOString().replace("T", " ").slice(0, 19);
    setTime(fmt());
    const id = setInterval(() => setTime(fmt()), 1000);
    return () => clearInterval(id);
  }, []);

  const role = roles[0]?.toUpperCase() ?? "VIEWER";
  const callsign = user?.email?.split("@")[0] ?? "OP";

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
        <Radio
          className="w-3.5 h-3.5"
          style={{ color: streamConnected ? "var(--color-emerald)" : "var(--color-amber)" }}
        />
        <span className="telemetry-label text-foreground/80">WS Stream</span>
        <span
          className="font-mono text-xs"
          style={{ color: streamConnected ? "var(--color-emerald)" : "var(--color-amber)" }}
        >
          {streamConnected ? "LIVE" : "RECONN"}
        </span>
      </div>

      <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-card/50">
        <span className="telemetry-label">AI Mesh</span>
        <span className="font-mono text-xs text-primary">12,402 active</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="text-right leading-tight" suppressHydrationWarning>
          <div className="telemetry-label">UTC SYNC</div>
          <div className="font-mono text-xs text-foreground" suppressHydrationWarning>
            {time ? `${time}Z` : "— — —"}
          </div>
        </div>

        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-md border"
          style={{
            borderColor: "color-mix(in oklab, var(--color-amber) 40%, transparent)",
            background: "color-mix(in oklab, var(--color-amber) 10%, transparent)",
          }}
        >
          <ShieldAlert className="w-3.5 h-3.5" style={{ color: "var(--color-amber)" }} />
          <span
            className="text-xs font-mono uppercase tracking-wider"
            style={{ color: "var(--color-amber)" }}
          >
            DEFCON 4
          </span>
        </button>

        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-md border bg-destructive/10 hover:bg-destructive/20 transition-colors"
          style={{ borderColor: "color-mix(in oklab, var(--color-crimson) 50%, transparent)" }}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
          <span className="text-xs font-mono uppercase tracking-wider text-destructive">
            Emergency
          </span>
        </button>

        <div className="flex items-center gap-2 pl-3 border-l border-border">
          <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 grid place-items-center">
            <User className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="leading-tight text-right">
            <div className="text-xs font-medium text-foreground truncate max-w-[120px]">
              {callsign}
            </div>
            <div
              className="text-[0.6rem] font-mono"
              style={{
                color:
                  role === "ADMIN"
                    ? "var(--color-crimson)"
                    : role === "OPERATOR"
                      ? "var(--color-cyan)"
                      : "var(--color-muted-foreground)",
              }}
            >
              {role} · CLEARED
            </div>
          </div>
          <button
            onClick={() => signOut()}
            title="Sign out"
            className="ml-1 p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
