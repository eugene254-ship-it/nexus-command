import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronUp,
  Clock,
  Hand,
  Radio,
  ShieldCheck,
  X,
  Bot,
  User as UserIcon,
  Activity,
} from "lucide-react";
import { recordAction, useAlertDetail, type AlertRow } from "@/hooks/use-alerts";
import type { Telemetry } from "@/hooks/use-telemetry";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

type Props = {
  alert: AlertRow | null;
  region: string | null;
  alerts: AlertRow[];
  telemetry: Record<string, Telemetry>;
  onClose: () => void;
};

const sevColor: Record<string, string> = {
  low: "var(--color-emerald)",
  medium: "var(--color-amber)",
  high: "var(--color-amber)",
  critical: "var(--color-crimson)",
};

const verifyColor: Record<string, string> = {
  verified: "var(--color-emerald)",
  pending: "var(--color-muted-foreground)",
  reviewing: "var(--color-amber)",
  failed: "var(--color-crimson)",
};

const layerIcon = { sensor: Radio, ai: Bot, human: UserIcon } as const;

export function DrillDownPanel({ alert, region, alerts, telemetry, onClose }: Props) {
  if (alert) return <AlertDrillDown alert={alert} telemetry={telemetry} onClose={onClose} />;
  if (region)
    return <RegionDrillDown region={region} alerts={alerts} telemetry={telemetry} onClose={onClose} />;
  return null;
}

function AlertDrillDown({
  alert,
  telemetry,
  onClose,
}: {
  alert: AlertRow;
  telemetry: Record<string, Telemetry>;
  onClose: () => void;
}) {
  const { user, canAct, hasRole } = useAuth();
  const { actions, verif } = useAlertDetail(alert.id);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const t = telemetry[alert.hotspot_id];

  async function act(action: "approve" | "hold" | "escalate" | "note") {
    if (!user) return;
    if (!canAct) {
      toast.error("Operator clearance required");
      return;
    }
    if (action === "escalate" && !hasRole("admin") && !hasRole("operator")) {
      toast.error("Escalation requires Operator or Admin");
      return;
    }
    setBusy(true);
    const { error } = await recordAction(alert.id, user.id, action, note.trim() || null);
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success(`Action recorded: ${action.toUpperCase()}`);
      setNote("");
    }
  }

  const sensorChain = verif.filter((v) => v.layer === "sensor");
  const aiChain = verif.filter((v) => v.layer === "ai");
  const humanChain = verif.filter((v) => v.layer === "human");

  return (
    <Shell onClose={onClose} title={`HOTSPOT · ${alert.hotspot_id.toUpperCase()}`}>
      <div className="space-y-3">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="font-mono text-[0.6rem] px-1.5 py-0.5 rounded uppercase tracking-wider"
              style={{
                color: sevColor[alert.severity],
                border: `1px solid ${sevColor[alert.severity]}`,
                background: `color-mix(in oklab, ${sevColor[alert.severity]} 15%, transparent)`,
              }}
            >
              {alert.severity}
            </span>
            <span className="telemetry-label">{alert.region}</span>
            <span className="ml-auto telemetry-label">
              {alert.lat?.toFixed(2)}°, {alert.lng?.toFixed(2)}°
            </span>
          </div>
          <h2 className="font-display text-base font-semibold leading-tight">{alert.title}</h2>
          {alert.description && (
            <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
          )}
        </div>

        {/* Live telemetry */}
        <div className="panel p-3">
          <div className="telemetry-label mb-2 flex items-center gap-1.5">
            <Activity className="w-3 h-3" /> Live Telemetry · WS
          </div>
          {t ? (
            <div className="grid grid-cols-4 gap-2 text-xs font-mono">
              <Stat label="Signal" value={`${t.signal.toFixed(0)}%`} accent />
              <Stat label="Packets" value={`${t.pps}/s`} />
              <Stat label="Latency" value={`${t.latencyMs}ms`} />
              <Stat label="Drift" value={t.drift.toFixed(2)} />
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">awaiting first frame…</div>
          )}
        </div>

        {/* Verification chain */}
        <div className="panel p-3">
          <div className="telemetry-label mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3" /> Verification Chain
          </div>
          <div className="space-y-2">
            <ChainGroup label="Sensor Authenticity" items={sensorChain} />
            <ChainGroup label="AI Consensus" items={aiChain} />
            <ChainGroup label="Human Review" items={humanChain} />
          </div>
        </div>

        {/* Action workflow */}
        <div className="panel p-3">
          <div className="telemetry-label mb-2">Acknowledge / Decide</div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={canAct ? "Note (optional, attached to action log)…" : "Viewer clearance — read only"}
            disabled={!canAct}
            rows={2}
            maxLength={500}
            className="w-full bg-card border border-border rounded p-2 text-xs font-mono focus:outline-none focus:border-primary/60 disabled:opacity-50 mb-2"
          />
          <div className="grid grid-cols-3 gap-1.5">
            <ActionBtn
              icon={CheckCircle2}
              label="Approve"
              color="var(--color-emerald)"
              disabled={!canAct || busy}
              onClick={() => act("approve")}
            />
            <ActionBtn
              icon={Hand}
              label="Hold"
              color="var(--color-amber)"
              disabled={!canAct || busy}
              onClick={() => act("hold")}
            />
            <ActionBtn
              icon={ChevronUp}
              label="Escalate"
              color="var(--color-crimson)"
              disabled={!canAct || busy}
              onClick={() => act("escalate")}
            />
          </div>
          {!canAct && (
            <div className="mt-2 text-[0.6rem] font-mono text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Requires OPERATOR or ADMIN clearance.
            </div>
          )}
        </div>

        {/* Action timeline */}
        <div className="panel p-3">
          <div className="telemetry-label mb-2 flex items-center gap-1.5">
            <Clock className="w-3 h-3" /> Incident Timeline
          </div>
          {actions.length === 0 ? (
            <div className="text-xs text-muted-foreground">No actions recorded yet.</div>
          ) : (
            <ol className="space-y-1.5">
              {actions.map((a) => (
                <li
                  key={a.id}
                  className="text-xs border-l-2 pl-2 py-0.5"
                  style={{
                    borderColor:
                      a.action === "approve"
                        ? "var(--color-emerald)"
                        : a.action === "escalate"
                          ? "var(--color-crimson)"
                          : a.action === "hold"
                            ? "var(--color-amber)"
                            : "var(--color-border)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono uppercase text-[0.6rem] tracking-wider">
                      {a.action}
                    </span>
                    <span className="font-mono text-[0.55rem] text-muted-foreground">
                      {new Date(a.created_at).toISOString().slice(0, 19).replace("T", " ")}Z
                    </span>
                  </div>
                  {a.note && <div className="text-foreground/80 mt-0.5">{a.note}</div>}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </Shell>
  );
}

function RegionDrillDown({
  region,
  alerts,
  telemetry,
  onClose,
}: {
  region: string;
  alerts: AlertRow[];
  telemetry: Record<string, Telemetry>;
  onClose: () => void;
}) {
  const local = alerts.filter((a) => a.region === region);
  const totalPps = local.reduce((s, a) => s + (telemetry[a.hotspot_id]?.pps ?? 0), 0);
  return (
    <Shell onClose={onClose} title={`REGION · ${region.toUpperCase()}`}>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Stat label="Active" value={String(local.length)} accent />
        <Stat label="Stream" value={`${totalPps}/s`} />
        <Stat
          label="Critical"
          value={String(local.filter((a) => a.severity === "critical").length)}
        />
      </div>
      <div className="telemetry-label mb-2">Local Hotspots</div>
      {local.length === 0 ? (
        <div className="text-xs text-muted-foreground">No active hotspots in this region.</div>
      ) : (
        <ul className="space-y-1.5">
          {local.map((a) => (
            <li
              key={a.id}
              className="text-xs panel p-2 flex items-center gap-2"
              style={{ borderLeft: `3px solid ${sevColor[a.severity]}` }}
            >
              <div className="flex-1">
                <div className="font-medium">{a.title}</div>
                <div className="font-mono text-[0.6rem] text-muted-foreground">
                  {a.category} · {a.severity.toUpperCase()} · conf {a.confidence_score}%
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Shell>
  );
}

function Shell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="absolute inset-y-2 right-[21rem] w-[26rem] panel flex flex-col z-30 shadow-2xl">
      <div className="panel-header">
        <span>{title}</span>
        <button onClick={onClose} className="hover:text-primary">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex-1 overflow-auto scrollbar-thin p-3">{children}</div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded border border-border bg-card/40 p-2">
      <div className="telemetry-label">{label}</div>
      <div className={`font-mono ${accent ? "text-primary" : "text-foreground"} text-sm mt-0.5`}>
        {value}
      </div>
    </div>
  );
}

function ChainGroup({
  label,
  items,
}: {
  label: string;
  items: { id: string; source: string; status: string; score: number; details: string | null }[];
}) {
  const Icon = label.startsWith("Sensor") ? Radio : label.startsWith("AI") ? Bot : UserIcon;
  if (items.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[0.6rem] font-mono uppercase tracking-wider text-muted-foreground mb-1">
        <Icon className="w-3 h-3" /> {label}
      </div>
      <div className="space-y-1">
        {items.map((it) => (
          <div
            key={it.id}
            className="flex items-center gap-2 text-[0.65rem] font-mono px-2 py-1 rounded border border-border bg-card/40"
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: verifyColor[it.status] }}
            />
            <div className="flex-1 truncate">
              <div className="text-foreground">{it.source}</div>
              {it.details && (
                <div className="text-[0.6rem] text-muted-foreground truncate">{it.details}</div>
              )}
            </div>
            <div
              className="text-right"
              style={{ color: verifyColor[it.status] }}
            >
              {it.status.toUpperCase()}
              <div className="text-[0.55rem] text-muted-foreground">{it.score}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionBtn({
  icon: Icon,
  label,
  color,
  disabled,
  onClick,
}: {
  icon: typeof CheckCircle2;
  label: string;
  color: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="text-[0.65rem] font-mono uppercase tracking-wider py-2 rounded border flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      style={{
        color,
        borderColor: `color-mix(in oklab, ${color} 50%, transparent)`,
        background: `color-mix(in oklab, ${color} 10%, transparent)`,
      }}
    >
      <Icon className="w-3 h-3" /> {label}
    </button>
  );
}
