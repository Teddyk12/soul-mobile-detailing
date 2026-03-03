# Soul Mobile Detailing - Complete System Overview

## 🚀 Live Website
**Main URL:** https://same-nf22lq4cgxv-latest.netlify.app

## 📱 Features

### Public Website
- ✅ Professional detailing service showcase
- ✅ 6 service packages with detailed pricing
- ✅ Mobile-responsive design
- ✅ Customer booking form with available time slots
- ✅ Automatic email confirmations (when configured)
- ✅ Service address collection

### Admin Panel (`/admin`)
- ✅ Multi-user authentication system
- ✅ Role-based access control (Owner/Admin/Staff)
- ✅ Booking management with status tracking
- ✅ Availability calendar with Quick Add
- ✅ Website content editor with image uploads
- ✅ User management (Owner only)
- ✅ Complete audit logging
- ✅ Real-time updates (with Supabase)

## 🔐 Admin Access

### Default Credentials
- **Username:** `owner`
- **Password:** `soul2025`
- **URL:** https://same-nf22lq4cgxv-latest.netlify.app/admin

### User Roles
1. **Owner** - Full access including user management
2. **Admin** - Full access except user management
3. **Staff** - View/edit access (no user management)

## 📊 Admin Panel Tabs

### 1. Bookings
- View all customer booking requests
- Update status: Pending → Confirmed → Completed → Cancelled
- View customer details (name, phone, email, address, vehicle type)
- Send confirmation/denial emails
- Delete bookings
- Filter and search (coming soon)

### 2. Availability
- **Single Slot:** Add individual time slots
- **Quick Add (Batch):** Create multiple slots at once
  - Select date range
  - Choose days of week
  - Set time range and intervals
  - Automatically generate slots
- View available vs booked slots
- Click booked slots to see customer details
- Delete/release slots
- Bulk management tools

### 3. Website Content
- **Site Name:** Update business name
- **Hero Section:** Banner image and text
- **Features:** 3 feature cards
- **Services:** 6 detailing packages with pricing
- **About Section:** Company info and stats
- **Contact Info:** Phone, email, hours
- **Image Uploads:** From PC or mobile

### 4. Users (Owner Only)
- Create new admin accounts
- Assign roles (Owner/Admin/Staff)
- Reset user passwords
- Delete users (except last owner)
- View last login times

### 5. Audit Log
- Track all admin panel activity
- See who made what changes
- Login/logout history
- Timestamp and details for each action
- Keeps last 1,000 entries or 90 days

## 📧 Email System

### Automatic Confirmations (Requires Setup)
1. Customer receives booking confirmation email
2. Business receives notification email

### Setup Required
1. Sign up at https://resend.com (free tier: 3,000 emails/month)
2. Get API key
3. Add to Netlify environment variables:
   - Key: `RESEND_API_KEY`
   - Value: Your API key

See `EMAIL_SETUP.md` for detailed instructions.

## 🗄️ Data Storage

### Hybrid Storage System
- **Primary:** Supabase (cloud database) - Real-time sync across devices
- **Fallback:** localStorage (browser storage) - Works offline
- Automatic sync when Supabase is configured
- All data persists across sessions

### Optional Supabase Setup
For multi-device, real-time updates:
1. Create free Supabase account
2. Create database with provided schema
3. Add environment variables to Netlify
4. Automatic real-time sync across all admin users

## 📱 Mobile Support
- ✅ Fully responsive design
- ✅ Mobile-optimized booking form
- ✅ Mobile admin panel access
- ✅ Image uploads from mobile devices
- ✅ Touch-friendly interface

## 🔧 Technical Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Hosting:** Netlify (dynamic site)
- **Database:** Supabase (optional) + localStorage
- **Email:** Resend API
- **Package Manager:** Bun

## 📁 Key Files

- `src/app/page.tsx` - Public homepage
- `src/app/admin/page.tsx` - Admin panel
- `src/components/BookingForm.tsx` - Customer booking form
- `src/lib/auth.ts` - User authentication & audit logging
- `src/lib/content.ts` - Data management functions
- `src/lib/supabase.ts` - Database connection
- `src/app/api/send-booking-emails/route.ts` - Email API

## 📚 Documentation

- `ADMIN_USERS_GUIDE.md` - Multi-user system guide
- `EMAIL_SETUP.md` - Email configuration instructions
- `SYSTEM_OVERVIEW.md` - This file

## 🎯 Common Tasks

### Add Available Time Slots
1. Go to Availability tab
2. Choose "Batch Slots" mode
3. Select date range (e.g., next 30 days)
4. Check days of week to include
5. Set time range (e.g., 9:00 AM - 5:00 PM)
6. Choose interval (e.g., 60 minutes)
7. Click "Generate Time Slots"

### Add New Admin User
1. Login as Owner
2. Go to Users tab
3. Click "Add User"
4. Enter username, password, full name
5. Select role
6. Click "Add User"

### Change Booking Status
1. Go to Bookings tab
2. Find the booking
3. Use dropdown to change status
4. Action is automatically logged

### Update Website Content
1. Go to Website Content tab
2. Edit any field
3. Upload images if needed
4. Click "Save Changes"
5. Changes appear immediately on live site

## 🔒 Security Features

- ✅ Session-based authentication
- ✅ Password-protected admin panel
- ✅ Role-based access control
- ✅ Audit logging of all actions
- ✅ User activity tracking
- ✅ Secure password reset
- ✅ Prevention of accidental account deletion

## 🆕 Recent Updates

### Version 47 - Multi-User Admin System
- Added username/password authentication
- Implemented 3 role levels
- Created user management interface
- Built comprehensive audit logging
- Added user activity tracking

### Version 46 - Email Fix
- Fixed email API for deployment
- Handles missing API key gracefully

### Version 45 - Automatic Emails
- Added Resend email integration
- Customer confirmation emails
- Business notification emails
- Fixed typo: "tire" → "tires"

## 💡 Future Enhancements

Potential features for future development:
- Email templates customization
- SMS notifications
- Calendar integration (Google/Outlook)
- Customer portal for rebooking
- Payment processing
- Review/rating system
- Analytics dashboard
- Staff role permissions refinement

## 🆘 Support

### For Technical Issues:
1. Check documentation files
2. Review audit logs for errors
3. Contact Same support at support@same.new

### For Business Questions:
- Contact: soulmobiledetailingllc@gmail.com
- Phone: 206 788 5850

---

**🎉 Your website is fully operational with enterprise-level features!**

Everything is tracked, multiple people can manage it, and customers can book online 24/7.
