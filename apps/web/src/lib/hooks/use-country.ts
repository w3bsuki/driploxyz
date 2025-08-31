import { page } from '$app/stores';
import { derived } from 'svelte/store';
import { COUNTRY_CONFIGS, type CountryCode } from '$lib/country/detection';

/**
 * Client-side hook to access current country configuration
 * Gets country from page data (set by server-side country detection)
 */
export const useCountry = derived(page, ($page) => {
  const countryCode = ($page.data?.country || 'BG') as CountryCode;
  const config = COUNTRY_CONFIGS[countryCode];
  
  return {
    code: countryCode,
    config,
    currency: config.currency,
    locale: config.locale,
    formatPrice: (price: number) => {
      const formatter = new Intl.NumberFormat(
        config.locale === 'bg' ? 'bg-BG' : 'en-GB',
        {
          style: 'currency',
          currency: config.currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }
      );
      return formatter.format(price);
    }
  };
});