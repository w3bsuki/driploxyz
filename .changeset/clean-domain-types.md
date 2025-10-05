---
"@repo/domain": patch
---

### Fixed Domain TypeScript Declarations

- **Error handling**: Fixed all `result.error` property access patterns with proper casting
- **Type imports**: Added missing `Money` and `Slug` type imports from entities
- **Database mapping**: Resolved null/undefined handling in domain entity mappers
- **Value objects**: Fixed object literal creation for Money/Slug instead of constructors
- **Error type consistency**: ValidationError vs NotFoundError alignment in services
- **Build output**: Now generates clean DTS files without compilation errors

### Quality Improvements
- All unit tests passing (12/12)
- TypeScript strict mode compliance
- ESM and DTS builds successful
- No internal factory leakage in public exports