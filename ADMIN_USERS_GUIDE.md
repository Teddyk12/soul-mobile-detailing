# Multi-User Admin System Guide

## Overview

Your Soul Mobile Detailing website now has a complete multi-user admin system with individual logins, role-based access control, and comprehensive audit logging to track who made what changes.

## Default Login

**Username:** `owner`
**Password:** `soul2025`

## User Roles

### 1. **Owner** (Full Access)
- Access to all features
- Can manage all users (create, delete, reset passwords)
- Can view and manage all bookings, availability, and content
- Can view audit logs
- **Recommended for:** Business owner

### 2. **Admin** (Full Access Except User Management)
- Can manage bookings, availability, and content
- Can view audit logs
- Cannot create or delete users
- **Recommended for:** Managers or senior staff

### 3. **Staff** (View Only - Future Enhancement)
- Currently has same access as Admin
- Designed for future read-only access
- **Recommended for:** Junior staff or part-time employees

## How to Add New Users

1. **Login** as an Owner account
2. Click on the **Users** tab in the admin panel
3. Click **Add User** button
4. Fill in the required information:
   - **Username:** Unique identifier for login (lowercase, no spaces)
   - **Password:** Minimum 6 characters
   - **Full Name:** Display name in the system
   - **Role:** Select appropriate access level
5. Click **Add User**

## Managing Users

### Reset Password
1. Go to the **Users** tab
2. Click **Reset Password** next to the user
3. Enter the new password
4. User will need to use the new password on next login

### Delete User
1. Go to the **Users** tab
2. Click the trash icon next to the user
3. Confirm deletion
4. **Note:** You cannot delete yourself or the last owner account

## Audit Log

Every action in the admin panel is tracked and logged:

- **Login/Logout** - Who signed in and when
- **Content Updates** - Changes to website content
- **Booking Updates** - Status changes, deletions
- **Availability Updates** - Time slot additions/deletions
- **User Management** - User creation, deletion, password resets

### Viewing Audit Logs

1. Click on the **Audit Log** tab
2. See chronological list of all actions
3. Each entry shows:
   - Who performed the action
   - What action was performed
   - When it happened
   - Details about the change

The system keeps the last 1,000 logs or 90 days of history (whichever is more).

## Admin Panel Tabs

### Bookings Tab
- View all customer booking requests
- Change booking status (Pending → Confirmed → Completed)
- View customer details including address
- Send confirmation or denial emails
- Delete bookings
- See who made changes in audit log

### Availability Tab
- Add single time slots
- Batch add multiple slots with Quick Add
- View booked vs available slots
- Click booked slots to see booking details
- Manage your schedule efficiently
- All changes are logged with your username

### Website Content Tab
- Edit site name, hero section, services, about section
- Upload images for various sections
- Update contact information
- Save changes (automatically logged)

### Users Tab (Owner Only)
- Visible only to Owner role accounts
- Manage admin users
- Create new accounts for staff
- Reset passwords
- View last login times

### Audit Log Tab
- View all admin panel activity
- Track who made what changes
- Review login/logout history
- Monitor system usage

## Best Practices

### Security
1. **Change the default password** immediately after first login
2. **Use strong passwords** for all accounts (mix of letters, numbers, symbols)
3. **Don't share accounts** - create individual accounts for each person
4. **Review audit logs regularly** to monitor activity
5. **Delete accounts** for staff who leave

### User Management
1. **Give minimum necessary access** - Use Staff role when possible
2. **Keep at least 2 Owner accounts** - For backup access
3. **Document passwords securely** - Don't store in plain text
4. **Review user list monthly** - Remove inactive accounts

### Change Tracking
1. **Check audit logs** when issues arise
2. **Use logs for training** - Review what changes were made
3. **Monitor unusual activity** - Multiple failed logins, unexpected changes

## Troubleshooting

### Can't Login
- Verify username and password are correct (case-sensitive)
- Try resetting your password (ask an Owner)
- Clear browser cache and try again

### Can't See Users Tab
- Only Owner role accounts can see this tab
- Contact an existing Owner to upgrade your role

### Changes Not Saving
- Check if you have the appropriate role permissions
- Refresh the page and try again
- Contact support if issue persists

### Audit Log Not Showing Recent Changes
- Refresh the page
- Changes are logged immediately when saved
- Check that you're logged in as the correct user

## Support

For technical issues or questions:
- Check this guide first
- Review the EMAIL_SETUP.md for email functionality
- Contact Same support if needed

## Summary of New Features

✅ Multiple admin users with individual accounts
✅ Username + password authentication
✅ Three role levels (Owner, Admin, Staff)
✅ Complete audit logging of all actions
✅ User management interface (Owner only)
✅ Track who made what changes and when
✅ Secure password reset functionality
✅ Last login tracking
✅ Session-based authentication (stays logged in per browser session)

---

**Your admin panel is now enterprise-ready with full accountability and multi-user support!**
