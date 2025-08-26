import type { AvatarSize, AvatarVariant } from '../types';
interface Props {
    src?: string;
    alt?: string;
    name?: string;
    size?: AvatarSize;
    premium?: boolean;
    variant?: AvatarVariant;
    fallback?: string;
    onclick?: () => void;
    class?: string;
}
declare const Avatar: import("svelte").Component<Props, {}, "">;
type Avatar = ReturnType<typeof Avatar>;
export default Avatar;
//# sourceMappingURL=Avatar.svelte.d.ts.map