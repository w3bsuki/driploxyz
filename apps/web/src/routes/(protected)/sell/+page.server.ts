import { redirect, fail } from '@sveltejs/kit';
import { ProductSchema } from '$lib/validation/product';
import type { PageServerLoad, Actions } from './$types';
import { createServices } from '$lib/services';
import { getUserCountry } from '$lib/country/detection';
import { generateUniqueSlug, validateSlug } from '$lib/utils/slug';

export const load = (async ({ locals }) => {
  // Get the session and validated user from locals
  const { supabase, session, user } = locals;

  // Redirect to login if not authenticated
  if (!session || !user) {
    redirect(303, '/login?redirect=/sell');
  }

  const services = createServices(supabase, null); // No stripe needed for selling products

  try {
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_type, subscription_tier, premium_boosts_remaining, role, username')
      .eq('id', user.id)
      .single();
    
    // Check if brand user can list products
    let canListProducts = true;
    if (profile?.account_type === 'brand') {
      canListProducts = profile.subscription_tier === 'brand';
    }

    // Get ALL categories for the 3-tier selection system
    const { data: allCategories } = await services.categories.getCategories();

    // Get available subscription plans for upgrade prompt
    const { data: plans } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });
    return {
      user: user,
      profile,
      categories: allCategories || [],
      canListProducts,
      plans: plans || [],
      needsBrandSubscription: profile?.account_type === 'brand' && !canListProducts
    };
  } catch {
    // Return empty but valid data structure
    return {
      user: user,
      profile: null,
      categories: [],
      canListProducts: true,
      plans: [],
      needsBrandSubscription: false
    };
  }
}) satisfies PageServerLoad;

export const actions = {
  create: async (event) => {
    const { request, locals: { supabase, session } } = event;
    if (!session) {
      return fail(401, { 
        errors: { _form: 'Not authenticated' }
      });
    }

    // Services created at the top of the function are reused here
    
    const formData = await request.formData();
    
    // Extract form values
    const title = formData.get('title') as string;
    const description = formData.get('description') as string || '';
    const gender_category_id = formData.get('gender_category_id') as string;
    const type_category_id = formData.get('type_category_id') as string;
    const category_id = formData.get('category_id') as string || type_category_id || gender_category_id;
    const brand = formData.get('brand') as string;
    const size = formData.get('size') as string;
    
    // Extract and validate condition
    const rawCondition = formData.get('condition') as string;
    const validConditions = ['brand_new_with_tags', 'new_without_tags', 'like_new', 'good', 'worn', 'fair'];
    const condition = (rawCondition && validConditions.includes(rawCondition)) 
      ? rawCondition as 'brand_new_with_tags' | 'new_without_tags' | 'like_new' | 'good' | 'worn' | 'fair'
      : 'good' as const;
    
    const color = formData.get('color') as string || '';
    const material = formData.get('material') as string || '';
    const price = parseFloat(formData.get('price') as string);
    const shipping_cost = parseFloat(formData.get('shipping_cost') as string || '0');
    const tags = JSON.parse(formData.get('tags') as string || '[]');
    const use_premium_boost = formData.get('use_premium_boost') === 'true';
    
    // Get the already uploaded image URLs and paths from Supabase
    const photo_urls = JSON.parse(formData.get('photo_urls') as string || '[]');
    const photo_paths = JSON.parse(formData.get('photo_paths') as string || '[]');
    
    
    // Manual validation using Zod schema
    const validation = ProductSchema.safeParse({
      title,
      description,
      category_id, // Using the specific Level 3 category
      brand,
      size,
      condition,
      color,
      material,
      price,
      shipping_cost,
      tags,
      use_premium_boost
    });
    
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((error) => {
        if (error.path.length > 0 && error.path[0] != null) {
          errors[error.path[0]] = error.message;
        }
      });
      return fail(400, { 
        errors,
        values: {
          title, description, gender_category_id, type_category_id, category_id, brand, size, 
          condition, color, material, price, shipping_cost, tags, use_premium_boost
        }
      });
    }

    try {
      // Validate we have at least one image
      // Photo validation temporarily disabled for testing
      /*if (!photo_urls || photo_urls.length === 0) {
        return fail(400, {
          errors: { photos: i18n.error_atLeastOnePhoto() },
          values: {
            title, description, gender_category_id, type_category_id, category_id, brand, size, 
            condition, color, material, price, shipping_cost, tags, use_premium_boost
          }
        });
      }*/

      // Get user's country for product listing
      const userCountry = await getUserCountry(event);
      
      // CRITICAL: Ensure category is NEVER null
      if (!category_id) {
        return fail(400, {
          errors: { category_id: 'Category is required' },
          values: {
            title, description, gender_category_id, type_category_id, category_id, brand, size, 
            condition, color, material, price, shipping_cost, tags, use_premium_boost
          }
        });
      }
      
      // Generate unique slug before creating product
      const slugResult = await generateUniqueSlug(supabase, title.trim(), {
        maxLength: 60,
        collisionSuffixLength: 6
      });

      // Validate the generated slug (additional safety check)
      const slugValidation = validateSlug(slugResult.slug);
      if (!slugValidation.valid) {
        return fail(400, {
          errors: { title: 'Unable to generate a valid URL slug from the product title' },
          values: {
            title, description, gender_category_id, type_category_id, category_id, brand, size, 
            condition, color, material, price, shipping_cost, tags, use_premium_boost
          }
        });
      }

      // Create product in database with generated slug
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          title: title.trim(),
          description: description.trim() || '',
          price: price,
          category_id: category_id,
          condition: condition,
          brand: brand?.trim() || null,
          size: size || null,
          location: null,
          seller_id: session.user.id,
          shipping_cost: shipping_cost,
          tags: tags?.length > 0 ? tags : null,
          color: color?.trim() || null,
          material: material?.trim() || null,
          is_active: true,
          status: 'active', // Required for RLS policy
          is_sold: false,
          view_count: 0,
          favorite_count: 0,
          country_code: userCountry, // Add country code for multi-tenancy
          slug: slugResult.slug // Use generated unique slug
        })
        .select()
        .single();

      if (productError) {
        throw new Error(`Failed to create product: ${productError.message}`);
      }


      // Add product images with error handling
      if (photo_urls && photo_urls.length > 0) {
        const imageInserts = photo_urls.map((url: string, index: number) => ({
          product_id: product.id,
          image_url: url,
          sort_order: index,
          alt_text: `${title} - Image ${index + 1}`
        }));

        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(imageInserts);

        if (imagesError) {
          // Try to delete the product if images fail
          await supabase.from('products').delete().eq('id', product.id);
          // Also try to delete uploaded images from storage
          if (photo_paths && photo_paths.length > 0) {
            await supabase.storage
              .from('product-images')
              .remove(photo_paths);
          }
          throw new Error(`Failed to save images: ${imagesError.message}`);
        }
      }

      // Handle premium boost if selected
      if (use_premium_boost) {
        // Use the database function to handle boost logic atomically
        const { data: boostResult } = await supabase.rpc('boost_product', {
          p_user_id: session.user.id,
          p_product_id: product.id,
          p_boost_duration_days: 7
        });
        
        // If boost failed, log but don't fail the entire product creation
        if (boostResult && !(boostResult as { success?: boolean })?.success) {

          // Could store this in a log table or send notification
        }
      }

      // Return success instead of redirect
      return {
        success: true,
        productId: product.id
      };

    } catch (_error) {
      // If it's a redirect, re-throw it (this is success, not an error!)
      if (_error instanceof Response) {
        throw _error;
      }

      return fail(500, {
        errors: { _form: _error instanceof Error ? _error.message : 'Failed to create product' },
        values: {
          title, description, gender_category_id, type_category_id, category_id, brand, size, 
          condition, color, material, price, shipping_cost, tags, use_premium_boost
        }
      });
    }
  }
} satisfies Actions;