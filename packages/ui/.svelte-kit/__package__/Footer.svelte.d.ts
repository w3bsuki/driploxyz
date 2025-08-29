interface Props {
    currentLanguage?: string;
    onLanguageChange?: (lang: string) => void;
    translations?: {
        company?: string;
        about?: string;
        careers?: string;
        press?: string;
        support?: string;
        help?: string;
        trustSafety?: string;
        legal?: string;
        privacy?: string;
        terms?: string;
        cookies?: string;
        returns?: string;
        community?: string;
        blog?: string;
        newsletter?: string;
        followUs?: string;
        madeWith?: string;
        in?: string;
        bulgaria?: string;
        allRightsReserved?: string;
        newsletterPlaceholder?: string;
        subscribe?: string;
    };
}
declare const Footer: import("svelte").Component<Props, {}, "">;
type Footer = ReturnType<typeof Footer>;
export default Footer;
//# sourceMappingURL=Footer.svelte.d.ts.map