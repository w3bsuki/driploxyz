import type { BadgeVariant, BadgeSize } from '../types.js';
interface Props {
    variant?: BadgeVariant;
    size?: BadgeSize;
    class?: string;
    children?: import('svelte').Snippet;
}
declare const Badge: import("svelte").Component<Props, {}, "">;
type Badge = ReturnType<typeof Badge>;
export default Badge;
//# sourceMappingURL=Badge.svelte.d.ts.map