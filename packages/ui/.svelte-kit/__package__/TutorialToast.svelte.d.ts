interface Props {
    step: number;
    totalSteps: number;
    title: string;
    description: string;
    targetElement?: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    onDismiss?: () => void;
    onNext?: () => void;
}
declare const TutorialToast: import("svelte").Component<Props, {}, "">;
type TutorialToast = ReturnType<typeof TutorialToast>;
export default TutorialToast;
