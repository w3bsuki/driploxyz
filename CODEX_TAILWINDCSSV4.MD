+# TailwindCSS v4 Production Refactor
+
+> References: [TailwindCSS v4 Docs](https://tailwindcss.com/docs) — updated August 2025
+
+## Official Best Practices
+
+- Use the CSS‑first configuration: `@import 'tailwindcss';` with `@theme`, `@plugin`, and `@source` directives.
+- Centralize design tokens inside `@theme` blocks and use semantic names.
+- Use `@plugin` for first‑party plugins and remove manual PostCSS config where not required.
+- Keep `@source` paths accurate to avoid shipping unused styles and exclude build output.
+- Avoid custom global resets; rely on Tailwind's preflight.
+- Install Tailwind as a single workspace dependency and share it across packages.
+
+## Repository Audit
+
+- `apps/web/src/app.css` already uses Tailwind v4 CSS config with plugins and theme tokens.
+- Root `package.json` depends on `tailwindcss@4.1.11`; `apps/web/package.json` uses `4.1.12` creating duplication.
+- No legacy `tailwind.config.js` files remain, but PostCSS config still includes manual plugin handling.
+- `@source` paths include `packages/ui/dist`, pulling in compiled artifacts that will be removed.
+- Some bespoke CSS in `app.css` may belong in components or utilities for reuse.
+
+## Refactor Actions
+
+- Remove redundant PostCSS plugin configuration; Tailwind v4 handles it when using `@tailwindcss/postcss`.
+- Move large utility blocks (e.g., form tweaks) into component classes or separate CSS modules to reduce `app.css` size.
+- Audit `@source` globs to ensure they only include shipped code; drop the `packages/ui/dist` glob once the directory is removed and exclude tests/stories.
+- Standardize on root‑level `tailwindcss@4.1.12` dependency and remove duplicates from nested `package.json` files.
+- Document design tokens and utilities for contributors.
+
+## Definition of Done
+
+- `app.css` contains only global theme and shared utilities; component-specific styles live with components.
+- PostCSS config minimal and relies on Tailwind's defaults.
+- `@source` paths point only at source directories.
+- Only one `tailwindcss` dependency version across the monorepo.
