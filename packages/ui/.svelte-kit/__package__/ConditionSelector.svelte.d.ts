type ConditionValue = 'brand_new_with_tags' | 'new_without_tags' | 'like_new' | 'good' | 'worn' | 'fair';
interface Props {
    value?: ConditionValue;
    label?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    class?: string;
    name?: string;
    onchange?: (value: ConditionValue) => void;
}
declare const ConditionSelector: import("svelte").Component<Props, {}, "value">;
type ConditionSelector = ReturnType<typeof ConditionSelector>;
export default ConditionSelector;
