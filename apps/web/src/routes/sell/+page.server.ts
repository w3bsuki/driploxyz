import { redirect, fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { ProductSchema } from '$lib/validation/product';
import type { PageServerLoad, Actions } from './$types';
import { createServices } from '$lib/services';

export const load: PageServerLoad = async ({ locals: { supabase, session } }) => {
  // Redirect to login if not authenticated
  if (!session) {
    throw redirect(303, '/login?redirect=/sell');
  }

  const services = createServices(supabase);

  try {
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_type, subscription_tier, premium_boosts_remaining, role, username')
      .eq('id', session.user.id)
      .single();

    // Check if brand user can list products
    let canListProducts = true;
    if (profile?.account_type === 'brand') {
      canListProducts = profile.subscription_tier === 'brand';
    }

    // Get all categories for the form
    const { data: categories, error: categoriesError } = await services.categories.getCategories();

    if (categoriesError) {
      console.error('Error loading categories:', categoriesError);
    }

    // Get available subscription plans for upgrade prompt
    const { data: plans } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });

    // Initialize form with Superforms
    const form = await superValidate(zod(ProductSchema));

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
    console.error('Error loading sell page:', error);
    
    // Still initialize form even on error
    const form = await superValidate(zod(ProductSchema));
    
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
    if (!session) {
      return fail(401, { 
        form: await superValidate(request, zod(ProductSchema)),
        error: 'Not authenticated' 
      });
    }

    const form = await superValidate(request, zod(ProductSchema));
    
    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      // Get files from formData
      const formData = await request.formData();
      const files = formData.getAll('photos') as File[];

      console.log('Server: Creating product with data:', form.data);
      console.log('Server: User ID:', session.user.id);
      console.log('Server: Files count:', files.length);

      // Upload images to Supabase Storage
      const uploadedUrls: string[] = [];
      
      for (const [index, file] of files.entries()) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${session.user.id}/${Date.now()}_${index}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);
        
        uploadedUrls.push(publicUrl);
      }

      // Create product in database
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          title: form.data.title,
          description: form.data.description || null,
          price: parseFloat(form.data.price),
          category_id: form.data.subcategory_id || form.data.category_id,
          condition: form.data.condition,
          brand: form.data.brand !== 'Other' ? form.data.brand : null,
          size: form.data.size || null,
          location: null,
          seller_id: session.user.id,
          shipping_cost: parseFloat(form.data.shipping_cost || '0'),
          tags: form.data.tags?.length > 0 ? form.data.tags : null,
          color: form.data.color || null,
          material: form.data.material || null
        })
        .select()
        .single();

      if (productError) {
        console.error('Product creation error:', productError);
        throw productError;
      }

      // Add product images
      if (uploadedUrls.length > 0) {
        const imageInserts = uploadedUrls.map((url, index) => ({
          product_id: product.id,
          image_url: url,
          display_order: index,
          alt_text: `${form.data.title} - Image ${index + 1}`
        }));

        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(imageInserts);

        if (imagesError) {
          console.error('Images error:', imagesError);
          throw imagesError;
        }
      }

      // Handle premium boost if selected
      if (form.data.use_premium_boost) {
        // Premium boost logic would go here
      }

      // Return success with redirect
      throw redirect(303, `/product/${product.id}?success=true`);

    } catch (error) {
      // If it's a redirect, re-throw it
      if (error instanceof Response) {
        throw error;
      }
      
      console.error('Server error creating product:', error);
      return fail(500, {
        form,
        error: error.message || 'Failed to create product'
      });
    }
  }
};