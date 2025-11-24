import nodemailer from "nodemailer";
import { log } from "./logger";

const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || "9c5e7a001@smtp-brevo.com",
    pass: process.env.SMTP_PASSWORD || "YKSNDCbx4sfW91pk",
  },
};

// Verify SMTP connection
const transporter = nodemailer.createTransport(SMTP_CONFIG);

// Test connection on startup
transporter.verify((error, success) => {
  if (error) {
    log(`SMTP connection error: ${error.message}`, "error");
    log(`SMTP config: host=${SMTP_CONFIG.host}, port=${SMTP_CONFIG.port}, user=${SMTP_CONFIG.auth.user}`, "error");
  } else {
    log(`SMTP server connected successfully`);
  }
});

export interface SendVerificationEmailParams {
  email: string;
  fullName: string;
  verificationToken: string;
}

export async function sendVerificationEmail({
  email,
  fullName,
  verificationToken,
}: SendVerificationEmailParams): Promise<void> {
  const verificationUrl = `${process.env.APP_URL || "http://localhost:5000"}/auth/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: `"inno-fair.uz" <${SMTP_CONFIG.auth.user}>`,
    to: email,
    subject: "Gmail manzilingizni tasdiqlang - inno-fair.uz",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>inno-fair.uz</h1>
              <p>Gmail manzilingizni tasdiqlang</p>
            </div>
            <div class="content">
              <p>Salom, <strong>${fullName}</strong>!</p>
              <p>inno-fair.uz platformasiga ro'yxatdan o'tganingiz uchun rahmat!</p>
              <p>Gmail manzilingizni tasdiqlash uchun quyidagi tugmani bosing:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Gmail manzilini tasdiqlash</a>
              </div>
              <p>Yoki quyidagi havolani brauzeringizga nusxalang:</p>
              <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
              <p><strong>Eslatma:</strong> Bu havola 24 soat davomida amal qiladi.</p>
              <p>Agar siz ro'yxatdan o'tmagan bo'lsangiz, bu xabarni e'tiborsiz qoldiring.</p>
            </div>
            <div class="footer">
              <p>inno-fair.uz - Innovatsion ishlanmalar portali</p>
              <p>Bu avtomatik xabar. Javob yozmang.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Salom, ${fullName}!
      
      inno-fair.uz platformasiga ro'yxatdan o'tganingiz uchun rahmat!
      
      Gmail manzilingizni tasdiqlash uchun quyidagi havolani oching:
      ${verificationUrl}
      
      Eslatma: Bu havola 24 soat davomida amal qiladi.
      
      Agar siz ro'yxatdan o'tmagan bo'lsangiz, bu xabarni e'tiborsiz qoldiring.
      
      inno-fair.uz - Innovatsion ishlanmalar portali
    `,
  };

  try {
    log(`Sending verification email to: ${email}`);
    log(`Verification URL: ${verificationUrl}`);
    const info = await transporter.sendMail(mailOptions);
    log(`Verification email sent successfully. Message ID: ${info.messageId}`);
  } catch (error: any) {
    log(`Email yuborishda xatolik: ${error?.message || "Unknown error"}`, "error");
    log(`Error code: ${error?.code || "N/A"}`, "error");
    log(`Error response: ${error?.response || "N/A"}`, "error");
    if (error?.stack) {
      log(`Error stack: ${error.stack.substring(0, 500)}`, "error");
    }
    throw new Error(`Email yuborib bo'lmadi: ${error?.message || "Unknown error"}`);
  }
}

