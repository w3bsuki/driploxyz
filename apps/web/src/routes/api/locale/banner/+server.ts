import { json } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { RequestHandler } from './$types';
import { COOKIES } from '$lib/server/cookies/production-cookie-system';
import { isLocale } from '@repo/i18n';

const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

function setPreferenceCookie(
  cookies: Parameters<RequestHandler>[0]['cookies'],
  name: string,
  value: string
) {
  cookies.set(name, value, {
    path: '/',
    maxAge: ONE_YEAR_SECONDS,
    httpOnly: false,
    sameSite: 'lax',
    secure: !dev
  });
}

export const POST: RequestHandler = async ({ request, cookies }) => {
  let payload: { action?: string; locale?: string } = {};
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid_payload' }, { status: 400 });
  }

  const action = payload.action;

  if (action === 'dismiss') {
    setPreferenceCookie(cookies, COOKIES.LOCALE_PROMPT_DISMISSED, 'true');
    return json({ ok: true });
  }

  if (action === 'switch' && payload.locale && isLocale(payload.locale)) {
    setPreferenceCookie(cookies, COOKIES.LOCALE, payload.locale);
    setPreferenceCookie(cookies, COOKIES.LOCALE_PROMPT_DISMISSED, 'true');
    return json({ ok: true });
  }

  return json({ ok: false, error: 'unsupported_action' }, { status: 400 });
};
