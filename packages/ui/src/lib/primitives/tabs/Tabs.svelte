<script lang="ts">
	import type { Snippet } from 'svelte';

	interface TabData {
		id: string;
		label: string;
		count?: number;
		disabled?: boolean;
		badge?: string;
		icon?: string; // WARNING: Raw HTML - ensure trusted content only
	}

	interface Props {
		/** Array of tab data to render */
		tabs: TabData[];
		/** Currently active tab ID (bindable for two-way binding) */
		value?: string;
		/** Callback when tab changes (uncontrolled mode) */
		onTabChange?: (tabId: string) => void;
		/** Whether tabs should be scrollable on mobile */
		scrollable?: boolean;
		/** Loop keyboard navigation */
		loop?: boolean;
		/** Custom tab content via snippet - receives { tab, isActive } */
		tabContent?: Snippet<[{ tab: TabData; isActive: boolean }]>;
		/** Tab panel content via snippet - receives active tab data */
		children?: Snippet<[TabData]>;
		/** Additional CSS classes for the tabs container */
		class?: string;
		/** Additional CSS classes for the tab list */
		tabListClass?: string;
		/** Additional CSS classes for individual tabs */
		tabClass?: string;
		/** Additional CSS classes for tab panels */
		panelClass?: string;
		/** Orientation of tabs */
		orientation?: 'horizontal' | 'vertical';
		/** Variant style */
		variant?: 'default' | 'pills' | 'underline';
		/** Size of tabs for touch targets */
		size?: 'sm' | 'md' | 'lg';
	}

	let {
		tabs,
		value = $bindable(tabs[0]?.id || ''),
		onTabChange,
		scrollable = true,
		loop = true,
		tabContent,
		children,
		class: className = '',
		tabListClass = '',
		tabClass = '',
		panelClass = '',
		orientation = 'horizontal',
		variant = 'default',
		size = 'md'
	}: Props = $props();

	// Handle tab changes with Svelte 5 runes
	function selectTab(tabId: string) {
		const tab = tabs.find(t => t.id === tabId);
		if (tab?.disabled) return;

		value = tabId;
		onTabChange?.(tabId);
	}

	// Get active tab data
	const activeTab = $derived.by(() => tabs.find(tab => tab.id === value));

	// Size variants for touch targets (mobile-first)
	const sizeClasses = {
		sm: 'min-h-[32px] px-3 py-1.5 text-sm',
		md: 'min-h-[36px] px-4 py-2 text-sm',
		lg: 'min-h-[44px] px-6 py-3 text-base'
	};

	// Variant styles
	const variantClasses = {
		default: {
			container: 'border-b border-gray-200',
			tab: 'border-b-2 border-transparent hover:border-gray-300 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 text-gray-500',
			list: 'flex'
		},
		pills: {
			container: 'p-1 bg-gray-100 rounded-lg',
			tab: 'rounded-md hover:bg-gray-200 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-gray-500',
			list: 'flex gap-1'
		},
		underline: {
			container: 'border-b border-gray-200',
			tab: 'border-b-2 border-transparent hover:border-gray-300 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 text-gray-500 relative',
			list: 'flex'
		}
	};

	// Build CSS classes
	const containerClasses = $derived(
		`tabs-root ${variantClasses[variant].container} ${orientation === 'vertical' ? 'flex' : ''} ${className}`
	);

	const listClasses = $derived(
		`tabs-list ${variantClasses[variant].list} ${orientation === 'horizontal' && scrollable ? 'overflow-x-auto' : ''} ${orientation === 'vertical' ? 'flex-col min-w-[200px] border-r border-gray-200' : ''} ${tabListClass}`
	);

	const getTabClasses = (tab: TabData, isActive: boolean) => {
		const baseClasses = `tabs-trigger font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 whitespace-nowrap flex items-center gap-2 ${sizeClasses[size]} ${variantClasses[variant].tab}`;
		const stateClasses = isActive ? 'active' : '';
		const disabledClasses = tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
		return `${baseClasses} ${stateClasses} ${disabledClasses} ${tabClass}`;
	};

	const panelClasses = $derived(`tabs-content focus-visible:outline-none ${panelClass}`);

	// Scroll behavior for mobile
	let tabListElement: HTMLElement;

	const scrollToActiveTab = () => {
		if (!scrollable || !tabListElement || orientation === 'vertical') return;

		const activeElement = tabListElement.querySelector('[data-state="active"]') as HTMLElement;
		if (activeElement) {
			// Respect user's motion preferences
			const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			activeElement.scrollIntoView({
				behavior: prefersReducedMotion ? 'auto' : 'smooth',
				block: 'nearest',
				inline: 'center'
			});
		}
	};

	// Scroll to active tab when value changes
	$effect(() => {
		if (value) {
			scrollToActiveTab();
		}
	});

	// Keyboard navigation
	function handleKeydown(e: KeyboardEvent, currentIndex: number) {
		let newIndex = currentIndex;

		switch (e.key) {
			case 'ArrowLeft':
			case 'ArrowUp':
				newIndex = currentIndex > 0 ? currentIndex - 1 : loop ? tabs.length - 1 : currentIndex;
				break;
			case 'ArrowRight':
			case 'ArrowDown':
				newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : loop ? 0 : currentIndex;
				break;
			case 'Home':
				newIndex = 0;
				break;
			case 'End':
				newIndex = tabs.length - 1;
				break;
			default:
				return;
		}

		e.preventDefault();
		const newTab = tabs[newIndex];
		if (!newTab.disabled) {
			selectTab(newTab.id);
		}
	}
</script>

<div class={containerClasses} data-orientation={orientation} data-variant={variant}>
	<!-- Tab List -->
	<div
		bind:this={tabListElement}
		class={listClasses}
		role="tablist"
		aria-orientation={orientation}
	>
		{#each tabs as tab, index (tab.id)}
			{@const isActive = value === tab.id}
			<button
				class={getTabClasses(tab, isActive)}
				data-value={tab.id}
				data-state={isActive ? 'active' : 'inactive'}
				disabled={tab.disabled}
				role="tab"
				aria-selected={isActive}
				aria-controls="panel-{tab.id}"
				id="tab-{tab.id}"
				tabindex={isActive ? 0 : -1}
				onclick={() => selectTab(tab.id)}
				onkeydown={(e) => handleKeydown(e, index)}
			>
				<!-- Custom tab content via snippet -->
				{#if tabContent}
					{@render tabContent({ tab, isActive })}
				{:else}
					<!-- Icon -->
					{#if tab.icon}
						<span class="tab-icon w-4 h-4" aria-hidden="true">
							<!-- Use icon components instead of raw HTML -->
						</span>
					{/if}

					<!-- Label -->
					<span class="tab-label">{tab.label}</span>

					<!-- Count -->
					{#if tab.count !== undefined}
						<span
							class="tab-count ml-1.5 px-1.5 py-0.5 text-xs rounded-full font-medium
								{isActive
									? variant === 'pills'
										? 'bg-gray-200 text-current'
										: 'bg-blue-100 text-blue-600'
									: 'bg-gray-100 text-gray-600'}"
							aria-label="{tab.count} items"
						>
							{tab.count}
						</span>
					{/if}

					<!-- Badge -->
					{#if tab.badge}
						<span
							class="tab-badge ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-red-100 text-red-600 font-medium"
							aria-label="Badge: {tab.badge}"
						>
							{tab.badge}
						</span>
					{/if}
				{/if}
			</button>
		{/each}
	</div>

	<!-- Tab Panels -->
	{#if children && activeTab}
		<div
			class={panelClasses}
			role="tabpanel"
			aria-labelledby="tab-{value}"
			id="panel-{value}"
			tabindex="0"
		>
			{@render children(activeTab)}
		</div>
	{/if}
</div>

<style>
	/* Base styles using semantic tokens */

	/* Auto scrolling by default, respecting user preferences */
	.tabs-list {
		scroll-behavior: auto;
		scroll-padding: 1rem;
	}

	/* Focus styles for accessibility */
	.tabs-trigger:focus-visible {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
		z-index: 1;
	}

	/* Hover states */
	.tabs-trigger:hover:not(:disabled) {
		background-color: #f3f4f6;
	}

	/* Active state animations */
	.tabs-trigger {
		position: relative;
		transition: all 0.2s ease-in-out;
	}

	/* Mobile-first responsive design */
	@media (max-width: 640px) {
		/* Ensure proper touch targets on mobile */
		.tabs-trigger {
			min-height: 44px;
			padding: 12px 16px;
			font-size: 16px; /* Prevent zoom on iOS */
		}

		/* Adjust spacing for mobile */
		.tabs-list {
			gap: 2px;
			padding: 0 16px;
		}

		/* Pills variant on mobile */
		.tabs-root[data-variant="pills"] .tabs-list {
			padding: 4px;
			margin: 0 16px;
		}

		/* Horizontal scroll indicators */
		.tabs-list {
			mask: linear-gradient(90deg, transparent, white 16px, white calc(100% - 16px), transparent);
			-webkit-mask: linear-gradient(90deg, transparent, white 16px, white calc(100% - 16px), transparent);
		}
	}

	/* Tablet and desktop */
	@media (min-width: 641px) {
		/* Reduce touch target size for larger screens */
		.tabs-trigger {
			min-height: 36px;
		}

		/* Better hover states for pointer devices */
		.tabs-trigger:hover:not(:disabled) {
			transform: translateY(-1px);
		}
	}

	/* High contrast mode support */
	@media (prefers-contrast: high) {
		.tabs-trigger[data-state="active"] {
			background-color: #f9fafb;
			color: #111827;
		}

		.tabs-trigger:focus-visible {
			outline-width: 3px;
		}
	}

	/* Reduce motion for accessibility */
	@media (prefers-reduced-motion: reduce) {
		.tabs-trigger,
		.tabs-list {
			transition: none;
			scroll-behavior: auto;
		}

		.tabs-trigger:hover:not(:disabled) {
			transform: none;
		}
	}

	/* Vertical orientation styles */
	.tabs-root[data-orientation="vertical"] {
		display: flex;
		align-items: stretch;
	}

	.tabs-root[data-orientation="vertical"] .tabs-list {
		flex-direction: column;
		border-right: 1px solid #e5e7eb;
		border-bottom: none;
		min-width: 200px;
		padding: 8px;
	}

	.tabs-root[data-orientation="vertical"] .tabs-trigger {
		justify-content: flex-start;
		text-align: left;
		width: 100%;
	}

	/* Animation for content changes */
	.tabs-content {
		animation: tab-content-in 0.2s cubic-bezier(0, 0, 0.2, 1);
	}

	@keyframes tab-content-in {
		from {
			opacity: 0;
			transform: translateY(4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.tabs-content {
			animation: none;
		}
	}
</style>