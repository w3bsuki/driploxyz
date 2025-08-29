import type { Product } from './types/index.js';
interface Props {
    searchQuery?: string;
    filters?: any;
    onProductClick: (product: Product) => void;
    onFavorite: (product: Product) => void;
    searchFunction: (params: any) => Promise<{
        products: Product[];
        totalCount: number;
        totalPages: number;
    }>;
    translations?: Record<string, any>;
    loadComponent?: (importFn: () => Promise<{
        default: any;
    }>) => Promise<any>;
    createLazyLoader?: (callback: () => void, options?: IntersectionObserverInit) => (node: Element) => any;
    class?: string;
}
declare const LazySearchResults: import("svelte").Component<Props, {}, "">;
type LazySearchResults = ReturnType<typeof LazySearchResults>;
export default LazySearchResults;
