interface Props {
    show?: boolean;
    onClose?: () => void;
    accountType?: 'personal' | 'brand';
    translations?: {
        welcomeBrand?: string;
        welcomePersonal?: string;
        brandProfileSetup?: string;
        profileComplete?: string;
        profileCreated?: string;
        profileVerified?: string;
        brandPending?: string;
        paymentReady?: string;
        goToDashboard?: string;
        startExploring?: string;
    };
}
declare const OnboardingSuccessModal: import("svelte").Component<Props, {}, "">;
type OnboardingSuccessModal = ReturnType<typeof OnboardingSuccessModal>;
export default OnboardingSuccessModal;
