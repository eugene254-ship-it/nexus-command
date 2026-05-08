
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'operator', 'viewer');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  callsign TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, callsign)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)),
          'OP-' || substr(NEW.id::text, 1, 4));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'viewer');
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Alerts
CREATE TYPE public.alert_severity AS ENUM ('low','medium','high','critical');
CREATE TYPE public.alert_status AS ENUM ('open','approved','hold','escalated','resolved');

CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotspot_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  region TEXT,
  category TEXT,
  severity public.alert_severity NOT NULL DEFAULT 'medium',
  status public.alert_status NOT NULL DEFAULT 'open',
  lat NUMERIC,
  lng NUMERIC,
  confidence_score NUMERIC NOT NULL DEFAULT 0,
  ai_consensus TEXT,
  eta_minutes INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE TYPE public.action_type AS ENUM ('approve','hold','escalate','note');

CREATE TABLE public.alert_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES public.alerts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action public.action_type NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.alert_actions ENABLE ROW LEVEL SECURITY;

CREATE TYPE public.verify_layer AS ENUM ('sensor','ai','human');
CREATE TYPE public.verify_status AS ENUM ('pending','verified','failed','reviewing');

CREATE TABLE public.verification_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES public.alerts(id) ON DELETE CASCADE,
  layer public.verify_layer NOT NULL,
  source TEXT NOT NULL,
  status public.verify_status NOT NULL DEFAULT 'pending',
  score NUMERIC NOT NULL DEFAULT 0,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.verification_entries ENABLE ROW LEVEL SECURITY;

-- RLS: profiles
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "admins read all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- RLS: user_roles
CREATE POLICY "users see own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- RLS: alerts
CREATE POLICY "auth read alerts" ON public.alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "operators insert alerts" ON public.alerts FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'operator'));
CREATE POLICY "operators update alerts" ON public.alerts FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'operator'));
CREATE POLICY "admins delete alerts" ON public.alerts FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- RLS: alert_actions
CREATE POLICY "auth read actions" ON public.alert_actions FOR SELECT TO authenticated USING (true);
CREATE POLICY "operators add actions" ON public.alert_actions FOR INSERT TO authenticated
  WITH CHECK ((public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'operator'))
              AND user_id = auth.uid());

-- RLS: verification_entries
CREATE POLICY "auth read verifications" ON public.verification_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage verifications" ON public.verification_entries FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "operators add verifications" ON public.verification_entries FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'operator'));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER alerts_touch BEFORE UPDATE ON public.alerts
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Realtime
ALTER TABLE public.alerts REPLICA IDENTITY FULL;
ALTER TABLE public.alert_actions REPLICA IDENTITY FULL;
ALTER TABLE public.verification_entries REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alert_actions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.verification_entries;
