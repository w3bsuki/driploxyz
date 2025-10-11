export interface EnvSource {
  PUBLIC_SUPABASE_URL?: string;
  PUBLIC_SUPABASE_ANON_KEY?: string;
  [key: string]: string | undefined;
}

export interface EnvDiagnostics {
  timestamp: string;
  dynamic: {
    url: boolean;
    anon: boolean;
  };
  importMeta: {
    url: boolean;
    anon: boolean;
  };
  processEnv: {
    url: boolean;
    anon: boolean;
  };
  effective: {
    url: string | null;
    anon: string | null;
  };
}

const redact = (value?: string | null): string | null => {
  if (!value) return null;
  if (value.startsWith('http')) {
    try {
      const parsed = new URL(value);
      return `${parsed.origin} (path:${parsed.pathname || '/'})`;
    } catch {
      return `${value.slice(0, 12)}…`;
    }
  }

  return value.length <= 4 ? value : `***${value.slice(-4)}`;
};

export interface CollectEnvOptions {
  dynamic?: EnvSource;
  importMeta?: EnvSource;
  processEnv?: EnvSource;
}

export const collectEnvDiagnostics = (
  options: CollectEnvOptions = {}
): EnvDiagnostics => {
  const { dynamic = {}, importMeta = {}, processEnv = process.env } = options;

  const effectiveUrl =
    dynamic.PUBLIC_SUPABASE_URL ??
    importMeta.PUBLIC_SUPABASE_URL ??
    processEnv.PUBLIC_SUPABASE_URL ??
    null;

  const effectiveAnon =
    dynamic.PUBLIC_SUPABASE_ANON_KEY ??
    importMeta.PUBLIC_SUPABASE_ANON_KEY ??
    processEnv.PUBLIC_SUPABASE_ANON_KEY ??
    null;

  return {
    timestamp: new Date().toISOString(),
    dynamic: {
      url: Boolean(dynamic.PUBLIC_SUPABASE_URL),
      anon: Boolean(dynamic.PUBLIC_SUPABASE_ANON_KEY)
    },
    importMeta: {
      url: Boolean(importMeta.PUBLIC_SUPABASE_URL),
      anon: Boolean(importMeta.PUBLIC_SUPABASE_ANON_KEY)
    },
    processEnv: {
      url: Boolean(processEnv.PUBLIC_SUPABASE_URL),
      anon: Boolean(processEnv.PUBLIC_SUPABASE_ANON_KEY)
    },
    effective: {
      url: redact(effectiveUrl),
      anon: redact(effectiveAnon)
    }
  };
};
