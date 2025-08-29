interface Translations {
    welcomeTitle?: string;
    welcomeContent?: string;
    discoverTitle?: string;
    discoverContent?: string;
    listItemTitle?: string;
    listItemContentBrand?: string;
    listItemContentPersonal?: string;
    stayConnectedTitle?: string;
    stayConnectedContent?: string;
    readyTitle?: string;
    readyContent?: string;
    skip?: string;
    next?: string;
    getStarted?: string;
}
interface Props {
    show: boolean;
    accountType: 'personal' | 'brand';
    onComplete: () => void;
    translations?: Translations;
}
declare const WelcomeTutorialFlow: import("svelte").Component<Props, {}, "">;
type WelcomeTutorialFlow = ReturnType<typeof WelcomeTutorialFlow>;
export default WelcomeTutorialFlow;
