var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
/**
 * Intersection Observer for lazy loading components
 */
export function createLazyLoader(callback, options) {
    if (options === void 0) { options = {}; }
    return function (node) {
        if (!window.IntersectionObserver) {
            // Fallback for browsers without IntersectionObserver
            callback();
            return;
        }
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    callback();
                    observer.disconnect();
                }
            });
        }, __assign({ rootMargin: '100px' }, options));
        observer.observe(node);
        return {
            destroy: function () {
                observer.disconnect();
            }
        };
    };
}
/**
 * Virtual scrolling utility for large lists
 */
var VirtualList = /** @class */ (function () {
    function VirtualList(container, items, itemHeight, visibleCount) {
        var _this = this;
        this.scrollTop = 0;
        this.startIndex = 0;
        this.endIndex = 0;
        this.onScroll = function (event) {
            var target = event.target;
            _this.scrollTop = target.scrollTop;
            _this.updateVisibleRange();
        };
        this.container = container;
        this.items = items;
        this.itemHeight = itemHeight;
        this.visibleCount = visibleCount;
        this.endIndex = Math.min(visibleCount, items.length);
    }
    VirtualList.prototype.updateVisibleRange = function () {
        this.startIndex = Math.floor(this.scrollTop / this.itemHeight);
        this.endIndex = Math.min(this.startIndex + this.visibleCount, this.items.length);
    };
    VirtualList.prototype.getVisibleItems = function () {
        return this.items.slice(this.startIndex, this.endIndex);
    };
    VirtualList.prototype.getOffsetY = function () {
        return this.startIndex * this.itemHeight;
    };
    VirtualList.prototype.getTotalHeight = function () {
        return this.items.length * this.itemHeight;
    };
    return VirtualList;
}());
export { VirtualList };
/**
 * Debounce function for performance optimization
 */
export function debounce(func, wait) {
    var timeout;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        clearTimeout(timeout);
        timeout = setTimeout(function () { return func.apply(void 0, args); }, wait);
    };
}
/**
 * Throttle function for scroll handlers
 */
export function throttle(func, limit) {
    var inThrottle;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!inThrottle) {
            func.apply(void 0, args);
            inThrottle = true;
            setTimeout(function () { return inThrottle = false; }, limit);
        }
    };
}
/**
 * Bundle splitting utility for dynamic imports
 */
export function loadComponent(importFn, fallback) {
    return __awaiter(this, void 0, Promise, function () {
        var module, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, importFn()];
                case 1:
                    module = _a.sent();
                    return [2 /*return*/, module.default];
                case 2:
                    error_1 = _a.sent();
                    console.warn('Failed to load component:', error_1);
                    return [2 /*return*/, fallback || {}];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Image lazy loading with IntersectionObserver
 */
export function lazyLoadImages(selector) {
    if (selector === void 0) { selector = 'img[data-src]'; }
    if (!window.IntersectionObserver)
        return;
    var images = document.querySelectorAll(selector);
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                var img = entry.target;
                var src = img.dataset.src;
                if (src) {
                    img.src = src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px'
    });
    images.forEach(function (img) { return observer.observe(img); });
}
/**
 * Preload critical resources
 */
export function preloadCriticalResources(resources) {
    if (resources === void 0) { resources = []; }
    var criticalImages = __spreadArray([
        '/placeholder-product.svg'
    ], resources, true);
    criticalImages.forEach(function (src) {
        var link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
}
/**
 * Performance monitoring utilities
 */
var PerformanceMonitor = /** @class */ (function () {
    function PerformanceMonitor() {
        this.metrics = new Map();
    }
    PerformanceMonitor.getInstance = function () {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    };
    PerformanceMonitor.prototype.startTiming = function (key) {
        this.metrics.set(key, performance.now());
    };
    PerformanceMonitor.prototype.endTiming = function (key) {
        var start = this.metrics.get(key);
        if (!start) {
            console.warn("No start time found for key: ".concat(key));
            return 0;
        }
        var duration = performance.now() - start;
        this.metrics.delete(key);
        if (duration > 100) {
            console.warn("Performance warning: ".concat(key, " took ").concat(duration.toFixed(2), "ms"));
        }
        return duration;
    };
    PerformanceMonitor.prototype.measureComponent = function (componentName, fn) {
        var _this = this;
        return (function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            _this.startTiming(componentName);
            var result = fn.apply(void 0, args);
            _this.endTiming(componentName);
            return result;
        });
    };
    return PerformanceMonitor;
}());
export { PerformanceMonitor };
