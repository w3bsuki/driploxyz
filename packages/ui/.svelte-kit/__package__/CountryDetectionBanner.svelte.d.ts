export type CountryCode = 'BG' | 'GB' | 'US' | 'RU' | 'UA' | 'DE' | 'FR' | 'ES' | 'IT' | 'NL' | 'PL' | 'RO';
interface Props {
    detectedCountry: CountryCode;
    currentCountry: CountryCode;
    onAccept: () => void;
    onDismiss: () => void;
}
declare const CountryDetectionBanner: import("svelte").Component<Props, {}, "">;
type CountryDetectionBanner = ReturnType<typeof CountryDetectionBanner>;
export default CountryDetectionBanner;
