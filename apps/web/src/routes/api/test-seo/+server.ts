import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * SEO Testing Endpoint
 * Tests slug generation and URL routing functionality
 */
export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const action = url.searchParams.get('action') || 'status';
  
  try {
    switch (action) {
      case 'status':
        // Get overall SEO status
        const { data: stats } = await supabase
          .from('products')
          .select('slug, is_active')
          .eq('is_active', true);
        
        const totalProducts = stats?.length || 0;
        const productsWithSlugs = stats?.filter(p => p.slug).length || 0;
        const productsNeedingSlugs = totalProducts - productsWithSlugs;
        
        return json({
          success: true,
          stats: {
            totalActiveProducts: totalProducts,
            productsWithSlugs,
            productsNeedingSlugs,
            seoCompletionRate: totalProducts > 0 ? (productsWithSlugs / totalProducts * 100).toFixed(1) + '%' : '0%'
          }
        });
      
      case 'sample_urls':
        // Get sample SEO URLs
        const { data: sampleProducts } = await supabase
          .from('products')
          .select('id, title, slug, brand, category_id')
          .not('slug', 'is', null)
          .eq('is_active', true)
          .limit(10);
        
        const urls = sampleProducts?.map(p => ({
          id: p.id,
          title: p.title,
          seoUrl: `/${p.slug}`,
          legacyUrl: `/product/${p.id}`
        })) || [];
        
        return json({
          success: true,
          sampleUrls: urls
        });
      
      case 'queue_status':
        // Get slug processing queue status
        const { data: queueData } = await supabase
          .from('slug_processing_queue')
          .select('status');
        
        const queueStats = queueData?.reduce((acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};
        
        return json({
          success: true,
          queueStatus: queueStats
        });
      
      default:
        return json({
          success: false,
          error: `Unknown action: ${action}`
        }, { status: 400 });
    }
  } catch (error) {
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
};