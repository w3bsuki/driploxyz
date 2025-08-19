import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import type { Database } from '@repo/database';
import { browser } from '$app/environment';

type Tables = Database['public']['Tables'];

export class RealtimeNotificationService {
	private supabase: SupabaseClient<Database>;
	private userId: string;
	private channel: RealtimeChannel | null = null;
	private isDestroyed = false;

	constructor(supabase: SupabaseClient<Database>, userId: string) {
		this.supabase = supabase;
		this.userId = userId;
	}

	/**
	 * Initialize a SINGLE channel with all subscriptions
	 */
	initialize() {
		if (this.channel || this.isDestroyed) {
			return;
		}

		// Create ONE channel for all subscriptions
		this.channel = this.supabase
			.channel('user_notifications_' + this.userId)
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'messages',
					filter: `receiver_id=eq.${this.userId}`
				},
				async (payload) => {
					// Handle new messages
					console.log('New message:', payload);
				}
			)
			.subscribe();
	}

	/**
	 * Cleanup subscription
	 */
	destroy() {
		this.isDestroyed = true;
		if (this.channel) {
			this.supabase.removeChannel(this.channel);
			this.channel = null;
		}
	}
}