import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend: Resend;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      throw new Error('RESEND_API_KEY is missing from environment variables');
    }
    this.resend = new Resend(apiKey);
  }

  async sendVerificationEmail(
    email: string,
    name: string,
    verificationToken: string,
  ): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl) {
      throw new Error('FRONTEND_URL is missing from environment variables');
    }

    const verificationUrl = `${frontendUrl}/verify-email?token=${encodeURIComponent(verificationToken)}`;

    const { error } = await this.resend.emails.send({
      from: process.env.EMAIL_FROM || 'Projectly <onboarding@resend.dev>',
      to: email,
      subject: 'Verify your Projectly email address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto">
          <h2>Welcome to Projectly, ${this.escapeHtml(name)}!</h2>
          <p>Please verify your email address to activate your account.</p>
          <p>
            <a href="${verificationUrl}" style="display: inline-block; padding: 12px 20px; background: #16a34a; color: white; text-decoration: none; border-radius: 6px">Verify my email</a>
          </p>
          <p>This link is temporary and can only be used for a limited time.</p>
          <p>If you didn't create a Projectly account, you can ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend email error:', error.message);
      throw new InternalServerErrorException(
        'Unable to send verification email. Please try again later.',
      );
    }
  }

  private escapeHtml(value: string): string {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return value.replace(/[&<>"']/g, (character) => entities[character]);
  }

  async sendEmailChangeVerification(email: string, name: string, verificationToken: string,): Promise<void>{
    const frontendUrl = process.env.FRONTEND_URL;
     if (!frontendUrl) {
      throw new Error('FRONTEND_URL is missing from environment variables');
    }
    const verificationUrl = `${frontendUrl}/verify-email-change?token=${encodeURIComponent(verificationToken)}`;

    const {error} = await this.resend.emails.send({
      from: process.env.EMAIL_FROM || 'Projectly <onboarding@resend.dev>',
      to: email,
      subject:'verify your new email address',
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2>Hello ${this.escapeHtml(name)}, </h2>
      <p>you requested to change the email address asssociated with your Projectly account.</p>
      <p>Click the button below to verify your new email address:</p>
      <p> <a href="${verificationUrl}" style="display: inline-block; padding: 12px 28px; background: #16a34a; color:white; text-decoration: none; border-radius: 6px;">
      Verify new email</a></p>
      <p>This link expires after 15 minutes and can only be used once.</p>
      <p>If you didn't request this change, you can ignore this email.</p>
      </div>`,
    });
    if(error){
      console.error('Resend email-change error:', error.message);
      throw new InternalServerErrorException('Unable to send email-change verification. Please try again later');
    }
  }

  
}