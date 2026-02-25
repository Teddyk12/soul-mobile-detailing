# 🔍 Debug: Why Image Changes Don't Appear on Other Devices

## Step 1: Check What's in Supabase Database

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **Table Editor** → **website_content**
4. You should see **1 row** of data
5. Click on that row to view it

### What to look for:
- Find the **services** column (JSONB type)
- Look for the "exterior" service
- Check what image URL is there

**Is it the OLD image or NEW image?**
- Old: `https://images.unsplash.com/photo-1621361365424-06f0e1eb5c49...`
- New: `https://images.unsplash.com/photo-1633014041037-f5446fb4ce99...`

---

## Step 2: Force Update the Database

Run this SQL to update the image directly:

```sql
UPDATE website_content
SET services = jsonb_set(
  services,
  '{1,image}',
  '"https://images.unsplash.com/photo-1633014041037-f5446fb4ce99?w=800&h=600&fit=crop&q=80"'
)
WHERE TRUE;
```

Then verify:
```sql
SELECT services->1->>'image' as exterior_image FROM website_content;
```

You should see the NEW image URL.

---

## Step 3: Clear ALL Caches

### On Your Device:
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images" and "Cookies"
3. Click Clear

### On Other Device:
1. Do the same - clear cache completely
2. Or use Incognito/Private mode

### In Vercel:
1. Go to: https://vercel.com/teddyk12/soul-mobile-detailing
2. Click **Deployments**
3. Find latest deployment
4. Click **...** → **Redeploy**

---

## Step 4: Test on Other Device

1. Open **Incognito/Private** window
2. Go to: https://soulmobiledetailingllc.com
3. Hard refresh: `Ctrl + Shift + R`
4. Scroll to "Exterior Only" service
5. **Does the image show the BMW with foam?**

---

## Common Issues:

### Issue 1: Admin Panel Saves to localStorage Only
**Symptom:** Changes appear on your device but not others
**Fix:** Environment variables missing in Vercel

Check: https://vercel.com/teddyk12/soul-mobile-detailing/settings/environment-variables
- `NEXT_PUBLIC_SUPABASE_URL` = present?
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = present?

### Issue 2: Database Not Updated
**Symptom:** SQL query shows old image URL
**Fix:** Run the UPDATE SQL above

### Issue 3: Aggressive Caching
**Symptom:** Even incognito shows old image
**Fix:** Wait 10-15 minutes OR add `?v=2` to URL

Try: https://soulmobiledetailingllc.com?v=2

---

## Quick Diagnostic:

Open browser console (F12) on homepage and run:
```javascript
fetch('https://soulmobiledetailingllc.com').then(r => r.text()).then(html => {
  if (html.includes('photo-1633014041037-f5446fb4ce99')) {
    console.log('✅ NEW image in HTML');
  } else if (html.includes('photo-1621361365424-06f0e1eb5c49')) {
    console.log('❌ OLD image still in HTML - cache issue');
  } else {
    console.log('🤔 Image not found in HTML');
  }
});
```
