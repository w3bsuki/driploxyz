import { redirect, fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { ProductSchema } from '$lib/validation/product';
import type { PageServerLoad, Actions } from './$types';
import { createServices } from '$lib/services';
import { processImageToWebP } from '$lib/utils/image-processing';

export const load: PageServerLoad = async ({ locals }) => {
  console.log('[SELL DEBUG] Starting load function');
  console.log('[SELL DEBUG] Locals keys:', Object.keys(locals));
  
  // Get the session from locals 
  const { supabase, session } = locals;
  
  console.log('[SELL DEBUG] Session exists:', !!session);
  console.log('[SELL DEBUG] Session user ID:', session?.user?.id);
  
  // Redirect to login if not authenticated
  if (!session) {
    console.log('[SELL DEBUG] No session, redirecting to login');
    throw redirect(303, '/login?redirect=/sell');
  }

  const services = createServices(supabase, null); // No stripe needed for selling products

  try {
    console.log('[SELL DEBUG] Fetching user profile...');
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('account_type, subscription_tier, premium_boosts_remaining, role, username')
      .eq('id', session.user.id)
      .single();
    
    if (profileError) {
      console.error('[SELL DEBUG] Profile fetch error:', profileError);
    } else {
      console.log('[SELL DEBUG] Profile fetched:', profile);

    }
    
    // Check if brand user can list products
    let canListProducts = true;
    if (profile?.account_type === 'brand') {
      canListProducts = profile.subscription_tier === 'brand';
    }

    console.log('[SELL DEBUG] Fetching categories...');
    // Get all categories for the form
    const { data: categories, error: categoriesError } = await services.categories.getCategories();

    if (categoriesError) {
      console.error('[SELL DEBUG] Categories error:', categoriesError);
    } else {
      console.log('[SELL DEBUG] Categories count:', categories?.length);
    }

    console.log('[SELL DEBUG] Fetching subscription plans...');
    // Get available subscription plans for upgrade prompt
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });
    
    if (plansError) {
      console.error('[SELL DEBUG] Plans error:', plansError);
    }

    console.log('[SELL DEBUG] Initializing form...');
    // Initialize empty form with default values
    const form = await superValidate(null, zod(ProductSchema));
    console.log('[SELL DEBUG] Form initialized:', !!form);

    console.log('[SELL DEBUG] Returning data successfully');
    return {
      user: session.user,
      profile,
      categories: categories || [],
      canListProducts,
      plans: plans || [],
      needsBrandSubscription: profile?.account_type === 'brand' && !canListProducts,
      form
    };
  } catch (error) {
    console.error('[SELL DEBUG] Load error:', error);
    
    // Still initialize form even on error
    const form = await superValidate(null, zod(ProductSchema));
    
    return {
      user: session.user,
      profile: null,
      categories: [],
      canListProducts: true,
      plans: [],
      needsBrandSubscription: false,
      form
    };
  }
};

export const actions: Actions = {
  default: async ({ request, locals: { supabase, session } }) => {
    console.log('[SELL ACTION] Starting form submission');
    
    if (!session) {
      console.log('[SELL ACTION] No session found');
      return fail(401, { 
        form: await superValidate(request, zod(ProductSchema)),
        error: 'Not authenticated' 
      });
    }

    const formData = await request.formData();
    console.log('[SELL ACTION] Form data received');
    console.log('[SELL ACTION] Form fields:', Array.from(formData.keys()));
    
    // Log key form values
    console.log('[SELL ACTION] Key values:', {
      title: formData.get('title'),
      category_id: formData.get('category_id'),
      brand: formData.get('brand'),
      size: formData.get('size'),
      price: formData.get('price'),
      photos: formData.getAll('photos').length
    });
    
    const form = await superValidate(formData, zod(ProductSchema));
    console.log('[SELL ACTION] Form validation:', form.valid ? 'VALID' : 'INVALID');
    
    if (!form.valid) {
      console.error('Validation errors:', form.errors);
      return fail(400, { form });
    }

    try {
      // Get files from formData
      const files = formData.getAll('photos') as File[];

      // Validate we have at least one image
      if (files.length === 0 || (files.length === 1 && !files[0].size)) {
        return fail(400, {
          form,
          error: 'At least one photo is required'
        });
      }

      // Upload images to Supabase Storage with WebP conversion
      const uploadedUrls: string[] = [];
      
      for (const [index, file] of files.entries()) {
        if (!file.size) continue; // Skip empty files
        
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        if (!['jpg', 'jpeg', 'png', 'webp'].includes(fileExt || '')) {
          throw new Error(`Invalid file type: ${fileExt}`);
        }
        
        try {
          // Convert image to WebP format
          console.log(`[SELL] Converting image ${index + 1} to WebP...`);
          const webpBuffer = await processImageToWebP(file, {
            maxWidth: 1200,
            maxHeight: 1200,
            quality: 85
          });
          
          // Always save as .webp regardless of input format
          const fileName = `${session.user.id}/${Date.now()}_${index}.webp`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, webpBuffer, {
              cacheControl: '3600',
              upsert: false,
              contentType: 'image/webp'
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            throw new Error(`Failed to upload image: ${uploadError.message}`);
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);
          
          uploadedUrls.push(publicUrl);
          console.log(`[SELL] Successfully uploaded WebP image: ${fileName}`);
        } catch (conversionError) {
          console.error(`Error processing image ${index + 1}:`, conversionError);
          throw new Error(`Failed to process image ${index + 1}: ${conversionError instanceof Error ? conversionError.message : 'Unknown error'}`);
        }
      }

      // Ensure price and shipping_cost are numbers
      const price = typeof form.data.price === 'string' 
        ? parseFloat(form.data.price) 
        : form.data.price;
      const shippingCost = typeof form.data.shipping_cost === 'string'
        ? parseFloat(form.data.shipping_cost || '0')
        : form.data.shipping_cost;

      // Create product in database
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          title: form.data.title.trim(),
          description: form.data.description?.trim() || '',
          price: price,
          category_id: form.data.subcategory_id || form.data.category_id,
          condition: form.data.condition,
          brand: form.data.brand !== 'Other' ? form.data.brand : null,
          size: form.data.size || null,
          location: null,
          seller_id: session.user.id,
          shipping_cost: shippingCost,
          tags: form.data.tags?.length > 0 ? form.data.tags : null,
          color: form.data.color?.trim() || null,
          material: form.data.material?.trim() || null,
          is_active: true,
          is_sold: false,
          view_count: 0,
          favorite_count: 0
        })
        .select()
        .single();

      if (productError) {
        console.error('Product creation error:', productError);
        throw new Error(`Failed to create product: ${productError.message}`);
      }

      // Add product images with error handling
      if (uploadedUrls.length > 0) {
        const imageInserts = uploadedUrls.map((url, index) => ({
          product_id: product.id,
          image_url: url,
          sort_order: index,
          alt_text: `${form.data.title} - Image ${index + 1}`
        }));

        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(imageInserts);

        if (imagesError) {
          console.error('Images insert error:', imagesError);
          // Try to delete the product if images fail
          await supabase.from('products').delete().eq('id', product.id);
          throw new Error(`Failed to save images: ${imagesError.message}`);
        }
      }

      // Handle premium boost if selected
      if (form.data.use_premium_boost) {
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

      // Return success with redirect to success page
      throw redirect(303, `/sell/success?id=${product.id}`);

    } catch (error) {
      // If it's a redirect, re-throw it
      if (error instanceof Response) {
        throw error;
      }
      
      console.error('Form submission error:', error);
      
      return fail(500, {
        form,
        error: error instanceof Error ? error.message : 'Failed to create product'
      });
    }
  }
};