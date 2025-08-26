/**
 * Design Tokens - Central source of design system values
 * Following CSS custom property patterns for theming support
 */
// Color System - OKLCH for modern color consistency
export const colors = {
    // Primary Brand Colors (Blue)
    primary: {
        50: 'oklch(0.97 0.02 240)',
        100: 'oklch(0.94 0.04 240)',
        200: 'oklch(0.88 0.06 240)',
        300: 'oklch(0.78 0.08 240)',
        400: 'oklch(0.68 0.11 240)',
        500: 'oklch(0.58 0.14 240)', // Base primary
        600: 'oklch(0.48 0.16 240)',
        700: 'oklch(0.38 0.15 240)',
        800: 'oklch(0.28 0.12 240)',
        900: 'oklch(0.18 0.08 240)',
    },
    // Semantic Colors
    semantic: {
        success: 'oklch(0.75 0.15 145)', // Green
        warning: 'oklch(0.8 0.12 85)', // Yellow
        error: 'oklch(0.62 0.15 20)', // Red
        info: 'oklch(0.7 0.15 240)', // Blue
    },
    // Neutral Grays
    gray: {
        50: 'oklch(0.98 0.005 270)',
        100: 'oklch(0.96 0.005 270)',
        200: 'oklch(0.95 0.005 270)', // Light borders
        300: 'oklch(0.87 0.01 270)',
        400: 'oklch(0.75 0.015 270)',
        500: 'oklch(0.62 0.02 270)',
        600: 'oklch(0.5 0.025 270)',
        700: 'oklch(0.38 0.025 270)',
        800: 'oklch(0.26 0.02 270)',
        900: 'oklch(0.15 0.015 270)',
    },
    // Additional Colors for Conditions
    green: {
        500: 'oklch(0.58 0.14 145)', // New with tags
        600: 'oklch(0.48 0.16 145)',
    },
    yellow: {
        500: 'oklch(0.8 0.12 85)', // Good condition
        600: 'oklch(0.7 0.13 85)',
    },
    orange: {
        500: 'oklch(0.75 0.15 50)', // Fair/worn
        600: 'oklch(0.65 0.16 50)',
    },
    red: {
        500: 'oklch(0.58 0.14 0)', // Poor condition
        600: 'oklch(0.48 0.16 0)',
    }
};
// Typography Scale
export const typography = {
    fontSizes: {
        '2xs': '0.6875rem', // 11px - fine print
        xs: '0.75rem', // 12px - badges, labels
        sm: '0.875rem', // 14px - secondary text
        base: '1rem', // 16px - body text (prevents mobile zoom)
        lg: '1.125rem', // 18px - emphasized text
        xl: '1.25rem', // 20px - section headings
        '2xl': '1.5rem', // 24px - page headings
        '3xl': '1.875rem', // 30px - hero headings
        '4xl': '2.25rem', // 36px - display text
    },
    fontWeights: {
        light: '300',
        normal: '400',
        medium: '500', // Default for UI elements
        semibold: '600', // Headings, emphasis
        bold: '700', // Strong emphasis
    },
    lineHeights: {
        display: '1.1', // Large headings
        heading: '1.25', // Section headings
        body: '1.5', // Body text
        caption: '1.4', // Small text
        relaxed: '1.625', // Reading text
    }
};
// Spacing System (Based on 4px grid)
export const spacing = {
    0: '0',
    '0.5': '0.125rem', // 2px - fine details
    1: '0.25rem', // 4px - minimal spacing
    '1.5': '0.375rem', // 6px - compact elements
    2: '0.5rem', // 8px - tight spacing
    '2.5': '0.625rem', // 10px - standard small
    3: '0.75rem', // 12px - standard medium
    4: '1rem', // 16px - comfortable
    5: '1.25rem', // 20px - generous
    6: '1.5rem', // 24px - spacious
    8: '2rem', // 32px - section spacing
    10: '2.5rem', // 40px - large sections
    12: '3rem', // 48px - major sections
    16: '4rem', // 64px - page sections
    20: '5rem', // 80px - hero sections
};
// Border Radius
export const borderRadius = {
    none: '0',
    sm: '0.125rem', // 2px
    base: '0.25rem', // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem', // 8px
    xl: '0.75rem', // 12px
    '2xl': '1rem', // 16px
    full: '9999px',
};
// Shadows
export const shadows = {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
};
// Breakpoints
export const breakpoints = {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
};
// Animation Durations
export const animations = {
    duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
    },
    easing: {
        ease: 'ease',
        linear: 'linear',
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    }
};
// Component-level token exports (use these in components, not CSS vars)
// CSS variables are defined in app.css @theme block - DO NOT duplicate
export const componentTokens = {
    button: {
        sizes: {
            sm: { px: '3', py: '1.5', text: 'sm', minHeight: '32px' }, // Compact
            md: { px: '4', py: '2', text: 'sm', minHeight: '36px' }, // Standard
            lg: { px: '5', py: '2.5', text: 'base', minHeight: '40px' } // Primary CTAs
        },
        variants: {
            primary: 'bg-gray-900 text-white hover:bg-gray-800', // Black primary
            secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
            outline: 'border-2 border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
            ghost: 'text-gray-700 hover:bg-gray-100',
            danger: 'bg-red-600 text-white hover:bg-red-700'
        }
    },
    card: {
        padding: { mobile: '4', desktop: '6' },
        radius: 'lg',
        shadow: 'sm',
        border: 'border-gray-200'
    },
    modal: {
        sizes: {
            sm: 'max-w-md', // 448px
            md: 'max-w-lg', // 512px
            lg: 'max-w-2xl', // 672px
            xl: 'max-w-4xl', // 896px
            full: 'max-w-7xl' // 1280px
        }
    },
    form: {
        input: {
            padding: 'px-3 py-2.5',
            text: 'base sm:text-sm',
            border: 'border-gray-300',
            focus: 'focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20'
        }
    }
};
