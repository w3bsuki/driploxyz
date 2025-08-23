interface CookieConsent {
    necessary: boolean;
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
    timestamp: string;
    locale?: string;
    ipCountry?: string;
}
interface Props {
    privacyUrl?: string;
    onLocaleChange?: (locale: string) => void;
    onConsentChange?: (consent: CookieConsent) => void;
}
declare const CookieConsentAdvanced: import("svelte").Component<Props, {}, "">;
type CookieConsentAdvanced = ReturnType<typeof CookieConsentAdvanced>;
export default CookieConsentAdvanced;
//# sourceMappingURL=CookieConsentAdvanced.svelte.d.ts.map