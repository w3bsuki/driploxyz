import { redirect, fail } from '@sveltejs/kit';
import { ProductSchema } from '$lib/validation/product';
import type { PageServerLoad, Actions } from './$types';
import { createServices } from '$lib/services';

export const load: PageServerLoad = async ({ locals }) => {
  // Get the session from locals 
  const { supabase, session } = locals;
  
  // Redirect to login if not authenticated
  if (!session) {
    throw redirect(303, '/login?redirect=/sell');
  }

  const services = createServices(supabase, null); // No stripe needed for selling products

  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('account_type, subscription_tier, premium_boosts_remaining, role, username')
      .eq('id', session.user.id)
      .single();
    
    // Check if brand user can list products
    let canListProducts = true;
    if (profile?.account_type === 'brand') {
      canListProducts = profile.subscription_tier === 'brand';
    }

    // Get ALL categories for the 3-tier selection system
    const { data: allCategories, error: categoriesError } = await services.categories.getCategories();

    // Get available subscription plans for upgrade prompt
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });
    return {
      user: session.user,
      profile,
      categories: allCategories || [],
      canListProducts,
      plans: plans || [],
      needsBrandSubscription: profile?.account_type === 'brand' && !canListProducts
    };
  } catch (error) {
    // Return empty but valid data structure
    return {
      user: session.user,
      profile: null,
      categories: [],
      canListProducts: true,
      plans: [],
      needsBrandSubscription: false
    };
  }
};

export const actions: Actions = {
  create: async ({ request, locals: { supabase, session } }) => {
    if (!session) {
      return fail(401, { 
        errors: { _form: 'Not authenticated' }
      });
    }

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
    const condition = (rawCondition && validConditions.includes(rawCondition)) ? rawCondition : 'good';
    
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
        if (error.path.length > 0) {
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
      // TODO: Re-enable photo validation after testing
      /*if (!photo_urls || photo_urls.length === 0) {
        return fail(400, {
          errors: { photos: 'At least one photo is required' },
          values: {
            title, description, gender_category_id, type_category_id, category_id, brand, size, 
            condition, color, material, price, shipping_cost, tags, use_premium_boost
          }
        });
      }*/
      
      // CRITICAL: Ensure category is NEVER null
      if (!category_id) {
        return fail(400, {
          errors: { category_id: 'Category is required. Please select a category for your item.' },
          values: {
            title, description, gender_category_id, type_category_id, category_id, brand, size, 
            condition, color, material, price, shipping_cost, tags, use_premium_boost
          }
        });
      }
      
      // Create product in database
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
          is_sold: false,
          view_count: 0,
          favorite_count: 0
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
        const { data: profile } = await supabase
          .from('profiles')
          .select('premium_boosts_remaining')
          .eq('id', session.user.id)
          .single();
          
        if (profile && profile.premium_boosts_remaining > 0) {
          // Update product to be boosted
          await supabase
            .from('products')
            .update({
              is_boosted: true,
              boost_type: 'premium',
              boosted_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            })
            .eq('id', product.id);
            
          // Decrement boosts remaining
          await supabase
            .from('profiles')
            .update({
              premium_boosts_remaining: profile.premium_boosts_remaining - 1
            })
            .eq('id', session.user.id);
        }
      }

      // Return success instead of redirect
      return {
        success: true,
        productId: product.id
      };

    } catch (error) {
      // If it's a redirect, re-throw it (this is success, not an error!)
      if (error instanceof Response) {
        throw error;
      }
      
      return fail(500, {
        errors: { _form: error instanceof Error ? error.message : 'Failed to create product' },
        values: {
          title, description, gender_category_id, type_category_id, category_id, brand, size, 
          condition, color, material, price, shipping_cost, tags, use_premium_boost
        }
      });
    }
  }
};