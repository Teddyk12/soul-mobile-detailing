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
    const { email, username, fullName, resetCode } = await req.json();

    if (!email || !resetCode) {
      return NextResponse.json({
        success: false,
        error: 'Email and reset code are required'
      }, { status: 400 });
    }

    const resetEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
    .code-box { background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); color: white; font-size: 36px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 25px; border-radius: 10px; margin: 25px 0; font-family: 'Courier New', monospace; }
    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; font-size: 14px; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #666; font-size: 14px; }
    .steps { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .steps ol { margin: 10px 0; padding-left: 20px; }
    .steps li { margin: 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset</h1>
      <p>Soul Mobile Detailing LLC</p>
    </div>
    <div class="content">
      <p>Hello ${fullName || username},</p>
      <p>A password reset has been requested for your admin account. Use the code below to reset your password:</p>

      <div class="code-box">${resetCode}</div>

      <div class="steps">
        <h3 style="margin-top: 0; color: #1e3a5f;">How to Reset Your Password:</h3>
        <ol>
          <li>Go to the admin login page</li>
          <li>Click <strong>"Forgot Password?"</strong></li>
          <li>Enter your username: <strong>${username}</strong></li>
          <li>Click <strong>"I Have a Reset Code"</strong></li>
          <li>Enter the 6-digit code above</li>
          <li>Create your new password</li>
        </ol>
      </div>

      <div class="warning">
        <strong>⚠️ Important:</strong> This code expires in <strong>15 minutes</strong>. If you didn't request this reset, please contact the business owner immediately.
      </div>

      <p>If you have any issues, please contact us at soulmobiledetailingllc@gmail.com</p>
    </div>
    <div class="footer">
      <p><strong>Soul Mobile Detailing LLC</strong></p>
      <p>This is an automated security email. Do not share this code with anyone.</p>
    </div>
  </div>
</body>
</html>
    `;

    // Send reset code email
    const emailResponse = await resend.emails.send({
      from: 'Soul Mobile Detailing LLC <security@updates.same-assets.com>',
      to: email,
      subject: 'Password Reset Code - Soul Mobile Detailing Admin',
      html: resetEmailHtml,
    });

    return NextResponse.json({
      success: true,
      emailId: emailResponse.data?.id
    });
  } catch (error) {
    console.error('Reset code email error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send reset code email'
    }, { status: 500 });
  }
}
