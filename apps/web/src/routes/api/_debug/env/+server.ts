import { json } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { env as dynamicPublicEnv } from '$env/dynamic/public';

export const GET = async () => {
  if (!dev) {
    return new Response('Not found', { status: 404 });
  }

  const importMetaEnv = (typeof import.meta !== 'undefined' ? (import.meta as any).env : {}) as Record<string, string | undefined>;

  const dynamic = {
    PUBLIC_SUPABASE_URL: dynamicPublicEnv.PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY: dynamicPublicEnv.PUBLIC_SUPABASE_ANON_KEY
  };

  const meta = {
    PUBLIC_SUPABASE_URL: importMetaEnv.PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY: importMetaEnv.PUBLIC_SUPABASE_ANON_KEY
  };

  const effective = {
    url: dynamic.PUBLIC_SUPABASE_URL ?? meta.PUBLIC_SUPABASE_URL ?? process.env.PUBLIC_SUPABASE_URL,
    anon: dynamic.PUBLIC_SUPABASE_ANON_KEY ?? meta.PUBLIC_SUPABASE_ANON_KEY ?? process.env.PUBLIC_SUPABASE_ANON_KEY
  };

  const redact = (val?: string | null) => {
    if (!val || typeof val !== 'string') return null;
    if (val.startsWith('http')) {
      try {
        const u = new URL(val);
        return `${u.origin} (path:${u.pathname || '/'})`;
      } catch {
        return `${val.slice(0, 12)}…`;
      }
    }
    const last4 = val.slice(-4);
    return `***${last4}`;
  };

  return json({
    dynamic: {
      url: Boolean(dynamic.PUBLIC_SUPABASE_URL),
      anon: Boolean(dynamic.PUBLIC_SUPABASE_ANON_KEY)
    },
    importMeta: {
      url: Boolean(meta.PUBLIC_SUPABASE_URL),
      anon: Boolean(meta.PUBLIC_SUPABASE_ANON_KEY)
    },
    processEnv: {
      url: Boolean(process.env.PUBLIC_SUPABASE_URL),
      anon: Boolean(process.env.PUBLIC_SUPABASE_ANON_KEY)
    },
    effective: {
      url: redact(effective.url),
      anon: redact(effective.anon)
    }
  });
};

