import { useEffect, useRef, useState } from "react";

export type Telemetry = {
  signal: number; // 0-100
  pps: number; // packets/sec
  latencyMs: number;
  drift: number; // -1..1
  ts: number;
};

/**
 * Simulated WebSocket sensor stream. Emits per-hotspot telemetry frames
 * at ~3Hz. Drop-in replaceable with a real WebSocket connection that
 * pushes the same shape into setFrames().
 */
export function useLiveTelemetry(hotspotIds: string[]) {
  const [frames, setFrames] = useState<Record<string, Telemetry>>({});
  const [connected, setConnected] = useState(false);
  const [tick, setTick] = useState(0);
  const seedRef = useRef<Record<string, number>>({});

  useEffect(() => {
    setConnected(true);
    // baseline seeds so values feel stable
    hotspotIds.forEach((id) => {
      if (seedRef.current[id] === undefined) {
        seedRef.current[id] = Math.random() * 1000;
      }
    });

    const id = setInterval(() => {
      setTick((t) => t + 1);
      setFrames((prev) => {
        const next: Record<string, Telemetry> = { ...prev };
        const now = Date.now();
        hotspotIds.forEach((hid) => {
          const seed = (seedRef.current[hid] += 0.2);
          const sig = 70 + Math.sin(seed) * 18 + Math.random() * 6;
          next[hid] = {
            signal: Math.max(0, Math.min(100, sig)),
            pps: Math.round(800 + Math.cos(seed * 1.3) * 200 + Math.random() * 60),
            latencyMs: Math.round(40 + Math.sin(seed * 0.7) * 20 + Math.random() * 10),
            drift: Math.sin(seed * 0.4) * 0.6 + (Math.random() - 0.5) * 0.2,
            ts: now,
          };
        });
        return next;
      });
    }, 350);
    return () => {
      clearInterval(id);
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotspotIds.join(",")]);

  return { frames, connected, tick };
}
