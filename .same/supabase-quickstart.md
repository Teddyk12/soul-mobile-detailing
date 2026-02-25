# Supabase Integration - Quick Start Guide

## 🎯 Goal
Enable real-time multi-user booking system supporting 5+ simultaneous users with instant updates.

## ✅ What's Already Done
- ✅ Supabase client installed (`@supabase/supabase-js`)
- ✅ Database schema created (`.same/supabase-schema.sql`)
- ✅ Hybrid storage functions implemented (Supabase + localStorage fallback)
- ✅ Real-time subscription functions ready
- ✅ Environment variables configured

## 🚀 How to Enable Supabase (5 Steps)

### Step 1: Create Supabase Project (5 minutes)

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up / Log in
3. Click **"New Project"**
4. Choose:
   - **Organization**: Create new or select existing
   - **Project Name**: `soul-mobile-detailing`
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to your customers
   - **Pricing**: Free tier (more than enough!)
5. Click **"Create new project"** (takes ~2 minutes to provision)

### Step 2: Run Database Schema (3 minutes)

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open the file: `soul-mobile-detailing/.same/supabase-schema.sql`
4. Copy ALL the SQL code
5. Paste into the Supabase SQL Editor
6. Click **"Run"** (green button)
7. ✅ You should see: `Success. No rows returned`

**Verify tables were created:**
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('website_content', 'bookings', 'availability_slots');
```
You should see 3 tables listed.

### Step 3: Get API Credentials (2 minutes)

1. In Supabase dashboard, go to **Settings** → **API** (left sidebar)
2. Copy these two values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (long string starting with `eyJ...`)

### Step 4: Update Environment Variables (1 minute)

1. Open: `soul-mobile-detailing/.env.local`
2. Replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. **IMPORTANT:** Restart your dev server after changing `.env.local`

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd soul-mobile-detailing
bun run dev
```

### Step 5: Test & Verify (3 minutes)

1. Open the website: `http://localhost:3000`
2. Open browser console (F12) → Console tab
3. Look for Supabase messages - should NOT see:
   - ❌ `"Supabase not configured"`
4. Create a test booking:
   - Click **"Book Now"**
   - Fill out the form
   - Submit
5. Check Supabase dashboard → **Table Editor** → **bookings**
   - ✅ You should see the booking appear in real-time!

## 🔥 Features You Get with Supabase

### ✅ Real-time Updates
- Multiple admins can view the same dashboard
- Bookings appear instantly for all users
- Availability updates in real-time
- No page refresh needed

### ✅ Persistent Storage
- Data survives browser cache clear
- Works across all devices
- Professional database backend
- Automatic backups

### ✅ Multi-User Support
- 5+ simultaneous users supported
- No conflicts when booking same slot
- Admin can see all bookings live
- Customers can't double-book

## 📊 Supabase Free Tier Limits

**More than enough for a detailing business:**
- ✅ 500MB database storage
- ✅ 1GB file storage
- ✅ 2GB bandwidth/month
- ✅ 50,000 monthly active users
- ✅ 500,000 Edge Function invocations
- ✅ Unlimited API requests

**Estimated capacity:**
- ~50,000 bookings
- ~100,000 availability slots
- Hundreds of simultaneous users

## 🔧 How It Works (Hybrid System)

The system automatically uses Supabase when configured, otherwise falls back to localStorage:

```typescript
// Booking function automatically chooses:
if (Supabase configured) {
  → Save to Supabase database
  → Also cache in localStorage
  → Enable real-time sync
} else {
  → Save to localStorage only
  → Works offline/locally
}
```

**Benefits:**
- ✅ Zero downtime during migration
- ✅ Works without Supabase (local dev)
- ✅ Automatic fallback if Supabase down
- ✅ Gradual migration possible

## 🎨 Admin Panel Features (with Supabase)

### Real-time Booking Updates
- See new bookings appear instantly
- Status changes sync across all admin users
- No manual refresh needed

### Real-time Availability
- Add/remove slots → updates for all users
- Customer books slot → admin sees it immediately
- Release slot → customers can book right away

### Multi-Admin Support
- Multiple staff can manage bookings
- No conflicts or overwrites
- All changes visible to everyone

## 🐛 Troubleshooting

### "Supabase not configured" in console

**Cause:** Environment variables not loaded

**Fix:**
1. Check `.env.local` has correct values
2. Restart dev server: `Ctrl+C` then `bun run dev`
3. Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### "relation does not exist" error

**Cause:** Tables not created in Supabase

**Fix:**
1. Go to SQL Editor in Supabase
2. Run the schema file again
3. Verify tables exist in Table Editor

### Bookings not appearing in Supabase

**Cause:** RLS (Row Level Security) blocking inserts

**Fix:**
1. Go to **Authentication** → **Policies** in Supabase
2. Verify policies exist for `bookings` table
3. Re-run the schema SQL to recreate policies

### Real-time not working

**Cause:** Realtime not enabled on tables

**Fix:**
1. Go to **Database** → **Replication** in Supabase
2. Enable for tables: `bookings`, `availability_slots`
3. Or re-run the schema SQL (includes realtime setup)

## 📱 Deployment with Supabase

When deploying to Netlify, add environment variables:

1. Go to Netlify dashboard → **Site settings** → **Environment variables**
2. Add both variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Redeploy the site

**Or deploy via CLI:**
```bash
netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://xxx.supabase.co"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "eyJhbGci..."
netlify deploy --prod
```

## ✨ Migration from localStorage

**Good news:** You don't need to migrate manually!

The hybrid system automatically:
1. Reads from localStorage first time
2. Saves to both Supabase + localStorage
3. Future reads come from Supabase
4. localStorage acts as cache/fallback

**Optional manual migration:**
1. Export data from browser localStorage
2. Use Supabase SQL Editor to import
3. Or just start fresh (recommended)

## 🎯 Next Steps After Setup

1. ✅ Test booking flow end-to-end
2. ✅ Add some availability slots
3. ✅ Test with 2+ browser windows (simulate multi-user)
4. ✅ Deploy to production with env vars
5. ✅ Monitor Supabase dashboard for usage
6. ✅ Set up email notifications (future)
7. ✅ Add customer testimonials (future)

## 📞 Support

- **Supabase Docs:** https://supabase.com/docs
- **Supabase Discord:** https://discord.supabase.com
- **Same Support:** support@same.new

---

**Current Status:** ✅ Code ready, just needs Supabase credentials!

**Time to enable:** ~15 minutes total

**Difficulty:** Easy (copy/paste SQL and env vars)
