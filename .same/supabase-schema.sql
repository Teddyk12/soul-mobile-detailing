-- Soul Mobile Detailing - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to create all necessary tables

-- ============================================
-- 1. WEBSITE CONTENT TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS website_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT NOT NULL,
  hero JSONB NOT NULL,
  features JSONB NOT NULL,
  services JSONB NOT NULL,
  about JSONB NOT NULL,
  contact JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default content (run after table creation)
INSERT INTO website_content (site_name, hero, features, services, about, contact)
VALUES (
  'Soul Mobile Detailing LLC',
  '{"backgroundImage": "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=1920&h=1080&fit=crop&q=80", "heading": "Soul Mobile Detailing", "subheading": "Professional mobile detailing services that restore your vehicle''s beauty and protect your investment"}',
  '[
    {"icon": "sparkles", "title": "Premium Products", "description": "We use only the highest quality detailing products and equipment for superior results"},
    {"icon": "shield", "title": "Satisfaction Guarantee", "description": "100% satisfaction guaranteed or we''ll make it right - your happiness is our priority"},
    {"icon": "clock", "title": "Mobile Convenience", "description": "We come to your location - home, office, or anywhere in our service area"}
  ]',
  '[]'::jsonb,
  '{"heading": "About Soul Mobile Detailing", "paragraph1": "With over 3 years of experience in automotive detailing, Soul Mobile Detailing brings professional mobile services directly to your location.", "paragraph2": "Our mobile detailing service comes to you wherever you are.", "stat1Label": "Cars Detailed", "stat1Value": "1000+", "stat2Label": "Customer Satisfaction", "stat2Value": "98%", "image": "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=1200&h=800&fit=crop&q=80"}',
  '{"phone": "206 788 5850", "email": "info@souldetailing.com", "hours": {"weekday": "Mon-Fri: 8AM-6PM", "saturday": "Sat: 8AM-4PM", "sunday": "Sun: By Appointment"}}'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. BOOKINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  vehicle_type TEXT NOT NULL,
  service TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings(status);
CREATE INDEX IF NOT EXISTS bookings_date_idx ON bookings(date);
CREATE INDEX IF NOT EXISTS bookings_created_at_idx ON bookings(created_at DESC);

-- ============================================
-- 3. AVAILABILITY SLOTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint to prevent duplicate slots
CREATE UNIQUE INDEX IF NOT EXISTS availability_slots_date_time_idx ON availability_slots(date, time);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS availability_slots_date_idx ON availability_slots(date);
CREATE INDEX IF NOT EXISTS availability_slots_is_booked_idx ON availability_slots(is_booked);

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;

-- Website Content Policies
-- Allow anyone to read website content
CREATE POLICY "Allow public to read website content"
  ON website_content
  FOR SELECT
  TO public
  USING (true);

-- Only authenticated users can update website content (admin)
CREATE POLICY "Allow authenticated to update website content"
  ON website_content
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Bookings Policies
-- Allow public to create bookings (booking form)
CREATE POLICY "Allow public to create bookings"
  ON bookings
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow public to read their own bookings (optional - for future customer portal)
CREATE POLICY "Allow public to read bookings"
  ON bookings
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to update bookings (admin)
CREATE POLICY "Allow authenticated to update bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete bookings (admin)
CREATE POLICY "Allow authenticated to delete bookings"
  ON bookings
  FOR DELETE
  TO authenticated
  USING (true);

-- Availability Slots Policies
-- Allow public to read available slots
CREATE POLICY "Allow public to read availability slots"
  ON availability_slots
  FOR SELECT
  TO public
  USING (true);

-- Allow public to update slots (for booking)
CREATE POLICY "Allow public to book slots"
  ON availability_slots
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to insert slots (admin)
CREATE POLICY "Allow authenticated to insert slots"
  ON availability_slots
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to delete slots (admin)
CREATE POLICY "Allow authenticated to delete slots"
  ON availability_slots
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- 5. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for bookings table
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for availability_slots table
CREATE TRIGGER update_availability_slots_updated_at
    BEFORE UPDATE ON availability_slots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for website_content table
CREATE TRIGGER update_website_content_updated_at
    BEFORE UPDATE ON website_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. REALTIME PUBLICATION (Enable Real-time)
-- ============================================

-- Enable realtime for bookings table
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;

-- Enable realtime for availability_slots table
ALTER PUBLICATION supabase_realtime ADD TABLE availability_slots;

-- ============================================
-- SETUP COMPLETE
-- ============================================

-- Verify tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('website_content', 'bookings', 'availability_slots');
