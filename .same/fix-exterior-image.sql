-- Quick Fix: Update only the Exterior Only service image
-- Run this in Supabase SQL Editor

UPDATE website_content
SET services = jsonb_set(
  services,
  '{1,image}',
  '"https://images.unsplash.com/photo-1633014041037-f5446fb4ce99?w=800&h=600&fit=crop&q=80"'
);

-- This updates index 1 (second service = Exterior Only) with the BMW foam wash image
