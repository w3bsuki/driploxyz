import { goto } from '$app/navigation';
import { browser } from '$app/environment';

export async function clientLogin(email: string, password: string) {
  if (!browser) return { success: false, error: 'Client-side only' };
  
  try {
    
    // Use fetch directly to bypass form actions
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    
    // Try to parse response as JSON
    let data;
    const text = await response.text();
    try {
      data = JSON.parse(text);
    } catch {
      return { success: false, error: 'Server error - please try again' };
    }
    
    if (response.ok && data.success) {
      // Let the auth state change handler update the UI naturally
      return { success: true };
    } else {
      return { success: false, error: data.error || 'Invalid email or password' };
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Network error' };
  }
}

export async function clientSignup(email: string, password: string, fullName: string) {
  if (!browser) return { success: false, error: 'Client-side only' };
  
  try {
    
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, fullName })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Redirect to verification page
      await goto(`/auth/verify-email?email=${encodeURIComponent(email)}`);
      return { success: true };
    } else {
      return { success: false, error: data.error || 'Signup failed' };
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Network error' };
  }
}