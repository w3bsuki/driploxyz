interface Step {
    id: number;
    title: string;
    description?: string;
}
interface Props {
    steps: Step[];
    current?: number;
    currentStep?: number;
    completed?: number;
    completedSteps?: number[];
    onStepClick?: (step: number) => void;
    variant?: 'default' | 'minimal' | 'compact';
    class?: string;
}
declare const StepIndicator: import("svelte").Component<Props, {}, "">;
type StepIndicator = ReturnType<typeof StepIndicator>;
export default StepIndicator;
