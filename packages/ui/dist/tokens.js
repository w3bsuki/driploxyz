/**
 * Design Tokens - Central source of design system values
 * Following CSS custom property patterns for theming support
 */
// Color System
export var colors = {
    // Primary Brand Colors
    primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6', // Base primary
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
    },
    // Semantic Colors
    semantic: {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
    },
    // Neutral Grays
    gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
    }
};
// Typography Scale
export var typography = {
    fontSizes: {
        xs: '0.75rem', // 12px
        sm: '0.875rem', // 14px
        base: '1rem', // 16px
        lg: '1.125rem', // 18px
        xl: '1.25rem', // 20px
        '2xl': '1.5rem', // 24px
        '3xl': '1.875rem', // 30px
        '4xl': '2.25rem', // 36px
    },
    fontWeights: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    },
    lineHeights: {
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.625',
    }
};
// Spacing System (Based on 4px grid)
export var spacing = {
    0: '0',
    1: '0.25rem', // 4px
    2: '0.5rem', // 8px
    3: '0.75rem', // 12px
    4: '1rem', // 16px
    5: '1.25rem', // 20px
    6: '1.5rem', // 24px
    8: '2rem', // 32px
    10: '2.5rem', // 40px
    12: '3rem', // 48px
    16: '4rem', // 64px
    20: '5rem', // 80px
};
// Border Radius
export var borderRadius = {
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
export var shadows = {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
};
// Breakpoints
export var breakpoints = {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
};
// Animation Durations
export var animations = {
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
// CSS Custom Properties Generator
export function generateCSSVariables(theme) {
    if (theme === void 0) { theme = 'light'; }
    var vars = {
        // Colors
        '--color-primary': colors.primary[500],
        '--color-primary-hover': colors.primary[600],
        '--color-primary-light': colors.primary[50],
        '--color-success': colors.semantic.success,
        '--color-warning': colors.semantic.warning,
        '--color-error': colors.semantic.error,
        '--color-info': colors.semantic.info,
        // Neutral colors (theme-aware)
        '--color-background': theme === 'light' ? colors.gray[50] : colors.gray[900],
        '--color-surface': theme === 'light' ? '#ffffff' : colors.gray[800],
        '--color-text-primary': theme === 'light' ? colors.gray[900] : colors.gray[50],
        '--color-text-secondary': theme === 'light' ? colors.gray[600] : colors.gray[300],
        '--color-border': theme === 'light' ? colors.gray[200] : colors.gray[700],
        // Spacing
        '--spacing-xs': spacing[1],
        '--spacing-sm': spacing[2],
        '--spacing-md': spacing[4],
        '--spacing-lg': spacing[6],
        '--spacing-xl': spacing[8],
        // Typography
        '--font-size-sm': typography.fontSizes.sm,
        '--font-size-base': typography.fontSizes.base,
        '--font-size-lg': typography.fontSizes.lg,
        '--font-weight-normal': typography.fontWeights.normal,
        '--font-weight-semibold': typography.fontWeights.semibold,
        // Border radius
        '--radius-sm': borderRadius.sm,
        '--radius-md': borderRadius.md,
        '--radius-lg': borderRadius.lg,
        // Shadows
        '--shadow-sm': shadows.sm,
        '--shadow-md': shadows.md,
        '--shadow-lg': shadows.lg,
    };
    return Object.entries(vars)
        .map(function (_a) {
        var key = _a[0], value = _a[1];
        return "".concat(key, ": ").concat(value, ";");
    })
        .join('\n  ');
}
