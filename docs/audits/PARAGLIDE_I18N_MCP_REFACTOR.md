# Paraglide i18n MCP Refactor Plan

## Overview
This document provides a comprehensive refactor plan for optimizing the Paraglide i18n implementation, including message bundle optimization, locale detection improvements, translation completeness checks, runtime optimization, and build process optimization for production readiness.

## Objectives
- Optimize message bundles for better performance
- Improve locale detection and switching mechanisms
- Ensure translation completeness across all languages
- Optimize runtime performance of i18n operations
- Enhance build process for better development experience
- Implement proper fallback mechanisms

## Prerequisites
- Paraglide JS 2.2.0 or later
- Node.js 22.12.0 or later
- Existing i18n setup with Bulgarian (bg) and English (en) locales

---

## 1. Message Bundle Optimization

### 1.1 Current State Analysis
```bash
# Analyze current message bundles
find packages/i18n/messages -name "*.json" -exec wc -l {} \;

# Check for unused translations
grep -r "i18n\." apps/web/src packages/ui/src --include="*.svelte" --include="*.ts" | \
  sed -E 's/.*i18n\.([a-zA-Z_]+)\(\).*/\1/' | sort | uniq > used_keys.txt

# Find unused keys
comm -23 <(cat packages/i18n/messages/en.json | jq -r 'keys[]' | sort) used_keys.txt
```

### 1.2 Message Bundle Structure Optimization
```typescript
// packages/i18n/src/bundle-optimizer.ts
interface MessageBundle {
  [key: string]: string | MessageBundle;
}

interface OptimizedBundle {
  common: Record<string, string>;
  pages: Record<string, Record<string, string>>;
  components: Record<string, Record<string, string>>;
}

export class BundleOptimizer {
  private bundles: Record<string, MessageBundle> = {};
  
  constructor(private locales: string[]) {}
  
  // Split large bundles into smaller, focused chunks
  optimizeBundles(): OptimizedBundle {
    const optimized: OptimizedBundle = {
      common: {},
      pages: {},
      components: {}
    };
    
    this.locales.forEach(locale => {
      const bundle = this.loadBundle(locale);
      const categorized = this.categorizeMessages(bundle);
      
      optimized.common[locale] = categorized.common;
      optimized.pages[locale] = categorized.pages;
      optimized.components[locale] = categorized.components;
    });
    
    return optimized;
  }
  
  private categorizeMessages(bundle: MessageBundle): {
    common: Record<string, string>;
    pages: Record<string, string>;
    components: Record<string, string>;
  } {
    const categorized = {
      common: {} as Record<string, string>,
      pages: {} as Record<string, string>,
      components: {} as Record<string, string>
    };
    
    Object.entries(bundle).forEach(([key, value]) => {
      if (typeof value === 'string') {
        if (key.startsWith('common_') || key.startsWith('nav_') || key.startsWith('auth_')) {
          categorized.common[key] = value;
        } else if (key.includes('page_') || key.includes('pdp_') || key.includes('listing_')) {
          categorized.pages[key] = value;
        } else {
          categorized.components[key] = value;
        }
      }
    });
    
    return categorized;
  }
  
  private loadBundle(locale: string): MessageBundle {
    // Load bundle from file system
    return require(`../messages/${locale}.json`);
  }
}
```

### 1.3 Lazy Loading Implementation
```typescript
// packages/i18n/src/lazy-loader.ts
export class LazyMessageLoader {
  private loadedBundles = new Map<string, Record<string, string>>();
  private loadingPromises = new Map<string, Promise<Record<string, string>>>();
  
  async loadBundle(locale: string, chunk: string = 'common'): Promise<Record<string, string>> {
    const key = `${locale}-${chunk}`;
    
    if (this.loadedBundles.has(key)) {
      return this.loadedBundles.get(key)!;
    }
    
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key)!;
    }
    
    const promise = this.fetchBundle(locale, chunk);
    this.loadingPromises.set(key, promise);
    
    try {
      const bundle = await promise;
      this.loadedBundles.set(key, bundle);
      return bundle;
    } finally {
      this.loadingPromises.delete(key);
    }
  }
  
  private async fetchBundle(locale: string, chunk: string): Promise<Record<string, string>> {
    const response = await fetch(`/i18n/${locale}/${chunk}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load ${chunk} bundle for ${locale}`);
    }
    return response.json();
  }
  
  preloadBundle(locale: string, chunk: string = 'common'): void {
    // Preload critical bundles
    this.loadBundle(locale, chunk);
  }
}
```

### 1.4 Message Compression
```typescript
// packages/i18n/src/message-compressor.ts
export class MessageCompressor {
  // Compress repetitive message patterns
  compressMessages(messages: Record<string, string>): Record<string, string> {
    const compressed: Record<string, string> = {};
    const patterns = new Map<string, string>();
    
    // Find common patterns
    Object.entries(messages).forEach(([key, value]) => {
      const pattern = this.extractPattern(value);
      if (pattern) {
        if (!patterns.has(pattern)) {
          patterns.set(pattern, `__PATTERN_${patterns.size}__`);
        }
        compressed[key] = value.replace(pattern, patterns.get(pattern)!);
      } else {
        compressed[key] = value;
      }
    });
    
    return compressed;
  }
  
  private extractPattern(message: string): string | null {
    // Extract common patterns like buttons, labels, etc.
    const patterns = [
      /^(Add|Remove|Edit|Delete|Save|Cancel)/,
      /(Loading|Error|Success|Warning)/,
      /(Please|Click here|Learn more)/
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        return match[0];
      }
    }
    
    return null;
  }
}
```

---

## 2. Locale Detection Improvements

### 2.1 Enhanced Locale Detection
```typescript
// packages/i18n/src/locale-detector.ts
export class EnhancedLocaleDetector {
  private static readonly PRIORITY_ORDER = [
    'url',      // URL parameter
    'path',     // URL path
    'cookie',   // User preference
    'header',   // Browser preference
    'timezone', // User timezone
    'default'   // Fallback
  ];
  
  detectLocale(request: {
    url?: URL;
    headers?: Record<string, string>;
    cookies?: Record<string, string>;
  }): string {
    for (const method of EnhancedLocaleDetector.PRIORITY_ORDER) {
      const locale = this.detectByMethod(method, request);
      if (locale && this.isValidLocale(locale)) {
        return locale;
      }
    }
    
    return this.getDefaultLocale();
  }
  
  private detectByMethod(method: string, request: any): string | null {
    switch (method) {
      case 'url':
        return request.url?.searchParams.get('locale');
      
      case 'path':
        const pathMatch = request.url?.pathname?.match(/^\/([a-z]{2})(\/|$)/);
        return pathMatch?.[1] || null;
      
      case 'cookie':
        return request.cookies?.locale || null;
      
      case 'header':
        return this.parseAcceptLanguage(request.headers?.['accept-language']);
      
      case 'timezone':
        return this.getTimezoneLocale(request.headers?.['timezone']);
      
      default:
        return null;
    }
  }
  
  private parseAcceptLanguage(header?: string): string | null {
    if (!header) return null;
    
    const locales = header
      .split(',')
      .map(lang => lang.split(';')[0].trim().toLowerCase())
      .filter(lang => this.isValidLocale(lang));
    
    return locales[0] || null;
  }
  
  private getTimezoneLocale(timezone?: string): string | null {
    if (!timezone) return null;
    
    // Map timezones to locales
    const timezoneMap: Record<string, string> = {
      'Europe/Sofia': 'bg',
      'Europe/Bucharest': 'bg',
      'America/New_York': 'en',
      'Europe/London': 'en'
    };
    
    return timezoneMap[timezone] || null;
  }
  
  private isValidLocale(locale: string): boolean {
    return ['en', 'bg'].includes(locale);
  }
  
  private getDefaultLocale(): string {
    return 'bg'; // Bulgarian as default
  }
}
```

### 2.2 Locale Persistence
```typescript
// packages/i18n/src/locale-persistence.ts
export class LocalePersistence {
  private static readonly COOKIE_NAME = 'driplo_locale';
  private static readonly STORAGE_KEY = 'driplo_locale';
  
  saveLocale(locale: string, options: {
    persistent?: boolean;
    consent?: boolean;
  } = {}): void {
    const { persistent = true, consent = true } = options;
    
    if (persistent && consent) {
      // Save to cookie for server-side access
      document.cookie = `${LocalePersistence.COOKIE_NAME}=${locale}; max-age=${365 * 24 * 60 * 60}; path=/; sameSite=lax`;
    }
    
    // Save to localStorage for client-side persistence
    try {
      localStorage.setItem(LocalePersistence.STORAGE_KEY, locale);
    } catch (error) {
      console.warn('Failed to save locale to localStorage:', error);
    }
  }
  
  loadLocale(): string | null {
    // Try localStorage first (client-side)
    try {
      const stored = localStorage.getItem(LocalePersistence.STORAGE_KEY);
      if (stored) return stored;
    } catch (error) {
      console.warn('Failed to load locale from localStorage:', error);
    }
    
    // Fallback to cookie
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === LocalePersistence.COOKIE_NAME) {
        return value;
      }
    }
    
    return null;
  }
  
  clearLocale(): void {
    // Clear cookie
    document.cookie = `${LocalePersistence.COOKIE_NAME}=; max-age=0; path=/`;
    
    // Clear localStorage
    try {
      localStorage.removeItem(LocalePersistence.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear locale from localStorage:', error);
    }
  }
}
```

### 2.3 Automatic Locale Switching
```typescript
// packages/i18n/src/auto-switcher.ts
export class AutoLocaleSwitcher {
  private detector = new EnhancedLocaleDetector();
  private persistence = new LocalePersistence();
  
  async switchToLocale(locale: string, options: {
    reload?: boolean;
    updateUrl?: boolean;
    savePreference?: boolean;
  } = {}): Promise<void> {
    const {
      reload = true,
      updateUrl = true,
      savePreference = true
    } = options;
    
    // Validate locale
    if (!this.isValidLocale(locale)) {
      throw new Error(`Invalid locale: ${locale}`);
    }
    
    // Update current locale
    this.setCurrentLocale(locale);
    
    // Save preference
    if (savePreference) {
      this.persistence.saveLocale(locale);
    }
    
    // Update URL if needed
    if (updateUrl && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('locale', locale);
      window.history.replaceState({}, '', url.toString());
    }
    
    // Reload page if needed
    if (reload && typeof window !== 'undefined') {
      window.location.reload();
    }
  }
  
  async autoDetectAndSwitch(): Promise<string> {
    const detected = this.detector.detectLocale({
      url: typeof window !== 'undefined' ? window.location : undefined,
      headers: this.getRequestHeaders(),
      cookies: this.getCookies()
    });
    
    await this.switchToLocale(detected, { reload: false });
    return detected;
  }
  
  private setCurrentLocale(locale: string): void {
    // Update runtime locale
    const { setLocale } = require('./runtime');
    setLocale(locale, { reload: false });
  }
  
  private isValidLocale(locale: string): boolean {
    return ['en', 'bg'].includes(locale);
  }
  
  private getRequestHeaders(): Record<string, string> {
    // Extract headers from current request
    return {};
  }
  
  private getCookies(): Record<string, string> {
    const cookies: Record<string, string> = {};
    
    if (typeof document !== 'undefined') {
      document.cookie.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        cookies[name] = value;
      });
    }
    
    return cookies;
  }
}
```

---

## 3. Translation Completeness Check

### 3.1 Completeness Validator
```typescript
// scripts/validate-translations.ts
import fs from 'fs';
import path from 'path';

interface TranslationReport {
  locale: string;
  totalKeys: number;
  translatedKeys: number;
  missingKeys: string[];
  unusedKeys: string[];
  completeness: number;
}

export class TranslationValidator {
  private locales: string[] = ['en', 'bg'];
  private baseMessages: Record<string, string> = {};
  
  async validateTranslations(): Promise<TranslationReport[]> {
    // Load base locale (English)
    this.baseMessages = this.loadMessages('en');
    
    const reports: TranslationReport[] = [];
    
    for (const locale of this.locales) {
      const report = await this.validateLocale(locale);
      reports.push(report);
    }
    
    return reports;
  }
  
  private async validateLocale(locale: string): Promise<TranslationReport> {
    const messages = this.loadMessages(locale);
    const baseKeys = Object.keys(this.baseMessages);
    const translatedKeys = Object.keys(messages);
    
    const missingKeys = baseKeys.filter(key => !translatedKeys.includes(key));
    const unusedKeys = translatedKeys.filter(key => !baseKeys.includes(key));
    
    const totalKeys = baseKeys.length;
    const translatedCount = totalKeys - missingKeys.length;
    const completeness = totalKeys > 0 ? (translatedCount / totalKeys) * 100 : 0;
    
    return {
      locale,
      totalKeys,
      translatedKeys: translatedCount,
      missingKeys,
      unusedKeys,
      completeness: Math.round(completeness * 100) / 100
    };
  }
  
  private loadMessages(locale: string): Record<string, string> {
    const filePath = path.join(__dirname, `../packages/i18n/messages/${locale}.json`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`Failed to load messages for ${locale}:`, error);
      return {};
    }
  }
  
  generateReport(reports: TranslationReport[]): void {
    console.log('\n=== Translation Completeness Report ===\n');
    
    reports.forEach(report => {
      console.log(`Locale: ${report.locale.toUpperCase()}`);
      console.log(`Completeness: ${report.completeness}% (${report.translatedKeys}/${report.totalKeys})`);
      
      if (report.missingKeys.length > 0) {
        console.log(`Missing keys (${report.missingKeys.length}):`);
        report.missingKeys.forEach(key => console.log(`  - ${key}`));
      }
      
      if (report.unusedKeys.length > 0) {
        console.log(`Unused keys (${report.unusedKeys.length}):`);
        report.unusedKeys.forEach(key => console.log(`  - ${key}`));
      }
      
      console.log('');
    });
  }
}

// Run validation
async function main() {
  const validator = new TranslationValidator();
  const reports = await validator.validateTranslations();
  validator.generateReport(reports);
  
  // Exit with error code if any locale is incomplete
  const hasIncompleteTranslations = reports.some(report => report.completeness < 100);
  process.exit(hasIncompleteTranslations ? 1 : 0);
}

main().catch(console.error);
```

### 3.2 Automated Translation Suggestions
```typescript
// scripts/suggest-translations.ts
import { TranslationValidator } from './validate-translations';

export class TranslationSuggester {
  private validator = new TranslationValidator();
  
  async suggestMissingTranslations(): Promise<void> {
    const reports = await this.validator.validateTranslations();
    
    for (const report of reports) {
      if (report.missingKeys.length > 0) {
        console.log(`\n=== Translation Suggestions for ${report.locale.toUpperCase()} ===\n`);
        
        for (const key of report.missingKeys) {
          const baseMessage = this.getBaseMessage(key);
          const suggestion = this.generateSuggestion(baseMessage, report.locale);
          
          console.log(`Key: ${key}`);
          console.log(`Base: ${baseMessage}`);
          console.log(`Suggestion: ${suggestion}`);
          console.log('');
        }
      }
    }
  }
  
  private getBaseMessage(key: string): string {
    const messages = this.validator['baseMessages'];
    return messages[key] || key;
  }
  
  private generateSuggestion(baseMessage: string, targetLocale: string): string {
    // Simple translation rules for common patterns
    const patterns: Record<string, Record<string, string>> = {
      'bg': {
        'Loading': 'Зареждане',
        'Error': 'Грешка',
        'Success': 'Успех',
        'Cancel': 'Отказ',
        'Save': 'Запази',
        'Delete': 'Изтрий',
        'Edit': 'Редактирай',
        'Add': 'Добави',
        'Remove': 'Премахни',
        'Search': 'Търси',
        'Filter': 'Филтър',
        'Sort': 'Сортирай',
        'Price': 'Цена',
        'Category': 'Категория',
        'Brand': 'Марка',
        'Size': 'Размер',
        'Color': 'Цвят'
      }
    };
    
    // Check for exact matches
    if (patterns[targetLocale]?.[baseMessage]) {
      return patterns[targetLocale][baseMessage];
    }
    
    // Check for partial matches
    for (const [english, bulgarian] of Object.entries(patterns[targetLocale] || {})) {
      if (baseMessage.includes(english)) {
        return baseMessage.replace(english, bulgarian);
      }
    }
    
    // Return placeholder for manual translation
    return `[TRANSLATE: ${baseMessage}]`;
  }
}

// Run suggestion generator
async function main() {
  const suggester = new TranslationSuggester();
  await suggester.suggestMissingTranslations();
}

main().catch(console.error);
```

### 3.3 Translation Quality Checker
```typescript
// scripts/check-translation-quality.ts
export class TranslationQualityChecker {
  checkQuality(translations: Record<string, Record<string, string>>): QualityReport {
    const issues: QualityIssue[] = [];
    
    Object.entries(translations).forEach(([locale, messages]) => {
      Object.entries(messages).forEach(([key, value]) => {
        // Check for common quality issues
        this.checkPlaceholders(key, value, issues);
        this.checkLength(key, value, issues);
        this.checkFormatting(key, value, issues);
        this.checkVariables(key, value, issues);
      });
    });
    
    return {
      totalIssues: issues.length,
      issues: issues.sort((a, b) => b.severity - a.severity)
    };
  }
  
  private checkPlaceholders(key: string, value: string, issues: QualityIssue[]): void {
    const basePlaceholders = (key.match(/\{[^}]+\}/g) || []).length;
    const valuePlaceholders = (value.match(/\{[^}]+\}/g) || []).length;
    
    if (basePlaceholders !== valuePlaceholders) {
      issues.push({
        key,
        type: 'placeholder_mismatch',
        severity: 3,
        message: `Placeholder count mismatch: expected ${basePlaceholders}, found ${valuePlaceholders}`,
        value
      });
    }
  }
  
  private checkLength(key: string, value: string, issues: QualityIssue[]): void {
    if (value.length > 200) {
      issues.push({
        key,
        type: 'length_warning',
        severity: 1,
        message: `Translation is too long (${value.length} characters)`,
        value
      });
    }
  }
  
  private checkFormatting(key: string, value: string, issues: QualityIssue[]): void {
    // Check for common formatting issues
    if (value.includes('  ')) {
      issues.push({
        key,
        type: 'double_spaces',
        severity: 1,
        message: 'Contains double spaces',
        value
      });
    }
    
    if (value.startsWith(' ') || value.endsWith(' ')) {
      issues.push({
        key,
        type: 'trailing_spaces',
        severity: 2,
        message: 'Contains leading or trailing spaces',
        value
      });
    }
  }
  
  private checkVariables(key: string, value: string, issues: QualityIssue[]): void {
    // Check for variable consistency
    const variables = value.match(/\{(\w+)\}/g) || [];
    const uniqueVars = new Set(variables.map(v => v.slice(1, -1)));
    
    if (uniqueVars.size !== variables.length) {
      issues.push({
        key,
        type: 'duplicate_variables',
        severity: 2,
        message: 'Contains duplicate variable names',
        value
      });
    }
  }
}

interface QualityIssue {
  key: string;
  type: string;
  severity: number; // 1-3 (low, medium, high)
  message: string;
  value: string;
}

interface QualityReport {
  totalIssues: number;
  issues: QualityIssue[];
}
```

---

## 4. Runtime Optimization

### 4.1 Message Caching
```typescript
// packages/i18n/src/message-cache.ts
export class MessageCache {
  private cache = new Map<string, string>();
  private cacheStats = {
    hits: 0,
    misses: 0,
    size: 0
  };
  
  get(key: string, locale: string): string | undefined {
    const cacheKey = `${locale}:${key}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached !== undefined) {
      this.cacheStats.hits++;
      return cached;
    }
    
    this.cacheStats.misses++;
    return undefined;
  }
  
  set(key: string, locale: string, value: string): void {
    const cacheKey = `${locale}:${key}`;
    
    // Implement LRU eviction if cache is too large
    if (this.cache.size >= 1000) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(cacheKey, value);
    this.cacheStats.size = this.cache.size;
  }
  
  clear(): void {
    this.cache.clear();
    this.cacheStats = { hits: 0, misses: 0, size: 0 };
  }
  
  getStats(): typeof this.cacheStats {
    return { ...this.cacheStats };
  }
}
```

### 4.2 Optimized Message Resolution
```typescript
// packages/i18n/src/optimized-resolver.ts
export class OptimizedMessageResolver {
  private cache = new MessageCache();
  private bundles = new Map<string, Record<string, string>>();
  
  async resolveMessage(key: string, locale: string, fallback?: string): Promise<string> {
    // Check cache first
    const cached = this.cache.get(key, locale);
    if (cached !== undefined) {
      return cached;
    }
    
    // Resolve message
    const resolved = await this.resolveFromBundle(key, locale, fallback);
    
    // Cache result
    this.cache.set(key, locale, resolved);
    
    return resolved;
  }
  
  private async resolveFromBundle(
    key: string, 
    locale: string, 
    fallback?: string
  ): Promise<string> {
    let bundle = this.bundles.get(locale);
    
    if (!bundle) {
      bundle = await this.loadBundle(locale);
      this.bundles.set(locale, bundle);
    }
    
    const message = bundle[key];
    
    if (message) {
      return message;
    }
    
    // Fallback to base locale
    if (locale !== 'en') {
      const baseBundle = this.bundles.get('en') || await this.loadBundle('en');
      this.bundles.set('en', baseBundle);
      
      const baseMessage = baseBundle[key];
      if (baseMessage) {
        return baseMessage;
      }
    }
    
    // Return fallback or key
    return fallback || key;
  }
  
  private async loadBundle(locale: string): Promise<Record<string, string>> {
    // Load bundle from network or file system
    const response = await fetch(`/i18n/${locale}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load bundle for ${locale}`);
    }
    return response.json();
  }
  
  preloadBundles(locales: string[]): Promise<void> {
    return Promise.all(locales.map(locale => this.loadBundle(locale))).then(() => {});
  }
}
```

### 4.3 Performance Monitoring
```typescript
// packages/i18n/src/performance-monitor.ts
export class I18nPerformanceMonitor {
  private metrics = {
    messageResolution: [] as number[],
    bundleLoading: [] as number[],
    cacheHitRate: 0,
    totalRequests: 0,
    cacheHits: 0
  };
  
  startMessageResolution(): () => void {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      this.metrics.messageResolution.push(duration);
      
      // Keep only last 100 measurements
      if (this.metrics.messageResolution.length > 100) {
        this.metrics.messageResolution.shift();
      }
    };
  }
  
  startBundleLoading(): () => void {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      this.metrics.bundleLoading.push(duration);
      
      // Keep only last 50 measurements
      if (this.metrics.bundleLoading.length > 50) {
        this.metrics.bundleLoading.shift();
      }
    };
  }
  
  recordCacheHit(): void {
    this.metrics.cacheHits++;
    this.metrics.totalRequests++;
    this.updateCacheHitRate();
  }
  
  recordCacheMiss(): void {
    this.metrics.totalRequests++;
    this.updateCacheHitRate();
  }
  
  private updateCacheHitRate(): void {
    this.metrics.cacheHitRate = this.metrics.totalRequests > 0 
      ? this.metrics.cacheHits / this.metrics.totalRequests 
      : 0;
  }
  
  getReport(): PerformanceReport {
    return {
      averageMessageResolution: this.calculateAverage(this.metrics.messageResolution),
      averageBundleLoading: this.calculateAverage(this.metrics.bundleLoading),
      cacheHitRate: this.metrics.cacheHitRate,
      totalRequests: this.metrics.totalRequests
    };
  }
  
  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }
}

interface PerformanceReport {
  averageMessageResolution: number;
  averageBundleLoading: number;
  cacheHitRate: number;
  totalRequests: number;
}
```

---

## 5. Build Process Optimization

### 5.1 Build-Time Optimization
```typescript
// packages/i18n/build/optimize.ts
import fs from 'fs';
import path from 'path';

export class BuildOptimizer {
  async optimizeBuild(outputDir: string): Promise<void> {
    // Optimize message bundles
    await this.optimizeMessageBundles(outputDir);
    
    // Generate bundle manifest
    await this.generateBundleManifest(outputDir);
    
    // Create locale-specific chunks
    await this.createLocaleChunks(outputDir);
    
    // Generate type definitions
    await this.generateTypes(outputDir);
  }
  
  private async optimizeMessageBundles(outputDir: string): Promise<void> {
    const locales = ['en', 'bg'];
    
    for (const locale of locales) {
      const bundlePath = path.join(outputDir, `${locale}.json`);
      const bundle = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));
      
      // Remove unused keys
      const optimizedBundle = this.removeUnusedKeys(bundle);
      
      // Compress messages
      const compressedBundle = this.compressBundle(optimizedBundle);
      
      // Write optimized bundle
      fs.writeFileSync(bundlePath, JSON.stringify(compressedBundle));
    }
  }
  
  private removeUnusedKeys(bundle: Record<string, string>): Record<string, string> {
    // Load usage analysis
    const usedKeys = this.loadUsedKeys();
    
    const optimized: Record<string, string> = {};
    
    Object.entries(bundle).forEach(([key, value]) => {
      if (usedKeys.includes(key)) {
        optimized[key] = value;
      }
    });
    
    return optimized;
  }
  
  private loadUsedKeys(): string[] {
    // Load used keys from analysis
    try {
      return JSON.parse(fs.readFileSync('used-keys.json', 'utf8'));
    } catch {
      return [];
    }
  }
  
  private compressBundle(bundle: Record<string, string>): Record<string, string> {
    // Apply compression techniques
    const compressed: Record<string, string> = {};
    
    Object.entries(bundle).forEach(([key, value]) => {
      compressed[key] = this.compressMessage(value);
    });
    
    return compressed;
  }
  
  private compressMessage(message: string): string {
    // Simple compression - remove redundant whitespace
    return message.replace(/\s+/g, ' ').trim();
  }
  
  private async generateBundleManifest(outputDir: string): Promise<void> {
    const manifest = {
      version: Date.now(),
      locales: ['en', 'bg'],
      chunks: {
        common: ['en', 'bg'],
        pages: ['en', 'bg'],
        components: ['en', 'bg']
      },
      hashes: await this.generateHashes(outputDir)
    };
    
    fs.writeFileSync(
      path.join(outputDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
  }
  
  private async generateHashes(outputDir: string): Promise<Record<string, string>> {
    const crypto = require('crypto');
    const hashes: Record<string, string> = {};
    
    const locales = ['en', 'bg'];
    
    for (const locale of locales) {
      const bundlePath = path.join(outputDir, `${locale}.json`);
      const content = fs.readFileSync(bundlePath, 'utf8');
      hashes[locale] = crypto.createHash('md5').update(content).digest('hex');
    }
    
    return hashes;
  }
  
  private async createLocaleChunks(outputDir: string): Promise<void> {
    // Create separate chunks for different parts of the app
    const chunks = ['common', 'pages', 'components'];
    const locales = ['en', 'bg'];
    
    for (const chunk of chunks) {
      for (const locale of locales) {
        const chunkPath = path.join(outputDir, `${locale}-${chunk}.json`);
        
        // Extract chunk-specific messages
        const chunkMessages = this.extractChunkMessages(chunk, locale);
        
        if (Object.keys(chunkMessages).length > 0) {
          fs.writeFileSync(chunkPath, JSON.stringify(chunkMessages));
        }
      }
    }
  }
  
  private extractChunkMessages(chunk: string, locale: string): Record<string, string> {
    // Load full bundle
    const bundlePath = path.join(__dirname, `../messages/${locale}.json`);
    const bundle = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));
    
    // Extract chunk-specific messages
    const chunkMessages: Record<string, string> = {};
    
    Object.entries(bundle).forEach(([key, value]) => {
      if (this.belongsToChunk(key, chunk)) {
        chunkMessages[key] = value;
      }
    });
    
    return chunkMessages;
  }
  
  private belongsToChunk(key: string, chunk: string): boolean {
    const patterns = {
      common: ['common_', 'nav_', 'auth_', 'error_'],
      pages: ['page_', 'pdp_', 'listing_', 'profile_'],
      components: ['btn_', 'form_', 'modal_', 'card_']
    };
    
    return patterns[chunk as keyof typeof patterns]?.some(pattern => 
      key.startsWith(pattern)
    ) || false;
  }
  
  private async generateTypes(outputDir: string): Promise<void> {
    // Generate TypeScript definitions for messages
    const typeDefinitions = this.generateTypeDefinitions();
    
    fs.writeFileSync(
      path.join(outputDir, 'types.d.ts'),
      typeDefinitions
    );
  }
  
  private generateTypeDefinitions(): string {
    return `
export interface MessageKeys {
${this.generateKeyTypeDefinitions()}
}

export type MessageFunction<T extends keyof MessageKeys> = (inputs?: Record<string, any>) => string;
`;
  }
  
  private generateKeyTypeDefinitions(): string {
    // Generate type definitions for all message keys
    const keys = this.getAllMessageKeys();
    
    return keys.map(key => `  ${key}: string;`).join('\n');
  }
  
  private getAllMessageKeys(): string[] {
    // Load all message keys from all locales
    const allKeys = new Set<string>();
    const locales = ['en', 'bg'];
    
    for (const locale of locales) {
      const bundlePath = path.join(__dirname, `../messages/${locale}.json`);
      const bundle = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));
      
      Object.keys(bundle).forEach(key => allKeys.add(key));
    }
    
    return Array.from(allKeys).sort();
  }
}
```

### 5.2 Development-Time Features
```typescript
// packages/i18n/dev/translation-helper.ts
export class TranslationHelper {
  private hotReloadEnabled = false;
  private watcher: any;
  
  enableHotReload(): void {
    if (this.hotReloadEnabled) return;
    
    this.hotReloadEnabled = true;
    this.setupWatcher();
  }
  
  private setupWatcher(): void {
    const chokidar = require('chokidar');
    
    this.watcher = chokidar.watch('packages/i18n/messages/*.json');
    
    this.watcher.on('change', (path: string) => {
      this.handleMessageFileChange(path);
    });
  }
  
  private handleMessageFileChange(filePath: string): void {
    const locale = path.match(/([a-z]{2})\.json$/)?.[1];
    
    if (locale) {
      this.reloadMessages(locale);
      this.notifyClients(locale);
    }
  }
  
  private reloadMessages(locale: string): void {
    // Reload messages for the specified locale
    const messages = this.loadMessages(locale);
    
    // Update runtime messages
    this.updateRuntimeMessages(locale, messages);
  }
  
  private loadMessages(locale: string): Record<string, string> {
    const fs = require('fs');
    const path = require('path');
    
    const filePath = path.join(__dirname, `../messages/${locale}.json`);
    const content = fs.readFileSync(filePath, 'utf8');
    
    return JSON.parse(content);
  }
  
  private updateRuntimeMessages(locale: string, messages: Record<string, string>): void {
    // Update the runtime messages
    const { setLocaleMessages } = require('./runtime');
    setLocaleMessages(locale, messages);
  }
  
  private notifyClients(locale: string): void {
    // Notify all connected clients about the update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('i18n-updated', { 
        detail: { locale } 
      }));
    }
  }
  
  disableHotReload(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
    
    this.hotReloadEnabled = false;
  }
}
```

---

## 6. Implementation Checklist

### 6.1 Pre-Implementation
- [ ] Analyze current message usage patterns
- [ ] Identify performance bottlenecks
- [ ] Set up translation validation workflow
- [ ] Create backup of existing translations

### 6.2 Implementation Tasks
- [ ] Implement message bundle optimization
- [ ] Enhance locale detection mechanisms
- [ ] Set up translation completeness checks
- [ ] Optimize runtime performance
- [ ] Improve build process
- [ ] Add development-time features

### 6.3 Post-Implementation
- [ ] Monitor performance improvements
- [ ] Validate translation completeness
- [ ] Test locale switching functionality
- [ ] Update documentation

---

## 7. Success Criteria

### 7.1 Performance Metrics
- Message resolution under 1ms average
- Bundle size reduced by at least 30%
- Cache hit rate above 90%
- Initial load time under 100ms

### 7.2 Quality Metrics
- 100% translation completeness
- Zero missing translations
- All translations pass quality checks
- Consistent message formatting

### 7.3 Developer Experience
- Hot reload for translations in development
- Clear error messages for missing translations
- Automated translation suggestions
- Comprehensive type safety

---

## 8. Next Steps

1. Implement message bundle optimization
2. Set up automated translation validation
3. Add performance monitoring
4. Create translation management workflow
5. Establish continuous integration checks