// import type nodemailer from 'nodemailer'; // TODO: Install nodemailer if SMTP email is needed
import { welcomeEmailTemplate } from './templates/welcome';
import { baseEmailTemplate } from './templates/base-template';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  locale?: string;
  trackingId?: string;
}

class EmailService {
  private transporter: any | null = null;
  private config: EmailConfig;
  
  constructor() {
    this.config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      },
      from: process.env.SMTP_FROM || 'Driplo <noreply@driplo.com>'
    };
    
    this.initializeTransporter();
  }
  
  private initializeTransporter() {
    try {
      // TODO: Uncomment when nodemailer is installed
      // this.transporter = nodemailer.createTransporter({
      //   host: this.config.host,
      //   port: this.config.port,
      //   secure: this.config.secure,
      //   auth: this.config.auth,
      //   pool: true,
      //   maxConnections: 5,
      //   maxMessages: 100,
      //   rateLimit: 10,
      //   tls: {
      //     rejectUnauthorized: false
      //   }
      // });
      
      // Verify connection
      this.transporter.verify((error: any, success: any) => {
        if (error) {
          console.error('SMTP connection error:', error);
        } else {
          // SMTP server ready
        }
      });
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
    }
  }
  
  private async getUserLocale(email: string): Promise<string> {
    // Try to get locale from user's saved preferences
    // This would query your database
    // For now, we'll detect from email domain
    const domain = email.split('@')[1];
    const localeMap: Record<string, string> = {
      'bg': 'bg',
      'es': 'es',
      'fr': 'fr',
      'de': 'de',
      'it': 'it',
    };
    
    // Check if domain has country code
    const tld = domain?.split('.').pop();
    return localeMap[tld || ''] || 'en';
  }
  
  private generateTrackingPixel(trackingId: string): string {
    const baseUrl = process.env.PUBLIC_APP_URL || 'https://driplo.com';
    return `${baseUrl}/api/email/track/${trackingId}`;
  }
  
  private generateUnsubscribeUrl(email: string, trackingId: string): string {
    const baseUrl = process.env.PUBLIC_APP_URL || 'https://driplo.com';
    const token = Buffer.from(`${email}:${trackingId}`).toString('base64');
    return `${baseUrl}/unsubscribe?token=${token}`;
  }
  
  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.error('Email transporter not initialized');
      return false;
    }
    
    try {
      const trackingId = options.trackingId || crypto.randomUUID();
      const locale = options.locale || await this.getUserLocale(options.to);
      
      // Process HTML to add tracking and unsubscribe links
      let processedHtml = options.html;
      processedHtml = processedHtml.replace('{{tracking_pixel}}', this.generateTrackingPixel(trackingId));
      processedHtml = processedHtml.replace('{{unsubscribe_url}}', this.generateUnsubscribeUrl(options.to, trackingId));
      
      const mailOptions = {
        from: this.config.from,
        to: options.to,
        subject: options.subject,
        html: processedHtml,
        text: options.text || this.htmlToText(processedHtml),
        headers: {
          'X-Tracking-ID': trackingId,
          'X-Locale': locale,
          'List-Unsubscribe': `<${this.generateUnsubscribeUrl(options.to, trackingId)}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
        }
      };
      
      const info = await this.transporter.sendMail(mailOptions);
      // Email sent successfully
      
      // Log email send for analytics
      await this.logEmailSent({
        to: options.to,
        subject: options.subject,
        trackingId,
        messageId: info.messageId,
        locale
      });
      
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }
  
  async sendWelcomeEmail(to: string, userName: string, verificationUrl?: string): Promise<boolean> {
    const locale = await this.getUserLocale(to);
    const { subject, html } = welcomeEmailTemplate({ userName, locale, verificationUrl: verificationUrl || '' });
    
    return this.sendEmail({
      to,
      subject,
      html,
      locale
    });
  }
  
  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<boolean> {
    const locale = await this.getUserLocale(to);
    
    const translations = {
      en: {
        subject: 'Reset Your Password - Driplo',
        heading: 'Password Reset Request',
        text: 'You requested to reset your password. Click the button below to create a new password:',
        button: 'Reset Password',
        expires: 'This link expires in 1 hour.',
        ignore: "If you didn't request this, you can safely ignore this email."
      },
      bg: {
        subject: 'Възстановяване на парола - Driplo',
        heading: 'Заявка за възстановяване на парола',
        text: 'Поискахте да възстановите паролата си. Кликнете бутона по-долу, за да създадете нова парола:',
        button: 'Възстанови парола',
        expires: 'Тази връзка изтича след 1 час.',
        ignore: 'Ако не сте поискали това, можете спокойно да игнорирате този имейл.'
      }
    };
    
    const t = translations[locale as keyof typeof translations] || translations.en;
    
    const content = `
      <h2 style="margin: 0 0 16px 0; color: #212529; font-size: 24px; font-weight: 700;">
        ${t.heading}
      </h2>
      <p style="margin: 0 0 24px 0; color: #495057; font-size: 16px; line-height: 1.6;">
        ${t.text}
      </p>
      <table border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="background-color: #dc3545; border-radius: 8px;">
            <a href="${resetUrl}" style="display: inline-block; padding: 14px 40px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none;">
              ${t.button}
            </a>
          </td>
        </tr>
      </table>
      <p style="margin: 24px 0 0 0; color: #6c757d; font-size: 14px;">
        ${t.expires}
      </p>
      <p style="margin: 8px 0 0 0; color: #6c757d; font-size: 14px;">
        ${t.ignore}
      </p>
    `;
    
    return this.sendEmail({
      to,
      subject: t.subject,
      html: baseEmailTemplate(content, locale),
      locale
    });
  }
  
  async sendOrderConfirmationEmail(to: string, orderDetails: any): Promise<boolean> {
    const locale = await this.getUserLocale(to);
    
    // Order confirmation template would go here
    const content = `
      <h2>Order Confirmed!</h2>
      <p>Your order #${orderDetails.orderId} has been confirmed.</p>
      <!-- More order details -->
    `;
    
    return this.sendEmail({
      to,
      subject: `Order #${orderDetails.orderId} Confirmed - Driplo`,
      html: baseEmailTemplate(content, locale),
      locale
    });
  }
  
  private htmlToText(html: string): string {
    // Simple HTML to text conversion
    return html
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  private async logEmailSent(data: any): Promise<void> {
    // Log to database or analytics service
    // Email sent (fallback mode)
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Export types
export type { SendEmailOptions, EmailConfig };