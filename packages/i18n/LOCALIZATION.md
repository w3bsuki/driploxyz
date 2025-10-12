# Localization Guide for Driplo

This document describes the localization setup and workflow for Driplo marketplace.

## Current State (2025-10-05)

### Supported Locales
- **Primary**: `bg` (Bulgarian) - Default locale for Bulgarian users
- **Secondary**: `en` (English) - Serves as base locale for fallbacks
- **Target Regions**: UK (en), Bulgaria (bg), with global expansion planned

### Technical Implementation

#### 0kb Bundle Optimization ✅
- Uses Paraglide JS with tree-shakable message imports
- Generated files are minimal and only load needed translations
- Bundle size optimized via `@inlang/paraglide-js` plugin

#### Locale Detection Priority
1. **Path-based**: `/en/...`, `/bg/...`, `/uk/...` (uk → en)
2. **Query parameter**: `?locale=en` or `?locale=bg`
3. **Cookie**: Persistent locale preference
4. **Browser header**: Accept-Language parsing
5. **Fallback**: Default locale (bg)

#### Strategy Configuration
```typescript
// In vite.config.ts
paraglideVitePlugin({
  project: '../../packages/i18n/project.inlang',
  outdir: '../../packages/i18n/lib/paraglide',
  strategy: ['cookie', 'url', 'baseLocale']
})
```

## Translation Workflow

### Adding New Translations

1. **Update Messages**: Edit JSON files in `messages/` directory
2. **Generate Types**: Run `pnpm --filter @repo/i18n build`
3. **Test Locales**: Use built-in tests to verify detection

```bash
# Add new messages to messages/en.json and messages/bg.json
pnpm --filter @repo/i18n build
pnpm --filter @repo/i18n test
```

### Expanding to New Languages

1. **Add Language to Settings**: Update `project.inlang/settings.json`
2. **Create Message File**: Add `messages/{locale}.json`
3. **Update Aliases**: Add to `LOCALE_ALIASES` in `src/runtime.ts`
4. **Update Detection**: Add language detection logic in `detectLanguage`

Example for adding German (de):
```json
{
  "$schema": "https://inlang.com/schema/project-settings",
  "sourceLanguageTag": "bg",
  "languageTags": ["bg", "en", "de"],
  "modules": [],
  "plugin.inlang.messageFormat": {
    "pathPattern": "./messages/{languageTag}.json"
  }
}
```

## SEO & URL Structure

### Current Pattern
- **Bulgarian**: `driplo.bg/product/...` (default, no prefix)
- **English UK**: `driplo.bg/en/product/...`
- **English GB**: `driplo.bg/en-gb/product/...` (planned)

### Hreflang Implementation
The system automatically generates `hreflang` tags in the layout based on available locales.

## Testing

### Unit Tests
```bash
pnpm --filter @repo/i18n test
pnpm --filter @repo/i18n test:coverage
```

### Manual Testing Checklist
- [ ] Locale detection works from URL paths
- [ ] Cookie persistence maintains selection
- [ ] Browser language detection functions correctly
- [ ] Fallback to base locale when translation missing
- [ ] SEO metadata updates correctly with locale changes
- [ ] Currency formatting adapts to locale (future)

## Integration in Apps

### Web App Integration
```typescript
import * as i18n from '@repo/i18n';

// Get current locale
const currentLocale = i18n.getLocale();

// Get localized message
const welcomeMessage = i18n.welcome();

// Set locale programmatically
i18n.setLocale('en', { reload: true });
```

### Component Usage
```svelte
<script>
  import * as i18n from '@repo/i18n';
  import { onMount } from 'svelte';

  let currentLocale = $state(i18n.getLocale());

  function switchLanguage(locale: 'en' | 'bg') {
    i18n.setLocale(locale, { reload: true });
  }
</script>

<h1>{i18n.welcome()}</h1>
<button onclick={() => switchLanguage('en')}>English</button>
<button onclick={() => switchLanguage('bg')}>Български</button>
```

## Bundle Size Metrics

- **Current**: Optimized with 0kb default loading
- **Target**: Maintain < 10kb total i18n bundle
- **Strategy**: Tree-shaking + lazy loading per locale

## Future Plans

### Phase 1: UK Market Focus
- [ ] Add `en-GB` specific terminology
- [ ] Implement UK-specific currency formatting
- [ ] Add UK shipping and payment methods

### Phase 2: European Expansion
- [ ] Add `fr` (French) basics
- [ ] Add `de` (German) basics
- [ ] Add `es` (Spanish) basics
- [ ] Implement regional shipping options

### Phase 3: Global
- [ ] Additional language support
- [ ] Advanced geo-detection
- [ ] Regional content adaptation

## Troubleshooting

### Common Issues

**Q: Locale detection isn't working**
A: Check that `paraglideVitePlugin` is properly configured in Vite config

**Q: Missing translations**
A: Ensure messages exist in JSON files and rebuild with `pnpm --filter @repo/i18n build`

**Q: Tests are failing**
A: Verify test imports and that all locale functions are properly exported

### Debug Commands
```bash
# Check generated files
find packages/i18n/lib/paraglide -name "*.js" | head -5

# Verify build output
pnpm --filter @repo/i18n build

# Run tests with coverage
pnpm --filter @repo/i18n test:coverage
```