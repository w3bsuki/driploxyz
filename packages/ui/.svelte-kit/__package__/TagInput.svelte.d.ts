interface Props {
    tags?: string[];
    maxTags?: number;
    label?: string;
    placeholder?: string;
    error?: string;
    helpText?: string;
    disabled?: boolean;
    suggestions?: string[];
    class?: string;
    name?: string;
    onTagsChange?: (tags: string[]) => void;
}
declare const TagInput: import("svelte").Component<Props, {}, "tags">;
type TagInput = ReturnType<typeof TagInput>;
export default TagInput;
