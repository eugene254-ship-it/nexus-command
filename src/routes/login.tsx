import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Globe2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: (s.redirect as string) || "/",
  }),
  beforeLoad: async ({ search }) => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: search.redirect || "/" });
  },
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Authenticated. Engaging command center.");
        nav({ to: search.redirect || "/" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Account created. Check your email to confirm, then sign in.");
        setMode("signin");
      }
    } catch (err: unknown) {
      const m = err instanceof Error ? err.message : "Authentication failed";
      toast.error(m);
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (r.error) toast.error("Google sign-in failed");
  }

  return (
    <div className="min-h-screen w-full grid place-items-center px-4">
      <div className="w-full max-w-md panel p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-md grid place-items-center bg-primary/10 border border-primary/30">
            <Globe2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold">CORE NEXUS</h1>
            <p className="telemetry-label text-[0.6rem]">Operator Authentication</p>
          </div>
        </div>

        <div className="flex gap-1 mb-4 p-1 rounded-md bg-muted/50">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 text-xs font-mono uppercase tracking-wider py-1.5 rounded ${
                mode === m
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "text-muted-foreground"
              }`}
            >
              {m === "signin" ? "Sign In" : "Request Access"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="telemetry-label">Operator Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full bg-card border border-border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary/60"
              placeholder="operator@nexus.gov"
            />
          </div>
          <div>
            <label className="telemetry-label">Authentication Key</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full bg-card border border-border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary/60"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full text-xs font-mono uppercase tracking-wider py-2 rounded bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Lock className="w-3.5 h-3.5" />
            {busy ? "Verifying…" : mode === "signin" ? "Engage Nexus" : "Request Clearance"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-2 text-[0.6rem] font-mono text-muted-foreground">
          <span className="flex-1 h-px bg-border" /> OR <span className="flex-1 h-px bg-border" />
        </div>

        <button
          onClick={google}
          className="w-full text-xs font-mono uppercase tracking-wider py-2 rounded border border-border hover:border-primary/40 hover:text-primary text-foreground/80"
        >
          Continue with Google
        </button>

        <p className="mt-4 text-[0.6rem] font-mono text-muted-foreground text-center">
          New accounts default to <span className="text-primary">VIEWER</span> clearance. An admin
          can elevate to OPERATOR or ADMIN.
        </p>
      </div>
    </div>
  );
}

