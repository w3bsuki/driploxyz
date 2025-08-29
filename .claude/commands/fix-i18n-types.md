# /fix-i18n-types — Trim to EN+BG and fix references

Goal: Remove TS errors caused by old RU/UA language references after limiting Paraglide to EN+BG.

Steps
1) Edit types and names
- File: `packages/i18n/src/index.ts`
  - Change: `export type LanguageTag = 'en' | 'bg'`
  - Update `languageNames` to only `en` and `bg` entries

2) Search for lingering RU/UA references
- Command: `rg -n "\bru\b|\bua\b|LanguageTag" packages apps/web/src`
- Fix files that assume RU/UA; replace unions or narrow generics to EN|BG

3) Build and check types
- `pnpm check-types > types-after-i18n.txt`
- `pnpm -C apps/web build > web-build-after-i18n.txt`

Acceptance
- No TS errors referencing RU/UA types
- Web app builds successfully

