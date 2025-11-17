/*
  # Fix event_templates RLS policies

  1. Security
    - Drop the overly permissive policy
    - Add proper public read/write policies for anonymous access
*/

DROP POLICY IF EXISTS "Allow all operations for now" ON event_templates;

CREATE POLICY "Allow public read access"
  ON event_templates
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert access"
  ON event_templates
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update access"
  ON event_templates
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access"
  ON event_templates
  FOR DELETE
  TO anon
  USING (true);