const nodemailer = require('nodemailer');

/**
 * Create reusable transporter based on environment config.
 * In development, uses Ethereal (fake SMTP) for testing.
 * In production, uses configured SMTP (Gmail, SendGrid, etc.)
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Fail fast instead of hanging for minutes when SMTP is blocked
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
};

/**
 * Send verification email to newly registered user.
 * Contains a link with the verification token.
 */
const sendVerificationEmail = async (email, fullName, verificationToken) => {
  const transporter = createTransporter();
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: `"Dayflow HRMS" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Verify Your Email - Dayflow HRMS',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2f5597; font-size: 28px; margin: 0;">Dayflow</h1>
          <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">Human Resource Management System</p>
        </div>
        
        <div style="background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 16px;">Welcome, ${fullName}!</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Thank you for registering with Dayflow. Please verify your email address to activate your account.
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verificationUrl}" 
               style="background: #2f5597; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
            If the button doesn't work, copy and paste this link into your browser:<br/>
            <a href="${verificationUrl}" style="color: #2f5597; word-break: break-all;">${verificationUrl}</a>
          </p>
          
          <p style="color: #9ca3af; font-size: 13px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
            This verification link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
        
        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 24px;">
          © ${new Date().getFullYear()} Dayflow HRMS. All rights reserved.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Verification email sent to ${email} (Message ID: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error(`❌ Email sending failed: ${error.message}`);
    // Don't throw - we don't want email failures to block registration
    return false;
  }
};

/**
 * Send an email through Brevo's HTTPS API (works on hosts that block SMTP ports,
 * e.g. Render's free plan). Needs BREVO_API_KEY and a sender verified in Brevo.
 */
const sendViaBrevo = async ({ to, subject, html, text }) => {
  const senderEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'Dayflow HRMS', email: senderEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Brevo API ${res.status}: ${body.slice(0, 300)}`);
  }
  return res.json();
};

/**
 * Send a 6-digit OTP to the user's email.
 * Uses Brevo's HTTP API when BREVO_API_KEY is set, otherwise SMTP (Nodemailer).
 * Returns true on success, false on failure (caller decides what to do).
 */
const sendOtpEmail = async (email, otp, expiryMinutes = 5) => {
  const useBrevo = !!process.env.BREVO_API_KEY;
  if (!useBrevo && (!process.env.EMAIL_USER || !process.env.EMAIL_PASS)) {
    console.warn('⚠️  No BREVO_API_KEY and no EMAIL_USER / EMAIL_PASS — cannot send OTP email.');
    return false;
  }

  const subject = `${otp} is your Dayflow verification code`;
  const text = `Your Dayflow verification code is ${otp}. It expires in ${expiryMinutes} minutes. If you didn't request this, ignore this email.`;
  const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 20px;">
        <h1 style="color: #2f5597; font-size: 24px; margin: 0 0 4px; text-align: center;">Dayflow</h1>
        <p style="color: #6b7280; font-size: 13px; margin: 0 0 24px; text-align: center;">Human Resource Management System</p>
        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 28px; text-align: center;">
          <p style="color: #4b5563; font-size: 15px; margin: 0 0 16px;">Your email verification code is</p>
          <p style="font-size: 34px; font-weight: 700; letter-spacing: 8px; color: #1f2937; margin: 0 0 16px; font-family: monospace;">${otp}</p>
          <p style="color: #9ca3af; font-size: 13px; margin: 0;">This code expires in ${expiryMinutes} minutes. Don't share it with anyone.</p>
        </div>
        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `;

  try {
    if (useBrevo) {
      const info = await sendViaBrevo({ to: email, subject, html, text });
      console.log(`📧 OTP email sent via Brevo to ${email} (Message ID: ${info.messageId})`);
    } else {
      const info = await createTransporter().sendMail({
        from: `"Dayflow HRMS" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: email,
        subject,
        text,
        html,
      });
      console.log(`📧 OTP email sent via SMTP to ${email} (Message ID: ${info.messageId})`);
    }
    return true;
  } catch (error) {
    console.error(`❌ OTP email failed (${useBrevo ? 'Brevo' : 'SMTP'}): ${error.message}`);
    return false;
  }
};

module.exports = { sendVerificationEmail, sendOtpEmail };
