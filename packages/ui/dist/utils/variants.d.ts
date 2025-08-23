/**
 * Advanced Component Variant System
 * Provides type-safe variant composition utilities for Svelte 5 components
 */
import type { ButtonVariant, ButtonSize, BadgeVariant, BadgeSize, AvatarSize, AvatarVariant } from '../types.js';
type VariantConfig<TVariants extends Record<string, any>> = {
    base: string;
    variants: TVariants;
    compoundVariants?: Array<{
        conditions: Partial<{
            [K in keyof TVariants]: TVariants[K][keyof TVariants[K]];
        }>;
        className: string;
    }>;
    defaultVariants?: Partial<{
        [K in keyof TVariants]: TVariants[K][keyof TVariants[K]];
    }>;
};
export declare function createVariants<TVariants extends Record<string, any>>(config: VariantConfig<TVariants>): (variants?: Partial<{ [K in keyof TVariants]: TVariants[K][keyof TVariants[K]]; }>, className?: string) => string;
export declare const buttonVariants: (variants?: Partial<{
    variant: string;
    size: string;
}>, className?: string) => string;
export declare const badgeVariants: (variants?: Partial<{
    variant: string;
    size: string;
}>, className?: string) => string;
export declare const avatarVariants: (variants?: Partial<{
    size: string;
    variant: string;
    status: string;
}>, className?: string) => string;
export declare function createResponsiveVariants<T extends Record<string, any>>(baseVariants: T, breakpoints?: Record<string, string>): (responsiveVariants?: Partial<{ [K in keyof T | `${string & keyof typeof breakpoints}:${string & keyof T}`]: T extends Record<string, infer U> ? U : never; }>, className?: string) => string;
export declare function cx(...classes: (string | boolean | undefined | null)[]): string;
export type VariantProps<T extends (...args: any) => any> = T extends (props: infer P, ...args: any) => any ? P : never;
export type ButtonVariantProps = {
    variant?: ButtonVariant;
    size?: ButtonSize;
};
export type BadgeVariantProps = {
    variant?: BadgeVariant;
    size?: BadgeSize;
};
export type AvatarVariantProps = {
    variant?: AvatarVariant;
    size?: AvatarSize;
};
export {};
//# sourceMappingURL=variants.d.ts.map