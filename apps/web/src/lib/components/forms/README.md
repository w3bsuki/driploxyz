# Enhanced Form Components for SvelteKit 2 & Svelte 5

This directory contains a comprehensive form validation and component system built for SvelteKit 2 and Svelte 5, featuring progressive enhancement, accessibility, and type safety.

## Core Features

- **Progressive Enhancement**: Forms work without JavaScript and enhance when available
- **Svelte 5 Runes**: Utilizes `$state`, `$derived`, and `$effect` for optimal reactivity
- **Type Safety**: Full TypeScript support with Zod schema validation
- **Accessibility**: WCAG 2.1 compliant with proper ARIA attributes and screen reader support
- **Real-time Validation**: Debounced client-side validation with server-side fallback
- **Multi-step Forms**: Advanced wizard-style forms with progress tracking
- **Error Handling**: Comprehensive error display and recovery patterns

## Components

### FormField.svelte
Basic form field component with validation and accessibility features.

```svelte
<script>
  import FormField from '$lib/components/forms/FormField.svelte';
  import { createFormValidator } from '$lib/utils/form-validation.svelte';
  import { z } from 'zod';

  const schema = z.object({
    email: z.string().email('Please enter a valid email')
  });

  const validator = createFormValidator({ email: '' }, schema);
  const emailField = $derived(validator.getFieldProps('email'));
</script>

<FormField
  label="Email"
  fieldName="email"
  fieldState={emailField}
  type="email"
  required
  placeholder="Enter your email"
/>
```

### SelectField.svelte
Dropdown select component with proper keyboard navigation and validation.

```svelte
<script>
  import SelectField from '$lib/components/forms/SelectField.svelte';

  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' }
  ];
</script>

<SelectField
  label="Choose an option"
  fieldName="selection"
  fieldState={selectionField}
  {options}
  required
/>
```

### TextareaField.svelte
Multi-line text input with character counting and auto-resize.

```svelte
<TextareaField
  label="Description"
  fieldName="description"
  fieldState={descriptionField}
  rows={4}
  maxlength={500}
  showCharacterCount
  hint="Describe your item in detail"
/>
```

### EnhancedForm.svelte
Smart form wrapper that integrates with SvelteKit's `use:enhance` for progressive enhancement.

```svelte
<script>
  import EnhancedForm from '$lib/components/forms/EnhancedForm.svelte';
  import { SignupSchema } from '$lib/validation/auth';

  async function handleSubmit(values) {
    // Custom client-side submission logic
    console.log('Form values:', values);
  }
</script>

<EnhancedForm
  action="?/signup"
  {schema}
  {initialValues}
  onSubmit={handleSubmit}
  onSuccess={(result) => goto('/dashboard')}
  onError={(error) => console.error(error)}
>
  {#snippet children(formContext)}
    <!-- Form fields here -->
  {/snippet}
</EnhancedForm>
```

### MultiStepForm.svelte
Advanced multi-step form component with progress tracking and step validation.

```svelte
<script>
  import MultiStepForm from '$lib/components/forms/MultiStepForm.svelte';
  import Step1Component from './Step1.svelte';
  import Step2Component from './Step2.svelte';

  const steps = [
    {
      id: 'basic-info',
      title: 'Basic Information',
      description: 'Tell us about yourself',
      schema: Step1Schema,
      component: Step1Component
    },
    {
      id: 'preferences',
      title: 'Preferences',
      description: 'Customize your experience',
      schema: Step2Schema,
      component: Step2Component
    }
  ];

  const initialValues = {
    name: '',
    email: '',
    preferences: []
  };
</script>

<MultiStepForm
  {steps}
  {initialValues}
  action="?/complete-setup"
  onComplete={async (values) => {
    // Handle completion
  }}
  showProgress
  allowStepBack
/>
```

## Validation Utilities

### createFormValidator
Core form validation hook using Svelte 5 runes.

```typescript
import { createFormValidator } from '$lib/utils/form-validation.svelte';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const initialValues = {
  email: '',
  password: ''
};

const validator = createFormValidator(initialValues, schema, {
  validateOnChange: true,
  validateOnBlur: true,
  debounceMs: 300
});

// Access form state
console.log(validator.isValid); // $derived boolean
console.log(validator.hasErrors); // $derived boolean
console.log(validator.formState.values); // Current form values

// Get field props for easy binding
const emailField = $derived(validator.getFieldProps('email'));
```

### Form Accessibility Utilities

```typescript
import {
  announceToScreenReader,
  focusFirstErrorField,
  validateFormAccessibility
} from '$lib/utils/form-accessibility';

// Announce messages to screen readers
announceToScreenReader('Form submitted successfully', 'assertive');

// Focus first field with error
focusFirstErrorField({ email: 'Invalid email', password: null });

// Validate form accessibility
const form = document.querySelector('form');
const { isValid, issues } = validateFormAccessibility(form);
```

## Integration with Existing Forms

### Upgrading Auth Forms
The signup and login forms have been upgraded to use the new validation system:

- **Progressive Enhancement**: Forms work without JavaScript
- **Real-time Validation**: Client-side validation with server fallback
- **Accessibility**: Proper error announcements and focus management
- **Type Safety**: Full TypeScript integration with Zod schemas

### Server-Side Integration
Forms integrate seamlessly with SvelteKit's form actions:

```typescript
// +page.server.ts
export const actions: Actions = {
  signup: async ({ request, locals }) => {
    const formData = await request.formData();

    try {
      const validatedData = SignupSchema.parse(Object.fromEntries(formData));
      // Process form...
      return { success: true, message: 'Account created!' };
    } catch (error) {
      if (error instanceof ZodError) {
        return fail(400, {
          errors: error.flatten().fieldErrors,
          values: Object.fromEntries(formData)
        });
      }
      return fail(500, { errors: { _form: 'Server error' } });
    }
  }
};
```

## Best Practices

### 1. Schema-First Design
Always define Zod schemas first, then build forms around them:

```typescript
// Define schema
const ProductSchema = z.object({
  title: z.string().min(3).max(50),
  price: z.number().min(0.01).max(10000),
  description: z.string().max(500).optional()
});

// Use in forms
const validator = createFormValidator(initialValues, ProductSchema);
```

### 2. Progressive Enhancement
Ensure forms work without JavaScript:

```svelte
<!-- Form works with just HTML -->
<form method="POST" action="?/submit">
  <input name="email" type="email" required />
  <button type="submit">Submit</button>
</form>

<!-- Enhanced with JavaScript -->
<EnhancedForm action="?/submit" {schema}>
  <!-- Enhanced fields -->
</EnhancedForm>
```

### 3. Accessibility First
- Use semantic HTML elements
- Provide proper labels and descriptions
- Implement proper error handling
- Support keyboard navigation
- Announce changes to screen readers

### 4. Error Handling
Handle errors at multiple levels:

```typescript
// Field-level validation
const emailField = $derived(validator.getFieldProps('email'));

// Form-level validation
const isFormValid = $derived(validator.isValid);

// Server-side errors
$effect(() => {
  if (form?.errors) {
    // Sync server errors with client validator
    Object.entries(form.errors).forEach(([field, error]) => {
      if (field !== '_form' && error) {
        validator.formState.errors[field] = error;
        validator.formState.touched[field] = true;
      }
    });
  }
});
```

## Migration Guide

### From Old Forms to New System

1. **Add Zod Schema**: Define validation schema
2. **Create Validator**: Use `createFormValidator`
3. **Replace Input Elements**: Use new form components
4. **Update Server Actions**: Handle errors properly
5. **Test Accessibility**: Ensure keyboard and screen reader support

### Example Migration

**Before:**
```svelte
<script>
  let email = '';
  let errors = {};
</script>

<input bind:value={email} type="email" />
{#if errors.email}<span>{errors.email}</span>{/if}
```

**After:**
```svelte
<script>
  import FormField from '$lib/components/forms/FormField.svelte';
  import { createFormValidator } from '$lib/utils/form-validation.svelte';

  const validator = createFormValidator({ email: '' }, schema);
  const emailField = $derived(validator.getFieldProps('email'));
</script>

<FormField
  label="Email"
  fieldName="email"
  fieldState={emailField}
  type="email"
  required
/>
```

## Performance Considerations

- **Debounced Validation**: Prevents excessive validation calls
- **Lazy Loading**: Components load only when needed
- **Optimized Reactivity**: Uses Svelte 5 runes for minimal re-renders
- **Smart Updates**: Only validates dirty fields

## Testing

Forms should be tested for:

1. **Validation Logic**: Schema validation works correctly
2. **Accessibility**: Keyboard navigation and screen reader support
3. **Progressive Enhancement**: Forms work without JavaScript
4. **Error Handling**: Proper error display and recovery
5. **Performance**: No unnecessary re-renders or API calls

## Future Enhancements

- **File Upload Components**: Drag-and-drop file upload with validation
- **Date/Time Pickers**: Accessible date and time selection
- **Rich Text Editor**: WYSIWYG editor with validation
- **Dynamic Forms**: Runtime form generation from schemas
- **Form Analytics**: Track form completion and abandonment