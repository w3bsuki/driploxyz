interface Props {
    show?: boolean;
    followerName: string;
    followerUsername: string;
    followerAvatar?: string;
    onViewProfile?: () => void;
    onDismiss?: () => void;
    autoHide?: boolean;
    duration?: number;
}
declare const FollowNotificationToast: import("svelte").Component<Props, {}, "">;
type FollowNotificationToast = ReturnType<typeof FollowNotificationToast>;
export default FollowNotificationToast;
