import * as i18n from '@repo/i18n';

// Locale mappings for Intl date formatting
const LOCALE_MAP: Record<string, string> = {
  'en': 'en-US',
  'bg': 'bg-BG'
};

/**
 * Format date using Intl.DateTimeFormat for proper locale-specific formatting
 */
export function formatDate(date: Date | string | number, options?: Intl.DateTimeFormatOptions, locale?: string): string {
  const currentLocale = locale || i18n.getLocale();
  const intlLocale = LOCALE_MAP[currentLocale] || 'en-US';
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  try {
    return new Intl.DateTimeFormat(intlLocale, { ...defaultOptions, ...options }).format(dateObj);
  } catch (error) {
    console.warn('Date formatting failed, using fallback:', error);
    return dateObj.toLocaleDateString(intlLocale);
  }
}

/**
 * Format date and time
 */
export function formatDateTime(date: Date | string | number, locale?: string): string {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }, locale);
}

/**
 * Format time only
 */
export function formatTime(date: Date | string | number, locale?: string): string {
  return formatDate(date, {
    hour: '2-digit',
    minute: '2-digit'
  }, locale);
}

/**
 * Format relative time (e.g., "2 hours ago", "yesterday")
 */
export function formatRelativeTime(date: Date | string | number, locale?: string): string {
  const currentLocale = locale || i18n.getLocale();
  const intlLocale = LOCALE_MAP[currentLocale] || 'en-US';
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);
  
  try {
    const rtf = new Intl.RelativeTimeFormat(intlLocale, { numeric: 'auto' });
    
    if (Math.abs(diffYear) >= 1) {
      return rtf.format(-diffYear, 'year');
    } else if (Math.abs(diffMonth) >= 1) {
      return rtf.format(-diffMonth, 'month');
    } else if (Math.abs(diffWeek) >= 1) {
      return rtf.format(-diffWeek, 'week');
    } else if (Math.abs(diffDay) >= 1) {
      return rtf.format(-diffDay, 'day');
    } else if (Math.abs(diffHour) >= 1) {
      return rtf.format(-diffHour, 'hour');
    } else if (Math.abs(diffMin) >= 1) {
      return rtf.format(-diffMin, 'minute');
    } else {
      return rtf.format(-diffSec, 'second');
    }
  } catch (error) {
    console.warn('Relative time formatting failed, using fallback:', error);
    return formatRelativeTimeFallback(diffMs, currentLocale);
  }
}

/**
 * Fallback relative time formatting
 */
function formatRelativeTimeFallback(diffMs: number, locale: string): string {
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  const translations = {
    en: {
      now: 'just now',
      min: 'minute',
      mins: 'minutes',
      hour: 'hour', 
      hours: 'hours',
      day: 'day',
      days: 'days',
      ago: 'ago'
    },
    bg: {
      now: 'току-що',
      min: 'минута',
      mins: 'минути',
      hour: 'час',
      hours: 'часа',
      day: 'ден',
      days: 'дни',
      ago: 'преди'
    },
  };
  
  const t = translations[locale as keyof typeof translations] || translations.en;
  
  if (diffSec < 60) return t.now;
  if (diffMin < 60) return `${diffMin} ${diffMin === 1 ? t.min : t.mins} ${t.ago}`;
  if (diffHour < 24) return `${diffHour} ${diffHour === 1 ? t.hour : t.hours} ${t.ago}`;
  return `${diffDay} ${diffDay === 1 ? t.day : t.days} ${t.ago}`;
}

/**
 * Format duration (e.g., "2h 30m")
 */
export function formatDuration(ms: number, locale?: string): string {
  const currentLocale = locale || i18n.getLocale();
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  const units = {
    en: { d: 'd', h: 'h', m: 'm', s: 's' },
    bg: { d: 'д', h: 'ч', m: 'м', s: 'с' },
  };
  
  const unit = units[currentLocale as keyof typeof units] || units.en;
  
  if (days > 0) {
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}${unit.d} ${remainingHours}${unit.h}` : `${days}${unit.d}`;
  } else if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}${unit.h} ${remainingMinutes}${unit.m}` : `${hours}${unit.h}`;
  } else if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}${unit.m} ${remainingSeconds}${unit.s}` : `${minutes}${unit.m}`;
  } else {
    return `${seconds}${unit.s}`;
  }
}