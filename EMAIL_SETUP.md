# Email Setup Guide

This application uses [Resend](https://resend.com) to send booking confirmation emails automatically.

## Setup Instructions

1. **Create a Resend Account**
   - Go to https://resend.com
   - Sign up for a free account
   - Free tier includes 3,000 emails/month

2. **Get Your API Key**
   - Navigate to https://resend.com/api-keys
   - Create a new API key
   - Copy the key (it starts with `re_`)

3. **Add API Key to Your Deployment**
   - Create a file named `.env.local` in the `soul-mobile-detailing` directory
   - Add this line: `RESEND_API_KEY=re_your_actual_api_key_here`
   - For Netlify deployment, add the environment variable in your Netlify dashboard:
     - Go to Site settings → Environment variables
     - Add: `RESEND_API_KEY` = `re_your_actual_api_key_here`

## How It Works

When a customer submits a booking:

1. **Customer receives** a confirmation email with:
   - Booking details (service, date, time, address)
   - What to expect next
   - Contact information

2. **Business receives** a notification email at `soulmobiledetailingllc@gmail.com` with:
   - Customer contact information
   - Service details
   - Action items to confirm the booking

## Testing

The emails will work automatically once the API key is configured. The system will:
- Send emails immediately when a booking is submitted
- Show success message to customer
- Handle errors gracefully if email service is unavailable
