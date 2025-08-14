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
}
declare const MessageNotificationToast: import("svelte").Component<Props, {}, "">;
type MessageNotificationToast = ReturnType<typeof MessageNotificationToast>;
export default MessageNotificationToast;
//# sourceMappingURL=MessageNotificationToast.svelte.d.ts.map