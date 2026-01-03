# Custom Domain Setup Guide

## 🌐 Connecting Your Custom Domain to Netlify

This guide will help you connect your own domain (like `soulmobiledetailing.com`) to your Netlify-hosted website.

---

## Prerequisites

You need to have:
- ✅ A domain name purchased (from GoDaddy, Namecheap, Google Domains, etc.)
- ✅ Access to your domain registrar's DNS settings
- ✅ Your Netlify site deployed (currently at: https://same-nf22lq4cgxv-latest.netlify.app)

---

## Option 1: Let Netlify Manage DNS (Recommended - Easiest)

### Step 1: Add Domain in Netlify
1. Go to your Netlify dashboard
2. Click on your site: **same-nf22lq4cgxv**
3. Go to **Domain management** (or **Domain settings**)
4. Click **Add custom domain**
5. Enter your domain: `soulmobiledetailing.com`
6. Click **Verify**
7. Click **Add domain**

### Step 2: Set Up Netlify DNS
1. Netlify will show you **4 nameservers** like:
   ```
   dns1.p01.nsone.net
   dns2.p01.nsone.net
   dns3.p01.nsone.net
   dns4.p01.nsone.net
   ```
2. Copy these nameservers

### Step 3: Update Nameservers at Your Registrar
1. Log in to your domain registrar (GoDaddy, Namecheap, etc.)
2. Find your domain's **DNS settings** or **Nameservers**
3. Change from default nameservers to Netlify's nameservers
4. Save changes

### Step 4: Wait for DNS Propagation
- **Time**: 24-48 hours (usually faster, often 1-2 hours)
- **Check status**: Use https://www.whatsmydns.net

### Step 5: Enable HTTPS (Automatic)
1. Netlify will automatically provision an SSL certificate
2. Wait a few minutes after DNS propagation
3. Your site will be accessible at `https://soulmobiledetailing.com`

---

## Option 2: Keep Current DNS Provider (External DNS)

If you want to keep your current DNS provider (for email, etc.):

### Step 1: Add Domain in Netlify
1. Go to Netlify dashboard → Your site → **Domain management**
2. Click **Add custom domain**
3. Enter: `soulmobiledetailing.com`
4. Click **Verify** → **Add domain**

### Step 2: Configure DNS Records at Your Registrar

You need to add these DNS records:

#### For Root Domain (soulmobiledetailing.com)
**Option A: If your DNS supports ALIAS/ANAME records:**
```
Type: ALIAS or ANAME
Name: @ (or leave blank)
Value: same-nf22lq4cgxv-latest.netlify.app
```

**Option B: If only A records are supported:**
```
Type: A
Name: @ (or leave blank)
Value: 75.2.60.5
```
*(This is Netlify's load balancer IP - check Netlify docs for current IP)*

#### For WWW Subdomain (www.soulmobiledetailing.com)
```
Type: CNAME
Name: www
Value: same-nf22lq4cgxv-latest.netlify.app
```

### Step 3: Wait for DNS Propagation
- **Time**: 24-48 hours (usually 1-2 hours)
- **Check**: https://www.whatsmydns.net

### Step 4: Enable HTTPS in Netlify
1. After DNS propagates, go to **Domain management**
2. Click **Verify DNS configuration**
3. Click **Provision certificate** (if not automatic)
4. Wait a few minutes for SSL setup

---

## Option 3: Subdomain Only (e.g., book.yourdomain.com)

If you want to use a subdomain like `book.yourdomain.com`:

### Step 1: Add Domain in Netlify
1. Netlify dashboard → **Domain management**
2. **Add custom domain**
3. Enter: `book.yourdomain.com`
4. Click **Add domain**

### Step 2: Add CNAME Record at Your DNS Provider
```
Type: CNAME
Name: book
Value: same-nf22lq4cgxv-latest.netlify.app
TTL: 3600 (or automatic)
```

### Step 3: Wait & Verify
- DNS propagation: 1-24 hours
- Netlify will auto-provision SSL
- Access at: `https://book.yourdomain.com`

---

## Common Domain Registrars - Quick Links

### GoDaddy
1. Log in → **My Products** → **Domains** → Click your domain
2. **DNS** → **Nameservers** → **Change**
3. Select **Custom** → Enter Netlify's nameservers

### Namecheap
1. Log in → **Domain List** → Click **Manage**
2. **Nameservers** → **Custom DNS**
3. Enter Netlify's nameservers

### Google Domains
1. Log in → Select your domain
2. **DNS** → **Custom name servers**
3. Enter Netlify's nameservers

### Cloudflare
1. Log in → Select your domain
2. **DNS** → **Records** → Add CNAME record
3. Point to: `same-nf22lq4cgxv-latest.netlify.app`

---

## Verification & Testing

### Check DNS Propagation
Use these tools to check if DNS has propagated:
- https://www.whatsmydns.net
- https://dnschecker.org
- Command line: `nslookup soulmobiledetailing.com`

### Check SSL Certificate
1. Visit your domain with `https://`
2. Click the padlock icon in browser
3. Verify certificate is from Netlify (Let's Encrypt)

### Test on Multiple Devices
- Desktop browser
- Mobile browser
- Incognito/private mode

---

## Redirect www to Non-www (or vice versa)

Netlify automatically handles this! Just configure:

1. **Domain management** → **Domain settings**
2. Choose your **Primary domain**:
   - `soulmobiledetailing.com` (non-www)
   - OR `www.soulmobiledetailing.com` (www)
3. Netlify will auto-redirect the other version

---

## Troubleshooting

### Domain Not Working After 48 Hours
1. Check nameservers are correct: `nslookup -type=ns soulmobiledetailing.com`
2. Verify DNS records are correct
3. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
4. Try incognito mode

### SSL Certificate Issues
1. Wait 24 hours after DNS propagation
2. In Netlify: **Domain management** → **Renew certificate**
3. Check domain is verified in Netlify
4. Ensure DNS records point to Netlify

### Mixed Content Warnings
1. Check all resources use `https://` not `http://`
2. Update any hardcoded HTTP URLs in your code
3. Redeploy if needed

### Email Stopped Working
If you switched to Netlify DNS:
1. Add MX records in Netlify DNS settings
2. Copy MX records from your old DNS provider
3. Add them to Netlify DNS management

---

## Recommended Setup

**Best Practice Setup:**
```
Primary Domain: soulmobiledetailing.com (non-www)
Redirect: www.soulmobiledetailing.com → soulmobiledetailing.com
SSL: Enabled (automatic)
DNS Provider: Netlify DNS (easiest)
```

This gives you:
- ✅ Clean URL (no www)
- ✅ Automatic www redirect
- ✅ Free SSL certificate
- ✅ Automatic DNS management
- ✅ Best performance

---

## Cost

- **Netlify Custom Domain**: FREE ✅
- **Netlify SSL Certificate**: FREE ✅
- **Netlify DNS**: FREE ✅
- **Domain Registration**: $10-15/year (paid to registrar)

---

## After Setup Checklist

Once your custom domain is working:

- [ ] Test booking form on custom domain
- [ ] Test admin panel: `https://yourdomain.com/admin`
- [ ] Update Google Analytics (if using)
- [ ] Update business cards/marketing materials
- [ ] Update Google My Business listing
- [ ] Update social media profiles
- [ ] Update email signatures
- [ ] Test on mobile devices
- [ ] Verify SSL certificate is active
- [ ] Check all pages load correctly

---

## Example Timeline

**Using Netlify DNS (Recommended):**
```
Day 1, 10:00 AM - Add domain to Netlify (5 min)
Day 1, 10:05 AM - Update nameservers at registrar (5 min)
Day 1, 02:00 PM - DNS propagates (4 hours typical)
Day 1, 02:15 PM - SSL certificate auto-provisions (15 min)
Day 1, 02:30 PM - Site live at custom domain! ✅
```

**Using External DNS:**
```
Day 1, 10:00 AM - Add domain to Netlify (5 min)
Day 1, 10:10 AM - Add DNS records at registrar (10 min)
Day 1, 06:00 PM - DNS propagates (8 hours typical)
Day 1, 06:30 PM - SSL certificate provisions (30 min)
Day 1, 07:00 PM - Site live at custom domain! ✅
```

---

## Need Help?

### Netlify Support
- Docs: https://docs.netlify.com/domains-https/custom-domains/
- Support: https://www.netlify.com/support/

### DNS Help
- DNS Checker: https://www.whatsmydns.net
- DNS Propagation: Usually 1-24 hours
- Emergency: Can take up to 48 hours

---

## Summary

**Easiest Method**: Let Netlify manage DNS
1. Add domain in Netlify
2. Copy Netlify's nameservers
3. Update nameservers at your registrar
4. Wait for DNS to propagate
5. Done! ✅

**Total Time**: 10 minutes of work + DNS propagation wait

**Cost**: $0 (just your domain registration fee)

**Result**: Professional custom domain with free SSL! 🎉

---

*Need help with this process? I can guide you through each step!*
