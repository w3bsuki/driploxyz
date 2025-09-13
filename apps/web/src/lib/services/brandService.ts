import type { SupabaseClient } from '@supabase/supabase-js';

export interface BrandActivationData {
  userId: string;
  subscriptionId: string;
}

/**
 * Activate brand status after successful subscription payment
 */
export async function activateBrandStatus(
  supabase: SupabaseClient,
  { userId, subscriptionId }: BrandActivationData
) {
  try {
    // Update brand record
    const { error: brandError } = await supabase
      .from('brands')
      .update({
        subscription_active: true,
        verified_brand: true,
        subscription_id: subscriptionId,
        updated_at: new Date().toISOString()
      })
      .eq('profile_id', userId);

    if (brandError) throw brandError;

    // Update profile brand status
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        brand_status: 'brand'
      })
      .eq('id', userId);

    if (profileError) throw profileError;

    return { success: true };
  } catch (error) {
    console.error('Brand activation error:', error);
    return { success: false, error };
  }
}

/**
 * Deactivate brand status when subscription is cancelled
 */
export async function deactivateBrandStatus(
  supabase: SupabaseClient,
  userId: string
) {
  try {
    // Update brand record
    const { error: brandError } = await supabase
      .from('brands')
      .update({
        subscription_active: false,
        verified_brand: false,
        updated_at: new Date().toISOString()
      })
      .eq('profile_id', userId);

    if (brandError) throw brandError;

    // Update profile brand status to pending
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        brand_status: 'brand_pending'
      })
      .eq('id', userId);

    if (profileError) throw profileError;

    return { success: true };
  } catch (error) {
    console.error('Brand deactivation error:', error);
    return { success: false, error };
  }
}