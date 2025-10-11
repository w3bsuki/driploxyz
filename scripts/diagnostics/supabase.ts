import type { SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseDiagnosticsOptions {
  tables?: string[];
  sampleLimit?: number;
}

export interface TableDiagnostics {
  ok: boolean;
  count: number | null;
  error: string | null;
}

export interface ProductsTestDiagnostics {
  count: number;
  error: string | null;
  sample: Record<string, unknown> | null;
}

export interface SupabaseDiagnostics {
  timestamp: string;
  url?: string;
  results: Record<string, TableDiagnostics>;
  productsTest: ProductsTestDiagnostics;
}

const DEFAULT_TABLES = ['products', 'categories', 'profiles'] as const;

export const collectSupabaseDiagnostics = async (
  client: SupabaseClient,
  options: SupabaseDiagnosticsOptions = {}
): Promise<SupabaseDiagnostics> => {
  const { tables = [...DEFAULT_TABLES], sampleLimit = 5 } = options;
  const results: Record<string, TableDiagnostics> = {};

  for (const table of tables) {
    try {
      const { error, count } = await client.from(table).select('*', { head: true, count: 'exact' });
      results[table] = {
        ok: !error,
        count: count ?? null,
        error: error?.message ?? null
      };
    } catch (error) {
      results[table] = {
        ok: false,
        count: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  let productsTest: ProductsTestDiagnostics = {
    count: 0,
    error: null,
    sample: null
  };

  try {
    const { data, error } = await client.from('products').select('id, title, price').limit(sampleLimit);
    productsTest = {
      count: data?.length ?? 0,
      error: error?.message ?? null,
      sample: data?.[0] ?? null
    };
  } catch (error) {
    productsTest = {
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
      sample: null
    };
  }

  return {
    timestamp: new Date().toISOString(),
    url: (client as SupabaseClient & { url?: string }).url,
    results,
    productsTest
  };
};
