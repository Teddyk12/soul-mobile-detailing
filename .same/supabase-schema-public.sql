-- Soul Mobile Detailing - Supabase Database Schema (Updated for Public Access)
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

-- ============================================
-- 2. BOOKINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  vehicle_type TEXT NOT NULL,
  service TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
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

-- Add unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS availability_slots_date_time_idx ON availability_slots(date, time);
CREATE INDEX IF NOT EXISTS availability_slots_date_idx ON availability_slots(date);
CREATE INDEX IF NOT EXISTS availability_slots_is_booked_idx ON availability_slots(is_booked);

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;

-- Website Content Policies
CREATE POLICY "Allow public read website content" ON website_content FOR SELECT TO public USING (true);
CREATE POLICY "Allow public update website content" ON website_content FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public insert website content" ON website_content FOR INSERT TO public WITH CHECK (true);

-- Bookings Policies
CREATE POLICY "Allow public read bookings" ON bookings FOR SELECT TO public USING (true);
CREATE POLICY "Allow public create bookings" ON bookings FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update bookings" ON bookings FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete bookings" ON bookings FOR DELETE TO public USING (true);

-- Availability Slots Policies (UPDATED - Allow public insert/delete for localStorage admin)
CREATE POLICY "Allow public read slots" ON availability_slots FOR SELECT TO public USING (true);
CREATE POLICY "Allow public create slots" ON availability_slots FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update slots" ON availability_slots FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete slots" ON availability_slots FOR DELETE TO public USING (true);

-- ============================================
-- 5. FUNCTIONS & TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_availability_slots_updated_at BEFORE UPDATE ON availability_slots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_website_content_updated_at BEFORE UPDATE ON website_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. INSERT DEFAULT DATA
-- ============================================

-- Insert default website content if none exists
INSERT INTO website_content (site_name, hero, features, services, about, contact)
SELECT
  'Soul Mobile Detailing LLC',
  '{"backgroundImage": "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=1920&h=1080&fit=crop&q=80", "heading": "Soul Mobile Detailing", "subheading": "Professional mobile detailing services that restore your vehicle''s beauty and protect your investment"}'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  '{"heading": "About Soul Mobile Detailing", "paragraph1": "With over 3 years of experience in automotive detailing, Soul Mobile Detailing brings professional mobile services directly to your location.", "paragraph2": "Our mobile detailing service comes to you wherever you are.", "stat1Label": "Cars Detailed", "stat1Value": "1000+", "stat2Label": "Customer Satisfaction", "stat2Value": "98%", "image": "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=1200&h=800&fit=crop&q=80"}'::jsonb,
  '{"phone": "425 574 6475", "email": "soulmobiledetailingllc@gmail.com", "hours": {"weekday": "Mon-Fri: 8AM-6PM", "saturday": "Sat: 8AM-4PM", "sunday": "Sun: By Appointment"}}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM website_content LIMIT 1);

-- ============================================
-- SETUP COMPLETE!
-- ============================================

-- Verify tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('website_content', 'bookings', 'availability_slots');
