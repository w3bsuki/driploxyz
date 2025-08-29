interface Translations {
    newMessage?: string;
    reply?: string;
    dismiss?: string;
    now?: string;
}
interface Props {
    show?: boolean;
    sender: {
        id: string;
        username: string;
        avatar_url?: string;
    };
    message: string;
    product?: {
        id: string;
        title: string;
        image: string;
    };
    onReply?: () => void;
    onDismiss?: () => void;
    autoHide?: boolean;
    duration?: number;
    translations?: Translations;
}
declare const MessageNotificationToast: import("svelte").Component<Props, {}, "">;
type MessageNotificationToast = ReturnType<typeof MessageNotificationToast>;
export default MessageNotificationToast;
