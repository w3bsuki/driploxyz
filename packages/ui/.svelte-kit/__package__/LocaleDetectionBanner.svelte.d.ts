import type { LanguageTag } from '@repo/i18n';
interface Props {
    detectedLocale: LanguageTag;
    detectedCountry?: string | null;
    currentLocale: LanguageTag;
    onAccept: () => void;
    onDismiss: () => void;
}
declare const LocaleDetectionBanner: import("svelte").Component<Props, {}, "">;
type LocaleDetectionBanner = ReturnType<typeof LocaleDetectionBanner>;
export default LocaleDetectionBanner;
