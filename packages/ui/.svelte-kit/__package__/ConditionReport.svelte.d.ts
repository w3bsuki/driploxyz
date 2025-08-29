interface ConditionDetail {
    aspect: string;
    rating: number;
    notes?: string;
}
interface Props {
    condition: 'new' | 'like-new' | 'good' | 'fair';
    details?: ConditionDetail[];
    images?: string[];
    authenticatedBy?: string;
    description?: string;
    class?: string;
}
declare const ConditionReport: import("svelte").Component<Props, {}, "">;
type ConditionReport = ReturnType<typeof ConditionReport>;
export default ConditionReport;
