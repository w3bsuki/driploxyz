import type { SupabaseClient } from '@supabase/supabase-js';
import { goto } from '$app/navigation';

export type QuickSearchResult = {
    id: string;
    title: string;
    price: number;
    images: Array<{ image_url: string }>;
    slug?: string | null;
    first_image_url?: string | null;
    [key: string]: unknown;
};

export async function performSearch(query: string) {
    if (!query?.trim()) return;
    await goto(`/search?q=${encodeURIComponent(query.trim())}`);
}

export async function performQuickSearch(
    supabase: SupabaseClient | null,
    query: string
): Promise<{ data: QuickSearchResult[]; error: string | null }> {
    if (!query?.trim() || !supabase) {
        return { data: [], error: null };
    }

    try {
        const { data: searchResults, error } = await supabase.rpc('search_products_fast', {
            query_text: query.trim(),
            result_limit: 6
        });

        if (error) {
            console.error('Search error:', error);
            return { data: [], error: error.message };
        }

        const normalizedResults = Array.isArray(searchResults) ? searchResults : [];
        const transformed = normalizedResults.map((result: any) => ({
            ...result,
            images: result.first_image_url ? [{ image_url: result.first_image_url }] : []
        }));

        return { data: transformed, error: null };
    } catch (err) {
        console.error('Search failed:', err);
        return { data: [], error: 'Search failed' };
    }
}
