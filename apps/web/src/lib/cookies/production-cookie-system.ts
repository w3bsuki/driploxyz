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
  LOCALE: 'locale',
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
  private blockedScripts = new Set<string>();
  private scriptQueue = new Map<string, () => void>();
  
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
    return match ? decodeURIComponent(match[2]) : null;
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
    
    // Block script injection - store reference to this
    const manager = this;
    const originalAppendChild = Element.prototype.appendChild;
    Element.prototype.appendChild = function<T extends Node>(node: T): T {
      if (node instanceof HTMLScriptElement) {
        const src = node.src || '';
        
        // Check if script should be blocked
        if (src.includes('googletagmanager.com') && !manager.hasConsent('analytics')) {
          console.log('[Cookie Manager] Blocked GTM script');
          return node;
        }
        if (src.includes('facebook.com') && !manager.hasConsent('marketing')) {
          console.log('[Cookie Manager] Blocked Facebook script');
          return node;
        }
      }
      
      return originalAppendChild.call(this, node);
    };
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
    
    // Load queued analytics scripts
    this.loadQueuedScripts('analytics');
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
    
    // Load queued marketing scripts
    this.loadQueuedScripts('marketing');
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
  queueScript(category: string, loader: () => void): void {
    this.scriptQueue.set(category, loader);
    
    // Load immediately if already consented
    if (category === 'analytics' && this.hasConsent('analytics')) {
      loader();
    } else if (category === 'marketing' && this.hasConsent('marketing')) {
      loader();
    }
  }
  
  /**
   * Process queued scripts
   */
  private processScriptQueue(): void {
    for (const [category, loader] of this.scriptQueue) {
      if ((category === 'analytics' && this.hasConsent('analytics')) ||
          (category === 'marketing' && this.hasConsent('marketing'))) {
        loader();
        this.scriptQueue.delete(category);
      }
    }
  }
  
  /**
   * Load queued scripts for category
   */
  private loadQueuedScripts(category: string): void {
    const loader = this.scriptQueue.get(category);
    if (loader) {
      loader();
      this.scriptQueue.delete(category);
    }
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
    if (!i18n.isAvailableLanguageTag(locale)) {
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
    
    // Update runtime
    i18n.setLanguageTag(locale as any);
    
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
      const cookieManager = ProductionCookieManager.getInstance();
      const match = document.cookie.match(new RegExp(`(^| )${COOKIES.LOCALE}=([^;]+)`));
      const locale = match ? match[2] : null;
      
      if (locale && i18n.isAvailableLanguageTag(locale)) {
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
    
    const browserLang = navigator.language.split('-')[0].toLowerCase();
    
    if (i18n.isAvailableLanguageTag(browserLang)) {
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
      i18n.setLanguageTag(stored as any);
      if (browser) {
        document.documentElement.lang = stored;
      }
      return stored;
    }
    
    const detected = this.detectLocale();
    i18n.setLanguageTag(detected as any);
    
    if (browser) {
      document.documentElement.lang = detected;
    }
    
    return detected;
  }
}