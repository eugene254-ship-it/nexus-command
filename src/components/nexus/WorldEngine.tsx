import { Layers, Maximize2, Minus, Plus, Satellite } from "lucide-react";
import { useEffect, useState } from "react";

type Hotspot = {
  id: string;
  name: string;
  x: number; // percent
  y: number; // percent
  severity: "low" | "med" | "high" | "critical";
  type: string;
};

const HOTSPOTS: Hotspot[] = [
  { id: "h1", name: "East Africa Water Risk", x: 58, y: 56, severity: "critical", type: "Climate" },
  { id: "h2", name: "Pacific Storm Cell", x: 18, y: 50, severity: "high", type: "Weather" },
  { id: "h3", name: "Amazon Restoration Surge", x: 32, y: 62, severity: "low", type: "Regen" },
  { id: "h4", name: "Arctic Ice Anomaly", x: 50, y: 14, severity: "med", type: "Sensor" },
  { id: "h5", name: "South Asia Grid Strain", x: 70, y: 48, severity: "high", type: "Infra" },
  { id: "h6", name: "North Sea Wind Yield", x: 49, y: 30, severity: "low", type: "Energy" },
  { id: "h7", name: "Andes Seismic Watch", x: 30, y: 70, severity: "med", type: "Geo" },
];

const severityColor: Record<Hotspot["severity"], string> = {
  low: "var(--color-emerald)",
  med: "var(--color-amber)",
  high: "var(--color-amber)",
  critical: "var(--color-crimson)",
};

const layers = ["Carbon", "Energy", "Supply", "Ecosystem", "Conflict", "Sensors"];

export function WorldEngine() {
  const [activeLayers, setActiveLayers] = useState<string[]>(["Carbon", "Sensors", "Energy"]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1500);
    return () => clearInterval(id);
  }, []);

  const toggle = (l: string) =>
    setActiveLayers((p) => (p.includes(l) ? p.filter((x) => x !== l) : [...p, l]));

  return (
    <section className="flex-1 panel m-2 relative overflow-hidden scanline">
      {/* Header */}
      <div className="panel-header">
        <div className="flex items-center gap-3">
          <Satellite className="w-3.5 h-3.5 text-primary" />
          <span>Central World Engine</span>
          <span className="font-mono text-[0.65rem] text-primary normal-case tracking-normal">
            ORBIT-7 · LIVE
          </span>
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

      {/* Map area */}
      <div className="relative h-[calc(100%-2.25rem)] w-full overflow-hidden">
        {/* world grid */}
        <div className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-grid-line) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute inset-0" style={{ background: "var(--gradient-glow)" }} />

        {/* simplified continents (SVG) */}
        <svg viewBox="0 0 1000 500" className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="land" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.36 0.05 220)" stopOpacity="0.55" />
              <stop offset="100%" stopColor="oklch(0.22 0.03 240)" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          {/* very rough continent silhouettes */}
          <g fill="url(#land)" stroke="oklch(0.78 0.16 200 / 60%)" strokeWidth="0.6">
            <path d="M120,110 Q180,80 240,110 L260,170 Q220,210 180,200 L150,250 Q120,220 110,180 Z" />
            <path d="M260,260 Q300,240 320,290 L340,380 Q300,430 270,400 L255,330 Z" />
            <path d="M460,90 Q540,70 600,100 L640,150 Q600,180 540,170 L480,160 Z" />
            <path d="M520,180 Q580,210 600,290 L580,360 Q540,380 510,340 L490,260 Z" />
            <path d="M620,120 Q720,100 820,140 L880,210 Q820,260 740,250 L660,220 Q620,180 620,160 Z" />
            <path d="M780,290 Q830,280 860,310 L850,360 Q810,370 790,340 Z" />
          </g>
          {/* lat/long lines */}
          <g stroke="var(--color-grid-line)" strokeWidth="0.5">
            {[100, 200, 300, 400].map((y) => <line key={y} x1="0" x2="1000" y1={y} y2={y} />)}
            {[200, 400, 600, 800].map((x) => <line key={x} x1={x} x2={x} y1="0" y2="500" />)}
          </g>
        </svg>

        {/* Hotspots */}
        {HOTSPOTS.map((h) => (
          <div
            key={h.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${h.x}%`, top: `${h.y}%` }}
          >
            <div
              className="pulse-dot w-2 h-2 rounded-full"
              style={{ color: severityColor[h.severity], background: severityColor[h.severity] }}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 hidden group-hover:block z-10">
              <div className="panel px-2 py-1.5 whitespace-nowrap text-[0.65rem]">
                <div className="font-mono text-foreground">{h.name}</div>
                <div className="telemetry-label" style={{ color: severityColor[h.severity] }}>
                  {h.type} · {h.severity.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Telemetry HUD */}
        <div className="absolute top-3 left-3 panel px-3 py-2 text-[0.65rem] font-mono space-y-0.5">
          <div className="telemetry-label">ORBITAL</div>
          <div>LAT  +00.000°  LON  +000.000°</div>
          <div>ALT  35,786 km · GEO</div>
          <div>FRAME #{tick.toString().padStart(6, "0")}</div>
        </div>

        <div className="absolute top-3 right-3 panel px-3 py-2 text-[0.65rem] font-mono space-y-0.5 text-right">
          <div className="telemetry-label">SENSOR FUSION</div>
          <div>SAT 412/420</div>
          <div>IOT 1.82M / 1.84M</div>
          <div className="text-primary">CONSENSUS 96.2%</div>
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
