/**
 * Production-Grade Cookie Management System
 * GDPR-compliant, SSR-compatible, Enterprise-ready
 */

import { browser, dev } from '$app/environment';
import type { Cookies } from '@sveltejs/kit';
import * as i18n from '@repo/i18n';

// Cookie Names - Single source of truth
export const COOKIES = {
  // Supabase Auth (Essential)
  AUTH_TOKEN: 'sb-auth-token',
  AUTH_REFRESH: 'sb-refresh-token',
  
  // GDPR Consent (Essential)
  CONSENT: 'driplo_consent',
  CONSENT_VERSION: 'consent_v',
  
  // Functional
  LOCALE: 'PARAGLIDE_LOCALE',
  COUNTRY: 'country',
  THEME: 'theme',
  CURRENCY: 'currency',
  
  // Analytics
  GA_CLIENT: '_ga',
  GA_SESSION: '_gid',
  GTM: '_gtm',
  
  // Marketing
  FB_PIXEL: '_fbp',
  GOOGLE_ADS: '_gcl_au',
  
  // Session
  SESSION_ID: 'session_id',
  CSRF: 'csrf_token'
} as const;

// Cookie Categories for GDPR
export const COOKIE_CATEGORIES = {
  essential: {
    id: 'essential',
    name: 'Essential Cookies',
    description: 'Required for authentication, security, and basic functionality',
    required: true,
    cookies: [
      COOKIES.AUTH_TOKEN,
      COOKIES.AUTH_REFRESH,
      COOKIES.CONSENT,
      COOKIES.CONSENT_VERSION,
      COOKIES.SESSION_ID,
      COOKIES.CSRF
    ]
  },
  functional: {
    id: 'functional',
    name: 'Functional Cookies',
    description: 'Remember preferences like language, theme, and currency',
    required: false,
    cookies: [COOKIES.LOCALE, COOKIES.THEME, COOKIES.CURRENCY]
  },
  analytics: {
    id: 'analytics',
    name: 'Analytics Cookies',
    description: 'Help us understand usage patterns and improve the platform',
    required: false,
    cookies: [COOKIES.GA_CLIENT, COOKIES.GA_SESSION, COOKIES.GTM]
  },
  marketing: {
    id: 'marketing',
    name: 'Marketing Cookies',
    description: 'Enable personalized ads and measure campaign effectiveness',
    required: false,
    cookies: [COOKIES.FB_PIXEL, COOKIES.GOOGLE_ADS]
  }
} as const;

export interface ConsentState {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
  version: string;
  ip?: string;
  userAgent?: string;
}

export interface CookieOptions {
  maxAge?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  path?: string;
  domain?: string;
}

/**
 * Production Cookie Manager - Singleton Pattern
 */
export class ProductionCookieManager {
  private static instance: ProductionCookieManager;
  private consent: ConsentState | null = null;
  private readonly CONSENT_VERSION = '2.0.0';
  private readonly CONSENT_MAX_AGE = 365 * 24 * 60 * 60; // 1 year
  private scriptQueue = new Map<string, Array<() => void>>();
  
  private constructor() {
    if (browser) {
      this.initialize();
    }
  }
  
  static getInstance(): ProductionCookieManager {
    if (!ProductionCookieManager.instance) {
      ProductionCookieManager.instance = new ProductionCookieManager();
    }
    return ProductionCookieManager.instance;
  }
  
  private initialize(): void {
    this.loadConsent();
    this.setupGlobalBlockers();
    this.applyConsentState();
    this.processScriptQueue(); // Process any queued scripts on init
    this.listenForChanges();
  }
  
  /**
   * Load consent from cookie
   */
  private loadConsent(): void {
    const consentCookie = this.getCookie(COOKIES.CONSENT);
    if (consentCookie) {
      try {
        this.consent = JSON.parse(decodeURIComponent(consentCookie));
        
        // Check version and expiry
        if (this.consent?.version !== this.CONSENT_VERSION) {
          this.consent = null; // Force re-consent on version change
        } else if (this.consent?.timestamp) {
          const age = Date.now() - this.consent.timestamp;
          if (age > this.CONSENT_MAX_AGE * 1000) {
            this.consent = null; // Expired
          }
        }
      } catch {
        this.consent = null;
      }
    }
  }
  
  /**
   * Get cookie value (client-side)
   */
  private getCookie(name: string): string | null {
    if (!browser) return null;
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match && match[2] ? decodeURIComponent(match[2]) : null;
  }
  
  /**
   * Set cookie with production settings
   */
  setCookie(name: string, value: string, options: CookieOptions = {}): void {
    if (!browser) return;
    
    const opts: CookieOptions = {
      path: '/',
      maxAge: this.CONSENT_MAX_AGE,
      sameSite: 'lax',
      secure: !dev,
      ...options
    };
    
    let cookieString = `${name}=${encodeURIComponent(value)}`;
    
    if (opts.maxAge) {
      const expires = new Date(Date.now() + opts.maxAge * 1000);
      cookieString += `; expires=${expires.toUTCString()}`;
      cookieString += `; max-age=${opts.maxAge}`;
    }
    
    cookieString += `; path=${opts.path}`;
    cookieString += `; SameSite=${opts.sameSite}`;
    
    if (opts.secure) {
      cookieString += '; Secure';
    }
    
    if (opts.httpOnly && !browser) {
      cookieString += '; HttpOnly';
    }
    
    if (opts.domain) {
      cookieString += `; domain=${opts.domain}`;
    }
    
    document.cookie = cookieString;
  }
  
  /**
   * Delete cookie properly
   */
  deleteCookie(name: string): void {
    if (!browser) return;
    
    // Delete from all possible paths and domains
    const paths = ['/', '', null];
    const domains = [window.location.hostname, `.${window.location.hostname}`, null];
    
    paths.forEach(path => {
      domains.forEach(domain => {
        let cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
        if (path) cookie += `; path=${path}`;
        if (domain) cookie += `; domain=${domain}`;
        document.cookie = cookie;
      });
    });
  }
  
  /**
   * Update consent and apply immediately
   */
  updateConsent(consent: Partial<ConsentState>): void {
    const newConsent: ConsentState = {
      essential: true,
      functional: consent.functional ?? false,
      analytics: consent.analytics ?? false,
      marketing: consent.marketing ?? false,
      timestamp: Date.now(),
      version: this.CONSENT_VERSION
    };
    if (consent.ip) newConsent.ip = consent.ip;
    if (browser && navigator.userAgent) newConsent.userAgent = navigator.userAgent;
    this.consent = newConsent;
    
    // Save consent
    this.setCookie(COOKIES.CONSENT, JSON.stringify(this.consent), {
      maxAge: this.CONSENT_MAX_AGE,
      sameSite: 'strict'
    });
    
    // Apply immediately
    this.applyConsentState();
    this.processScriptQueue(); // Process queued scripts after consent update
    
    // Dispatch event
    this.dispatchConsentEvent();
  }
  
  /**
   * Check if category is consented
   */
  hasConsent(category: keyof typeof COOKIE_CATEGORIES): boolean {
    if (category === 'essential') return true;
    return this.consent?.[category] === true;
  }
  
  /**
   * Get full consent state
   */
  getConsent(): ConsentState | null {
    return this.consent;
  }
  
  /**
   * Apply consent state - block/allow scripts and cookies
   */
  private applyConsentState(): void {
    if (!browser) return;
    
    // Clean non-consented cookies
    this.cleanupCookies();
    
    // Handle analytics
    if (this.hasConsent('analytics')) {
      this.enableAnalytics();
    } else {
      this.blockAnalytics();
    }
    
    // Handle marketing
    if (this.hasConsent('marketing')) {
      this.enableMarketing();
    } else {
      this.blockMarketing();
    }
    
    // Process queued scripts
    this.processScriptQueue();
  }
  
  /**
   * Remove cookies based on consent
   */
  private cleanupCookies(): void {
    if (!browser) return;
    
    const allCookies = document.cookie.split(';');
    
    for (const cookie of allCookies) {
      const [name] = cookie.split('=').map(c => c.trim());
      if (!name) continue;
      
      // Check each category
      let shouldKeep = false;
      
      // Always keep essential
      if (COOKIE_CATEGORIES.essential.cookies.includes(name as any)) {
        shouldKeep = true;
      }
      // Check Supabase auth cookies
      else if (name.startsWith('sb-')) {
        shouldKeep = true;
      }
      // Check functional consent
      else if (COOKIE_CATEGORIES.functional.cookies.includes(name as any)) {
        shouldKeep = this.hasConsent('functional');
      }
      // Check analytics consent
      else if (COOKIE_CATEGORIES.analytics.cookies.includes(name as any)) {
        shouldKeep = this.hasConsent('analytics');
      }
      // Check marketing consent
      else if (COOKIE_CATEGORIES.marketing.cookies.includes(name as any)) {
        shouldKeep = this.hasConsent('marketing');
      }
      
      if (!shouldKeep) {
        this.deleteCookie(name);
      }
    }
  }
  
  /**
   * Block all tracking scripts globally
   */
  private setupGlobalBlockers(): void {
    if (!browser) return;
    
    // Google Analytics
    (window as any)['ga-disable-GA_MEASUREMENT_ID'] = true;
    
    // Google Tag Manager
    (window as any).gtag = function() {
      console.log('[Cookie Manager] GTM blocked - no consent');
    };
    
    // Facebook Pixel
    (window as any).fbq = function() {
      console.log('[Cookie Manager] Facebook Pixel blocked - no consent');
    };
    
    // Removed DOM monkey-patching per security plan; use consent-aware loaders instead
  }
  
  /**
   * Enable analytics with consent
   */
  private enableAnalytics(): void {
    if (!browser) return;
    
    // Enable GA
    delete (window as any)['ga-disable-GA_MEASUREMENT_ID'];
    
    // Update consent mode
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
    }
    
    // Consent-aware loaders will handle script injection
  }
  
  /**
   * Block analytics
   */
  private blockAnalytics(): void {
    if (!browser) return;
    
    (window as any)['ga-disable-GA_MEASUREMENT_ID'] = true;
    
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('consent', 'update', {
        'analytics_storage': 'denied'
      });
    }
  }
  
  /**
   * Enable marketing with consent
   */
  private enableMarketing(): void {
    if (!browser) return;
    
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('consent', 'update', {
        'ad_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted'
      });
    }
    
    // Consent-aware loaders will handle script injection
  }
  
  /**
   * Block marketing
   */
  private blockMarketing(): void {
    if (!browser) return;
    
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('consent', 'update', {
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied'
      });
    }
  }
  

  /**
   * Queue script for loading after consent
   */
  queueScript(category: keyof typeof COOKIE_CATEGORIES, loader: () => void): void {
    if (!browser) return;
    
    // If already consented, load immediately
    if (this.hasConsent(category)) {
      try {
        loader();
      } catch (error) {
        console.error(`Failed to load ${category} script:`, error);
      }
      return;
    }
    
    // Otherwise queue for later
    if (!this.scriptQueue.has(category)) {
      this.scriptQueue.set(category, []);
    }
    this.scriptQueue.get(category)!.push(loader);
  }
  
  /**
   * Process queued scripts
   */
  private processScriptQueue(): void {
    if (!browser) return;
    
    for (const [category] of this.scriptQueue) {
      const categoryKey = category as keyof typeof COOKIE_CATEGORIES;
      if (this.hasConsent(categoryKey)) {
        this.loadQueuedScripts(categoryKey);
      }
    }
  }
  
  /**
   * Load queued scripts for category
   */
  private loadQueuedScripts(category: keyof typeof COOKIE_CATEGORIES): void {
    if (!browser) return;
    
    const scripts = this.scriptQueue.get(category);
    if (!scripts || scripts.length === 0) return;
    
    scripts.forEach(loader => {
      try {
        loader();
      } catch (error) {
        console.error(`Failed to load ${category} script:`, error);
      }
    });
    
    // Clear the queue for this category
    this.scriptQueue.set(category, []);
  }

  /**
   * Get CSP nonce from current document
   */
  private getCSPNonce(): string | null {
    // Try to get nonce from existing script tags (SvelteKit provides this)
    const scripts = document.querySelectorAll('script[nonce]');
    if (scripts.length > 0 && scripts[0]) {
      return scripts[0].getAttribute('nonce') || null;
    }
    return null;
  }

  /**
   * Create script element with CSP nonce
   */
  private createScript(src: string, nonce?: string): HTMLScriptElement {
    const script = document.createElement('script');
    const nonceValue = nonce || this.getCSPNonce();
    if (nonceValue) script.setAttribute('nonce', nonceValue);
    script.src = src;
    script.async = true;
    return script;
  }

  /**
   * Consent-aware script loaders (with CSP nonce support)
   */
  loadAnalyticsWithConsent(nonce?: string): void {
    if (!browser || !this.hasConsent('analytics')) return;
    
    // Only load if not already loaded
    if (document.querySelector('script[src*="googletagmanager.com/gtag"]')) return;
    
    const script = this.createScript('https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID', nonce);
    document.head.appendChild(script);
    
    // Initialize gtag
    script.onload = () => {
      if (typeof (window as any).gtag === 'undefined') {
        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).gtag = function() {
          (window as any).dataLayer.push(arguments);
        };
        (window as any).gtag('js', new Date());
        (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
          anonymize_ip: true,
          cookie_flags: 'SameSite=Strict;Secure'
        });
      }
    };
  }

  /**
   * Load marketing scripts with consent
   */
  loadMarketingWithConsent(nonce?: string): void {
    if (!browser || !this.hasConsent('marketing')) return;
    
    // Example: Facebook Pixel (replace with actual marketing scripts)
    const script = this.createScript('https://connect.facebook.net/en_US/fbevents.js', nonce);
    document.head.appendChild(script);
    
    script.onload = () => {
      if (typeof (window as any).fbq === 'undefined') {
        (window as any).fbq = function() {
          if ((window as any).fbq.callMethod) {
            (window as any).fbq.callMethod.apply((window as any).fbq, arguments);
          } else {
            (window as any).fbq.queue.push(arguments);
          }
        };
        (window as any).fbq.push = (window as any).fbq;
        (window as any).fbq.queue = [];
        // Initialize with your Facebook Pixel ID
        // (window as any).fbq('init', 'YOUR_PIXEL_ID');
      }
    };
  }

  /**
   * Load Stripe scripts (functional - always allowed)
   */
  loadStripeScripts(nonce?: string): void {
    if (!browser) return;
    
    // Only load if not already loaded
    if (document.querySelector('script[src*="js.stripe.com"]')) return;
    
    const script = this.createScript('https://js.stripe.com/v3/', nonce);
    document.head.appendChild(script);
  }

  /**
   * Load performance monitoring scripts (functional - always allowed)
   */
  loadPerformanceScripts(nonce?: string): void {
    if (!browser) return;
    
    // Vercel Speed Insights
    if (document.querySelector('script[src*="vercel-insights"]')) return;
    
    const script = this.createScript('https://vitals.vercel-insights.com/v1/vitals', nonce);
    document.head.appendChild(script);
  }

  
  /**
   * Listen for consent changes across tabs
   */
  private listenForChanges(): void {
    if (!browser) return;
    
    window.addEventListener('storage', (e) => {
      if (e.key === COOKIES.CONSENT) {
        this.loadConsent();
        this.applyConsentState();
        this.processScriptQueue();
      }
    });
  }
  
  /**
   * Dispatch consent update event
   */
  private dispatchConsentEvent(): void {
    if (!browser) return;
    
    window.dispatchEvent(new CustomEvent('cookieConsentUpdate', {
      detail: this.consent
    }));
  }
  
  /**
   * Revoke all consent
   */
  revokeConsent(): void {
    this.consent = null;
    this.deleteCookie(COOKIES.CONSENT);
    this.cleanupCookies();
    this.blockAnalytics();
    this.blockMarketing();
    this.scriptQueue.clear(); // Clear script queue when consent is revoked
    this.dispatchConsentEvent();
  }
}

/**
 * Server-side consent checker
 */
export function checkServerConsent(cookies: Cookies, category: keyof typeof COOKIE_CATEGORIES): boolean {
  if (category === 'essential') return true;
  
  const consentCookie = cookies.get(COOKIES.CONSENT);
  if (!consentCookie) return false;
  
  try {
    const consent = JSON.parse(decodeURIComponent(consentCookie));
    return consent[category] === true;
  } catch {
    return false;
  }
}

/**
 * Locale Manager - Production Grade
 */
export class ProductionLocaleManager {
  private static instance: ProductionLocaleManager;
  
  static getInstance(): ProductionLocaleManager {
    if (!ProductionLocaleManager.instance) {
      ProductionLocaleManager.instance = new ProductionLocaleManager();
    }
    return ProductionLocaleManager.instance;
  }
  
  /**
   * Set locale with full SSR sync
   */
  async setLocale(locale: string, skipReload: boolean = false): Promise<void> {
    if (!i18n.locales.includes(locale as i18n.Locale)) {
      throw new Error(`Invalid locale: ${locale}`);
    }
    
    const cookieManager = ProductionCookieManager.getInstance();
    
    // Check functional consent
    if (!cookieManager.hasConsent('functional')) {
      throw new Error('Functional cookies required for locale preference');
    }
    
    // Set cookie with proper options
    cookieManager.setCookie(COOKIES.LOCALE, locale, {
      maxAge: 365 * 24 * 60 * 60,
      sameSite: 'lax',
      secure: !dev
    });
    
    // Update runtime locale
    i18n.setLocale(locale as i18n.Locale);
    
    if (browser) {
      document.documentElement.lang = locale;
      
      // Reload for SSR sync unless skipped
      if (!skipReload) {
        // Use navigation to preserve state better
        const { goto } = await import('$app/navigation');
        await goto(window.location.pathname + window.location.search, { 
          invalidateAll: true,
          replaceState: true 
        });
      }
    }
  }
  
  /**
   * Get locale from cookie
   */
  getLocale(): string {
    if (browser) {
      // Cookie manager available if needed for future functionality
      const match = document.cookie.match(new RegExp(`(^| )${COOKIES.LOCALE}=([^;]+)`));
      const locale = match ? match[2] : null;
      
      if (locale && i18n.locales.includes(locale as i18n.Locale)) {
        return locale;
      }
    }
    
    return 'en';
  }
  
  /**
   * Detect locale from browser
   */
  detectLocale(): string {
    if (!browser) return 'en';
    
    const browserLang = navigator.language.split('-')[0]?.toLowerCase() || 'en';
    
    if (i18n.locales.includes(browserLang as i18n.Locale)) {
      return browserLang;
    }
    
    return 'en';
  }
  
  /**
   * Initialize on client
   */
  initializeClient(): string {
    const stored = this.getLocale();
    
    if (stored !== 'en') {
      i18n.setLocale(stored as i18n.Locale);
      if (browser) {
        document.documentElement.lang = stored;
      }
      return stored;
    }
    
    const detected = this.detectLocale();
    i18n.setLocale(detected as i18n.Locale);
    
    if (browser) {
      document.documentElement.lang = detected;
    }
    
    return detected;
  }
}