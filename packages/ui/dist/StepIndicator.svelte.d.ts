interface Step {
    id: number;
    title: string;
    description?: string;
}
interface Props {
    steps: Step[];
    currentStep: number;
    onStepClick?: (step: number) => void;
    completedSteps?: number[];
    class?: string;
}
declare const StepIndicator: import("svelte").Component<Props, {}, "">;
type StepIndicator = ReturnType<typeof StepIndicator>;
export default StepIndicator;
//# sourceMappingURL=StepIndicator.svelte.d.ts.map