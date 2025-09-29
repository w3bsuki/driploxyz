import type { RequestEvent } from '@sveltejs/kit';
import { createServerSupabase, createServiceSupabase } from '$lib/auth';

export const createServerSupabaseClient = (event: RequestEvent) =>
  createServerSupabase(event.cookies, event.fetch);

export const createServiceSupabaseClient = () => createServiceSupabase();
