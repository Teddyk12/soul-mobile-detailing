# Quick Fix: Update Exterior Only Image in Supabase

## The Problem
The image change isn't appearing on other devices because it's not saved in Supabase.

## Solution: Update Directly in Supabase

### Step 1: Go to Supabase Dashboard
1. Visit: https://supabase.com/dashboard
2. Select your **Soul Mobile Detailing** project
3. Click **Table Editor** in the left sidebar

### Step 2: Open website_content Table
1. Click on the **website_content** table
2. You should see 1 row of data
3. Click on that row to edit it

### Step 3: Update the Services JSON
1. Find the **services** column (it's JSONB type)
2. Click the **Edit** button (pencil icon)
3. Look for the section that has:
   ```json
   {
     "id": "exterior",
     "badge": "Exterior Only",
     "image": "https://images.unsplash.com/photo-1621361365424-06f0e1eb5c49?w=800&h=600&fit=crop&q=80",
     ...
   }
   ```

### Step 4: Replace the Image URL
Change the old image URL to:
```
https://images.unsplash.com/photo-1633014041037-f5446fb4ce99?w=800&h=600&fit=crop&q=80
```

So it becomes:
```json
{
  "id": "exterior",
  "badge": "Exterior Only",
  "image": "https://images.unsplash.com/photo-1633014041037-f5446fb4ce99?w=800&h=600&fit=crop&q=80",
  ...
}
```

### Step 5: Save
1. Click **Save** or **Update**
2. Wait for confirmation

### Step 6: Test
1. Go to: https://soulmobiledetailingllc.com
2. Press Ctrl+Shift+R (hard refresh)
3. The image should now update on ALL devices!

---

## Alternative: Run SQL in Supabase

If editing JSON is difficult, run this SQL:

```sql
UPDATE website_content
SET services = jsonb_set(
  services,
  '{1,image}',
  '"https://images.unsplash.com/photo-1633014041037-f5446fb4ce99?w=800&h=600&fit=crop&q=80"'
)
WHERE TRUE;
```

This will update the second service (index 1) image directly.
