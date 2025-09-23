import { Resend } from 'resend';
import { env } from '$env/dynamic/private';

// Type definitions for email templates
interface OrderEmailData {
  product: {
    title: string;
    price: number;
  };
  buyer: {
    username: string;
  };
  amount: number;
}

interface SaleEmailData {
  product: {
    title: string;
  };
  amount: number;
  commission: number;
  net_amount: number;
}

interface UserEmailData {
  username: string;
}

// Initialize Resend with your API key (lazy initialization to avoid build errors)
let resendInstance: Resend | null = null;

function getResendInstance(): Resend | null {
	if (!env.RESEND_API_KEY) {
		
		return null;
	}
	
	if (!resendInstance) {
		resendInstance = new Resend(env.RESEND_API_KEY);
	}
	
	return resendInstance;
}

// Email templates
export const emailTemplates = {
	orderConfirmation: (order: OrderEmailData) => ({
		subject: `Order Confirmed - ${order.product.title}`,
		html: `
			<div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
				<div style="border: 1px solid #000; border-radius: 8px;">
					<div style="background: #000; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
						<h1 style="color: #fff; margin: 0; font-size: 24px; font-weight: 600;">DRIPLO</h1>
					</div>
					<div style="padding: 40px 30px;">
						<h2 style="color: #000; margin: 0 0 20px 0;">Order Confirmed! 🎉</h2>
						<p style="color: #666; line-height: 1.6;">
							Your order for <strong>${order.product.title}</strong> has been confirmed.
						</p>
						<div style="background: #f5f5f5; padding: 20px; border-radius: 4px; margin: 20px 0;">
							<p style="margin: 0 0 10px 0;"><strong>Order ID:</strong> ${order.id}</p>
							<p style="margin: 0 0 10px 0;"><strong>Amount:</strong> €${(order.total_amount / 100).toFixed(2)}</p>
							<p style="margin: 0;"><strong>Seller:</strong> ${order.seller.username}</p>
						</div>
						<p style="color: #666; font-size: 14px;">
							The seller will ship your item within 2-3 business days. You'll receive a tracking number once shipped.
						</p>
					</div>
					<div style="border-top: 1px solid #e5e5e5; padding: 20px 30px; background: #fafafa;">
						<p style="color: #999; font-size: 11px; margin: 0; text-align: center;">
							© 2024 Driplo · hi@driplo.xyz
						</p>
					</div>
				</div>
			</div>
		`
	}),

	productSold: (sale: SaleEmailData) => ({
		subject: `Your item sold! - ${sale.product.title}`,
		html: `
			<div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
				<div style="border: 1px solid #000; border-radius: 8px;">
					<div style="background: #000; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
						<h1 style="color: #fff; margin: 0; font-size: 24px; font-weight: 600;">DRIPLO</h1>
					</div>
					<div style="padding: 40px 30px;">
						<h2 style="color: #000; margin: 0 0 20px 0;">Congratulations! You made a sale 💰</h2>
						<p style="color: #666; line-height: 1.6;">
							Your item <strong>${sale.product.title}</strong> has been sold!
						</p>
						<div style="background: #f5f5f5; padding: 20px; border-radius: 4px; margin: 20px 0;">
							<p style="margin: 0 0 10px 0;"><strong>Sale Amount:</strong> €${(sale.amount / 100).toFixed(2)}</p>
							<p style="margin: 0 0 10px 0;"><strong>Commission (3%):</strong> -€${(sale.commission / 100).toFixed(2)}</p>
							<p style="margin: 0;"><strong>Your Earnings:</strong> €${(sale.net_amount / 100).toFixed(2)}</p>
						</div>
						<div style="text-align: center; margin: 30px 0;">
							<a href="https://driplo.xyz/dashboard" style="background: #000; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 4px; display: inline-block;">
								VIEW DASHBOARD
							</a>
						</div>
						<p style="color: #666; font-size: 14px;">
							Please ship the item within 2-3 business days. Don't forget to add tracking!
						</p>
					</div>
					<div style="border-top: 1px solid #e5e5e5; padding: 20px 30px; background: #fafafa;">
						<p style="color: #999; font-size: 11px; margin: 0; text-align: center;">
							© 2024 Driplo · hi@driplo.xyz
						</p>
					</div>
				</div>
			</div>
		`
	}),

	welcomeOnboarding: (user: UserEmailData) => ({
		subject: 'Welcome to Driplo! 🎉',
		html: `
			<div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
				<div style="border: 1px solid #000; border-radius: 8px;">
					<div style="background: #000; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
						<h1 style="color: #fff; margin: 0; font-size: 24px; font-weight: 600;">DRIPLO</h1>
					</div>
					<div style="padding: 40px 30px;">
						<h2 style="color: #000; margin: 0 0 20px 0;">Welcome ${user.username}! 🎊</h2>
						<p style="color: #666; line-height: 1.6;">
							Your account is all set up and ready to go. Here's how to get started:
						</p>
						<ul style="color: #666; line-height: 2;">
							<li>List your first item and get a new seller badge</li>
							<li>Browse trending fashion items</li>
							<li>Follow your favorite sellers</li>
							<li>Join our community of fashion lovers</li>
						</ul>
						<div style="text-align: center; margin: 30px 0;">
							<a href="https://driplo.xyz/sell" style="background: #000; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 4px; display: inline-block;">
								START SELLING
							</a>
						</div>
					</div>
					<div style="border-top: 1px solid #e5e5e5; padding: 20px 30px; background: #fafafa;">
						<p style="color: #999; font-size: 11px; margin: 0; text-align: center;">
							© 2024 Driplo · hi@driplo.xyz
						</p>
					</div>
				</div>
			</div>
		`
	})
};

// Helper function to send email
export async function sendEmail(to: string, template: { subject: string; html: string }) {
	try {
		const resend = getResendInstance();
		if (!resend) {
			
			return { success: false, error: 'Email service not configured' };
		}
		
		const data = await resend.emails.send({
			from: 'Driplo <hi@driplo.xyz>',
			to: [to],
			subject: template.subject,
			html: template.html
		});
		
		return { success: true, data };
	} catch (error) {
		
		return { success: false, error };
	}
}