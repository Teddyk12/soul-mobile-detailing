-- Soul Mobile Detailing - Supabase Storage Setup
-- Run this in Supabase SQL Editor to create image storage

-- ============================================
-- 1. CREATE STORAGE BUCKET
-- ============================================

-- Create a public bucket for website images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'website-images',
  'website-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. SET STORAGE POLICIES
-- ============================================

-- Allow public to read/view images
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'website-images');

-- Allow public to upload images (for admin panel)
CREATE POLICY "Public can upload images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'website-images');

-- Allow public to update images
CREATE POLICY "Public can update images"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'website-images')
WITH CHECK (bucket_id = 'website-images');

-- Allow public to delete images
CREATE POLICY "Public can delete images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'website-images');

-- ============================================
-- SETUP COMPLETE!
-- ============================================

-- Verify bucket was created
SELECT * FROM storage.buckets WHERE id = 'website-images';
