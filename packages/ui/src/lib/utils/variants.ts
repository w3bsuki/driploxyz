/**
 * Advanced Component Variant System
 * Provides type-safe variant composition utilities for Svelte 5 components
 */

import type {
  ButtonVariant,
  ButtonSize,
  BadgeVariant,
  BadgeSize,
  AvatarSize,
  AvatarVariant
} from '../types';

// Generic variant builder type
type VariantConfig<TVariants extends Record<string, Record<string, string>>> = {
  base: string;
  variants: TVariants;
  compoundVariants?: Array<{
    conditions: Partial<{ [K in keyof TVariants]: TVariants[K][keyof TVariants[K]] }>;
    className: string;
  }>;
  defaultVariants?: Partial<{ [K in keyof TVariants]: TVariants[K][keyof TVariants[K]] }>;
};

// Variant builder function
export function createVariants<TVariants extends Record<string, Record<string, string>>>(
  config: VariantConfig<TVariants>
) {
  return function (
    variants: Partial<{ [K in keyof TVariants]: TVariants[K][keyof TVariants[K]] }> = {},
    className = ''
  ): string {
    const classes = [config.base];
    
    // Apply variant classes
    Object.entries(config.variants).forEach(([key, variantOptions]) => {
      const variant = variants[key as keyof typeof variants] ?? config.defaultVariants?.[key as keyof typeof variants];
      if (variant && variantOptions[variant]) {
        classes.push(variantOptions[variant]);
      }
    });
    
    // Apply compound variants
    config.compoundVariants?.forEach(({ conditions, className: compoundClass }) => {
      const matches = Object.entries(conditions).every(([key, value]) => 
        variants[key as keyof typeof variants] === value
      );
      if (matches) {
        classes.push(compoundClass);
      }
    });
    
    // Add custom className
    if (className) {
      classes.push(className);
    }
    
    return classes.filter(Boolean).join(' ');
  };
}

// Pre-configured variant systems for common components
export const buttonVariants = createVariants({
  base:
    'inline-flex items-center justify-center gap-x-[var(--space-2)] font-medium rounded-[length:var(--btn-radius)] transition-colors duration-[var(--duration-base)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface-base)] disabled:pointer-events-none disabled:opacity-60 data-[state=waiting]:pointer-events-none data-[state=waiting]:opacity-70 touch-manipulation select-none relative isolate',
  variants: {
    variant: {
      primary:
        'bg-[color:var(--surface-brand-strong, var(--brand-primary-strong))] text-[color:var(--text-inverse)] shadow-[var(--shadow-sm)] hover:bg-[color:color-mix(in oklch, var(--brand-primary-strong) 92%, black 8%)] hover:shadow-[var(--shadow-md)] active:bg-[color:color-mix(in oklch, var(--brand-primary-strong) 88%, black 12%)]',
      secondary:
        'bg-[color:var(--surface-muted)] text-[color:var(--text-primary)] border border-[color:var(--border-default)] hover:bg-[color:var(--surface-emphasis)] active:bg-[color:var(--surface-subtle)]',
      outline:
        'border border-[color:var(--border-default)] bg-[color:var(--surface-base)] text-[color:var(--text-primary)] hover:border-[color:var(--border-emphasis)] hover:bg-[color:var(--surface-subtle)] active:bg-[color:var(--surface-muted)]',
      ghost:
        'text-[color:var(--text-primary)] hover:bg-[color:var(--state-hover)] active:bg-[color:color-mix(in oklch, var(--state-hover) 80%, var(--surface-muted) 20%)]',
      danger:
        'bg-[color:var(--status-error-solid)] text-[color:var(--text-inverse)] hover:bg-[color:color-mix(in oklch, var(--status-error-solid) 92%, black 8%)] active:bg-[color:color-mix(in oklch, var(--status-error-solid) 88%, black 12%)]'
    },
    size: {
      sm: 'min-h-[length:var(--btn-height-sm)] px-[length:var(--btn-padding-sm)] text-[length:var(--btn-font-sm)]',
      md: 'min-h-[length:var(--btn-height-md)] px-[length:var(--btn-padding-md)] text-[length:var(--btn-font-md)]',
      lg: 'min-h-[length:var(--btn-height-lg)] px-[length:var(--btn-padding-lg)] text-[length:var(--btn-font-lg)]'
    },
    density: {
      spacious: 'gap-x-[var(--space-3)]',
      cozy: 'gap-x-[var(--space-1-5)]',
      compact: 'gap-x-[var(--space-1)]'
    }
  },
  compoundVariants: [
    {
      conditions: { variant: 'outline', size: 'sm' },
      className: 'border-[length:1.5px]'
    }
  ],
  defaultVariants: {
    variant: 'primary',
    size: 'md',
    density: 'spacious'
  }
});

export const badgeVariants = createVariants({
  base:
    'inline-flex items-center justify-center font-medium rounded-[length:var(--badge-radius)] border border-[color:var(--border-subtle)] bg-[color:var(--surface-subtle)] text-[color:var(--text-secondary)] transition-colors duration-[var(--duration-base)] min-h-[length:var(--touch-compact)]',
  variants: {
    variant: {
      primary:
        'bg-[color:var(--surface-brand-subtle, var(--brand-primary-soft))] text-[color:var(--brand-primary-strong)] border-[color:color-mix(in oklch, var(--brand-primary-soft) 80%, var(--brand-primary-strong) 20%)]',
      secondary: 'bg-[color:var(--surface-muted)] text-[color:var(--text-secondary)] border-[color:var(--border-default)]',
      success:
        'bg-[color:var(--status-success-bg)] text-[color:var(--status-success-text)] border-[color:var(--status-success-border)]',
      warning:
        'bg-[color:var(--status-warning-bg)] text-[color:var(--status-warning-text)] border-[color:var(--status-warning-border)]',
      error:
        'bg-[color:var(--status-error-bg)] text-[color:var(--status-error-text)] border-[color:var(--status-error-border)]',
      info:
        'bg-[color:var(--status-info-bg)] text-[color:var(--status-info-text)] border-[color:var(--status-info-border)]'
    },
    size: {
      sm: 'px-[length:calc(var(--badge-padding-x)*0.75)] py-[length:calc(var(--badge-padding-y)*0.75)] text-[length:calc(var(--badge-font)*0.85)]',
      md: 'px-[length:var(--badge-padding-x)] py-[length:var(--badge-padding-y)] text-[length:var(--badge-font)]',
      lg: 'px-[length:calc(var(--badge-padding-x)*1.25)] py-[length:calc(var(--badge-padding-y)*1.1)] text-[length:calc(var(--badge-font)*1.1)]'
    }
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md'
  }
});

export const avatarVariants = createVariants({
  base: 'relative block overflow-hidden',
  variants: {
    size: {
      xs: 'w-8 h-8',
      sm: 'w-10 h-10',
      md: 'w-12 h-12',
      lg: 'w-16 h-16',
      xl: 'w-20 h-20'
    },
    variant: {
      circle: 'rounded-full',
      square: 'rounded-xl'
    },
    status: {
      online: 'ring-2 ring-green-400',
      offline: 'ring-2 ring-gray-300',
      busy: 'ring-2 ring-red-400',
      away: 'ring-2 ring-yellow-400'
    }
  },
  defaultVariants: {
    size: 'md',
    variant: 'circle'
  }
});

// Advanced: Responsive variant system
export function createResponsiveVariants<T extends Record<string, Record<string, string>>>(
  baseVariants: T,
  _breakpoints: Record<string, string> = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px'
  }
) {
  return function (
    responsiveVariants: Partial<{
      [K in keyof T | `${string & keyof typeof _breakpoints}:${string & keyof T}`]: 
        T extends Record<string, infer U> ? U : never;
    }> = {},
    className = ''
  ): string {
    const classes = [];
    
    // Apply base variants
    Object.entries(responsiveVariants).forEach(([key, value]) => {
      if (!key.includes(':')) {
        // Base variant
        const variantClass = baseVariants[key]?.[value as string];
        if (variantClass) classes.push(variantClass);
      } else {
        // Responsive variant: "md:variant"
        const [breakpoint, variantKey] = key.split(':');
        const variantClass = variantKey ? baseVariants[variantKey]?.[value as string] : undefined;
        if (variantClass) classes.push(`${breakpoint}:${variantClass}`);
      }
    });
    
    if (className) classes.push(className);
    return classes.filter(Boolean).join(' ');
  };
}

// Utility for conditional variant application
export function cx(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Type-safe variant props helper
export type VariantProps<T extends (...args: unknown[]) => unknown> = 
  T extends (props: infer P, ...args: unknown[]) => unknown ? P : never;

// Example usage types:
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