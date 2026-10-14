import nodemailer from 'nodemailer';

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  private static getTransporter() {
    if (!this.transporter) {
      const host = process.env.SMTP_HOST;
      const port = Number(process.env.SMTP_PORT) || 587;
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;

      if (host && user && pass) {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass }
        });
      }
    }
    return this.transporter;
  }

  public static async sendPasswordResetEmail(recipientEmail: string, resetCode: string, name: string): Promise<boolean> {
    const transporter = this.getTransporter();
    
    const subject = '🔐 EventBridge - Password Reset Code';
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #0f172a; max-width: 500px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="color: #2563eb; margin-top: 0;">EventBridge Password Reset</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>You recently requested to reset your password for your EventBridge account (<strong>${recipientEmail}</strong>).</p>
        <div style="background: #f1f5f9; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #2563eb;">${resetCode}</span>
        </div>
        <p style="font-size: 14px; color: #475569;">Enter this code on the password reset page to update your password.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8;">If you did not request a password reset, you can safely ignore this email.</p>
      </div>
    `;

    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || `"EventBridge System" <${process.env.SMTP_USER}>`,
          to: recipientEmail,
          subject,
          html: htmlBody
        });
        console.log(`✉️ Actual SMTP Email sent to ${recipientEmail}`);
        return true;
      } catch (err) {
        console.error('❌ Failed to send SMTP email:', err);
      }
    }

    console.log(`📧 [Simulated Email Dispatch] To: ${recipientEmail} | Code: ${resetCode}`);
    return false;
  }
}
