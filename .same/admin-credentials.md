# Admin Panel Credentials

## Login Information

**Admin Password:** `soul2025`

## How to Access

1. Click the "Admin" button in the top-right navigation on the homepage
2. You'll be redirected to `/admin`
3. Enter the password: `soul2025`
4. Click "Login"

## Security Features

- Password-protected admin panel
- Session persists in localStorage (you won't need to re-login after page refresh)
- Logout button in admin panel to clear authentication
- Unauthorized users cannot access the admin panel

## Changing the Password

To change the admin password:

1. Open `soul-mobile-detailing/src/app/admin/page.tsx`
2. Find line 15: `const ADMIN_PASSWORD = 'soul2025';`
3. Change `'soul2025'` to your desired password
4. Save the file

**Note:** For production deployment, you should implement a proper backend authentication system with hashed passwords stored securely in a database.

## Features Protected

When logged in, you can:
- Edit all website content (hero, services, about, contact)
- View and manage customer bookings
- Change service prices and descriptions
- Update images and text
- Reset content to defaults

## Logout

Click the "Logout" button in the top-right of the admin panel to sign out.
