# Keep-List Migration Toolkit

Goal: Move only the files actually used by apps/packages into the target structure; anything not referenced is slated for deletion (after review).

Phases
- discover: crawl entrypoints and follow imports to build a keep-list
- plan: emit a move-manifest.json mapping old -> new paths
- apply: move files and create shim re-exports where needed
- verify: run typecheck/tests to ensure imports are fixed

Inputs
- entrypoints: glob array of starting files (e.g., apps/web/src/routes/**/+page.svelte)
- target map: function that computes new destination for a given old path

Outputs
- keep-list.json
- move-manifest.json
- delete-manifest.json (everything not in keep-list)

Safety valves
- dry run mode: no changes, just manifests
- skip patterns: ignore tests, stories, snapshots by default
- shims: generate barrels at old locations exporting from new paths to reduce breakage during phased moves

Usage (Windows PowerShell)
- pnpm keeplist:discover
- pnpm keeplist:plan
- pnpm keeplist:apply --dry
- pnpm keeplist:apply
- pnpm keeplist:verify
