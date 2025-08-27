import type { Product } from './types';
interface Props {
    sellerId: string;
    sellerUsername: string;
    sellerAvatar?: string;
    sellerRating?: number;
    initialItem: Product;
    onConfirm: (items: Product[]) => void;
    onCancel: () => void;
    open?: boolean;
    supabaseClient: any;
    translations: {
        bundle_title: () => string;
        bundle_subtitle: () => string;
        bundle_shipTogether: () => string;
        bundle_savePerItem: () => string;
        bundle_yourBundle: () => string;
        bundle_item: () => string;
        bundle_items: () => string;
        bundle_justThisItem: () => string;
        bundle_addTwoItems: () => string;
        bundle_addThreeItems: () => string;
        bundle_addFiveItems: () => string;
        bundle_saveAmount: () => string;
        bundle_addMoreFrom: () => string;
        bundle_noOtherItems: () => string;
        bundle_showAll: () => string;
        bundle_itemsTotal: () => string;
        bundle_shipping: () => string;
        bundle_serviceFee: () => string;
        bundle_youSave: () => string;
        bundle_total: () => string;
        bundle_continueToCheckout: () => string;
        bundle_checkoutItems: () => string;
        bundle_quickOptions: () => string;
        bundle_loading: () => string;
        bundle_saveOnShipping: () => string;
    };
}
declare const BundleBuilder: import("svelte").Component<Props, {}, "">;
type BundleBuilder = ReturnType<typeof BundleBuilder>;
export default BundleBuilder;
//# sourceMappingURL=BundleBuilder.svelte.d.ts.map