import { Layers, Maximize2, Minus, Plus, Satellite } from "lucide-react";
import { useEffect, useState } from "react";
import type { AlertRow } from "@/hooks/use-alerts";
import type { Telemetry } from "@/hooks/use-telemetry";

const severityColor: Record<string, string> = {
  low: "var(--color-emerald)",
  medium: "var(--color-amber)",
  high: "var(--color-amber)",
  critical: "var(--color-crimson)",
};

const layers = ["Carbon", "Energy", "Supply", "Ecosystem", "Conflict", "Sensors"];

// Project lat/lng to viewbox % (equirectangular)
function project(lat: number | null, lng: number | null) {
  if (lat == null || lng == null) return { x: 50, y: 50 };
  return { x: ((lng + 180) / 360) * 100, y: ((90 - lat) / 180) * 100 };
}

type Props = {
  alerts: AlertRow[];
  telemetry: Record<string, Telemetry>;
  onSelect: (id: string) => void;
  selectedId: string | null;
  highlightRegion: string | null;
};

export function WorldEngine({ alerts, telemetry, onSelect, selectedId, highlightRegion }: Props) {
  const [activeLayers, setActiveLayers] = useState<string[]>(["Carbon", "Sensors", "Energy"]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1500);
    return () => clearInterval(id);
  }, []);

  const toggle = (l: string) =>
    setActiveLayers((p) => (p.includes(l) ? p.filter((x) => x !== l) : [...p, l]));

  const totalPps = Object.values(telemetry).reduce((s, t) => s + t.pps, 0);
  const avgSig = Object.values(telemetry).length
    ? Object.values(telemetry).reduce((s, t) => s + t.signal, 0) / Object.values(telemetry).length
    : 0;

  return (
    <section className="flex-1 panel m-2 relative overflow-hidden scanline">
      <div className="panel-header">
        <div className="flex items-center gap-3">
          <Satellite className="w-3.5 h-3.5 text-primary" />
          <span>Central World Engine</span>
          <span className="font-mono text-[0.65rem] text-primary normal-case tracking-normal">
            ORBIT-7 · WS://LIVE
          </span>
          {highlightRegion && (
            <span className="font-mono text-[0.6rem] px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/30 normal-case">
              FOCUS: {highlightRegion}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {layers.map((l) => (
            <button
              key={l}
              onClick={() => toggle(l)}
              className={`px-2 py-0.5 rounded text-[0.6rem] font-mono uppercase tracking-wider border ${
                activeLayers.includes(l)
                  ? "bg-primary/15 text-primary border-primary/40"
                  : "bg-transparent text-muted-foreground border-border hover:border-primary/30"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-[calc(100%-2.25rem)] w-full overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-grid-line) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute inset-0" style={{ background: "var(--gradient-glow)" }} />

        <svg viewBox="0 0 1000 500" className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="land" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.36 0.05 220)" stopOpacity="0.55" />
              <stop offset="100%" stopColor="oklch(0.22 0.03 240)" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <g fill="url(#land)" stroke="oklch(0.78 0.16 200 / 60%)" strokeWidth="0.6">
            <path d="M120,110 Q180,80 240,110 L260,170 Q220,210 180,200 L150,250 Q120,220 110,180 Z" />
            <path d="M260,260 Q300,240 320,290 L340,380 Q300,430 270,400 L255,330 Z" />
            <path d="M460,90 Q540,70 600,100 L640,150 Q600,180 540,170 L480,160 Z" />
            <path d="M520,180 Q580,210 600,290 L580,360 Q540,380 510,340 L490,260 Z" />
            <path d="M620,120 Q720,100 820,140 L880,210 Q820,260 740,250 L660,220 Q620,180 620,160 Z" />
            <path d="M780,290 Q830,280 860,310 L850,360 Q810,370 790,340 Z" />
          </g>
          <g stroke="var(--color-grid-line)" strokeWidth="0.5">
            {[100, 200, 300, 400].map((y) => (
              <line key={y} x1="0" x2="1000" y1={y} y2={y} />
            ))}
            {[200, 400, 600, 800].map((x) => (
              <line key={x} x1={x} x2={x} y1="0" y2="500" />
            ))}
          </g>
        </svg>

        {alerts.map((a) => {
          const { x, y } = project(a.lat, a.lng);
          const t = telemetry[a.hotspot_id];
          const isSel = a.id === selectedId;
          const color = severityColor[a.severity] ?? "var(--color-amber)";
          return (
            <button
              key={a.id}
              onClick={() => onSelect(a.id)}
              className="absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div
                className={`pulse-dot rounded-full transition-all ${
                  isSel ? "w-3 h-3 ring-2 ring-primary ring-offset-2 ring-offset-background" : "w-2 h-2"
                }`}
                style={{ color, background: color }}
              />
              {/* Live telemetry ring */}
              {t && (
                <svg
                  className="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 pointer-events-none"
                  width="36"
                  height="36"
                  viewBox="0 0 36 36"
                >
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="var(--color-border)"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke={color}
                    strokeWidth="1.5"
                    strokeDasharray={`${(t.signal / 100) * 88} 88`}
                    transform="rotate(-90 18 18)"
                    style={{ transition: "stroke-dasharray 300ms linear" }}
                  />
                </svg>
              )}
              <div className="absolute left-5 top-1/2 -translate-y-1/2 hidden group-hover:block z-10">
                <div className="panel px-2 py-1.5 whitespace-nowrap text-[0.65rem] text-left">
                  <div className="font-mono text-foreground">{a.title}</div>
                  <div className="telemetry-label" style={{ color }}>
                    {a.category} · {a.severity.toUpperCase()}
                  </div>
                  {t && (
                    <div className="font-mono text-[0.6rem] text-primary mt-0.5">
                      sig {t.signal.toFixed(0)}% · {t.pps}p/s · {t.latencyMs}ms
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}

        <div className="absolute top-3 left-3 panel px-3 py-2 text-[0.65rem] font-mono space-y-0.5">
          <div className="telemetry-label">ORBITAL</div>
          <div>LAT  +00.000°  LON  +000.000°</div>
          <div>ALT  35,786 km · GEO</div>
          <div>FRAME #{tick.toString().padStart(6, "0")}</div>
        </div>

        <div className="absolute top-3 right-3 panel px-3 py-2 text-[0.65rem] font-mono space-y-0.5 text-right">
          <div className="telemetry-label">SENSOR FUSION · WS</div>
          <div>SAT 412/420</div>
          <div>STREAM {totalPps.toLocaleString()} p/s</div>
          <div className="text-primary">SIG AVG {avgSig.toFixed(1)}%</div>
        </div>

        <div className="absolute bottom-3 left-3 flex flex-col gap-1.5">
          <button className="w-8 h-8 panel grid place-items-center hover:text-primary">
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button className="w-8 h-8 panel grid place-items-center hover:text-primary">
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button className="w-8 h-8 panel grid place-items-center hover:text-primary">
            <Layers className="w-3.5 h-3.5" />
          </button>
          <button className="w-8 h-8 panel grid place-items-center hover:text-primary">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="absolute bottom-3 right-3 panel px-3 py-2 text-[0.65rem] font-mono">
          <div className="telemetry-label mb-1">Active Layers</div>
          <div className="flex gap-1.5 flex-wrap">
            {activeLayers.map((l) => (
              <span key={l} className="px-1.5 py-0.5 rounded bg-primary/15 text-primary">
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
