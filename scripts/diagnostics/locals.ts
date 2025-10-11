export interface LocalsLike {
  supabase?: unknown;
  safeGetSession?: unknown;
}

export interface LocalsDiagnostics {
  timestamp: string;
  routeId: string | null;
  hasSupabase: boolean;
  hasSafeGetSession: boolean;
}

export interface CollectLocalsOptions {
  routeId?: string | null;
}

export const collectLocalsDiagnostics = (
  locals: LocalsLike = {},
  options: CollectLocalsOptions = {}
): LocalsDiagnostics => {
  const { routeId = null } = options;

  return {
    timestamp: new Date().toISOString(),
    routeId,
    hasSupabase: Boolean(locals.supabase),
    hasSafeGetSession: typeof locals.safeGetSession === 'function'
  };
};
