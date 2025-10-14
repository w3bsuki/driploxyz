<script lang="ts">
  import type { Action } from 'svelte/action';
  import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
  import type { ButtonVariant, ButtonSize, ButtonDensity } from '../../types';
  import { buttonVariants } from '../../utils/variants';

  // Allow passing through standard HTML attributes (aria-*, data-*, etc.)
  // for both <button> and <a> usages. We omit fields we control explicitly.
  interface Props extends Omit<HTMLButtonAttributes, 'class' | 'type' | 'form' | 'disabled' | 'children' | 'onclick'>, Omit<HTMLAnchorAttributes, 'class' | 'href' | 'rel' | 'target' | 'children' | 'onclick'> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    density?: ButtonDensity;
    disabled?: boolean;
    loading?: boolean;
    loadingLabel?: string;
    href?: string;
    rel?: string;
    target?: HTMLAnchorElement['target'];
    type?: 'button' | 'submit' | 'reset';
    form?: string;
    onclick?: (event: MouseEvent) => void;
    class?: string;
    children?: import('svelte').Snippet;
    use?: Action<HTMLElement>[] | Action<HTMLElement> | null;
    // Accept any additional attributes (e.g., data-testid, custom aria props)
    [attr: string]: unknown;
  }

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
    use = null
  }: Props = $props();

  const element = $derived(href ? 'a' : 'button');
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

<svelte:element
  this={element}
  href={element === 'a' ? href : undefined}
  rel={element === 'a' ? rel : undefined}
  target={element === 'a' ? target : undefined}
  form={element === 'button' ? form : undefined}
  {onclick}
  class={classes}
  type={element === 'button' ? type : undefined}
  disabled={element === 'button' ? disabled : undefined}
  aria-disabled={element === 'a' && disabled ? 'true' : undefined}
  aria-busy={ariaBusy}
  data-state={stateAttr}
  tabindex={tabIndex}
  role={element === 'a' ? undefined : 'button'}
  use:applyActions
  {...$$restProps}
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
</svelte:element>

