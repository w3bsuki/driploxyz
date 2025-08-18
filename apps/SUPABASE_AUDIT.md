                                                                                                                                                   
# Driplo Web: Auth, Forms, Routing Audit Plan                                                                                                      
                                                                                                                                                   
Date: 2025-08-18                                                                                                                                   
Owner: Web App Team                                                                                                                                
Status: Draft                                                                                                                                      
                                                                                                                                                   
## Scope                                                                                                                                           
                                                                                                                                                   
- SvelteKit + Supabase auth best practices                                                                                                         
- Superforms consistency                                                                                                                           
- Routing hygiene and missing routes                                                                                                               
- Bloat/logs/debt cleanup                                                                                                                          
- Security and config hardening                                                                                                                    
- Type safety and DB types                                                                                                                         
- Messaging N+1 query mitigation                                                                                                                   
                                                                                                                                                   
## Outcomes                                                                                                                                        
                                                                                                                                                   
- Single source of truth for auth/session/client across app                                                                                        
- Predictable, minimal logging with opt-in debug                                                                                                   
- Consistent form UX with Superforms where appropriate                                                                                             
- No duplicate/competing routes; missing routes added                                                                                              
- Stronger cookie + CSRF posture                                                                                                                   
- Fewer DB round-trips on messages pages                                                                                                           
- Real, generated Supabase types in use                                                                                                            
                                                                                                                                                   
## Priority Roadmap                                                                                                                                
                                                                                                                                                   
- P0: Remove duplicate Supabase client in (protected); add verify-email page; gate Sentry; reduce production logs                                  
- P1: Optimize messages queries; consolidate auth helpers; rename supabase helpers                                                                 
- P2: Regenerate DB types; re-enable CSRF; unify forgot-password to Superforms                                                                     
- P3: Locals/PageData typing polish; service client policy; optional “resend verification” flow                                                    
                                                                                                                                                   
## P0 Tasks                                                                                                                                        
                                                                                                                                                   
### 1) Remove Duplicate Supabase Client in (protected)                                                                                             
                                                                                                                                                   
- Rationale: Avoid two browser clients, double store writes, and subtle bugs.                                                                      
- Files:                                                                                                                                           
    - apps/web/src/routes/(protected)/+layout.ts                                                                                                   
- Steps:                                                                                                                                           
    - Replace local createBrowserClient(...) with const { supabase, user, session, profile } = await parent().                                     
    - Stop calling setAuthState, setProfile, setAuthLoading here (root layout already handles).                                                    
- Acceptance:                                                                                                                                      
    - Only one Supabase client is created (root layout).                                                                                           
    - Protected pages still load with valid parent() data.                                                                                         
    - No duplicate auth store updates.                                                                                                             
                                                                                                                                                   
### 2) Add Missing Verify Email Route                                                                                                              
                                                                                                                                                   
- Rationale: Signup redirects to /auth/verify-email?email=... but route does not exist.                                                            
- Files:                                                                                                                                           
    - apps/web/src/routes/auth/verify-email/+page.svelte                                                                                           
- Steps:                                                                                                                                           
    - Create a simple page explaining verification step, showing target email, and a button for “Resend email” (optional P3 endpoint).             
- Acceptance:                                                                                                                                      
    - Navigating after signup lands on verify page without 404.                                                                                    
    - Page renders target email from query param.                                                                                                  
                                                                                                                                                   
### 3) Gate Sentry Initialization on DSN                                                                                                           
                                                                                                                                                   
- Rationale: Avoid unnecessary init and bundle weight when DSN is unset.                                                                           
- Files:                                                                                                                                           
    - apps/web/src/hooks.server.ts                                                                                                                 
    - apps/web/src/hooks.client.ts                                                                                                                 
- Steps:                                                                                                                                           
    - Wrap Sentry.init(...) in if (dsn) checks and only add integrations when DSN present.                                                         
- Acceptance:                                                                                                                                      
    - No Sentry initialization in local dev unless DSN is set.                                                                                     
    - Errors still handled when DSN configured.                                                                                                    
                                                                                                                                                   
### 4) Reduce Production Logging                                                                                                                   
                                                                                                                                                   
- Rationale: Current logs are verbose and noisy in production.                                                                                     
- Files:                                                                                                                                           
    - apps/web/src/hooks.server.ts                                                                                                                 
    - apps/web/src/routes/messages/+page.server.ts                                                                                                 
- Steps:                                                                                                                                           
    - Add const DEBUG = process.env.DEBUG === 'true'.                                                                                              
    - Guard all console logs (except critical errors) with if (DEBUG).                                                                             
    - Remove “test” queries and misleading comments in messages loader.                                                                            
- Acceptance:                                                                                                                                      
    - Production logs are minimal by default.                                                                                                      
    - Debug logs available when DEBUG=true.                                                                                                        
                                                                                                                                                   
## P1 Tasks                                                                                                                                        
                                                                                                                                                   
### 5) Optimize Messages Page (Remove N+1)                                                                                                         
                                                                                                                                                   
- Rationale: Current loader loops and queries sender/receiver/product per message.                                                                 
- Files:                                                                                                                                           
    - apps/web/src/routes/messages/+page.server.ts                                                                                                 
    - supabase/functions/sql or migrations (optional RPC/view)                                                                                     
- Approaches:                                                                                                                                      
    - A) Batch fetch:                                                                                                                              
    - Collect unique `sender_id`/`receiver_id` and fetch profiles with `.in('id', [...])`.                                                         
    - Collect `product_id` (non-null) and fetch products in one query (including images).                                                          
    - Map in-memory.                                                                                                                               
- B) RPC/view:                                                                                                                                     
    - Create `get_user_messages_with_meta(user_id uuid)` returning messages with sender/receiver/product meta.                                     
- Acceptance:                                                                                                                                      
    - Loader performs ≤ 4 queries total.                                                                                                           
    - No per-message DB calls.                                                                                                                     
    - UI shows identical data.                                                                                                                     
                                                                                                                                                   
### 6) Consolidate Auth Helpers                                                                                                                    
                                                                                                                                                   
- Rationale: Duplication between $lib/auth.ts and $lib/stores/auth.ts.                                                                             
- Files:                                                                                                                                           
    - apps/web/src/lib/auth.ts                                                                                                                     
    - apps/web/src/lib/stores/auth.ts                                                                                                              
- Steps:                                                                                                                                           
    - Keep reactive derivations in stores (displayName, canSell).                                                                                  
    - Keep server-only helpers in $lib/auth.ts for loads/actions (e.g., requireAuth, profile guards).                                              
    - Remove duplicated logic or delegate one to the other.                                                                                        
- Acceptance:                                                                                                                                      
    - Single implementation source for each helper.                                                                                                
    - No duplicate names with divergent logic.                                                                                                     
                                                                                                                                                   
### 7) Rename Supabase Helpers to Avoid Collisions                                                                                                 
                                                                                                                                                   
- Rationale: Two createClient exports (browser/server) increase confusion.                                                                         
- Files:                                                                                                                                           
    - apps/web/src/lib/supabase/client.ts                                                                                                          
    - apps/web/src/lib/supabase/server.ts                                                                                                          
    - Imports throughout                                                                                                                           
- Steps:                                                                                                                                           
    - Rename exports to createBrowserSupabaseClient and createServerSupabaseClient.                                                                
    - Update imports where used (note: root layout currently uses @supabase/ssr directly—OK to keep).                                              
- Acceptance:                                                                                                                                      
    - Clear naming, no ambiguous imports.                                                                                                          
    - Build passes.                                                                                                                                
                                                                                                                                                   
## P2 Tasks                                                                                                                                        
                                                                                                                                                   
### 8) Generate and Adopt Real Supabase Types                                                                                                      
                                                                                                                                                   
- Rationale: Hand-written placeholder types risk drift and runtime bugs.                                                                           
- Files:                                                                                                                                           
    - apps/web/src/lib/types/database.types.ts                                                                                                     
- Steps:                                                                                                                                           
    - Use CLI: supabase gen types typescript --project-id <id> --schema public > apps/web/src/lib/types/database.types.ts                          
    - Update any mismatches in services/routes.                                                                                                    
- Acceptance:                                                                                                                                      
    - Types reflect actual DB.                                                                                                                     
    - Type errors resolved; no casts hiding issues.                                                                                                
                                                                                                                                                   
### 9) Re-enable CSRF Origin Checks                                                                                                                
                                                                                                                                                   
- Rationale: csrf.checkOrigin: false weakens security posture.                                                                                     
- Files:                                                                                                                                           
    - apps/web/svelte.config.js                                                                                                                    
- Steps:                                                                                                                                           
    - Set csrf.checkOrigin: true (default).                                                                                                        
    - If needed, configure allowed origins via headers/proxy.                                                                                      
    - Verify OAuth callback (GET) not affected.                                                                                                    
- Acceptance:                                                                                                                                      
    - All forms post without CSRF errors in expected origins.                                                                                      
    - No regressions on OAuth callback.                                                                                                            
                                                                                                                                                   
### 10) Cookie Policy Hardening                                                                                                                    
                                                                                                                                                   
- Rationale: Stick to safe defaults and remove misleading comments.                                                                                
- Files:                                                                                                                                           
    - apps/web/src/hooks.server.ts                                                                                                                 
- Steps:                                                                                                                                           
    - Ensure httpOnly: true, sameSite: 'lax', secure when protocol is https (as implemented).                                                      
    - Remove comment that suggests relaxing httpOnly.                                                                                              
- Acceptance:                                                                                                                                      
    - No mobile regressions observed.                                                                                                              
    - Clear, accurate comments.                                                                                                                    
                                                                                                                                                   
### 11) Convert Forgot-Password to Superforms (Optional)                                                                                           
                                                                                                                                                   
- Rationale: Consistent validation and UX with login/signup.                                                                                       
- Files:                                                                                                                                           
    - apps/web/src/routes/(auth)/forgot-password/+page.server.ts                                                                                   
    - apps/web/src/routes/(auth)/forgot-password/+page.svelte                                                                                      
    - Optional: add simple zod schema                                                                                                              
- Acceptance:                                                                                                                                      
    - Client-side validation and server errors match other auth screens.                                                                           
                                                                                                                                                   
## P3 Tasks                                                                                                                                        
                                                                                                                                                   
### 12) Typing Polish for Locals/PageData                                                                                                          
                                                                                                                                                   
- Rationale: Avoid repeated manual shapes in loads; carry profile when useful.                                                                     
- Files:                                                                                                                                           
    - apps/web/src/app.d.ts                                                                                                                        
    - Key loads using profile                                                                                                                      
- Steps:                                                                                                                                           
    - Consider adding profile?: … to App.Locals and App.PageData if used broadly.                                                                  
- Acceptance:                                                                                                                                      
    - Better type inference across loads.                                                                                                          
                                                                                                                                                   
### 13) Service Client Policy (Keep or Remove)                                                                                                     
                                                                                                                                                   
- Rationale: createServiceClient bypasses RLS; currently unused.                                                                                   
- Files:                                                                                                                                           
    - apps/web/src/lib/supabase/server.ts                                                                                                          
- Steps:                                                                                                                                           
    - If unused, remove.                                                                                                                           
    - If kept, add docstring warning “server-only; never import in client”.                                                                        
- Acceptance:                                                                                                                                      

### 14) Verify Email: Optional “Resend” Endpoint

- Rationale: Better UX for stuck verification emails.
- Files:
    - apps/web/src/routes/auth/verify-email/+page.svelte
    - apps/web/src/routes/auth/verify-email/+server.ts (optional)
- Steps:
    - POST handler: supabase.auth.resend({ type: 'signup', email }).
- Acceptance:
    - Resend works; rate-limit via UI.

## Env & Ops

- Add DEBUG toggle in Vercel env for controlled server logs.
- Keep .env.example free of service keys.
- Verify PUBLIC_SUPABASE_* present in prod environments.

## Testing & Verification

- Smoke: login, signup, logout, onboarding redirect behaviors.
- Verify: /auth/callback success path and failure path redirect.
- Messages page: before/after DB call count and performance.
- CSRF: Validate form submissions in dev + preview + prod.
- Sentry: With and without DSN; events captured only when DSN set.

## Rollout Plan

- Merge P0 as a single PR; verify staging.
- P1 can be split: (a) messages optimization, (b) helpers consolidation.
- P2 types generation can be noisy; gate with a branch and staged fixes.
- P3 optional UX and typing refinements can ship incrementally.

## Acceptance Checklist

- [ ] Single Supabase browser client; no duplicate store writes
- [ ] /auth/verify-email exists and works
- [ ] Sentry only initializes when DSN present
- [ ] Production logs minimal; DEBUG toggle works
- [ ] Messages page has no N+1 queries
- [ ] Auth helpers consolidated without duplication
- [ ] Supabase helpers clearly named (browser/server)
- [ ] Real DB types adopted and type errors resolved
- [ ] CSRF origin checks re-enabled; no regressions
- [ ] Cookies hardened; comments accurate
- [ ] Forgot-password optionally using Superforms
- [ ] Locals/PageData typing polished
- [ ] Service client usage policy decided and enforced