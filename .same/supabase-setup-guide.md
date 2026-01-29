# Supabase Database Integration Guide

## Overview

Your website currently uses **localStorage** for storing all data (content, bookings, testimonials, gallery). This works great for development and single-user scenarios, but has limitations:

❌ **LocalStorage Limitations:**
- Data only stored in browser (lost if user clears cache)
- No cross-device sync
- No real-time updates
- Maximum ~10MB storage
- Client-side only (not secure for sensitive data)

✅ **Supabase Benefits:**
- Real PostgreSQL database (unlimited storage)
- Real-time subscriptions
- Built-in authentication
- Row-level security
- API auto-generated
- Works across all devices
- Serverless and scalable

---

## What's Already Done

✅ Supabase client package installed (`@supabase/supabase-js`)
✅ Supabase configuration file created (`src/lib/supabase.ts`)
✅ Environment variable file created (`.env.local`)
✅ Data types defined for all content (testimonials, gallery, bookings, etc.)

---

## What You Need to Do

### Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project
4. Choose a region closest to your users
5. Set a database password (save it somewhere safe!)

### Step 2: Get Your Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (a long string starting with `eyJ...`)

### Step 3: Update Environment Variables

1. Open `/soul-mobile-detailing/.env.local`
2. Replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_URL.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Save the file
4. Restart your development server

---

## Database Schema

You'll need to create these tables in Supabase:

### 1. **website_content** table
```sql
CREATE TABLE website_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT NOT NULL,
  hero JSONB NOT NULL,
  features JSONB NOT NULL,
  services JSONB NOT NULL,
  testimonials JSONB NOT NULL,
  gallery JSONB NOT NULL,
  about JSONB NOT NULL,
  contact JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default content
INSERT INTO website_content (site_name, hero, features, services, testimonials, gallery, about, contact)
VALUES (
  'Soul Mobile Detailing LLC',
  '{"backgroundImage": "...", "heading": "...", "subheading": "..."}',
  '[...]',
  '[...]',
  '[...]',
  '[...]',
  '{...}',
  '{...}'
);
```

### 2. **bookings** table
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  vehicle_type TEXT NOT NULL,
  service TEXT NOT NULL,
  preferred_date TEXT,
  preferred_time TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. **testimonials** table (optional - for customer-submitted reviews)
```sql
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  vehicle_type TEXT,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. **gallery_photos** table (optional - separate from content)
```sql
CREATE TABLE gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  before_image TEXT NOT NULL,
  after_image TEXT NOT NULL,
  description TEXT,
  service TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## How to Create Tables

### Option 1: SQL Editor (Recommended)
1. Go to **SQL Editor** in Supabase dashboard
2. Copy and paste each table creation SQL above
3. Click **Run**

### Option 2: Table Editor (Visual)
1. Go to **Table Editor**
2. Click **New Table**
3. Add columns manually based on schema above

---

## Migrating from localStorage to Supabase

Once Supabase is set up, you'll need to update the storage functions in `src/lib/content.ts`:

### Current (localStorage):
```typescript
export function saveContent(content: WebsiteContent): void {
  localStorage.setItem('websiteContent', JSON.stringify(content));
}
```

### New (Supabase):
```typescript
import { supabase } from './supabase';

export async function saveContent(content: WebsiteContent): Promise<void> {
  const { error } = await supabase
    .from('website_content')
    .update({
      site_name: content.siteName,
      hero: content.hero,
      features: content.features,
      services: content.services,
      testimonials: content.testimonials,
      gallery: content.gallery,
      about: content.about,
      contact: content.contact,
      updated_at: new Date().toISOString()
    })
    .eq('id', 'your-content-row-id');

  if (error) throw error;
}
```

---

## Admin Panel Updates Needed

The admin panel needs to be updated to support editing:

1. **Testimonials Tab**
   - Add/edit/delete customer reviews
   - Change ratings
   - Manage customer details

2. **Gallery Tab**
   - Upload before/after photos
   - Add titles and descriptions
   - Link to service packages

---

## Hybrid Approach (Fallback)

You can implement a hybrid system that:
- ✅ Uses Supabase when configured
- ✅ Falls back to localStorage if not configured
- ✅ Allows gradual migration

This is already set up in `src/lib/supabase.ts` with the `isSupabaseConfigured()` function.

---

## Security Considerations

### Row Level Security (RLS)

Enable RLS on tables to control access:

```sql
-- Enable RLS on bookings table
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Allow public to insert bookings (for booking form)
CREATE POLICY "Allow public to create bookings"
  ON bookings
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Only authenticated users can read bookings (admin panel)
CREATE POLICY "Allow authenticated to read bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (true);
```

---

## Testing

After setup:

1. ✅ Test booking form submission
2. ✅ Test admin panel content editing
3. ✅ Test testimonials display
4. ✅ Test gallery display
5. ✅ Verify data persists across browser refreshes
6. ✅ Check mobile responsiveness

---

## Cost

**Supabase Free Tier includes:**
- 500MB database storage
- 1GB file storage
- 2GB bandwidth
- 50,000 monthly active users
- 500,000 edge function invocations

This is MORE than enough for a detailing business website!

---

## Need Help?

If you need assistance setting up Supabase:
1. Follow the official docs: https://supabase.com/docs
2. Join Supabase Discord: https://discord.supabase.com
3. Ask for help implementing the database migration

---

## Current Status

**✅ What's Working Now (with localStorage):**
- All website content editable
- Booking system functional
- Testimonials displaying
- Gallery showcasing before/after photos
- Admin panel with password protection
- Image uploads working

**🔄 What Supabase Will Add:**
- Persistent data across devices
- Real-time updates
- Scalable storage
- Professional database backend
- Better security
- Email notifications (with Supabase Functions)

---

**Note:** The current localStorage implementation is perfectly fine for development and testing. You can deploy and use it as-is. Supabase is recommended when you need production-grade persistence and multi-device access.
