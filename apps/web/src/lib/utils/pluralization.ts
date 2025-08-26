import * as i18n from '@repo/i18n';

/**
 * Pluralization rules for different languages
 */
const PLURALIZATION_RULES = {
  'en': (n: number) => n === 1 ? 'one' : 'other',
  'bg': (n: number) => n === 1 ? 'one' : 'other',
  'ru': (n: number) => {
    if (n % 10 === 1 && n % 100 !== 11) return 'one';
    if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'few';
    return 'many';
  },
  'ua': (n: number) => {
    if (n % 10 === 1 && n % 100 !== 11) return 'one';
    if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'few';
    return 'many';
  }
} as const;

/**
 * Pluralization translations for common UI elements
 */
const PLURAL_TRANSLATIONS = {
  'en': {
    item: { one: 'item', other: 'items' },
    product: { one: 'product', other: 'products' },
    result: { one: 'result', other: 'results' },
    review: { one: 'review', other: 'reviews' },
    follower: { one: 'follower', other: 'followers' },
    following: { one: 'following', other: 'following' },
    sale: { one: 'sale', other: 'sales' },
    order: { one: 'order', other: 'orders' },
    message: { one: 'message', other: 'messages' },
    notification: { one: 'notification', other: 'notifications' },
    minute: { one: 'minute', other: 'minutes' },
    hour: { one: 'hour', other: 'hours' },
    day: { one: 'day', other: 'days' },
    week: { one: 'week', other: 'weeks' },
    month: { one: 'month', other: 'months' },
    year: { one: 'year', other: 'years' },
    like: { one: 'like', other: 'likes' },
    view: { one: 'view', other: 'views' },
    photo: { one: 'photo', other: 'photos' }
  },
  'bg': {
    item: { one: 'артикул', other: 'артикула' },
    product: { one: 'продукт', other: 'продукта' },
    result: { one: 'резултат', other: 'резултата' },
    review: { one: 'отзив', other: 'отзива' },
    follower: { one: 'последовател', other: 'последователи' },
    following: { one: 'следван', other: 'следвани' },
    sale: { one: 'продажба', other: 'продажби' },
    order: { one: 'поръчка', other: 'поръчки' },
    message: { one: 'съобщение', other: 'съобщения' },
    notification: { one: 'известие', other: 'известия' },
    minute: { one: 'минута', other: 'минути' },
    hour: { one: 'час', other: 'часа' },
    day: { one: 'ден', other: 'дни' },
    week: { one: 'седмица', other: 'седмици' },
    month: { one: 'месец', other: 'месеца' },
    year: { one: 'година', other: 'години' },
    like: { one: 'харесване', other: 'харесвания' },
    view: { one: 'преглед', other: 'прегледа' },
    photo: { one: 'снимка', other: 'снимки' }
  },
  'ru': {
    item: { one: 'товар', few: 'товара', many: 'товаров' },
    product: { one: 'продукт', few: 'продукта', many: 'продуктов' },
    result: { one: 'результат', few: 'результата', many: 'результатов' },
    review: { one: 'отзыв', few: 'отзыва', many: 'отзывов' },
    follower: { one: 'подписчик', few: 'подписчика', many: 'подписчиков' },
    following: { one: 'подписка', few: 'подписки', many: 'подписок' },
    sale: { one: 'продажа', few: 'продажи', many: 'продаж' },
    order: { one: 'заказ', few: 'заказа', many: 'заказов' },
    message: { one: 'сообщение', few: 'сообщения', many: 'сообщений' },
    notification: { one: 'уведомление', few: 'уведомления', many: 'уведомлений' },
    minute: { one: 'минута', few: 'минуты', many: 'минут' },
    hour: { one: 'час', few: 'часа', many: 'часов' },
    day: { one: 'день', few: 'дня', many: 'дней' },
    week: { one: 'неделя', few: 'недели', many: 'недель' },
    month: { one: 'месяц', few: 'месяца', many: 'месяцев' },
    year: { one: 'год', few: 'года', many: 'лет' },
    like: { one: 'лайк', few: 'лайка', many: 'лайков' },
    view: { one: 'просмотр', few: 'просмотра', many: 'просмотров' },
    photo: { one: 'фото', few: 'фото', many: 'фото' }
  },
  'ua': {
    item: { one: 'товар', few: 'товари', many: 'товарів' },
    product: { one: 'продукт', few: 'продукти', many: 'продуктів' },
    result: { one: 'результат', few: 'результати', many: 'результатів' },
    review: { one: 'відгук', few: 'відгуки', many: 'відгуків' },
    follower: { one: 'підписник', few: 'підписники', many: 'підписників' },
    following: { one: 'підписка', few: 'підписки', many: 'підписок' },
    sale: { one: 'продаж', few: 'продажі', many: 'продажів' },
    order: { one: 'замовлення', few: 'замовлення', many: 'замовлень' },
    message: { one: 'повідомлення', few: 'повідомлення', many: 'повідомлень' },
    notification: { one: 'сповіщення', few: 'сповіщення', many: 'сповіщень' },
    minute: { one: 'хвилина', few: 'хвилини', many: 'хвилин' },
    hour: { one: 'година', few: 'години', many: 'годин' },
    day: { one: 'день', few: 'дні', many: 'днів' },
    week: { one: 'тиждень', few: 'тижні', many: 'тижнів' },
    month: { one: 'місяць', few: 'місяці', many: 'місяців' },
    year: { one: 'рік', few: 'роки', many: 'років' },
    like: { one: 'вподобання', few: 'вподобання', many: 'вподобань' },
    view: { one: 'перегляд', few: 'перегляди', many: 'переглядів' },
    photo: { one: 'фото', few: 'фото', many: 'фото' }
  }
} as const;

type LocaleKey = keyof typeof PLURAL_TRANSLATIONS;
type PluralKey = keyof typeof PLURAL_TRANSLATIONS['en'];

/**
 * Get pluralized text based on count and locale
 */
export function pluralize(key: PluralKey, count: number, locale?: string): string {
  const currentLocale = (locale || i18n.languageTag()) as LocaleKey;
  
  // Fallback to English if locale not supported
  const translations = PLURAL_TRANSLATIONS[currentLocale] || PLURAL_TRANSLATIONS.en;
  const pluralRule = PLURALIZATION_RULES[currentLocale] || PLURALIZATION_RULES.en;
  
  const rule = pluralRule(count);
  const pluralForms = translations[key];
  
  if (!pluralForms) {
    console.warn(`Missing plural translations for key: ${key}`);
    return key;
  }
  
  // For languages with 3 forms (ru, ua)
  if ('many' in pluralForms && rule === 'many') {
    return pluralForms.many;
  }
  
  if ('few' in pluralForms && rule === 'few') {
    return pluralForms.few;
  }
  
  // Default to 'one' or 'other'
  if ('other' in pluralForms && (rule === 'other' || rule === 'many')) {
    return pluralForms.other;
  }
  
  if ('one' in pluralForms) {
    return pluralForms.one;
  }
  
  // Should never reach here, but return first available form
  return Object.values(pluralForms)[0] as string;
}

/**
 * Format count with pluralized noun
 */
export function formatCount(key: PluralKey, count: number, locale?: string): string {
  const pluralWord = pluralize(key, count, locale);
  return `${count} ${pluralWord}`;
}

/**
 * Format count with short form (e.g., "2.5K items")
 */
export function formatCountShort(key: PluralKey, count: number, locale?: string): string {
  const pluralWord = pluralize(key, count, locale);
  
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M ${pluralWord}`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K ${pluralWord}`;
  } else {
    return `${count} ${pluralWord}`;
  }
}

/**
 * Common pluralization helpers
 */
export const plural = {
  items: (count: number, locale?: string) => formatCount('item', count, locale),
  products: (count: number, locale?: string) => formatCount('product', count, locale),
  results: (count: number, locale?: string) => formatCount('result', count, locale),
  reviews: (count: number, locale?: string) => formatCount('review', count, locale),
  followers: (count: number, locale?: string) => formatCount('follower', count, locale),
  sales: (count: number, locale?: string) => formatCount('sale', count, locale),
  orders: (count: number, locale?: string) => formatCount('order', count, locale),
  messages: (count: number, locale?: string) => formatCount('message', count, locale),
  notifications: (count: number, locale?: string) => formatCount('notification', count, locale),
  views: (count: number, locale?: string) => formatCount('view', count, locale),
  likes: (count: number, locale?: string) => formatCount('like', count, locale),
  photos: (count: number, locale?: string) => formatCount('photo', count, locale)
};