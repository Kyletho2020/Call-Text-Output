-- Calendar Invite Generator - Database Setup
-- Run this SQL in your Supabase SQL Editor

-- Create event_templates table
CREATE TABLE IF NOT EXISTS event_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  goal TEXT,
  agenda TEXT NOT NULL,
  rsvp TEXT NOT NULL,
  recurring JSONB DEFAULT '{"enabled": false, "frequency": "", "daysOfWeek": [], "endDate": "", "occurrences": null}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE event_templates ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your auth setup)
-- For production, you should implement proper authentication and user-specific policies
CREATE POLICY "Allow all operations for now" ON event_templates
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to auto-update updated_at
CREATE TRIGGER update_event_templates_updated_at 
  BEFORE UPDATE ON event_templates 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_event_templates_created_at 
  ON event_templates(created_at DESC);

-- Insert sample template (optional)
INSERT INTO event_templates (title, date, time, location, goal, agenda, rsvp, recurring)
VALUES (
  'Weekly Team Standup',
  '2025-11-18',
  '09:00',
  'Zoom: https://zoom.us/j/123456789',
  'Sync on weekly progress and blockers',
  '1. Quick wins from last week
2. Current priorities
3. Blockers and help needed
4. Next week planning',
  'team@company.com',
  '{"enabled": true, "frequency": "weekly", "daysOfWeek": ["Mon"], "endDate": "", "occurrences": 12}'::jsonb
);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Database setup complete! ✅';
  RAISE NOTICE 'Event templates table created with RLS enabled.';
END $$;
