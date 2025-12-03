/**
 * CONSOLIDATED ONBOARDING SYSTEM
 *
 * Clean, simple onboarding logic without over-engineering.
 * Handles profile creation and completion in a straightforward way.
 */

import { dev } from '$app/environment';
import type { SupabaseAuthClient, Profile, AuthUser } from './index';
import { updateUserProfile } from './index';
import type { Database } from '@repo/database';

// Onboarding form data interface
export interface OnboardingData {
  accountType: 'personal' | 'brand' | 'pro';
  username: string;
  fullName: string;
  location?: string;
  avatarUrl?: string;
  bio?: string;
  payoutMethod: {
    type: string;
    details: string;
    name: string;
  };
  socialLinks?: Array<{ platform: string; url: string }>;
}

// Onboarding result interface
export interface OnboardingResult {
  success: boolean;
  error?: string;
  profile?: Profile;
  needsPayment?: boolean;
  paymentRequired?: boolean;
}

/**
 * Complete user onboarding
 */
export async function completeOnboarding(
  supabase: SupabaseAuthClient,
  user: AuthUser,
  data: OnboardingData
): Promise<OnboardingResult> {
  try {
    // Validate required fields
    const validation = validateOnboardingData(data);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Check if premium account type requires payment
    const isPremiumAccount = data.accountType === 'brand' || data.accountType === 'pro';
    if (isPremiumAccount) {
      const hasPayment = await verifyPaymentForPremiumAccount(supabase, user.id, data.accountType);
      if (!hasPayment) {
        return {
          success: false,
          needsPayment: true,
          paymentRequired: true,
          error: `Payment is required for ${data.accountType} accounts`
        };
      }
    }

    // Determine subscription tier and account status
    const subscriptionTier = isPremiumAccount ? data.accountType : 'free';
    const accountStatus = isPremiumAccount ? data.accountType : null;

    // Build profile update
    const profileUpdate: Partial<Database['public']['Tables']['profiles']['Update']> = {
      account_type: data.accountType,
      username: data.username.trim(),
      full_name: data.fullName.trim(),
      location: data.location?.trim() || null,
      avatar_url: data.avatarUrl || null,
      bio: data.bio?.trim() || null,
      payout_method: data.payoutMethod,
      social_links: data.socialLinks || [],
      onboarding_completed: true,
      subscription_tier: subscriptionTier,
      verified: isPremiumAccount,
      brand_status: accountStatus,
      updated_at: new Date().toISOString()
    };

    // Update profile
    const result = await updateUserProfile(supabase, user.id, profileUpdate);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Create brand entry if needed
    if (data.accountType === 'brand' && result.profile) {
      await createBrandEntry(supabase, user.id, data.fullName || data.username);
    }

    return {
      success: true,
      profile: result.profile
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Onboarding failed'
    };
  }
}

/**
 * Validate onboarding data
 */
function validateOnboardingData(data: OnboardingData): { valid: boolean; error?: string } {
  if (!data.username || data.username.trim().length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }

  if (!data.fullName || data.fullName.trim().length === 0) {
    return { valid: false, error: 'Full name is required' };
  }

  if (!data.payoutMethod || !data.payoutMethod.type || !data.payoutMethod.details || !data.payoutMethod.name) {
    return { valid: false, error: 'Complete payout method is required' };
  }

  return { valid: true };
}

/**
 * Verify payment for premium account types
 */
async function verifyPaymentForPremiumAccount(
  supabase: SupabaseAuthClient,
  userId: string,
  accountType: string
): Promise<boolean> {
  // Personal accounts don't require payment
  if (accountType === 'personal') {
    return true;
  }

  // For premium accounts, check if there's a successful payment
  try {
    const { data, error } = await supabase
      .from('user_payments')
      .select('id, status, plan_type, completed_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .eq('plan_type', accountType)
      .not('completed_at', 'is', null)
      .single();

    if (error) {
      console.warn('[Onboarding] Payment verification failed:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('[Onboarding] Error verifying payment:', error);
    return false;
  }
}

/**
 * Create brand entry for brand accounts
 */
async function createBrandEntry(
  supabase: SupabaseAuthClient,
  profileId: string,
  brandName: string
): Promise<void> {
  try {
    // Check if brand entry already exists
    const { data: existingBrand } = await supabase
      .from('brands')
      .select('id')
      .eq('profile_id', profileId)
      .single();

    if (existingBrand) {
      if (dev) console.log('[Onboarding] Brand entry already exists for profile:', profileId);
      return;
    }

    // Create new brand entry
    const { error } = await supabase
      .from('brands')
      .insert({
        profile_id: profileId,
        brand_name: brandName,
        verified_brand: false,
        subscription_active: true,
        verification_documents: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('[Onboarding] Error creating brand entry:', error);
      throw error;
    }

    if (dev) console.log('[Onboarding] Brand entry created successfully for profile:', profileId);
  } catch (error) {
    if (dev) console.error('[Onboarding] Error in createBrandEntry:', error);
    // Don't throw the error to avoid breaking onboarding
    // Log it for monitoring instead
  }
}

/**
 * Check if username is available
 */
export async function checkUsernameAvailability(
  supabase: SupabaseAuthClient,
  username: string,
  currentUserId?: string
): Promise<{ available: boolean; error?: string }> {
  try {
    if (!username || username.trim().length < 3) {
      return { available: false, error: 'Username must be at least 3 characters' };
    }

    const cleanUsername = username.trim().toLowerCase();

    let query = supabase
      .from('profiles')
      .select('id')
      .eq('username', cleanUsername);

    // Exclude current user when updating
    if (currentUserId) {
      query = query.neq('id', currentUserId);
    }

    const { data } = await query.limit(1);

    return { available: !data || data.length === 0 };
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : 'Failed to check username'
    };
  }
}

/**
 * Get onboarding progress for a user
 */
export function getOnboardingProgress(profile: Profile | null): {
  completed: boolean;
  completedSteps: string[];
  nextStep?: string;
  progress: number;
} {
  if (!profile) {
    return {
      completed: false,
      completedSteps: [],
      nextStep: 'account-type',
      progress: 0
    };
  }

  const steps = [
    { key: 'account-type', check: () => !!profile.account_type },
    { key: 'profile', check: () => !!profile.username && !!profile.full_name },
    { key: 'payout', check: () => !!profile.payout_method },
    { key: 'complete', check: () => profile.onboarding_completed === true }
  ];

  const completedSteps = steps.filter(step => step.check()).map(step => step.key);
  const nextStep = steps.find(step => !step.check())?.key;
  const progress = Math.round((completedSteps.length / steps.length) * 100);

  return {
    completed: profile.onboarding_completed === true,
    completedSteps,
    nextStep,
    progress
  };
}