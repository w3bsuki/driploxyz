/**
 * Advanced Component Variant System
 * Provides type-safe variant composition utilities for Svelte 5 components
 */
// Variant builder function
export function createVariants(config) {
    return function (variants, className) {
        var _a;
        if (variants === void 0) { variants = {}; }
        if (className === void 0) { className = ''; }
        var classes = [config.base];
        // Apply variant classes
        Object.entries(config.variants).forEach(function (_a) {
            var _b, _c;
            var key = _a[0], variantOptions = _a[1];
            var variant = (_b = variants[key]) !== null && _b !== void 0 ? _b : (_c = config.defaultVariants) === null || _c === void 0 ? void 0 : _c[key];
            if (variant && variantOptions[variant]) {
                classes.push(variantOptions[variant]);
            }
        });
        // Apply compound variants
        (_a = config.compoundVariants) === null || _a === void 0 ? void 0 : _a.forEach(function (_a) {
            var conditions = _a.conditions, compoundClass = _a.className;
            var matches = Object.entries(conditions).every(function (_a) {
                var key = _a[0], value = _a[1];
                return variants[key] === value;
            });
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
export var buttonVariants = createVariants({
    base: 'inline-flex items-center justify-center font-medium rounded-lg focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition-all duration-200',
    variants: {
        variant: {
            primary: 'bg-blue-600 text-white focus-visible:ring-blue-500 hover:bg-blue-700',
            secondary: 'bg-gray-100 text-gray-900 focus-visible:ring-gray-500 hover:bg-gray-200',
            outline: 'border border-gray-300 bg-white text-gray-700 focus-visible:ring-gray-500 hover:bg-gray-50',
            ghost: 'text-gray-700 focus-visible:ring-gray-500 hover:bg-gray-100',
            danger: 'bg-red-600 text-white focus-visible:ring-red-500 hover:bg-red-700'
        },
        size: {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2 text-sm',
            lg: 'px-6 py-3 text-base'
        }
    },
    compoundVariants: [
        {
            conditions: { variant: 'outline', size: 'sm' },
            className: 'border-2'
        }
    ],
    defaultVariants: {
        variant: 'primary',
        size: 'md'
    }
});
export var badgeVariants = createVariants({
    base: 'inline-flex items-center justify-center font-medium rounded-full border',
    variants: {
        variant: {
            primary: 'bg-blue-50 text-blue-700 border-blue-200',
            secondary: 'bg-gray-50 text-gray-700 border-gray-200',
            success: 'bg-green-50 text-green-700 border-green-200',
            warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            error: 'bg-red-50 text-red-700 border-red-200',
            info: 'bg-indigo-50 text-indigo-700 border-indigo-200'
        },
        size: {
            sm: 'px-2 py-0.5 text-xs',
            md: 'px-2.5 py-1 text-sm',
            lg: 'px-3 py-1.5 text-base'
        }
    },
    defaultVariants: {
        variant: 'primary',
        size: 'md'
    }
});
export var avatarVariants = createVariants({
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
export function createResponsiveVariants(baseVariants, breakpoints) {
    if (breakpoints === void 0) { breakpoints = {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px'
    }; }
    return function (responsiveVariants, className) {
        if (responsiveVariants === void 0) { responsiveVariants = {}; }
        if (className === void 0) { className = ''; }
        var classes = [];
        // Apply base variants
        Object.entries(responsiveVariants).forEach(function (_a) {
            var _b, _c;
            var key = _a[0], value = _a[1];
            if (!key.includes(':')) {
                // Base variant
                var variantClass = (_b = baseVariants[key]) === null || _b === void 0 ? void 0 : _b[value];
                if (variantClass)
                    classes.push(variantClass);
            }
            else {
                // Responsive variant: "md:variant"
                var _d = key.split(':'), breakpoint = _d[0], variantKey = _d[1];
                var variantClass = (_c = baseVariants[variantKey]) === null || _c === void 0 ? void 0 : _c[value];
                if (variantClass)
                    classes.push("".concat(breakpoint, ":").concat(variantClass));
            }
        });
        if (className)
            classes.push(className);
        return classes.filter(Boolean).join(' ');
    };
}
// Utility for conditional variant application
export function cx() {
    var classes = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        classes[_i] = arguments[_i];
    }
    return classes.filter(Boolean).join(' ');
}
