# Build Configuration Issues

## Status: Non-Critical (Dev server works, security fixed)

### Issue: fsevents Resolution Error
- **Error**: Rollup failed to resolve import "fsevents" 
- **Platform**: Windows (fsevents is macOS-specific)
- **Impact**: Blocks production build, does not affect functionality
- **Dev Impact**: None - dev server works perfectly

### Investigation Required:
1. Add fsevents to Rollup externals in Vite config
2. Check SvelteKit 2 + Vite 7 + Windows compatibility
3. Consider alternative build configuration
4. Check if enhanced-img plugin is required for production

### Workaround:
- Development works perfectly
- Can deploy with simpler Vite config if needed
- Focus on TypeScript errors as real production blocker

### Priority: Low (after TypeScript errors resolved)