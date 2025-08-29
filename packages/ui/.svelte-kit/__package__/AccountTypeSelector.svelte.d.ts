interface Props {
    selected?: 'personal' | 'premium' | 'brand';
    onSelect?: (type: 'personal' | 'premium' | 'brand') => void;
    class?: string;
    showDiscountCode?: boolean;
    onDiscountCodeChange?: (code: string) => void;
    discountCode?: string;
    translations?: {
        personalTitle?: string;
        personalDescription?: string;
        personalFeatures?: string[];
        premiumTitle?: string;
        premiumDescription?: string;
        premiumFeatures?: string[];
        brandTitle?: string;
        brandDescription?: string;
        brandFeatures?: string[];
        free?: string;
        perMonth?: string;
        popular?: string;
        selected?: string;
        select?: string;
        haveDiscountCode?: string;
        enterCode?: string;
    };
}
declare const AccountTypeSelector: import("svelte").Component<Props, {}, "">;
type AccountTypeSelector = ReturnType<typeof AccountTypeSelector>;
export default AccountTypeSelector;
