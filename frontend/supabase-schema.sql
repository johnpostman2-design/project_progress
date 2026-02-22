-- Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) > 0 AND char_length(name) <= 200),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  kaiten_board_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Stages table
CREATE TABLE IF NOT EXISTS stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) > 0 AND char_length(name) <= 200),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  pause_reason TEXT,
  kaiten_group_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stages_project_id ON stages(project_id);
CREATE INDEX IF NOT EXISTS idx_stages_start_date ON stages(start_date);
CREATE INDEX IF NOT EXISTS idx_stages_kaiten_group_id ON stages(kaiten_group_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stages_updated_at ON stages;
CREATE TRIGGER update_stages_updated_at BEFORE UPDATE ON stages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) - adjust policies as needed
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (adjust as needed)
-- For development, you might want to allow all operations:
CREATE POLICY "Allow all for authenticated users" ON projects
  FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON stages
  FOR ALL USING (true);

-- Or for public access (development only):
-- CREATE POLICY "Allow all" ON projects FOR ALL USING (true);
-- CREATE POLICY "Allow all" ON stages FOR ALL USING (true);

-- Kaiten External Webhooks: события от Kaiten при изменении задач на доске
CREATE TABLE IF NOT EXISTS kaiten_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id TEXT NOT NULL,
  event_type TEXT,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kaiten_webhook_events_board_id ON kaiten_webhook_events(board_id);
CREATE INDEX IF NOT EXISTS idx_kaiten_webhook_events_created_at ON kaiten_webhook_events(created_at DESC);

ALTER TABLE kaiten_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for kaiten_webhook_events" ON kaiten_webhook_events
  FOR ALL USING (true);

-- Включить Realtime для подписки в приложении
ALTER PUBLICATION supabase_realtime ADD TABLE kaiten_webhook_events;
