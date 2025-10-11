export interface EmailConfig {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export class EmailService {
  constructor(private config?: { from: string; replyTo?: string }) {}

  async sendEmail(email: EmailConfig): Promise<{ success: boolean; error?: any }> {
    // TODO: Implement email sending using a service like Resend, SendGrid, etc.
    console.log('Email to send:', email);
    return { success: true };
  }

  async sendWelcomeEmail(to: string, userName: string): Promise<{ success: boolean; error?: any }> {
    const email: EmailConfig = {
      to,
      subject: 'Welcome to Driplo!',
      html: `
        <h1>Welcome to Driplo, ${userName}!</h1>
        <p>Thank you for joining our marketplace. We're excited to have you on board!</p>
        <p>You can now start buying and selling amazing fashion items.</p>
        <p>Best regards,<br/>The Driplo Team</p>
      `,
      ...this.config
    };

    return this.sendEmail(email);
  }

  async sendOrderConfirmation(to: string, orderDetails: any): Promise<{ success: boolean; error?: any }> {
    const email: EmailConfig = {
      to,
      subject: 'Order Confirmation - Driplo',
      html: `
        <h1>Order Confirmed!</h1>
        <p>Thank you for your purchase. Your order has been confirmed.</p>
        <!-- Add order details here -->
        <p>Best regards,<br/>The Driplo Team</p>
      `,
      ...this.config
    };

    return this.sendEmail(email);
  }

  async sendPaymentConfirmation(to: string, paymentDetails: any): Promise<{ success: boolean; error?: any }> {
    const email: EmailConfig = {
      to,
      subject: 'Payment Received - Driplo',
      html: `
        <h1>Payment Received!</h1>
        <p>We've received your payment successfully.</p>
        <!-- Add payment details here -->
        <p>Best regards,<br/>The Driplo Team</p>
      `,
      ...this.config
    };

    return this.sendEmail(email);
  }

  async sendShippingNotification(to: string, shippingDetails: any): Promise<{ success: boolean; error?: any }> {
    const email: EmailConfig = {
      to,
      subject: 'Your Order Has Shipped! - Driplo',
      html: `
        <h1>Your Order Has Shipped!</h1>
        <p>Great news! Your order has been shipped and is on its way to you.</p>
        <!-- Add shipping details here -->
        <p>Best regards,<br/>The Driplo Team</p>
      `,
      ...this.config
    };

    return this.sendEmail(email);
  }

  async sendPasswordReset(to: string, resetLink: string): Promise<{ success: boolean; error?: any }> {
    const email: EmailConfig = {
      to,
      subject: 'Reset Your Password - Driplo',
      html: `
        <h1>Reset Your Password</h1>
        <p>You requested to reset your password. Click the link below to reset it:</p>
        <p><a href="${resetLink}">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p>Best regards,<br/>The Driplo Team</p>
      `,
      ...this.config
    };

    return this.sendEmail(email);
  }
}