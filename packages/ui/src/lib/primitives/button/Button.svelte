<script lang="ts">
  import type { Action } from 'svelte/action';
  import type { HTMLAnchorAttributes, HTMLButtonAttributes, SvelteHTMLElements, ClassValue } from 'svelte/elements';
  import type { ButtonVariant, ButtonSize, ButtonDensity } from '../../types';
  import { buttonVariants } from '../../utils/variants';

  // Allow passing through standard HTML attributes (aria-*, data-*, etc.)
  // for both <button> and <a> usages. We omit fields we control explicitly.
  type AnchorRest = Omit<HTMLAnchorAttributes, 'class' | 'href' | 'rel' | 'target' | 'children' | 'onclick'>;
  type ButtonRest = Omit<HTMLButtonAttributes, 'class' | 'type' | 'form' | 'disabled' | 'children' | 'onclick'>;
  
  /**
   * Button component with multiple variants and sizes.
   * Supports both button and anchor element rendering.
   * 
   * @example
   * ```svelte
   * <Button variant="primary" size="lg" class={{ 'w-full': fullWidth }}>
   *   Click me
   * </Button>
   * ```
   */
  export interface CommonProps {
    variant?: ButtonVariant;
    size?: ButtonSize;
    density?: ButtonDensity;
    disabled?: boolean;
    loading?: boolean;
    loadingLabel?: string;
    onclick?: (event: MouseEvent) => void;
    class?: ClassValue;
    children?: import('svelte').Snippet;
    use?: Action<HTMLElement>[] | Action<HTMLElement> | null;
    // Common optional fields so destructuring doesn't produce unknown
    href?: string;
    rel?: string;
    target?: HTMLAnchorElement['target'];
    type?: 'button' | 'submit' | 'reset';
    form?: string;
    // Accept any additional attributes (e.g., data-testid, custom aria props)
    [attr: string]: unknown;
  }
  export type ButtonProps = CommonProps;
  type AnchorProps = CommonProps & { href: string } & AnchorRest;
  type NativeButtonProps = CommonProps & ButtonRest;
  type Props = AnchorProps | NativeButtonProps;
  

  let {
    variant = 'primary',
    size = 'md',
    density = 'spacious',
    disabled = false,
    loading = false,
    loadingLabel = 'Loading',
    href,
    rel,
    target,
    type = 'button',
    form,
    onclick,
    class: className = '',
    children,
    use = null,
    ...rest
  }: Props = $props();

  // infer from presence of href
  const isLink = $derived(!!href);
  const tabIndex = $derived(href && disabled ? -1 : undefined);
  const ariaBusy = $derived(loading ? 'true' : undefined);
  const stateAttr = $derived(loading ? 'waiting' : 'ready');

  function applyActions(node: HTMLElement) {
    const actions = Array.isArray(use) ? use : use ? [use] : [];
    const cleanups = actions.map((action) => action?.(node)).filter(Boolean) as Array<() => void>;
    return {
      destroy() {
        cleanups.forEach((cleanup) => cleanup?.());
      }
    };
  }

  const classes = $derived(
    buttonVariants(
      {
        variant,
        size,
        density
      },
      className
    )
  );

  const spinnerSize = $derived(
    size === 'sm' ? 'size-3' : size === 'lg' ? 'size-5' : 'size-4'
  );
</script>

{#if isLink}
  <a
    href={href}
    rel={rel}
    target={target}
    {onclick}
    class={classes}
    aria-disabled={disabled ? 'true' : undefined}
    aria-busy={ariaBusy}
    data-state={stateAttr}
    tabindex={tabIndex}
    use:applyActions
    {...(rest as AnchorRest)}
  >
  {#if loading}
    <span
      class={`inline-flex items-center gap-x-[var(--space-2)] ${size === 'sm' ? 'text-[length:var(--btn-font-sm)]' : size === 'lg' ? 'text-[length:var(--btn-font-lg)]' : 'text-[length:var(--btn-font-md)]'}`}
      role="status"
      aria-live="polite"
    >
      <svg
        class={`${spinnerSize} animate-spin text-current`}
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span class="sr-only">{loadingLabel}</span>
    </span>
  {/if}
  <span
    class={
      loading
        ? 'opacity-0 pointer-events-none absolute inset-0 flex items-center justify-center'
        : 'inline-flex items-center gap-x-[var(--space-2)]'
    }
    aria-hidden={loading ? 'true' : undefined}
  >
    {@render children?.()}
  </span>
  </a>
{:else}
  <button
    type={type}
    form={form}
    {onclick}
    class={classes}
    disabled={disabled}
    aria-busy={ariaBusy}
    data-state={stateAttr}
    use:applyActions
    {...(rest as ButtonRest)}
  >
  {#if loading}
    <span
      class={`inline-flex items-center gap-x-[var(--space-2)] ${size === 'sm' ? 'text-[length:var(--btn-font-sm)]' : size === 'lg' ? 'text-[length:var(--btn-font-lg)]' : 'text-[length:var(--btn-font-md)]'}`}
      role="status"
      aria-live="polite"
    >
      <svg
        class={`${spinnerSize} animate-spin text-current`}
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span class="sr-only">{loadingLabel}</span>
    </span>
  {/if}
  <span
    class={
      loading
        ? 'opacity-0 pointer-events-none absolute inset-0 flex items-center justify-center'
        : 'inline-flex items-center gap-x-[var(--space-2)]'
    }
    aria-hidden={loading ? 'true' : undefined}
  >
    {@render children?.()}
  </span>
  </button>
{/if}

