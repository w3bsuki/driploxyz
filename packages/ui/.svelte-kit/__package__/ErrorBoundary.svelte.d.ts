import type { Snippet } from 'svelte';
interface ErrorInfo {
    componentStack?: string;
    errorBoundary?: boolean;
    errorBoundaryFound?: boolean;
    [key: string]: unknown;
}
interface Props {
    children: Snippet;
    fallback?: Snippet<[error: Error, retry: () => void]>;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    resetKeys?: unknown[];
    resetOnPropsChange?: boolean;
    isolate?: boolean;
}
declare const ErrorBoundary: import("svelte").Component<Props, {}, "">;
type ErrorBoundary = ReturnType<typeof ErrorBoundary>;
export default ErrorBoundary;
