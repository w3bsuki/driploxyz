type ConditionType = 'brand_new_with_tags' | 'new_without_tags' | 'like_new' | 'good' | 'worn' | 'fair';
interface Props {
    condition: ConditionType;
    translations?: {
        brandNewWithTags?: string;
        newWithoutTags?: string;
        likeNew?: string;
        good?: string;
        worn?: string;
        fair?: string;
    };
}
declare const ConditionBadge: import("svelte").Component<Props, {}, "">;
type ConditionBadge = ReturnType<typeof ConditionBadge>;
export default ConditionBadge;
//# sourceMappingURL=ConditionBadge.svelte.d.ts.map