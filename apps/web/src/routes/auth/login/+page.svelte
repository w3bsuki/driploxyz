<script lang="ts">
  import { Button } from '@repo/ui';
  import Header from '$lib/components/Header.svelte';
  
  let mode = $state<'login' | 'signup'>('login');
  let email = $state('');
  let password = $state('');
  let username = $state('');
  let confirmPassword = $state('');
  let agreedToTerms = $state(false);
  let showPassword = $state(false);
  
  function handleSubmit() {
    if (mode === 'login') {
      console.log('Login:', { email, password });
    } else {
      console.log('Signup:', { email, username, password, confirmPassword });
    }
  }
  
  function handleSocialLogin(provider: string) {
    console.log('Social login:', provider);
  }
</script>

<svelte:head>
  <title>{mode === 'login' ? 'Log In' : 'Sign Up'} - Driplo</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex flex-col">
  <Header minimal />

  <!-- Main Content -->
  <div class="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <div class="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900">
            {mode === 'login' ? 'Welcome back!' : 'Create your account'}
          </h1>
          <p class="text-gray-600 mt-2">
            {mode === 'login' 
              ? 'Log in to continue shopping' 
              : 'Join our community of fashion lovers'}
          </p>
        </div>

        <!-- Tabs -->
        <div class="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onclick={() => mode = 'login'}
            class="flex-1 py-2 rounded-md text-sm font-medium transition-colors
              {mode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}"
          >
            Log In
          </button>
          <button
            onclick={() => mode = 'signup'}
            class="flex-1 py-2 rounded-md text-sm font-medium transition-colors
              {mode === 'signup' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}"
          >
            Sign Up
          </button>
        </div>

        <!-- Form -->
        <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div class="space-y-4">
            {#if mode === 'signup'}
              <div>
                <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  bind:value={username}
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Choose a username"
                />
              </div>
            {/if}
            
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                bind:value={email}
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div class="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  bind:value={password}
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onclick={() => showPassword = !showPassword}
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {#if showPassword}
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  {:else}
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  {/if}
                </button>
              </div>
            </div>
            
            {#if mode === 'signup'}
              <div>
                <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  bind:value={confirmPassword}
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            {/if}
            
            {#if mode === 'login'}
              <div class="flex items-center justify-between">
                <label class="flex items-center">
                  <input type="checkbox" class="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                  <span class="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <a href="/auth/forgot-password" class="text-sm text-purple-600 hover:text-purple-800">
                  Forgot password?
                </a>
              </div>
            {:else}
              <div class="flex items-start">
                <input 
                  type="checkbox" 
                  bind:checked={agreedToTerms}
                  class="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500" 
                />
                <label class="ml-2 text-sm text-gray-600">
                  I agree to the <a href="/terms" class="text-purple-600 hover:text-purple-800">Terms of Service</a> and <a href="/privacy" class="text-purple-600 hover:text-purple-800">Privacy Policy</a>
                </label>
              </div>
            {/if}
          </div>
          
          <Button 
            type="submit"
            size="lg" 
            class="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {mode === 'login' ? 'Log In' : 'Create Account'}
          </Button>
        </form>
        
        <!-- Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>
        
        <!-- Social Login -->
        <div class="grid grid-cols-3 gap-3">
          <button
            onclick={() => handleSocialLogin('google')}
            class="flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </button>
          
          <button
            onclick={() => handleSocialLogin('apple')}
            class="flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.42-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.42C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
          </button>
          
          <button
            onclick={() => handleSocialLogin('facebook')}
            class="flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg class="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Footer Links -->
      <div class="text-center mt-6">
        <p class="text-sm text-gray-600">
          {mode === 'login' 
            ? "Don't have an account? " 
            : 'Already have an account? '}
          <button 
            onclick={() => mode = mode === 'login' ? 'signup' : 'login'}
            class="text-purple-600 hover:text-purple-800 font-medium"
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  </div>
</div>