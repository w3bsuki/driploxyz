# ACCESSIBILITY - WCAG 2.1 AA Compliance

**Reference**: https://svelte.dev/docs/kit/accessibility

## ROUTE ANNOUNCEMENTS

### 1. Page Titles
```svelte
<!-- UNIQUE descriptive title per page -->
<svelte:head>
  <title>Product: {product.name} - €{product.price} | Driplo</title>
</svelte:head>

<!-- ❌ WRONG - Generic titles -->
<title>Driplo</title>
<title>Page</title>
```

### 2. Live Region (Auto-injected)
```javascript
// SvelteKit injects automatically
<div aria-live="polite" aria-atomic="true" style="position: absolute; left: 0; top: 0; clip: rect(0 0 0 0); clip-path: inset(50%); overflow: hidden; white-space: nowrap; width: 1px; height: 1px">
  {title}
</div>
```

## FOCUS MANAGEMENT

### 1. After Navigation
```javascript
// hooks.client.ts
import { afterNavigate } from '$app/navigation';

afterNavigate(() => {
  // Custom focus logic if needed
  const main = document.querySelector('main');
  main?.focus();
});
```

### 2. Skip Links
```svelte
<!-- +layout.svelte -->
<a href="#main" class="skip-link">Skip to content</a>

<style>
  .skip-link {
    position: absolute;
    left: -9999px;
  }
  .skip-link:focus {
    left: 0;
    z-index: 999;
  }
</style>

<main id="main" tabindex="-1">
  <slot />
</main>
```

## SEMANTIC HTML

### 1. Headings Hierarchy
```svelte
<!-- ✅ CORRECT -->
<h1>Page Title</h1>
  <h2>Section</h2>
    <h3>Subsection</h3>

<!-- ❌ WRONG - Skipping levels -->
<h1>Title</h1>
  <h3>Subtitle</h3>
```

### 2. Interactive Elements
```svelte
<!-- ✅ CORRECT - Real button -->
<button onclick={handleClick}>
  Click me
</button>

<!-- ❌ WRONG - Div as button -->
<div onclick={handleClick}>Click me</div>
```

### 3. Form Labels
```svelte
<!-- ✅ CORRECT -->
<label for="email">Email</label>
<input id="email" type="email" required>

<!-- OR -->
<label>
  Email
  <input type="email" required>
</label>

<!-- ❌ WRONG - No label -->
<input type="email" placeholder="Email">
```

## ARIA ATTRIBUTES

### 1. Required ARIA
```svelte
<!-- Navigation -->
<nav aria-label="Main navigation">
  <ul>...</ul>
</nav>

<!-- Search -->
<form role="search" aria-label="Site search">
  <input type="search" aria-label="Search products">
</form>

<!-- Loading states -->
<div aria-busy="true" aria-live="polite">
  Loading...
</div>

<!-- Errors -->
<div role="alert" aria-live="assertive">
  {error.message}
</div>
```

### 2. Button States
```svelte
<button 
  aria-pressed={isActive}
  aria-expanded={isOpen}
  aria-controls="menu"
>
  Menu
</button>
```

### 3. Dynamic Content
```svelte
<!-- Live regions -->
<div aria-live="polite" aria-atomic="true">
  {itemCount} items in cart
</div>

<!-- Status messages -->
<div role="status" aria-live="polite">
  Product added to cart
</div>
```

## KEYBOARD NAVIGATION

### 1. Tab Order
```svelte
<!-- Natural tab order -->
<nav>...</nav>
<main>...</main>
<aside>...</aside>

<!-- Custom focus order (avoid if possible) -->
<button tabindex="1">First</button>
<button tabindex="2">Second</button>
```

### 2. Keyboard Shortcuts
```svelte
<script>
  function handleKeydown(e) {
    if (e.key === 'Escape') closeModal();
    if (e.key === '/' && !e.ctrlKey) focusSearch();
  }
</script>

<svelte:window on:keydown={handleKeydown} />
```

### 3. Focus Trapping (Modals)
```svelte
<script>
  import { trapFocus } from '$lib/utils/focus';
  
  let modal;
  
  $effect(() => {
    if (modal && isOpen) {
      return trapFocus(modal);
    }
  });
</script>

<dialog bind:this={modal} open={isOpen}>
  <!-- Modal content -->
</dialog>
```

## COLOR & CONTRAST

### 1. WCAG AA Requirements
```css
/* Minimum contrast ratios */
.text {
  /* Normal text: 4.5:1 */
  color: #333; /* on white */
  
  /* Large text (18pt+): 3:1 */
  font-size: 24px;
  color: #666; /* on white */
}

/* ❌ WRONG - Insufficient contrast */
.low-contrast {
  color: #ccc; /* on white = 1.6:1 */
}
```

### 2. Focus Indicators
```css
/* Visible focus */
:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

/* ❌ WRONG - Removing focus */
:focus {
  outline: none;
}
```

## IMAGES & MEDIA

### 1. Alt Text
```svelte
<!-- Informative image -->
<img src={product.image} alt={product.description}>

<!-- Decorative image -->
<img src="pattern.jpg" alt="" role="presentation">

<!-- Complex image -->
<figure>
  <img src="chart.png" alt="Sales chart">
  <figcaption>
    Detailed description of chart data...
  </figcaption>
</figure>
```

### 2. Video Captions
```svelte
<video controls>
  <source src="video.mp4" type="video/mp4">
  <track kind="captions" src="captions.vtt" srclang="en" label="English">
  <track kind="subtitles" src="subtitles.vtt" srclang="es" label="Spanish">
</video>
```

## FORMS ACCESSIBILITY

### 1. Error Messages
```svelte
<script>
  let errors = {};
</script>

<label for="email">
  Email
  {#if errors.email}
    <span class="error" role="alert" id="email-error">
      {errors.email}
    </span>
  {/if}
</label>
<input 
  id="email" 
  type="email"
  aria-invalid={!!errors.email}
  aria-describedby={errors.email ? 'email-error' : undefined}
>
```

### 2. Required Fields
```svelte
<!-- Mark required fields -->
<label for="name">
  Name <span aria-label="required">*</span>
</label>
<input id="name" required aria-required="true">

<!-- Explain requirements -->
<p class="form-help">* indicates required field</p>
```

## TESTING CHECKLIST

### Automated Testing
```bash
# Install testing tools
pnpm add -D @testing-library/svelte jest-axe

# Run tests
pnpm test:a11y
```

### Manual Testing
- [ ] Navigate with keyboard only
- [ ] Test with screen reader (NVDA/JAWS/VoiceOver)
- [ ] Zoom to 200% without horizontal scroll
- [ ] Check color contrast (Chrome DevTools)
- [ ] Disable CSS - content still readable
- [ ] Test with Windows High Contrast mode

### Screen Reader Testing
```javascript
// Announce dynamic changes
function announce(message) {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.textContent = message;
  document.body.appendChild(announcement);
  setTimeout(() => announcement.remove(), 1000);
}
```

## COMMON VIOLATIONS

### ❌ DON'T
- Remove focus indicators
- Use placeholder as label
- Use color alone to convey information
- Auto-play media with sound
- Create keyboard traps
- Use `tabindex` > 0
- Ignore heading hierarchy
- Use generic link text ("click here")
- Forget empty alt for decorative images
- Use px for font sizes (use rem)

### ✅ DO
- Provide skip links
- Use semantic HTML
- Add ARIA labels for icons
- Test with real assistive technology
- Provide text alternatives
- Ensure keyboard accessibility
- Maintain focus visibility
- Use sufficient color contrast
- Write descriptive page titles
- Structure content logically

## COMPLIANCE REQUIREMENTS

- **WCAG 2.1 Level AA** minimum
- **Section 508** for US government
- **EN 301 549** for EU
- **ADA** compliance for US businesses

## AUDIT COMMANDS

```bash
# Lighthouse accessibility audit
npx lighthouse https://driplo.xyz --only-categories=accessibility

# axe DevTools
# Install browser extension

# Pa11y command line
npx pa11y https://driplo.xyz

# Manual audit checklist
# Use WAVE browser extension
```

## RESOURCES

- [WCAG Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [The A11y Project](https://www.a11yproject.com/)
- [MDN ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
- [WebAIM](https://webaim.org/)