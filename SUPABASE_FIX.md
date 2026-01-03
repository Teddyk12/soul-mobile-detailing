# 🔧 FIX: Supabase Database Setup

## Problem
Your admin panel shows this error:
```
Error loading from Supabase: 'PGRST116'
The result contains 0 rows
Cannot coerce the result to a single JSON object
```

This means your Supabase database tables haven't been created yet.

## Solution (5 minutes)

### Step 1: Go to Supabase Dashboard
1. Visit https://supabase.com/dashboard
2. Select your **Soul Mobile Detailing** project
3. Click on **SQL Editor** in the left sidebar

### Step 2: Run the Database Schema
1. Click **New Query** button
2. Copy the ENTIRE contents of `.same/supabase-schema-public.sql` file
3. Paste it into the SQL Editor
4. Click **Run** (or press Ctrl/Cmd + Enter)

### Step 3: Verify Tables Created
You should see a success message showing:
```
website_content
bookings
availability_slots
```

### Step 4: Test the Admin Panel
1. Go back to https://soulmobiledetailingllc.com/admin
2. Login with: username `owner`, password `soul2025`
3. Click **Availability** tab
4. Try adding a slot - it should work now!

## What This Does

The SQL script:
- ✅ Creates 3 database tables
- ✅ Sets up proper indexes for fast queries
- ✅ Configures security policies (RLS)
- ✅ Adds default website content
- ✅ Enables public access for localStorage-based admin

## After Setup

Once the tables are created:
- ✅ Slot creation will work
- ✅ Bookings will be saved to cloud
- ✅ Data persists across devices
- ✅ Real-time updates enabled

## Still Having Issues?

If you still see errors after running the SQL:
1. Check browser console (F12) for new errors
2. Verify environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Make sure you're using the **anon key**, not the service role key
4. Try clearing browser cache and reloading
