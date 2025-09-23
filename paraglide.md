# Paraglide Localisation Playbook

Ensures translation assets stay in sync and locale-aware routing works as designed.

## Goals
- Maintain a single source of translation messages in packages/i18n/messages.
- Generate outputs via Paraglide scripts and keep lib/index exports current.
- Guarantee routes under language groups load the correct locale based on hooks logic.

## Tasks
- [ ] Review packages/i18n scripts and confirm generate-ts-exports.ts plus build steps run without errors.
- [ ] Document how project.inlang is structured and set expectations for adding new locales.
- [ ] Align apps/web routing folders with localisation requirements (for example src/routes/(lang)).
- [ ] Validate hooks.ts and hooks.server.ts handle reroute and locale detection consistently.
- [ ] Update Supabase or API calls that depend on locale to accept language parameters explicitly.
- [ ] Define testing steps for translated content (manual QA matrix or automated snapshots).

## Validation
- Run pnpm --filter @repo/i18n build to regenerate bundles.
- Run pnpm --filter web check-types to ensure generated types align with usage.
- Manually spot-check key pages in multiple locales, noting screenshots or issues.

## Operational Notes
- Version translation changes alongside feature work; avoid out-of-band edits.
- When removing locales, document cleanup steps for routes, messages, and user settings.
- Coordinate with design to confirm copy length and text direction needs are satisfied.

Log pending localisation tasks or follow-ups at the bottom of this document.
