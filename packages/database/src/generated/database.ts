// Re-export the canonical generated Supabase types.
// The real generated source lives one directory up at ../generated.ts
// and is compiled to ../generated.js. Keeping this shim avoids breaking
// older import paths such as `@repo/database/src/generated/database` while
// ensuring consumers receive the actual generated definitions.
export type { Json, Database } from '../generated.js';
