/**
 * Design Tokens - Central source of design system values
 * Following CSS custom property patterns for theming support
 */
export declare const colors: {
    primary: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
    };
    semantic: {
        success: string;
        warning: string;
        error: string;
        info: string;
    };
    gray: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
    };
};
export declare const typography: {
    fontSizes: {
        xs: string;
        sm: string;
        base: string;
        lg: string;
        xl: string;
        '2xl': string;
        '3xl': string;
        '4xl': string;
    };
    fontWeights: {
        normal: string;
        medium: string;
        semibold: string;
        bold: string;
    };
    lineHeights: {
        tight: string;
        normal: string;
        relaxed: string;
    };
};
export declare const spacing: {
    0: string;
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
    8: string;
    10: string;
    12: string;
    16: string;
    20: string;
};
export declare const borderRadius: {
    none: string;
    sm: string;
    base: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    full: string;
};
export declare const shadows: {
    sm: string;
    base: string;
    md: string;
    lg: string;
    xl: string;
};
export declare const breakpoints: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
};
export declare const animations: {
    duration: {
        fast: string;
        normal: string;
        slow: string;
    };
    easing: {
        ease: string;
        linear: string;
        'ease-in': string;
        'ease-out': string;
        'ease-in-out': string;
    };
};
export declare function generateCSSVariables(theme?: 'light' | 'dark'): string;
//# sourceMappingURL=tokens.d.ts.map