interface WelcomeStep {
    id: string;
    title: string;
    description: string;
    icon: string;
    gradient?: string;
    color?: string;
}
interface Props {
    show?: boolean;
    steps?: WelcomeStep[];
    currentStep?: number;
    onNext?: () => void;
    onPrevious?: () => void;
    onComplete?: () => void;
    onSkip?: () => void;
}
declare const WelcomeModal: import("svelte").Component<Props, {}, "">;
type WelcomeModal = ReturnType<typeof WelcomeModal>;
export default WelcomeModal;
//# sourceMappingURL=WelcomeModal.svelte.d.ts.map