interface Props {
    selected?: 'personal' | 'brand';
    onSelect?: (type: 'personal' | 'brand') => void;
    class?: string;
    translations?: {
        personalTitle?: string;
        personalDescription?: string;
        personalFeatures?: string[];
        brandTitle?: string;
        brandDescription?: string;
        brandFeatures?: string[];
        free?: string;
        perMonth?: string;
        popular?: string;
        selected?: string;
        select?: string;
    };
}
declare const AccountTypeSelector: import("svelte").Component<Props, {}, "">;
type AccountTypeSelector = ReturnType<typeof AccountTypeSelector>;
export default AccountTypeSelector;
//# sourceMappingURL=AccountTypeSelector.svelte.d.ts.map