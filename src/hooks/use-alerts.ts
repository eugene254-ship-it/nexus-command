import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AlertRow = {
  id: string;
  hotspot_id: string;
  title: string;
  description: string | null;
  region: string | null;
  category: string | null;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "approved" | "hold" | "escalated" | "resolved";
  lat: number | null;
  lng: number | null;
  confidence_score: number;
  ai_consensus: string | null;
  eta_minutes: number | null;
  created_at: string;
  updated_at: string;
};

export type ActionRow = {
  id: string;
  alert_id: string;
  user_id: string;
  action: "approve" | "hold" | "escalate" | "note";
  note: string | null;
  created_at: string;
};

export type VerificationRow = {
  id: string;
  alert_id: string;
  layer: "sensor" | "ai" | "human";
  source: string;
  status: "pending" | "verified" | "failed" | "reviewing";
  score: number;
  details: string | null;
  created_at: string;
};

export function useAlerts() {
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    supabase
      .from("alerts")
      .select("*")
      .order("severity", { ascending: false })
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!ignore) {
          setAlerts((data ?? []) as AlertRow[]);
          setLoading(false);
        }
      });

    const ch = supabase
      .channel("alerts-stream")
      .on("postgres_changes", { event: "*", schema: "public", table: "alerts" }, (payload) => {
        setAlerts((prev) => {
          if (payload.eventType === "INSERT") return [payload.new as AlertRow, ...prev];
          if (payload.eventType === "DELETE")
            return prev.filter((a) => a.id !== (payload.old as AlertRow).id);
          return prev.map((a) =>
            a.id === (payload.new as AlertRow).id ? (payload.new as AlertRow) : a
          );
        });
      })
      .subscribe();
    return () => {
      ignore = true;
      supabase.removeChannel(ch);
    };
  }, []);

  return { alerts, loading };
}

export function useAlertDetail(alertId: string | null) {
  const [actions, setActions] = useState<ActionRow[]>([]);
  const [verif, setVerif] = useState<VerificationRow[]>([]);

  useEffect(() => {
    if (!alertId) {
      setActions([]);
      setVerif([]);
      return;
    }
    let ignore = false;
    Promise.all([
      supabase
        .from("alert_actions")
        .select("*")
        .eq("alert_id", alertId)
        .order("created_at", { ascending: false }),
      supabase
        .from("verification_entries")
        .select("*")
        .eq("alert_id", alertId)
        .order("layer", { ascending: true }),
    ]).then(([a, v]) => {
      if (ignore) return;
      setActions((a.data ?? []) as ActionRow[]);
      setVerif((v.data ?? []) as VerificationRow[]);
    });

    const ch = supabase
      .channel(`alert-${alertId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "alert_actions", filter: `alert_id=eq.${alertId}` },
        (payload) => {
          if (payload.eventType === "INSERT")
            setActions((p) => [payload.new as ActionRow, ...p]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "verification_entries",
          filter: `alert_id=eq.${alertId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT")
            setVerif((p) => [...p, payload.new as VerificationRow]);
          if (payload.eventType === "UPDATE")
            setVerif((p) =>
              p.map((r) =>
                r.id === (payload.new as VerificationRow).id
                  ? (payload.new as VerificationRow)
                  : r
              )
            );
        }
      )
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(ch);
    };
  }, [alertId]);

  return { actions, verif };
}

export async function recordAction(
  alertId: string,
  userId: string,
  action: "approve" | "hold" | "escalate" | "note",
  note: string | null
) {
  const statusMap: Record<string, string | null> = {
    approve: "approved",
    hold: "hold",
    escalate: "escalated",
    note: null,
  };
  const newStatus = statusMap[action];
  if (newStatus) {
    await supabase.from("alerts").update({ status: newStatus }).eq("id", alertId);
  }
  return supabase
    .from("alert_actions")
    .insert({ alert_id: alertId, user_id: userId, action, note });
}
