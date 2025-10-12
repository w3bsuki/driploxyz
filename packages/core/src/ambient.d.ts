declare module 'resend' {
	export interface SendEmailInput {
		from: string;
		to: string | string[];
		subject: string;
		html: string;
		replyTo?: string;
	}

	export interface SendEmailResult {
		data?: {
			id?: string;
		} | null;
		error?: unknown;
	}

	export class Resend {
		constructor(apiKey?: string);

		emails: {
			send(input: SendEmailInput): Promise<SendEmailResult>;
		};
	}
}
