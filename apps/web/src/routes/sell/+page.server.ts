import { redirect } from '@sveltejs/kit';
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

    return {
      user: session.user,
      profile,
      categories: categories || [],
      canListProducts,
      plans: plans || [],
      needsBrandSubscription: profile?.account_type === 'brand' && !canListProducts
    };
  } catch (error) {
    console.error('Error loading sell page:', error);
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

export const actions = {
  create: async ({ request, locals: { supabase, session } }) => {
    if (!session) {
      return {
        success: false,
        error: 'Not authenticated'
      };
    }

    try {
      const formData = await request.formData();
      const productData = JSON.parse(formData.get('productData') as string);
      const files = formData.getAll('files') as File[];

      console.log('Server: Creating product with data:', productData);
      console.log('Server: User ID:', session.user.id);

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
          title: productData.title,
          description: productData.description || null,
          price: parseFloat(productData.price),
          category_id: productData.category_id,
          condition: productData.condition,
          brand: productData.brand !== 'Other' ? productData.brand : null,
          size: productData.size || null,
          location: null,
          seller_id: session.user.id,
          shipping_cost: parseFloat(productData.shipping_cost || '0'),
          tags: productData.tags?.length > 0 ? productData.tags : null,
          color: productData.color || null,
          material: productData.material || null
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
          alt_text: `${productData.title} - Image ${index + 1}`
        }));

        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(imageInserts);

        if (imagesError) {
          console.error('Images error:', imagesError);
          throw imagesError;
        }
      }

      return {
        success: true,
        productId: product.id
      };

    } catch (error) {
      console.error('Server error creating product:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
} satisfies Actions;