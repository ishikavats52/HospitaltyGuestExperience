import nodemailer from 'nodemailer';
import { ENV } from '../config/env.js';

/**
 * Aura Hospitality Automated Email Dispatch Service
 * Sends welcome credentials and system alerts to Hotel Admins and Staff.
 * Works immediately in simulated logging mode, and switches to live SMTP automatically
 * whenever SMTP_HOST, SMTP_USER, and SMTP_PASS are set in .env.
 */

let transporter = null;

const getTransporter = () => {
  const host = process.env.SMTP_HOST || ENV.SMTP_HOST;
  const user = process.env.SMTP_USER || ENV.SMTP_USER;
  const pass = process.env.SMTP_PASS || ENV.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT || ENV.SMTP_PORT || 587);
  const secure = port === 465;

  if (host && user && pass) {
    if (!transporter) {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
      });
      console.log(`[EMAIL SERVICE] Live SMTP Transporter initialized (${host}:${port})`);
    }
    return transporter;
  }
  return null;
};

export class EmailService {
  /**
   * Generic send email method
   */
  static async sendMail({ to, subject, html, text }) {
    const fromAddress =
      process.env.SMTP_FROM ||
      ENV.SMTP_FROM ||
      process.env.SMTP_USER ||
      '"AURA Hospitality Cloud" <no-reply@aura-hospitality.com>';

    const liveTransporter = getTransporter();

    if (liveTransporter) {
      try {
        const info = await liveTransporter.sendMail({
          from: fromAddress,
          to,
          subject,
          text,
          html,
        });
        console.log(`[EMAIL SERVICE] Live email delivered to ${to} (MessageId: ${info.messageId})`);
        return { success: true, live: true, messageId: info.messageId };
      } catch (err) {
        console.error(`[EMAIL SERVICE ERROR] Live dispatch failed to ${to}:`, err.message);
        // Fall back to simulation log without crashing the API
      }
    }

    // Simulated Dispatch Log (When SMTP credentials are not yet entered in .env)
    console.log('\n======================================================================');
    console.log('📧 [AURA EMAIL DISPATCHER — SIMULATED MODE]');
    console.log(`To        : ${to}`);
    console.log(`From      : ${fromAddress}`);
    console.log(`Subject   : ${subject}`);
    console.log('----------------------------------------------------------------------');
    console.log(text || 'HTML Email Body Delivered (See web portal for credentials)');
    console.log('----------------------------------------------------------------------');
    console.log('💡 Note: Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env to deliver live emails.');
    console.log('======================================================================\n');

    return { success: true, simulated: true, to, subject };
  }

  /**
   * 1. Send Welcome Credentials Email to newly provisioned Hotel Admin
   */
  static async sendAdminWelcomeEmail({ email, name, password, hotelName, propertiesCount = 1, loginUrl }) {
    const portalUrl = loginUrl || 'https://hospitalty-guest-experience-fronten.vercel.app/staff/login';
    const subject = `Welcome to AURA Hospitality — Credentials for ${hotelName || 'Your Hotel'}`;

    const text = `
Hello ${name},

Welcome to AURA Hospitality Management Platform!
Your Hotel Administrator account has been provisioned for "${hotelName}".

Here are your administrator access credentials:
--------------------------------------------------
Hotel Name     : ${hotelName}
Administrator  : ${name}
Work Email     : ${email}
Password       : ${password}
Managed Units  : ${propertiesCount} Property(ies)
Portal Sign-In : ${portalUrl}
--------------------------------------------------

Please sign in and change your password if required.
Thank you,
The AURA Hospitality Team
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #fdfaf7; margin: 0; padding: 24px; color: #1e1e1e; }
    .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #ede8e3; box-shadow: 0 4px 20px rgba(0,0,0,0.06); overflow: hidden; }
    .header { background: #8C1D40; color: #ffffff; padding: 28px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em; }
    .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
    .content { padding: 28px; }
    .creds-box { background: #FAF7F2; border: 1px solid #D4AF37; border-radius: 8px; padding: 18px; margin: 20px 0; }
    .cred-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
    .cred-label { color: #6b7280; font-weight: 500; }
    .cred-value { font-weight: 700; color: #111827; }
    .password-badge { background: #8C1D40; color: #ffffff; padding: 3px 10px; border-radius: 4px; font-family: monospace; font-size: 15px; letter-spacing: 0.05em; }
    .btn { display: block; text-align: center; background: #8C1D40; color: #ffffff !important; text-decoration: none; padding: 13px 24px; border-radius: 6px; font-weight: 700; font-size: 14px; margin-top: 24px; }
    .footer { font-size: 12px; color: #9ca3af; text-align: center; padding: 20px; border-top: 1px solid #f3f4f6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>AURA HOSPITALITY</h1>
      <p>Executive Hotel Administration Access</p>
    </div>
    <div class="content">
      <h2 style="font-size: 18px; margin-top: 0;">Welcome, ${name}</h2>
      <p style="font-size: 14px; line-height: 1.5; color: #4b5563;">
        Your hotel administrator profile has been configured on the AURA platform for <strong>${hotelName}</strong>. You have full executive privileges to manage properties, rooms, staff members, culinary dining, and guest services.
      </p>

      <div class="creds-box">
        <div style="font-size: 12px; font-weight: 700; color: #8C1D40; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.06em;">
          Your Secure Sign-In Credentials
        </div>
        <div class="cred-row">
          <span class="cred-label">Hotel Group:</span>
          <span class="cred-value">${hotelName}</span>
        </div>
        <div class="cred-row">
          <span class="cred-label">Login Email:</span>
          <span class="cred-value">${email}</span>
        </div>
        <div class="cred-row">
          <span class="cred-label">Password:</span>
          <span class="password-badge">${password}</span>
        </div>
        <div class="cred-row" style="margin-bottom: 0;">
          <span class="cred-label">Properties:</span>
          <span class="cred-value">${propertiesCount} Wing(s)</span>
        </div>
      </div>

      <a href="${portalUrl}" class="btn">Sign In to Hotel Admin Portal →</a>
    </div>
    <div class="footer">
      🔒 Secure • Multi-Tenant • Enterprise Hospitality Solution<br/>
      If you did not expect this invitation, please contact your platform administrator.
    </div>
  </div>
</body>
</html>
    `.trim();

    return this.sendMail({ to: email, subject, html, text });
  }

  /**
   * 2. Send Welcome Credentials Email to newly provisioned Hotel Employee
   */
  static async sendEmployeeWelcomeEmail({
    email,
    name,
    password,
    hotelName = 'Hotel Partner',
    department = 'Staff Operations',
    subDepartment = '',
    propertyName = 'Main Property',
    loginUrl,
  }) {
    const portalUrl = loginUrl || 'https://hospitalty-guest-experience-fronten.vercel.app/staff/login';
    const subject = `Your Staff Account at ${hotelName} — AURA Hospitality`;

    const text = `
Hello ${name},

You have been onboarded as a staff member at "${hotelName}".

Your Staff Sign-In Details:
--------------------------------------------------
Hotel Name     : ${hotelName}
Staff Name     : ${name}
Department     : ${department}${subDepartment ? ` (${subDepartment})` : ''}
Branch Property: ${propertyName}
Work Email     : ${email}
Password       : ${password}
Portal Sign-In : ${portalUrl}
--------------------------------------------------

Please sign in to your departmental workspace to view daily operations and guest requests.
Thank you,
${hotelName} Operations Desk
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #fdfaf7; margin: 0; padding: 24px; color: #1e1e1e; }
    .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #ede8e3; box-shadow: 0 4px 20px rgba(0,0,0,0.06); overflow: hidden; }
    .header { background: #8C1D40; color: #ffffff; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 800; }
    .header p { margin: 4px 0 0; font-size: 13px; opacity: 0.9; }
    .content { padding: 28px; }
    .creds-box { background: #FAF7F2; border: 1px solid #D4AF37; border-radius: 8px; padding: 18px; margin: 20px 0; }
    .cred-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
    .cred-label { color: #6b7280; font-weight: 500; }
    .cred-value { font-weight: 700; color: #111827; }
    .password-badge { background: #8C1D40; color: #ffffff; padding: 3px 10px; border-radius: 4px; font-family: monospace; font-size: 15px; }
    .btn { display: block; text-align: center; background: #8C1D40; color: #ffffff !important; text-decoration: none; padding: 13px 24px; border-radius: 6px; font-weight: 700; font-size: 14px; margin-top: 24px; }
    .footer { font-size: 12px; color: #9ca3af; text-align: center; padding: 18px; border-top: 1px solid #f3f4f6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>${hotelName.toUpperCase()}</h1>
      <p>Staff Operations Workspace Portal</p>
    </div>
    <div class="content">
      <h2 style="font-size: 18px; margin-top: 0;">Welcome to the Team, ${name}!</h2>
      <p style="font-size: 14px; line-height: 1.5; color: #4b5563;">
        Your staff profile has been created for <strong>${hotelName}</strong>. You have been assigned to the <strong>${department}</strong> team.
      </p>

      <div class="creds-box">
        <div style="font-size: 12px; font-weight: 700; color: #8C1D40; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.06em;">
          Your Staff Login Information
        </div>
        <div class="cred-row">
          <span class="cred-label">Department:</span>
          <span class="cred-value">${department}${subDepartment ? ` (${subDepartment})` : ''}</span>
        </div>
        <div class="cred-row">
          <span class="cred-label">Property:</span>
          <span class="cred-value">${propertyName}</span>
        </div>
        <div class="cred-row">
          <span class="cred-label">Login Email:</span>
          <span class="cred-value">${email}</span>
        </div>
        <div class="cred-row" style="margin-bottom: 0;">
          <span class="cred-label">Password:</span>
          <span class="password-badge">${password}</span>
        </div>
      </div>

      <a href="${portalUrl}" class="btn">Access Staff Operations Portal →</a>
    </div>
    <div class="footer">
      🔒 Secure • Strategic • Live Staff Dispatch
    </div>
  </div>
</body>
</html>
    `.trim();

    return this.sendMail({ to: email, subject, html, text });
  }
}
