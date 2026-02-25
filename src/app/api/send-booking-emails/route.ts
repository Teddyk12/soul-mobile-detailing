import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend only if API key is available
const resendApiKey = process.env.RESEND_API_KEY || '';
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(req: NextRequest) {
  // Check if Resend is configured
  if (!resend || !resendApiKey) {
    console.error('Resend API key not configured');
    return NextResponse.json({
      success: false,
      error: 'Email service not configured. Please add RESEND_API_KEY to environment variables.'
    }, { status: 503 });
  }

  try {
    const booking = await req.json();

    const businessEmail = 'soulmobiledetailingllc@gmail.com';

    // Customer confirmation email
    const customerEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #ffffff; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
    .details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .detail-row { margin: 10px 0; }
    .label { font-weight: bold; color: #667eea; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Booking Confirmation</h1>
      <p>Soul Mobile Detailing LLC</p>
    </div>
    <div class="content">
      <p>Dear ${booking.name},</p>
      <p>Thank you for booking with Soul Mobile Detailing LLC! We have received your booking request and will contact you shortly to confirm your appointment.</p>

      <div class="details">
        <h3 style="margin-top: 0; color: #667eea;">Booking Details</h3>
        <div class="detail-row"><span class="label">Service:</span> ${booking.service}</div>
        <div class="detail-row"><span class="label">Date:</span> ${booking.date}</div>
        <div class="detail-row"><span class="label">Time:</span> ${booking.time}</div>
        <div class="detail-row"><span class="label">Address:</span> ${booking.address}</div>
        <div class="detail-row"><span class="label">Vehicle Type:</span> ${booking.vehicleType}</div>
        ${booking.notes ? `<div class="detail-row"><span class="label">Notes:</span> ${booking.notes}</div>` : ''}
      </div>

      <p><strong>What's Next?</strong></p>
      <p>Our team will reach out to you at ${booking.phone} or ${booking.email} within 24 hours to confirm your appointment details.</p>

      <p>If you have any questions in the meantime, feel free to contact us at ${businessEmail}.</p>

      <p>We look forward to making your vehicle shine!</p>
    </div>
    <div class="footer">
      <p><strong>Soul Mobile Detailing LLC</strong></p>
      <p>Email: ${businessEmail}</p>
      <p>This is an automated confirmation email.</p>
    </div>
  </div>
</body>
</html>
    `;

    // Business notification email
    const businessEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #ffffff; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
    .details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .detail-row { margin: 10px 0; }
    .label { font-weight: bold; color: #667eea; }
    .urgent { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚗 New Booking Request</h1>
      <p>Soul Mobile Detailing LLC</p>
    </div>
    <div class="content">
      <div class="urgent">
        <strong>Action Required:</strong> A new customer has requested a detailing service. Please contact them to confirm.
      </div>

      <div class="details">
        <h3 style="margin-top: 0; color: #667eea;">Customer Information</h3>
        <div class="detail-row"><span class="label">Name:</span> ${booking.name}</div>
        <div class="detail-row"><span class="label">Phone:</span> ${booking.phone}</div>
        <div class="detail-row"><span class="label">Email:</span> ${booking.email}</div>
        <div class="detail-row"><span class="label">Address:</span> ${booking.address}</div>
      </div>

      <div class="details">
        <h3 style="margin-top: 0; color: #667eea;">Service Details</h3>
        <div class="detail-row"><span class="label">Service Requested:</span> ${booking.service}</div>
        <div class="detail-row"><span class="label">Vehicle Type:</span> ${booking.vehicleType}</div>
        <div class="detail-row"><span class="label">Preferred Date:</span> ${booking.date}</div>
        <div class="detail-row"><span class="label">Preferred Time:</span> ${booking.time}</div>
        ${booking.notes ? `<div class="detail-row"><span class="label">Additional Notes:</span> ${booking.notes}</div>` : ''}
      </div>

      <p><strong>Next Steps:</strong></p>
      <ol>
        <li>Contact the customer at ${booking.phone} to confirm the appointment</li>
        <li>Verify the service address and any specific requirements</li>
        <li>Update the booking status in the admin panel</li>
      </ol>
    </div>
  </div>
</body>
</html>
    `;

    // Send customer confirmation email
    const customerEmail = await resend.emails.send({
      from: 'Soul Mobile Detailing LLC <bookings@updates.same-assets.com>',
      to: booking.email,
      subject: 'Booking Confirmation - Soul Mobile Detailing LLC',
      html: customerEmailHtml,
    });

    // Send business notification email
    const businessEmailResponse = await resend.emails.send({
      from: 'Soul Mobile Detailing Bookings <bookings@updates.same-assets.com>',
      to: businessEmail,
      replyTo: booking.email,
      subject: `🚗 New Booking: ${booking.service} - ${booking.date} at ${booking.time}`,
      html: businessEmailHtml,
    });

    return NextResponse.json({
      success: true,
      customerEmailId: customerEmail.data?.id,
      businessEmailId: businessEmailResponse.data?.id
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send emails'
    }, { status: 500 });
  }
}
