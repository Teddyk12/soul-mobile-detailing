import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend only if API key is available
const resendApiKey = process.env.RESEND_API_KEY || '';
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(req: NextRequest) {
  // Check if Resend is configured
  if (!resend || !resendApiKey) {
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
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset - Soul Mobile Detailing LLC</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">

          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0; border: 1px solid #334155; border-bottom: none;">
              <div style="font-size: 48px; margin-bottom: 10px;">🚗</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Soul Mobile Detailing</h1>
              <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 14px;">LLC</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="background-color: #1e293b; padding: 40px 30px; border: 1px solid #334155; border-top: none; border-bottom: none;">

              <!-- Greeting -->
              <p style="color: #f1f5f9; font-size: 18px; margin: 0 0 20px 0;">
                Hello <strong>${fullName || username}</strong>,
              </p>

              <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">
                We received a request to reset your admin account password. Use the secure code below to complete the reset:
              </p>

              <!-- Reset Code Box -->
              <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 0 0 30px 0; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);">
                <p style="color: #bfdbfe; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 10px 0;">Your Reset Code</p>
                <div style="color: #ffffff; font-size: 42px; font-weight: 800; letter-spacing: 12px; font-family: 'Courier New', monospace; margin: 0;">
                  ${resetCode}
                </div>
                <p style="color: #bfdbfe; font-size: 13px; margin: 15px 0 0 0;">
                  ⏱️ Expires in 15 minutes
                </p>
              </div>

              <!-- Steps -->
              <div style="background-color: #0f172a; border-radius: 10px; padding: 25px; margin: 0 0 30px 0; border: 1px solid #334155;">
                <h3 style="color: #3b82f6; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">
                  📋 How to Reset Your Password:
                </h3>
                <ol style="color: #cbd5e1; margin: 0; padding-left: 20px; font-size: 14px; line-height: 2;">
                  <li>Go to <a href="https://soulmobiledetailingllc.com/admin" style="color: #60a5fa; text-decoration: none;">soulmobiledetailingllc.com/admin</a></li>
                  <li>Click <strong style="color: #f1f5f9;">"Forgot Password?"</strong></li>
                  <li>Enter username: <strong style="color: #f1f5f9;">${username}</strong></li>
                  <li>Enter the 6-digit code above</li>
                  <li>Create your new password</li>
                </ol>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 0 0 30px 0;">
                <a href="https://soulmobiledetailingllc.com/admin" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);">
                  Go to Admin Login →
                </a>
              </div>

              <!-- Security Warning -->
              <div style="background-color: #422006; border-left: 4px solid #f59e0b; padding: 15px 20px; border-radius: 0 8px 8px 0; margin: 0;">
                <p style="color: #fcd34d; margin: 0; font-size: 14px; font-weight: 600;">
                  🔒 Security Notice
                </p>
                <p style="color: #fde68a; margin: 8px 0 0 0; font-size: 13px; line-height: 1.5;">
                  If you didn't request this password reset, please ignore this email. Your account remains secure. Never share this code with anyone.
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 30px; text-align: center; border-radius: 0 0 16px 16px; border: 1px solid #334155; border-top: none;">
              <p style="color: #64748b; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">
                Soul Mobile Detailing LLC
              </p>
              <p style="color: #475569; margin: 0 0 15px 0; font-size: 13px;">
                Professional Mobile Car Detailing Services
              </p>
              <div style="border-top: 1px solid #334155; padding-top: 20px; margin-top: 10px;">
                <p style="color: #475569; margin: 0; font-size: 12px;">
                  📧 soulmobiledetailingllc@gmail.com | 📞 425 574 6475
                </p>
                <p style="color: #334155; margin: 10px 0 0 0; font-size: 11px;">
                  This is an automated security email. Please do not reply.
                </p>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Try to send a simpler email if the full template doesn't work
    try {
      // First try with default sender (more reliable)
      const emailResponse = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: '🔐 Password Reset Code - Soul Mobile Detailing Admin',
        html: `<h1>Your password reset code: ${resetCode}</h1><p>Use this code to reset your password at soulmobiledetailingllc.com/admin</p>`,
      });

      if (emailResponse.data?.id) {
        return NextResponse.json({
          success: true,
          emailId: emailResponse.data.id
        });
      }

      throw new Error('Email sending failed');
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to send email. Please try the security question or contact support.',
        useSecurityQuestion: true
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send reset code email',
      useSecurityQuestion: true
    }, { status: 500 });
  }
}
