import { goto } from '$app/navigation';
import { browser } from '$app/environment';

export async function clientLogin(email: string, password: string) {
  if (!browser) return { success: false, error: 'Client-side only' };
  
  try {
    console.log('[CLIENT AUTH] Attempting login for:', email);
    
    // Use fetch directly to bypass form actions
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    console.log('[CLIENT AUTH] Response:', data);
    
    if (data.success) {
      // Redirect based on onboarding status
      if (data.needsOnboarding) {
        await goto('/onboarding');
      } else {
        await goto('/');
      }
      return { success: true };
    } else {
      return { success: false, error: data.error || 'Login failed' };
    }
  } catch (error: any) {
    console.error('[CLIENT AUTH] Error:', error);
    return { success: false, error: error.message || 'Network error' };
  }
}

export async function clientSignup(email: string, password: string, fullName: string) {
  if (!browser) return { success: false, error: 'Client-side only' };
  
  try {
    console.log('[CLIENT AUTH] Attempting signup for:', email);
    
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, fullName })
    });
    
    const data = await response.json();
    console.log('[CLIENT AUTH] Response:', data);
    
    if (data.success) {
      // Redirect to verification page
      await goto(`/auth/verify-email?email=${encodeURIComponent(email)}`);
      return { success: true };
    } else {
      return { success: false, error: data.error || 'Signup failed' };
    }
  } catch (error: any) {
    console.error('[CLIENT AUTH] Error:', error);
    return { success: false, error: error.message || 'Network error' };
  }
}