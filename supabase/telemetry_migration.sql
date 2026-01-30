CREATE TABLE IF NOT EXISTS telemetry_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL, 
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  context JSONB DEFAULT '{}'::jsonb,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telemetry_created_at ON telemetry_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_event_type ON telemetry_events(event_type);

ALTER TABLE telemetry_events ENABLE ROW LEVEL SECURITY;

-- Allow insert by anyone (authenticated or anon if public access is needed, usually authenticated is safer but for logs sometimes we need valid session)
-- Let's stick to authenticated for now or public if we want to catch login errors before auth. 
-- Since login errors happen contextually before full auth sometimes, we might need public insert if we want to catch failed logins from anon users.
-- For safety, let's start with public insert but limited? No, let's just allow authenticated for now for simplicity, 
-- or use a service key function in a real backend.
-- For this "SaaS", let's allow basic inserts.

CREATE POLICY "Allow insert for all users" 
ON telemetry_events 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow select for admins only" 
ON telemetry_events 
FOR SELECT 
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin' OR role = 'owner'
  )
);
