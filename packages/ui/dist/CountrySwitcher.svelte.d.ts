export type CountryCode = 'BG' | 'GB' | 'US' | 'RU' | 'UA' | 'DE' | 'FR' | 'ES' | 'IT' | 'NL' | 'PL' | 'RO';
interface Props {
    currentCountry: CountryCode;
    showFlag?: boolean;
    variant?: 'dropdown' | 'inline' | 'modal';
    onCountryChange?: (country: CountryCode) => void;
}
declare const CountrySwitcher: import("svelte").Component<Props, {}, "">;
type CountrySwitcher = ReturnType<typeof CountrySwitcher>;
export default CountrySwitcher;
//# sourceMappingURL=CountrySwitcher.svelte.d.ts.map