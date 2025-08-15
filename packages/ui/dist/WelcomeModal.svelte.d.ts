interface WelcomeStep {
    id: string;
    title: string;
    description: string;
    icon: string;
    gradient?: string;
    color?: string;
}
interface Translations {
    welcome?: string;
    welcomeBrand?: string;
    welcomePersonal?: string;
    discover?: string;
    discoverDesc?: string;
    sell?: string;
    sellDesc?: string;
    ready?: string;
    readyDesc?: string;
    back?: string;
    next?: string;
    getStarted?: string;
    skip?: string;
    designer?: string;
    vintage?: string;
    trending?: string;
    totalSales?: string;
    happySellers?: string;
    trustedMarketplace?: string;
}
interface Props {
    show?: boolean;
    steps?: WelcomeStep[];
    currentStep?: number;
    onNext?: () => void;
    onPrevious?: () => void;
    onComplete?: () => void;
    onSkip?: () => void;
    translations?: Translations;
}
declare const WelcomeModal: import("svelte").Component<Props, {}, "">;
type WelcomeModal = ReturnType<typeof WelcomeModal>;
export default WelcomeModal;
//# sourceMappingURL=WelcomeModal.svelte.d.ts.map