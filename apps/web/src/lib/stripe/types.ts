export interface PaymentIntent {
	id: string;
	amount: number;
	currency: string;
	status: string;
	client_secret?: string;
}

export interface Product {
	id: string;
	title: string;
	description: string;
	price: number;
	currency: string;
	images: string[];
	seller_id: string;
}

export interface Order {
	id: string;
	product_id: string;
	buyer_id: string;
	seller_id: string;
	amount: number;
	status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
	payment_intent_id?: string;
	created_at: string;
	updated_at: string;
}