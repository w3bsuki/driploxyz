# /fix-types - Fix TypeScript Errors

Systematically fix TypeScript errors in the Driplo project.

## Steps:
1. Run `pnpm check-types` to identify all errors
2. Start with database-related type errors first
3. If needed, run `pnpm db:types` to regenerate Supabase types
4. Fix service layer types next
5. Then component prop types
6. Update WORK.md with progress
7. Commit fixes every 10 errors resolved

Focus on:
- Don't over-engineer fixes
- Prefer explicit types over 'any'
- Maintain mobile-first patterns
- Test that fixes don't break functionality