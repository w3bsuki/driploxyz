interface Props {
    size?: 'xs' | 'sm' | 'md' | 'lg';
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
    text?: string;
    class?: string;
}
declare const AdminBadge: import("svelte").Component<Props, {}, "">;
type AdminBadge = ReturnType<typeof AdminBadge>;
export default AdminBadge;
