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
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-state-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base disabled:pointer-events-none disabled:opacity-60 data-[state=waiting]:pointer-events-none data-[state=waiting]:opacity-70 touch-manipulation select-none relative',
  variants: {
    variant: {
      primary:
        'bg-text-primary text-text-inverse shadow-sm hover:opacity-90 active:opacity-80',
      secondary:
        'bg-surface-muted text-text-primary border border-border-default hover:bg-surface-emphasis active:bg-surface-subtle',
      outline:
        'border border-border-default bg-surface-base text-text-primary hover:border-border-emphasis hover:bg-surface-subtle active:bg-surface-muted',
      ghost:
        'text-text-primary hover:bg-surface-subtle active:bg-surface-muted',
      danger:
        'bg-status-error-solid text-text-inverse hover:opacity-90 active:opacity-80'
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
    'inline-flex items-center justify-center font-medium rounded-[length:var(--badge-radius)] border border-zinc-200 bg-zinc-50 text-zinc-600 transition-colors duration-[var(--duration-base)] min-h-[length:var(--touch-compact)]',
  variants: {
    variant: {
      primary:
        'bg-zinc-900 text-white border-zinc-900',
      secondary: 'bg-zinc-100 text-zinc-900 border-zinc-200',
      success:
        'bg-zinc-100 text-zinc-900 border-zinc-200',
      warning:
        'bg-zinc-100 text-zinc-900 border-zinc-200',
      error:
        'bg-zinc-100 text-zinc-900 border-zinc-200',
      info:
        'bg-zinc-100 text-zinc-900 border-zinc-200'
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