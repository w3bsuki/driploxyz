<script lang="ts">
	interface Props {
		currentLanguage?: string;
		languages?: Array<{ code: string; name: string; flag?: string }>;
		onLanguageChange?: (lang: string) => void;
		variant?: 'dropdown' | 'inline' | 'compact';
		class?: string;
	}

	let {
		currentLanguage = 'en',
		languages = [
			{ code: 'en', name: 'English', flag: '🇬🇧' },
			{ code: 'bg', name: 'Български', flag: '🇧🇬' },
			{ code: 'ru', name: 'Русский', flag: '🇷🇺' },
			{ code: 'ua', name: 'Українська', flag: '🇺🇦' }
		],
		onLanguageChange = () => {},
		variant = 'dropdown',
		class: className = ''
	}: Props = $props();

	let showDropdown = $state(false);

	const currentLang = $derived(
		languages.find(l => l.code === currentLanguage) || languages[0]
	);

	function selectLanguage(lang: string) {
		onLanguageChange(lang);
		showDropdown = false;
	}
</script>

{#if variant === 'inline'}
	<div class="flex gap-2 {className}">
		{#each languages as lang}
			<button
				onclick={() => selectLanguage(lang.code)}
				class="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors
					{currentLanguage === lang.code 
						? 'bg-gray-900 text-white' 
						: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
			>
				{#if lang.flag}
					<span class="mr-1.5">{lang.flag}</span>
				{/if}
				{lang.name}
			</button>
		{/each}
	</div>
{:else if variant === 'compact'}
	<div class="flex gap-1 {className}">
		{#each languages as lang}
			<button
				onclick={() => selectLanguage(lang.code)}
				class="w-8 h-8 flex items-center justify-center text-sm font-medium rounded-full transition-colors
					{currentLanguage === lang.code 
						? 'bg-gray-900 text-white' 
						: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
				title={lang.name}
			>
				{lang.flag || lang.code.toUpperCase().slice(0, 2)}
			</button>
		{/each}
	</div>
{:else}
	<div class="relative {className}">
		<button
			onclick={() => showDropdown = !showDropdown}
			class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
		>
			{#if currentLang.flag}
				<span>{currentLang.flag}</span>
			{/if}
			<span>{currentLang.name}</span>
			<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</button>

		{#if showDropdown}
			<div class="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
				<div class="py-1">
					{#each languages as lang}
						<button
							onclick={() => selectLanguage(lang.code)}
							class="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors
								{currentLanguage === lang.code ? 'bg-gray-50 font-semibold' : ''}"
						>
							{#if lang.flag}
								<span>{lang.flag}</span>
							{/if}
							<span>{lang.name}</span>
							{#if currentLanguage === lang.code}
								<svg class="w-4 h-4 ml-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
							{/if}
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>
{/if}

{#if showDropdown}
	<button
		onclick={() => showDropdown = false}
		class="fixed inset-0 z-40"
		aria-label="Close dropdown"
	></button>
{/if}