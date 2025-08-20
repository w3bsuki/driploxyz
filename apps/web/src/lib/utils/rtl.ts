import * as i18n from '@repo/i18n';

/**
 * RTL (Right-to-Left) language support utilities
 */

// Languages that are written right-to-left
const RTL_LANGUAGES = new Set([
  'ar', // Arabic
  'he', // Hebrew
  'fa', // Persian
  'ur', // Urdu
  'yi', // Yiddish
  'ji', // Yiddish (alternative code)
  'ku', // Kurdish
  'ps', // Pashto
  'sd', // Sindhi
  'ug', // Uyghur
  'dv'  // Dhivehi
]);

/**
 * Check if current locale is RTL
 */
export function isRTL(locale?: string): boolean {
  const currentLocale = locale || i18n.languageTag();
  return RTL_LANGUAGES.has(currentLocale);
}

/**
 * Get text direction for current locale
 */
export function getTextDirection(locale?: string): 'ltr' | 'rtl' {
  return isRTL(locale) ? 'rtl' : 'ltr';
}

/**
 * Get CSS direction property value
 */
export function getCSSDirection(locale?: string): string {
  return getTextDirection(locale);
}

/**
 * Get appropriate margin/padding classes for RTL
 */
export function getRTLClass(ltrClass: string, rtlClass?: string, locale?: string): string {
  if (!isRTL(locale)) {
    return ltrClass;
  }
  
  if (rtlClass) {
    return rtlClass;
  }
  
  // Auto-convert common LTR classes to RTL equivalents
  const rtlMap: Record<string, string> = {
    // Margin
    'ml-': 'mr-',
    'mr-': 'ml-',
    'ml': 'mr',
    'mr': 'ml',
    
    // Padding  
    'pl-': 'pr-',
    'pr-': 'pl-',
    'pl': 'pr',
    'pr': 'pl',
    
    // Text alignment
    'text-left': 'text-right',
    'text-right': 'text-left',
    
    // Float
    'float-left': 'float-right',
    'float-right': 'float-left',
    
    // Flex
    'justify-start': 'justify-end',
    'justify-end': 'justify-start',
    
    // Border
    'border-l': 'border-r',
    'border-r': 'border-l',
    'border-l-': 'border-r-',
    'border-r-': 'border-l-',
    
    // Rounded
    'rounded-l': 'rounded-r',
    'rounded-r': 'rounded-l',
    'rounded-tl': 'rounded-tr',
    'rounded-tr': 'rounded-tl',
    'rounded-bl': 'rounded-br',
    'rounded-br': 'rounded-bl'
  };
  
  let convertedClass = ltrClass;
  
  for (const [ltr, rtl] of Object.entries(rtlMap)) {
    if (convertedClass.includes(ltr)) {
      convertedClass = convertedClass.replace(new RegExp(ltr, 'g'), rtl);
    }
  }
  
  return convertedClass;
}

/**
 * Get flex direction for RTL layouts
 */
export function getFlexDirection(baseDirection: 'row' | 'col' = 'row', locale?: string): string {
  if (baseDirection === 'col') {
    return 'flex-col';
  }
  
  return isRTL(locale) ? 'flex-row-reverse' : 'flex-row';
}

/**
 * Get appropriate icon rotation for RTL (useful for arrows, chevrons)
 */
export function getIconRotation(locale?: string): string {
  return isRTL(locale) ? 'transform rotate-180' : '';
}

/**
 * RTL-aware class builder
 */
export function rtlClasses(classes: {
  base?: string;
  ltr?: string;
  rtl?: string;
}, locale?: string): string {
  const result = [classes.base || ''];
  
  if (isRTL(locale)) {
    if (classes.rtl) {
      result.push(classes.rtl);
    }
  } else {
    if (classes.ltr) {
      result.push(classes.ltr);
    }
  }
  
  return result.filter(Boolean).join(' ');
}

/**
 * Format number for RTL locales (some RTL languages use different number systems)
 */
export function formatNumber(num: number, locale?: string): string {
  const currentLocale = locale || i18n.languageTag();
  
  try {
    return new Intl.NumberFormat(currentLocale).format(num);
  } catch {
    // Fallback to default formatting
    return num.toString();
  }
}

/**
 * Get CSS custom properties for RTL support
 */
export function getRTLCSSVars(locale?: string): Record<string, string> {
  const direction = getTextDirection(locale);
  const isRtl = direction === 'rtl';
  
  return {
    '--text-direction': direction,
    '--start': isRtl ? 'right' : 'left',
    '--end': isRtl ? 'left' : 'right',
    '--margin-start': isRtl ? 'margin-right' : 'margin-left',
    '--margin-end': isRtl ? 'margin-left' : 'margin-right',
    '--padding-start': isRtl ? 'padding-right' : 'padding-left',
    '--padding-end': isRtl ? 'padding-left' : 'padding-right',
    '--border-start': isRtl ? 'border-right' : 'border-left',
    '--border-end': isRtl ? 'border-left' : 'border-right',
    '--transform-x': isRtl ? 'scaleX(-1)' : 'scaleX(1)'
  };
}

/**
 * Apply RTL-aware inline styles to an element
 */
export function applyRTLStyles(element: HTMLElement, locale?: string): void {
  const cssVars = getRTLCSSVars(locale);
  
  Object.entries(cssVars).forEach(([property, value]) => {
    element.style.setProperty(property, value);
  });
  
  element.dir = getTextDirection(locale);
}

/**
 * RTL utility object with common helpers
 */
export const rtl = {
  is: isRTL,
  direction: getTextDirection,
  css: getCSSDirection,
  class: getRTLClass,
  flex: getFlexDirection,
  icon: getIconRotation,
  classes: rtlClasses,
  number: formatNumber,
  vars: getRTLCSSVars,
  apply: applyRTLStyles
};

/**
 * Svelte action for RTL support
 */
export function rtlAction(element: HTMLElement, locale?: string) {
  applyRTLStyles(element, locale);
  
  return {
    update(newLocale?: string) {
      applyRTLStyles(element, newLocale);
    }
  };
}