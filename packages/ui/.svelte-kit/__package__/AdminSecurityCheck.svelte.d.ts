interface Props {
    isOpen: boolean;
    operation: string;
    onClose: () => void;
    onConfirm: (securityCode: string) => Promise<void>;
}
/**
 * AdminSecurityCheck - Multi-factor admin verification
 * Requires additional verification for sensitive admin operations
 */
declare const AdminSecurityCheck: import("svelte").Component<Props, {}, "">;
type AdminSecurityCheck = ReturnType<typeof AdminSecurityCheck>;
export default AdminSecurityCheck;
//# sourceMappingURL=AdminSecurityCheck.svelte.d.ts.map