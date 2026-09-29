import nodemailer from 'nodemailer';
import { env } from '../config/env';

export class MailerService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: env.SMTP_HOST,
            port: env.SMTP_PORT,
            secure: env.SMTP_SECURE,
        });
    }

    public async sendOTPEmail(toEmail: string, otpCode: string): Promise<boolean> {
        try {
            await this.transporter.sendMail({
                from: env.EMAIL_FROM,
                to: toEmail,
                subject: `${otpCode} is your PadosiPro Verification Code`,
                text: `Your PadosiPro verification code is: ${otpCode}. It is valid for 10 minutes. Do not share this code with anyone.`,
                html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #0f172a; margin-bottom: 8px;">Verify Your PadosiPro Account</h2>
            <p style="color: #475569; font-size: 14px;">Use the following 6-digit verification code to complete your registration:</p>
            <div style="background-color: #f1f5f9; padding: 16px; border-radius: 6px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2563eb;">${otpCode}</span>
            </div>
            <p style="color: #64748b; font-size: 12px;">This code is valid for 10 minutes and can only be used once.</p>
          </div>
        `,
            });
            return true;
        } catch (error) {
            console.error('Failed to send OTP email via Mailpit:', error);
            return false;
        }
    }
}

export const mailerService = new MailerService();
