interface Props {
    type: 'new_seller' | 'pro' | 'brand';
    size?: 'xs' | 'sm' | 'md' | 'lg';
    class?: string;
}
declare const UserBadge: import("svelte").Component<Props, {}, "">;
type UserBadge = ReturnType<typeof UserBadge>;
export default UserBadge;
