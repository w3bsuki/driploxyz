import { Resend } from 'resend';
// Framework-agnostic environment access

// TODO: Initialize Resend with proper API key from environment
// const resend = new Resend(process.env.RESEND_API_KEY);

let resend: Resend | null = null;

export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}) {
  try {
    if (!resend) {
      console.warn('Resend not configured, skipping email send');
      return { success: true, id: 'mock-id' };
    }

    const { data, error } = await resend.emails.send({
      from: options.from || 'noreply@driplo.com',
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(to: string, userName: string) {
  return sendEmail({
    to,
    subject: 'Welcome to Driplo!',
    html: `
      <h1>Welcome to Driplo, ${userName}!</h1>
      <p>Thank you for joining our marketplace. We're excited to have you on board!</p>
      <p>You can now start buying and selling amazing fashion items.</p>
      <p>Best regards,<br/>The Driplo Team</p>
    `
  });
}

export async function sendOrderConfirmation(to: string, orderDetails: any) {
  return sendEmail({
    to,
    subject: 'Order Confirmation - Driplo',
    html: `
      <h1>Order Confirmed!</h1>
      <p>Thank you for your purchase. Your order has been confirmed.</p>
      <p>Order ID: ${orderDetails.id}</p>
      <p>Total: ${orderDetails.total} ${orderDetails.currency}</p>
      <p>Best regards,<br/>The Driplo Team</p>
    `
  });
}

export async function sendPaymentConfirmation(to: string, paymentDetails: any) {
  return sendEmail({
    to,
    subject: 'Payment Received - Driplo',
    html: `
      <h1>Payment Received!</h1>
      <p>We've received your payment successfully.</p>
      <p>Payment ID: ${paymentDetails.id}</p>
      <p>Amount: ${paymentDetails.amount} ${paymentDetails.currency}</p>
      <p>Best regards,<br/>The Driplo Team</p>
    `
  });
}

export async function sendShippingNotification(to: string, shippingDetails: any) {
  return sendEmail({
    to,
    subject: 'Your Order Has Shipped! - Driplo',
    html: `
      <h1>Your Order Has Shipped!</h1>
      <p>Great news! Your order has been shipped and is on its way to you.</p>
      <p>Tracking Number: ${shippingDetails.trackingNumber}</p>
      <p>Carrier: ${shippingDetails.carrier}</p>
      <p>Best regards,<br/>The Driplo Team</p>
    `
  });
}

export async function sendPasswordReset(to: string, resetLink: string) {
  return sendEmail({
    to,
    subject: 'Reset Your Password - Driplo',
    html: `
      <h1>Reset Your Password</h1>
      <p>You requested to reset your password. Click the link below to reset it:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this password reset, please ignore this email.</p>
      <p>Best regards,<br/>The Driplo Team</p>
    `
  });
}

export const emailTemplates = {
  welcome: (userName: string) => `
    <h1>Welcome to Driplo, ${userName}!</h1>
    <p>Thank you for joining our marketplace. We're excited to have you on board!</p>
    <p>You can now start buying and selling amazing fashion items.</p>
    <p>Best regards,<br/>The Driplo Team</p>
  `,
  orderConfirmation: (orderDetails: any) => `
    <h1>Order Confirmed!</h1>
    <p>Thank you for your purchase. Your order has been confirmed.</p>
    <p>Order ID: ${orderDetails.id}</p>
    <p>Total: ${orderDetails.total} ${orderDetails.currency}</p>
    <p>Best regards,<br/>The Driplo Team</p>
  `,
  paymentConfirmation: (paymentDetails: any) => `
    <h1>Payment Received!</h1>
    <p>We've received your payment successfully.</p>
    <p>Payment ID: ${paymentDetails.id}</p>
    <p>Amount: ${paymentDetails.amount} ${paymentDetails.currency}</p>
    <p>Best regards,<br/>The Driplo Team</p>
  `,
  shippingNotification: (shippingDetails: any) => `
    <h1>Your Order Has Shipped!</h1>
    <p>Great news! Your order has been shipped and is on its way to you.</p>
    <p>Tracking Number: ${shippingDetails.trackingNumber}</p>
    <p>Carrier: ${shippingDetails.carrier}</p>
    <p>Best regards,<br/>The Driplo Team</p>
  `,
  passwordReset: (resetLink: string) => `
    <h1>Reset Your Password</h1>
    <p>You requested to reset your password. Click the link below to reset it:</p>
    <p><a href="${resetLink}">Reset Password</a></p>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this password reset, please ignore this email.</p>
    <p>Best regards,<br/>The Driplo Team</p>
  `
};