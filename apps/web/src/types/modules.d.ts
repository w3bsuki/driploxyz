declare module '@repo/i18n' {
  export type Locale = 'en' | 'bg';
  export type LanguageTag = Locale;

  export function setLocale(locale: Locale): void;
  export function getLocale(): Locale;
  export function isLocale(locale: string): locale is Locale;
  export const locales: readonly Locale[];
  export const baseLocale: Locale;

  export const languageTag: () => Locale;
  export const setLanguageTag: (locale: Locale) => void;
  export const availableLanguageTags: readonly Locale[];
  export const isAvailableLanguageTag: (locale: string) => locale is Locale;

  export const languageNames: Record<Locale, string>;
  export function detectLanguage(acceptLanguage?: string): Locale;
  export const LOCALE_ALIASES: Record<string, Locale>;

  export function detectLocale(input: {
    path?: string;
    query?: URLSearchParams | null;
    cookie?: string | null;
    header?: string | null;
    defaultLocale?: Locale;
  }): Locale;

  export function applyLocale(locale: Locale): void;

  // Message functions
  export function hello(): string;
  export function add_to_favorites(): string;
  export function addfavorite1(): string;
  export function admin_amount(): string;
  export function admin_back(): string;
  export function admin_backtosite2(): string;
  export function admin_buyer(): string;
  export function admin_commission(): string;
  export function admin_created(): string;
  export function admin_dashboard(): string;
  export function admin_date(): string;
  export function admin_delivered(): string;
  export function admin_driploadmin1(): string;
  export function admin_loading(): string;
  export function admin_managepayouts1(): string;
  export function admin_markcompleted1(): string;
  export function admin_markfailed1(): string;
  export function admin_monitormetrics1(): string;
  export function admin_noorders1(): string;
  export function admin_nopendingpayouts2(): string;
  export function admin_noprocessingpayouts2(): string;
  export function admin_orderid1(): string;
  export function admin_payoutmanagement1(): string;
  export function admin_payoutsappearhere2(): string;
  export function admin_pending(): string;
  export function admin_pendingpayouts1(): string;
  export function admin_platformcommission1(): string;
  export function admin_processing(): string;
  export function admin_recentorders1(): string;
  export function admin_ref(): string;
  export function admin_refresh(): string;
  export function admin_seller(): string;
  export function admin_startprocessing1(): string;
  export function admin_status(): string;
  export function admin_totalorders1(): string;
  export function admin_totalpendingamount2(): string;
  export function admin_totalproducts1(): string;
  export function admin_totalrevenue1(): string;
  export function admin_totalusers1(): string;
  export function admin_trackprocesspayouts2(): string;
  export function admin_viewmainsite2(): string;

  // Add other message functions as needed
  export function auth_alreadyhaveaccount2(): string;
  export function auth_and(): string;
  export function auth_confirmpassword1(): string;
  export function auth_createaccount1(): string;
  export function auth_donthaveaccount2(): string;
  export function auth_email(): string;
  export function auth_firstname1(): string;
  export function auth_forgotpassword1(): string;
  export function auth_lastname1(): string;
  export function auth_orcontinuewith2(): string;
  export function auth_password(): string;
  export function auth_privacypolicy1(): string;
  export function auth_rememberme1(): string;
  export function auth_signin1(): string;
  export function auth_signout1(): string;
  export function auth_signup1(): string;
  export function auth_termsagreement1(): string;
  export function auth_termsofservice2(): string;
  export function auth_username(): string;

  // Category functions
  export function category_accessories(): string;
  export function category_activewear(): string;
  export function category_all(): string;
  export function category_bags(): string;
  export function category_clothing(): string;
  export function category_jewelry(): string;
  export function category_kids(): string;
  export function category_men(): string;
  export function category_shoes(): string;
  export function category_women(): string;
}