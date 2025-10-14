<script lang="ts">
  import { Button } from '@repo/ui';
  import * as i18n from '@repo/i18n';
  import type { LanguageTag } from '@repo/i18n';

  interface Props {
    show: boolean;
    detectedCountry?: string | null;
    suggestedLocale: LanguageTag;
    currentLocale: LanguageTag;
    onSwitch: () => void | Promise<void>;
    onStay: () => void | Promise<void>;
  }

  let {
    show,
    detectedCountry = null,
    suggestedLocale,
    currentLocale,
    onSwitch,
    onStay
  }: Props = $props();

  const localeLabels: Record<string, string> = {
    en: i18n.locale_name_en ? i18n.locale_name_en() : 'English',
    bg: i18n.locale_name_bg ? i18n.locale_name_bg() : 'Български'
  };

  const normalizedCurrentLocale = typeof currentLocale === 'string' && currentLocale.length > 0 ? currentLocale : 'bg';
  const normalizedSuggestedLocale = typeof suggestedLocale === 'string' && suggestedLocale.length > 0
    ? suggestedLocale
    : normalizedCurrentLocale;

  const currentLocaleLabel =
    localeLabels[normalizedCurrentLocale] ?? normalizedCurrentLocale.toUpperCase();
  const suggestedLocaleLabel =
    localeLabels[normalizedSuggestedLocale] ?? normalizedSuggestedLocale.toUpperCase();
  const headline = i18n.locale_banner_headline
    ? i18n.locale_banner_headline({
        country: detectedCountry ?? suggestedLocaleLabel,
        localeName: suggestedLocaleLabel
      })
    : `We detected you're in ${detectedCountry ?? 'your region'}. Switch to ${suggestedLocaleLabel}?`;
  const switchLabel = i18n.locale_banner_switch
    ? i18n.locale_banner_switch({ localeName: suggestedLocaleLabel })
    : `Switch to ${suggestedLocaleLabel}`;
  const stayLabel = i18n.locale_banner_stay
    ? i18n.locale_banner_stay({ localeName: currentLocaleLabel })
    : `Stay on ${currentLocaleLabel}`;
  const rememberLabel = i18n.locale_banner_remember
    ? i18n.locale_banner_remember()
    : "We'll remember your preference.";
</script>

{#if show}
  <section class="locale-banner">
    <div class="mx-auto flex max-w-5xl flex-col gap-4 rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-900 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 sm:py-5">
      <div class="flex flex-col gap-2">
        <p class="text-base font-semibold text-blue-900">{headline}</p>
        <p class="text-xs text-blue-700">{rememberLabel}</p>
      </div>
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button variant="ghost" class="justify-center sm:min-w-[10rem]" onclick={async () => { await onStay(); }}>
          {stayLabel}
        </Button>
        <Button variant="primary" class="justify-center sm:min-w-[10rem]" onclick={async () => { await onSwitch(); }}>
          {switchLabel}
        </Button>
      </div>
    </div>
  </section>
{/if}
