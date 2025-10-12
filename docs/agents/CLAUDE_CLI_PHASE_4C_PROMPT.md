# 🤖 Claude CLI Agent: Execute Phase 4C - Apps/Web Restructure

> **🚨 CRITICAL EXECUTION DIRECTIVE 🚨**
> 
> You are an EXECUTION AGENT, not a planning agent. You MUST:
> 1. ✅ START EXECUTING IMMEDIATELY - Do not ask for permission
> 2. ✅ RUN EVERY POWERSHELL COMMAND in this document
> 3. ✅ COMPLETE ALL 9 STEPS in this session
> 4. ✅ COMMIT changes at the end
> 
> **DO NOT:** Plan, analyze, or discuss. **JUST EXECUTE.**
> 
> If you see a PowerShell code block, you MUST run it. No exceptions.

---

## 🎯 YOUR MISSION

You are a **systematic execution agent**. Your job is to restructure `apps/web/` to follow SvelteKit 2 + Svelte 5 best practices:

1. **Layout Groups** - Organize routes into `(app)/(shop)/`, `(app)/(account)/`, `(auth)/`, `(marketing)/`
2. **Route Colocation** - Move route-specific components to live WITH their routes  
3. **$lib/server/ Separation** - Move ALL server-only code to `$lib/server/`
4. **Clean $lib/components/** - Keep ONLY truly shared components

**This is THE BIG ONE** - the restructure that gets toward the "clean sitemap and structure" goal.

**Your output will be audited by GitHub Copilot**, so be thorough and document everything.

---

## 📋 CRITICAL CONTEXT

**Monorepo:** `K:\driplo-turbo-1\` (SvelteKit 2 + Turborepo + Svelte 5)  
**Shell:** PowerShell (Windows)  
**Phase Status:**
- ✅ Phase 4A Complete: UI package restructured (174 components, score: 115/120)
- ✅ Phase 4B Complete: Domain package restructured (7 domains, score: 115/120)
- ⏳ Phase 4C: Apps/web restructure (YOU ARE HERE)

**Current apps/web/src/ structure:**
```
lib/
├── components/         # Mixed: some shared, some route-specific
│   ├── Header.svelte   # KEEP (shared)
│   ├── layout/         # KEEP (shared)
│   ├── modular/        # MOVE to routes (route-specific)
│   └── forms/          # AUDIT (may be mixed)
├── server/             # ✅ Good start, but incomplete
├── auth/               # ❌ Has server code NOT in server/
├── analytics/
├── categories/
├── client/
├── cookies/
├── ... (many more)
routes/
├── (admin)/            # ✅ Layout group (good)
├── (auth)/             # ✅ Layout group (good)
├── (protected)/        # ✅ Layout group (good)
├── (api)/              # ✅ Layout group (good)
├── search/             # ❌ Should be in (app)/(shop)/
├── product/            # ❌ Should be in (app)/(shop)/
├── profile/            # ❌ Should be in (app)/(account)/
├── brands/             # ❌ Should be in (app)/(shop)/ or (marketing)/
├── category/           # ❌ Should be in (app)/(shop)/
└── ... (many more loose routes)
```

---

## 📚 EXECUTION PLAN

**Primary reference:** This file contains your complete checklist below.

**For deep understanding, read these sections:**
1. `K:\driplo-turbo-1\PHASE_4_COMPLETE_RESTRUCTURE.md` (lines 251-450)
   - Complete apps/web target structure
   - Layout group organization
   - Route colocation examples
   
2. `K:\driplo-turbo-1\docs\IDEAL_STRUCTURE.md` (lines 44-150)
   - SvelteKit 2 best practices
   - File naming conventions
   - $lib/server/ separation rules

**You can execute from this file alone**, but reading those sections will help you understand the "why" behind each step.

---

## 🎓 LESSONS FROM PHASE 4A & 4B

**What worked perfectly:**
- Systematic audit before making changes
- Creating detailed mapping JSON for tracking
- Using PowerShell scripts for file operations
- Testing builds before claiming completion
- Testing dev server to ensure nothing broke
- Single atomic commit at the end

**Apply the same discipline here.**

---

## 📋 STEP-BY-STEP CHECKLIST

> **⚡ EXECUTION MODE: Each step below has PowerShell commands. RUN THEM IMMEDIATELY.**

---

### STEP 1: AUDIT CURRENT STRUCTURE (30 min)

**Goal:** Understand what exists before moving anything.

**🚨 EXECUTE THESE COMMANDS NOW:**

#### 1.1 Map all routes
```powershell
# List all routes with their current locations
$routes = Get-ChildItem -Path "K:\driplo-turbo-1\apps\web\src\routes" -Directory -Recurse | Where-Object { $_.Name -notlike "*node_modules*" }

# Create route map
$routeMap = @()
foreach ($route in $routes) {
    $relativePath = $route.FullName.Replace("K:\driplo-turbo-1\apps\web\src\routes\", "")
    $hasPageSvelte = Test-Path (Join-Path $route.FullName "+page.svelte")
    $hasLayoutSvelte = Test-Path (Join-Path $route.FullName "+layout.svelte")
    $hasServerTs = Test-Path (Join-Path $route.FullName "+page.server.ts")
    
    $routeMap += [PSCustomObject]@{
        Path = $relativePath
        HasPage = $hasPageSvelte
        HasLayout = $hasLayoutSvelte
        HasServer = $hasServerTs
        ProposedGroup = ""  # Fill this in during categorization
    }
}

# Save route map
$routeMap | ConvertTo-Json | Out-File "K:\driplo-turbo-1\phase4c-route-map.json"
```

#### 1.2 Categorize routes into layout groups

Based on URL patterns and purpose, categorize each route:

**`(app)/(shop)/`** - Shop/commerce routes:
- `search/` → `(app)/(shop)/search/`
- `product/` → `(app)/(shop)/product/`
- `products/` → `(app)/(shop)/products/` (if exists)
- `category/` → `(app)/(shop)/category/`
- `brands/` → `(app)/(shop)/brands/`
- `collection/` → `(app)/(shop)/collection/`
- `designer/` → `(app)/(shop)/designer/`
- `drip/` → `(app)/(shop)/drip/` (if shop-related)
- `wishlist/` → `(app)/(shop)/wishlist/`
- `sellers/` → `(app)/(shop)/sellers/`

**`(app)/(account)/`** - User account routes:
- `profile/` → `(app)/(account)/profile/`
- `pro/` → `(app)/(account)/pro/`

**`(auth)/`** - Authentication routes (ALREADY DONE):
- `auth/` - ✅ Already at `(auth)/`
- `register/` → `(auth)/register/`
- `logout/` → `(auth)/logout/`

**`(marketing)/`** - Marketing/info pages:
- `about/` → `(marketing)/about/`
- `blog/` → `(marketing)/blog/`
- `careers/` → `(marketing)/careers/`
- `help/` → `(marketing)/help/`
- `privacy/` → `(marketing)/privacy/`
- `terms/` → `(marketing)/terms/`
- `returns/` → `(marketing)/returns/`
- `trust-safety/` → `(marketing)/trust-safety/`

**Keep at root level:**
- `(admin)/` - ✅ Already grouped
- `(api)/` - ✅ Already grouped  
- `(protected)/` - ✅ Already grouped
- `api/` - API routes
- `+layout.svelte` - Root layout
- `+page.svelte` - Homepage
- `+error.svelte` - Root error page
- `sitemap.xml/` - SEO
- `robots.txt/` - SEO
- `offline/` - PWA
- `[...slug]/` - Catch-all

#### 1.3 Update route map with proposed groups
```powershell
# Manually edit phase4c-route-map.json to add ProposedGroup for each route
# Example:
# {
#   "Path": "search",
#   "HasPage": true,
#   "HasLayout": false,
#   "HasServer": true,
#   "ProposedGroup": "(app)/(shop)/search"
# }
```

#### 1.4 Audit lib/components
```powershell
# List all components
$components = Get-ChildItem -Path "K:\driplo-turbo-1\apps\web\src\lib\components" -Recurse -Include *.svelte

# For each component, determine if it's:
# - SHARED (used by multiple routes) → KEEP in lib/components
# - ROUTE-SPECIFIC (used by one route) → MOVE to route's components/ folder

# Create component map
$componentMap = @()
foreach ($comp in $components) {
    $relativePath = $comp.FullName.Replace("K:\driplo-turbo-1\apps\web\src\lib\components\", "")
    
    # Search for imports of this component
    $imports = Select-String -Path "K:\driplo-turbo-1\apps\web\src\routes" -Pattern $comp.BaseName -Recurse
    $usageCount = ($imports | Measure-Object).Count
    
    $componentMap += [PSCustomObject]@{
        Path = $relativePath
        UsageCount = $usageCount
        Action = if ($usageCount -le 1) { "MOVE to route" } else { "KEEP in lib" }
        TargetRoute = ""  # Fill in during move step
    }
}

# Save component map
$componentMap | ConvertTo-Json | Out-File "K:\driplo-turbo-1\phase4c-component-map.json"
```

**Components that MUST STAY in lib/components:**
- `Header.svelte` (used in root layout)
- `layout/*` (used across multiple routes)
- `error/*` (used for error boundaries)
- `forms/*` (if used by multiple routes)

**Components that SHOULD MOVE:**
- `modular/*` (appears to be for /messages route only)
- Route-specific forms
- Route-specific cards/widgets

#### 1.5 Audit lib/ for server code
```powershell
# Find ALL files that should be in lib/server but aren't
$libFiles = Get-ChildItem -Path "K:\driplo-turbo-1\apps\web\src\lib" -Recurse -Include *.ts,*.js | Where-Object { $_.FullName -notlike "*\lib\server\*" -and $_.FullName -notlike "*node_modules*" }

# Check each file for server-only indicators
$serverCodeMap = @()
foreach ($file in $libFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Check for server-only patterns
    $hasEnvPrivate = $content -match '\$env/static/private|\$env/dynamic/private'
    $hasSupabaseAdmin = $content -match 'createClient.*\{[\s\S]*?serviceRole'
    $hasServerOnlyImport = $content -match "from ['\`"].*\.server['\`"]"
    $hasSecrets = $content -match 'PRIVATE_|SECRET_|API_KEY'
    
    if ($hasEnvPrivate -or $hasSupabaseAdmin -or $hasServerOnlyImport -or $hasSecrets) {
        $relativePath = $file.FullName.Replace("K:\driplo-turbo-1\apps\web\src\lib\", "")
        $serverCodeMap += [PSCustomObject]@{
            CurrentPath = $relativePath
            TargetPath = "server/" + $relativePath
            Reason = @(
                $(if ($hasEnvPrivate) { "Uses private env vars" }),
                $(if ($hasSupabaseAdmin) { "Uses Supabase admin client" }),
                $(if ($hasServerOnlyImport) { "Imports .server files" }),
                $(if ($hasSecrets) { "Contains secrets" })
            ) -join ", "
        }
    }
}

# Save server code map
$serverCodeMap | ConvertTo-Json | Out-File "K:\driplo-turbo-1\phase4c-server-code-map.json"
```

**Directories that likely have server code:**
- `lib/auth/` - Auth logic (some should be in server/)
- `lib/supabase/` - Supabase clients (admin client should be in server/)
- `lib/stripe/` - Stripe logic (API calls should be in server/)
- `lib/analytics/` - Server-side analytics
- `lib/monitoring/` - Server monitoring

#### 1.6 Document audit results
Create `K:\driplo-turbo-1\PHASE_4C_AUDIT_RESULTS.md`:
```markdown
# Phase 4C Audit Results

## Route Reorganization
- Total routes: [count]
- Routes to move to (app)/(shop)/: [count]
- Routes to move to (app)/(account)/: [count]
- Routes to move to (marketing)/: [count]
- Routes already grouped: [count]

## Component Colocation
- Total components in lib/components: [count]
- Components to KEEP (shared): [count]
- Components to MOVE (route-specific): [count]

## Server Code Separation
- Files already in lib/server/: [count]
- Files to MOVE to lib/server/: [count]

## Estimated Changes
- File moves: ~[count]
- Import updates: ~[count]
- Layout groups to create: 4 (shop, account, marketing, + nested)

See generated JSON maps for complete details.
```

---

### STEP 2: CREATE LAYOUT GROUP STRUCTURE (15 min)

**Goal:** Create all layout group directories before moving routes.

#### 2.1 Create shop layout group
```powershell
# Create (app)/(shop) structure
$shopBase = "K:\driplo-turbo-1\apps\web\src\routes\(app)\(shop)"
New-Item -Path $shopBase -ItemType Directory -Force

# Create shop layout
$shopLayout = @"
<script lang="ts">
  // Shop layout - wrap shop pages with shop-specific UI
  import { page } from '\$app/stores';
</script>

<div class="shop-layout">
  <!-- Shop header/nav could go here -->
  <slot />
  <!-- Shop footer could go here -->
</div>

<style>
  .shop-layout {
    /* Shop-specific styles */
  }
</style>
"@

$shopLayout | Out-File -FilePath (Join-Path $shopBase "+layout.svelte") -Encoding UTF8
```

#### 2.2 Create account layout group
```powershell
# Create (app)/(account) structure
$accountBase = "K:\driplo-turbo-1\apps\web\src\routes\(app)\(account)"
New-Item -Path $accountBase -ItemType Directory -Force

# Create account layout
$accountLayout = @"
<script lang="ts">
  // Account layout - wrap account pages with account-specific UI
  import { page } from '\$app/stores';
  
  // Ensure user is authenticated (could add guard here)
</script>

<div class="account-layout">
  <aside>
    <!-- Account sidebar/nav -->
  </aside>
  <main>
    <slot />
  </main>
</div>

<style>
  .account-layout {
    display: grid;
    grid-template-columns: 250px 1fr;
    gap: 2rem;
  }
</style>
"@

$accountLayout | Out-File -FilePath (Join-Path $accountBase "+layout.svelte") -Encoding UTF8
```

#### 2.3 Create marketing layout group
```powershell
# Create (marketing) structure
$marketingBase = "K:\driplo-turbo-1\apps\web\src\routes\(marketing)"
New-Item -Path $marketingBase -ItemType Directory -Force

# Create marketing layout
$marketingLayout = @"
<script lang="ts">
  // Marketing layout - wrap marketing pages with marketing-specific UI
</script>

<div class="marketing-layout">
  <!-- Simpler header for marketing pages -->
  <slot />
  <!-- Marketing-focused footer -->
</div>

<style>
  .marketing-layout {
    /* Marketing-specific styles */
  }
</style>
"@

$marketingLayout | Out-File -FilePath (Join-Path $marketingBase "+layout.svelte") -Encoding UTF8
```

#### 2.4 Create app parent layout
```powershell
# Create (app) parent layout (wraps both shop and account)
$appBase = "K:\driplo-turbo-1\apps\web\src\routes\(app)"
New-Item -Path $appBase -ItemType Directory -Force

# Create app layout
$appLayout = @"
<script lang="ts">
  // Main app layout (authenticated area)
  // This wraps both (shop) and (account) groups
</script>

<div class="app-layout">
  <slot />
</div>

<style>
  .app-layout {
    /* App-wide authenticated styles */
  }
</style>
"@

$appLayout | Out-File -FilePath (Join-Path $appBase "+layout.svelte") -Encoding UTF8
```

---

### STEP 3: MOVE ROUTES TO LAYOUT GROUPS (45 min)

**Goal:** Systematically move routes to their correct layout groups.

#### 3.1 Move shop routes
```powershell
# Load route map
$routeMap = Get-Content "K:\driplo-turbo-1\phase4c-route-map.json" | ConvertFrom-Json

# Filter shop routes
$shopRoutes = $routeMap | Where-Object { $_.ProposedGroup -like "*shop*" }

foreach ($route in $shopRoutes) {
    $sourcePath = "K:\driplo-turbo-1\apps\web\src\routes\$($route.Path)"
    $targetPath = "K:\driplo-turbo-1\apps\web\src\routes\$($route.ProposedGroup)"
    
    if (Test-Path $sourcePath) {
        # Create target directory
        New-Item -Path $targetPath -ItemType Directory -Force | Out-Null
        
        # Move route files
        Move-Item -Path $sourcePath\* -Destination $targetPath -Force
        
        # Remove empty source directory
        if ((Get-ChildItem $sourcePath).Count -eq 0) {
            Remove-Item $sourcePath -Force
        }
        
        Write-Host "✅ Moved $($route.Path) → $($route.ProposedGroup)"
    }
}
```

**Routes to move (examples):**
```powershell
# Shop routes
Move-Item "src\routes\search" "src\routes\(app)\(shop)\search"
Move-Item "src\routes\product" "src\routes\(app)\(shop)\product"
Move-Item "src\routes\category" "src\routes\(app)\(shop)\category"
Move-Item "src\routes\brands" "src\routes\(app)\(shop)\brands"
Move-Item "src\routes\collection" "src\routes\(app)\(shop)\collection"
Move-Item "src\routes\designer" "src\routes\(app)\(shop)\designer"
Move-Item "src\routes\wishlist" "src\routes\(app)\(shop)\wishlist"
Move-Item "src\routes\sellers" "src\routes\(app)\(shop)\sellers"
```

#### 3.2 Move account routes
```powershell
# Account routes
Move-Item "src\routes\profile" "src\routes\(app)\(account)\profile"
Move-Item "src\routes\pro" "src\routes\(app)\(account)\pro"
```

#### 3.3 Move auth routes (if not already grouped)
```powershell
# Auth routes (some may already be in (auth)/)
# Check first, then move if needed
if (Test-Path "src\routes\register" -and -not (Test-Path "src\routes\(auth)\register")) {
    Move-Item "src\routes\register" "src\routes\(auth)\register"
}

if (Test-Path "src\routes\logout" -and -not (Test-Path "src\routes\(auth)\logout")) {
    Move-Item "src\routes\logout" "src\routes\(auth)\logout"
}
```

#### 3.4 Move marketing routes
```powershell
# Marketing routes
$marketingRoutes = @("about", "blog", "careers", "help", "privacy", "terms", "returns", "trust-safety")

foreach ($route in $marketingRoutes) {
    $sourcePath = "src\routes\$route"
    $targetPath = "src\routes\(marketing)\$route"
    
    if (Test-Path $sourcePath) {
        New-Item -Path "src\routes\(marketing)" -ItemType Directory -Force | Out-Null
        Move-Item $sourcePath $targetPath -Force
        Write-Host "✅ Moved $route → (marketing)/$route"
    }
}
```

---

### STEP 4: COLOCATE ROUTE-SPECIFIC COMPONENTS (45 min)

**Goal:** Move route-specific components to live WITH their routes.

#### 4.1 Move modular components (messages route)
```powershell
# The modular/ components are used by (protected)/messages
$modularPath = "K:\driplo-turbo-1\apps\web\src\lib\components\modular"
$targetPath = "K:\driplo-turbo-1\apps\web\src\routes\(protected)\messages\components"

# Create components folder in messages route
New-Item -Path $targetPath -ItemType Directory -Force | Out-Null

# Move modular components
if (Test-Path $modularPath) {
    Get-ChildItem $modularPath\*.svelte | ForEach-Object {
        Move-Item $_.FullName (Join-Path $targetPath $_.Name) -Force
        Write-Host "✅ Moved $($_.Name) → messages/components/"
    }
    
    # Remove empty modular directory
    if ((Get-ChildItem $modularPath).Count -eq 0) {
        Remove-Item $modularPath -Force
    }
}
```

#### 4.2 Identify and move other route-specific components
```powershell
# Load component map
$componentMap = Get-Content "K:\driplo-turbo-1\phase4c-component-map.json" | ConvertFrom-Json

# Filter components to move
$componentsToMove = $componentMap | Where-Object { $_.Action -eq "MOVE to route" }

foreach ($comp in $componentsToMove) {
    # You'll need to manually determine target route for each
    # This requires checking where the component is used
    
    $sourcePath = "K:\driplo-turbo-1\apps\web\src\lib\components\$($comp.Path)"
    
    # Example: If VirtualProductGrid is only used in search page
    if ($comp.Path -like "*VirtualProductGrid*") {
        $targetPath = "K:\driplo-turbo-1\apps\web\src\routes\(app)\(shop)\search\components"
        New-Item -Path $targetPath -ItemType Directory -Force | Out-Null
        Move-Item $sourcePath (Join-Path $targetPath (Split-Path $sourcePath -Leaf)) -Force
        Write-Host "✅ Moved VirtualProductGrid → search/components/"
    }
    
    # Continue for other route-specific components...
}
```

#### 4.3 Keep shared components
Components that STAY in `lib/components/`:
- `Header.svelte`
- `layout/*`
- `error/*`
- `ErrorBoundary.svelte`
- `FormErrorBoundary.svelte`
- `PaymentErrorBoundary.svelte`
- `RealtimeErrorBoundary.svelte`
- `RealtimeManager.svelte`
- `LocaleDetector.svelte`
- `RegionSwitchModal.svelte`
- `OptimizedImage.svelte`
- `PageLoader.svelte`
- `forms/*` (if used by multiple routes)

---

### STEP 5: MOVE SERVER CODE TO $lib/server/ (45 min)

**Goal:** Ensure ALL server-only code is in `$lib/server/`.

#### 5.1 Move auth server code
```powershell
$authPath = "K:\driplo-turbo-1\apps\web\src\lib\auth"
$serverAuthPath = "K:\driplo-turbo-1\apps\web\src\lib\server\auth"

# Create server auth directory
New-Item -Path $serverAuthPath -ItemType Directory -Force | Out-Null

# Find server-only auth files
$authFiles = Get-ChildItem $authPath -Recurse -Include *.ts,*.js

foreach ($file in $authFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Check if it's server-only
    $isServerOnly = $content -match '\$env/static/private|\$env/dynamic/private|serviceRole|PRIVATE_|SECRET_'
    
    if ($isServerOnly) {
        $relativePath = $file.FullName.Replace($authPath, "")
        $targetPath = Join-Path $serverAuthPath $relativePath
        
        # Create target directory
        $targetDir = Split-Path $targetPath -Parent
        New-Item -Path $targetDir -ItemType Directory -Force | Out-Null
        
        # Move file
        Move-Item $file.FullName $targetPath -Force
        Write-Host "✅ Moved $($file.Name) → lib/server/auth/"
    }
}
```

#### 5.2 Move Supabase server code
```powershell
$supabasePath = "K:\driplo-turbo-1\apps\web\src\lib\supabase"
$serverSupabasePath = "K:\driplo-turbo-1\apps\web\src\lib\server\supabase"

# Create server supabase directory
New-Item -Path $serverSupabasePath -ItemType Directory -Force | Out-Null

# Look for admin client (server-only)
$supabaseFiles = Get-ChildItem $supabasePath -Recurse -Include *.ts,*.js

foreach ($file in $supabaseFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Check if it creates admin client
    $isAdminClient = $content -match 'createClient.*\{[\s\S]*?serviceRole|SUPABASE_SERVICE_ROLE'
    
    if ($isAdminClient) {
        $relativePath = $file.FullName.Replace($supabasePath, "")
        $targetPath = Join-Path $serverSupabasePath $relativePath
        
        $targetDir = Split-Path $targetPath -Parent
        New-Item -Path $targetDir -ItemType Directory -Force | Out-Null
        
        Move-Item $file.FullName $targetPath -Force
        Write-Host "✅ Moved $($file.Name) → lib/server/supabase/"
    }
}
```

#### 5.3 Move Stripe server code
```powershell
$stripePath = "K:\driplo-turbo-1\apps\web\src\lib\stripe"
$serverStripePath = "K:\driplo-turbo-1\apps\web\src\lib\server\stripe"

# Stripe API calls should be server-only
if (Test-Path $stripePath) {
    # Move entire stripe/ to server/ (Stripe SDK is server-only)
    New-Item -Path (Split-Path $serverStripePath -Parent) -ItemType Directory -Force | Out-Null
    Move-Item $stripePath $serverStripePath -Force
    Write-Host "✅ Moved stripe/ → lib/server/stripe/"
}
```

#### 5.4 Move analytics server code
```powershell
$analyticsPath = "K:\driplo-turbo-1\apps\web\src\lib\analytics"
$serverAnalyticsPath = "K:\driplo-turbo-1\apps\web\src\lib\server\analytics"

if (Test-Path $analyticsPath) {
    $analyticsFiles = Get-ChildItem $analyticsPath -Recurse -Include *.ts,*.js
    
    foreach ($file in $analyticsFiles) {
        $content = Get-Content $file.FullName -Raw
        
        # Check if server-only (API calls, private keys)
        $isServerOnly = $content -match '\$env/static/private|\$env/dynamic/private|fetch.*headers.*Authorization'
        
        if ($isServerOnly) {
            $relativePath = $file.FullName.Replace($analyticsPath, "")
            $targetPath = Join-Path $serverAnalyticsPath $relativePath
            
            $targetDir = Split-Path $targetPath -Parent
            New-Item -Path $targetDir -ItemType Directory -Force | Out-Null
            
            Move-Item $file.FullName $targetPath -Force
            Write-Host "✅ Moved $($file.Name) → lib/server/analytics/"
        }
    }
}
```

#### 5.5 Move monitoring server code
```powershell
$monitoringPath = "K:\driplo-turbo-1\apps\web\src\lib\monitoring"
$serverMonitoringPath = "K:\driplo-turbo-1\apps\web\src\lib\server\monitoring"

if (Test-Path $monitoringPath) {
    # Monitoring is typically server-only
    New-Item -Path (Split-Path $serverMonitoringPath -Parent) -ItemType Directory -Force | Out-Null
    Move-Item $monitoringPath $serverMonitoringPath -Force
    Write-Host "✅ Moved monitoring/ → lib/server/monitoring/"
}
```

---

### STEP 6: UPDATE ALL IMPORTS (60 min)

**Goal:** Fix ALL broken imports after file moves.

#### 6.1 Create import mapping
```powershell
# Generate import update map
$importMap = @{
    # Route component imports (OLD → NEW)
    "from '\$lib/components/modular/ConversationSidebar.svelte'" = "from './components/ConversationSidebar.svelte'"
    "from '\$lib/components/modular/ChatWindow.svelte'" = "from './components/ChatWindow.svelte'"
    "from '\$lib/components/modular/ConnectionStatus.svelte'" = "from './components/ConnectionStatus.svelte'"
    
    # Server imports (OLD → NEW)
    "from '\$lib/auth/" = "from '\$lib/server/auth/"
    "from '\$lib/supabase/admin'" = "from '\$lib/server/supabase/admin'"
    "from '\$lib/stripe/" = "from '\$lib/server/stripe/"
    "from '\$lib/analytics/" = "from '\$lib/server/analytics/"
    "from '\$lib/monitoring/" = "from '\$lib/server/monitoring/"
}

# Save import map
$importMap | ConvertTo-Json | Out-File "K:\driplo-turbo-1\phase4c-import-map.json"
```

#### 6.2 Update route component imports
```powershell
# For moved routes, update imports to use relative paths for colocated components
$routeFiles = Get-ChildItem -Path "K:\driplo-turbo-1\apps\web\src\routes" -Recurse -Include *.svelte,*.ts

foreach ($file in $routeFiles) {
    $content = Get-Content $file.FullName -Raw
    $updated = $false
    
    # Update modular component imports (for messages route)
    if ($content -match "from ['\`"]\`$lib/components/modular/") {
        $content = $content -replace "from ['\`"]\`$lib/components/modular/(.*?\.svelte)['\`"]", "from './components/`$1'"
        $updated = $true
    }
    
    # Continue for other route-specific imports...
    
    if ($updated) {
        $content | Out-File -FilePath $file.FullName -Encoding UTF8 -NoNewline
        Write-Host "✅ Updated imports in $($file.Name)"
    }
}
```

#### 6.3 Update server imports
```powershell
# Update all imports that reference moved server code
$allFiles = Get-ChildItem -Path "K:\driplo-turbo-1\apps\web\src" -Recurse -Include *.svelte,*.ts,*.js | Where-Object { $_.FullName -notlike "*node_modules*" }

foreach ($file in $allFiles) {
    $content = Get-Content $file.FullName -Raw
    $updated = $false
    
    # Update auth imports
    if ($content -match "from ['\`"]\`$lib/auth/") {
        # Check if the imported module is server-only
        # If yes, update to $lib/server/auth/
        $content = $content -replace "from ['\`"]\`$lib/auth/(.*?\.server)", "from '\`$lib/server/auth/`$1"
        $updated = $true
    }
    
    # Update Supabase admin imports
    if ($content -match "from ['\`"]\`$lib/supabase/admin") {
        $content = $content -replace "from ['\`"]\`$lib/supabase/admin", "from '\`$lib/server/supabase/admin"
        $updated = $true
    }
    
    # Update Stripe imports
    if ($content -match "from ['\`"]\`$lib/stripe/") {
        $content = $content -replace "from ['\`"]\`$lib/stripe/", "from '\`$lib/server/stripe/"
        $updated = $true
    }
    
    # Update analytics imports
    if ($content -match "from ['\`"]\`$lib/analytics/") {
        $content = $content -replace "from ['\`"]\`$lib/analytics/(.*?\.server)", "from '\`$lib/server/analytics/`$1"
        $updated = $true
    }
    
    # Update monitoring imports
    if ($content -match "from ['\`"]\`$lib/monitoring/") {
        $content = $content -replace "from ['\`"]\`$lib/monitoring/", "from '\`$lib/server/monitoring/"
        $updated = $true
    }
    
    if ($updated) {
        $content | Out-File -FilePath $file.FullName -Encoding UTF8 -NoNewline
        Write-Host "✅ Updated server imports in $($file.Name)"
    }
}
```

#### 6.4 Handle systematic import fixes with PowerShell script
```powershell
# Create comprehensive import fix script
$fixImportsScript = @'
# Fix all imports systematically
$projectRoot = "K:\driplo-turbo-1\apps\web"

# Define replacements
$replacements = @(
    @{
        Pattern = "from ['\`"]\`$lib/components/modular/(.*?\.svelte)['\`"]"
        Replacement = "from './components/`$1'"
        Scope = "$projectRoot\src\routes\(protected)\messages"
    },
    @{
        Pattern = "from ['\`"]\`$lib/auth/(.*?\.server.*?)['\`"]"
        Replacement = "from '\`$lib/server/auth/`$1'"
        Scope = "$projectRoot\src"
    },
    @{
        Pattern = "from ['\`"]\`$lib/supabase/admin['\`"]"
        Replacement = "from '\`$lib/server/supabase/admin'"
        Scope = "$projectRoot\src"
    }
    # Add more as needed
)

# Apply replacements
foreach ($replacement in $replacements) {
    $files = Get-ChildItem -Path $replacement.Scope -Recurse -Include *.svelte,*.ts,*.js
    
    foreach ($file in $files) {
        $content = Get-Content $file.FullName -Raw
        $newContent = $content -replace $replacement.Pattern, $replacement.Replacement
        
        if ($content -ne $newContent) {
            $newContent | Out-File -FilePath $file.FullName -Encoding UTF8 -NoNewline
            Write-Host "✅ Updated $($file.Name)"
        }
    }
}

Write-Host "`n✅ All imports updated!"
'@

$fixImportsScript | Out-File "K:\driplo-turbo-1\fix-phase4c-imports.ps1" -Encoding UTF8

# Execute the script
& "K:\driplo-turbo-1\fix-phase4c-imports.ps1"
```

---

### STEP 7: VERIFY & TEST (30 min)

**Goal:** Ensure everything builds and runs correctly.

#### 7.1 Check TypeScript errors
```powershell
cd K:\driplo-turbo-1\apps\web
pnpm run check
```

**Expected:** Should pass with 0 errors (or minimal errors related to types, not imports).

#### 7.2 Build the app
```powershell
cd K:\driplo-turbo-1\apps\web
pnpm run build
```

**Expected:** Build should complete successfully.

#### 7.3 Test dev server
```powershell
cd K:\driplo-turbo-1\apps\web
pnpm run dev
```

Visit http://localhost:5173/ and test:
- Homepage loads ✅
- Shop routes work (search, products, etc.) ✅
- Account routes work (profile, etc.) ✅
- Auth routes work (login, register) ✅
- Marketing routes work (about, help, etc.) ✅

#### 7.4 Check for broken imports
```powershell
# Search for any remaining old import patterns
Select-String -Path "K:\driplo-turbo-1\apps\web\src" -Pattern "from ['\`"]\`$lib/components/modular" -Recurse
Select-String -Path "K:\driplo-turbo-1\apps\web\src" -Pattern "from ['\`"]\`$lib/auth/.*\.server" -Recurse
Select-String -Path "K:\driplo-turbo-1\apps\web\src" -Pattern "from ['\`"]\`$lib/stripe/" -Recurse

# Should return ZERO results (all imports updated)
```

---

### STEP 8: DOCUMENT CHANGES (15 min)

#### 8.1 Create restructure summary
Create `K:\driplo-turbo-1\PHASE_4C_RESTRUCTURE_SUMMARY.md`:
```markdown
# Phase 4C: Apps/Web Restructure - COMPLETE ✅

## Summary
Restructured `apps/web/` to follow SvelteKit 2 + Svelte 5 best practices with layout groups, route colocation, and proper server code separation.

## Changes Made

### Layout Groups Created
- `(app)/` - Parent group for authenticated app
  - `(shop)/` - Shop/commerce routes (search, products, brands, etc.)
  - `(account)/` - User account routes (profile, pro)
- `(marketing)/` - Marketing/info pages (about, help, terms, etc.)
- `(auth)/` - Authentication routes (already existed, enhanced)

### Routes Reorganized
**Moved to (app)/(shop)/ ([count] routes):**
- search → (app)/(shop)/search
- product → (app)/(shop)/product
- [list all moved shop routes]

**Moved to (app)/(account)/ ([count] routes):**
- profile → (app)/(account)/profile
- [list all moved account routes]

**Moved to (marketing)/ ([count] routes):**
- about → (marketing)/about
- [list all moved marketing routes]

### Components Colocated
**Moved to route components/ folders ([count] components):**
- modular/* → (protected)/messages/components/
- [list other moved components]

**Kept in lib/components/ ([count] components):**
- Header.svelte (used by root layout)
- layout/* (used across multiple routes)
- error/* (global error boundaries)
- [list other shared components]

### Server Code Separated
**Moved to lib/server/ ([count] files):**
- auth/*.server.ts → lib/server/auth/
- supabase/admin.ts → lib/server/supabase/
- stripe/* → lib/server/stripe/
- [list all moved server code]

### Import Updates
- Total imports updated: [count]
- Route component imports: [count] (now use relative paths)
- Server imports: [count] (now use $lib/server/)

## Verification
✅ TypeScript check: PASSED
✅ Build: SUCCESS
✅ Dev server: WORKS
✅ All routes accessible
✅ No broken imports

## Files Changed
- Routes moved: [count]
- Components moved: [count]
- Server files moved: [count]
- Imports updated: [count]
- New layout files: 4

## Commit Message
```
feat(web): restructure app with SvelteKit 2 layout groups and colocation

- Organize routes into (app)/(shop), (app)/(account), (marketing) layout groups
- Colocate route-specific components with their routes
- Move all server-only code to $lib/server/ (auth, supabase, stripe, analytics, monitoring)
- Update all imports to reflect new structure
- Create layout group +layout.svelte files for shop, account, marketing

Follows SvelteKit 2 best practices for route organization and server code separation.

Phase 4C complete. Next: Phase 4D (core package audit).
```

## Next Steps
Phase 4D: Core package audit & verification
Phase 4E: Global import cleanup
Phase 4F: Nuclear cleanup of unused files
```

#### 8.2 Generate route tree visualization
```powershell
# Create route tree
tree /F "K:\driplo-turbo-1\apps\web\src\routes" > "K:\driplo-turbo-1\phase4c-final-routes-tree.txt"
```

---

### STEP 9: COMMIT CHANGES (5 min)

**Goal:** Create ONE atomic commit with all Phase 4C changes.

```powershell
cd K:\driplo-turbo-1

# Stage all changes
git add -A

# Commit with detailed message
git commit -m "feat(web): restructure app with SvelteKit 2 layout groups and colocation

- Organize routes into (app)/(shop), (app)/(account), (marketing) layout groups
- Colocate route-specific components with their routes
- Move all server-only code to \$lib/server/ (auth, supabase, stripe, analytics, monitoring)
- Update [COUNT] imports to reflect new structure
- Create layout group +layout.svelte files for shop, account, marketing

Follows SvelteKit 2 best practices:
- Route colocation for single-use components
- Layout groups for clean URL structure
- \$lib/server/ separation for server-only code
- No framework contamination

Phase 4C complete. Apps/web now follows ideal structure.

Files changed: ~[COUNT]
Routes moved: [COUNT]
Components colocated: [COUNT]
Server files moved: [COUNT]

Verified:
✅ TypeScript check passes
✅ Build succeeds
✅ Dev server works
✅ All routes accessible"

# Get commit hash
git log -1 --oneline
```

---

## 🎯 COMPLETION CHECKLIST

Before you report back, verify ALL of these:

### Structure
- [ ] Layout groups created: (app)/(shop), (app)/(account), (marketing)
- [ ] Routes moved to correct layout groups
- [ ] Route-specific components colocated in components/ folders
- [ ] Shared components remain in lib/components/
- [ ] All server code moved to lib/server/

### Functionality
- [ ] `pnpm run check` passes (or minimal errors)
- [ ] `pnpm run build` succeeds
- [ ] Dev server runs at http://localhost:5173/
- [ ] Homepage loads correctly
- [ ] Shop routes work (search, products, etc.)
- [ ] Account routes work (profile, etc.)
- [ ] Auth routes work (login, register)
- [ ] Marketing routes work (about, help, etc.)

### Documentation
- [ ] `PHASE_4C_RESTRUCTURE_SUMMARY.md` created
- [ ] `phase4c-route-map.json` generated
- [ ] `phase4c-component-map.json` generated
- [ ] `phase4c-server-code-map.json` generated
- [ ] `phase4c-import-map.json` generated
- [ ] `phase4c-final-routes-tree.txt` generated

### Cleanup
- [ ] All import updates applied
- [ ] No broken imports remaining
- [ ] Empty directories removed
- [ ] Commit created with detailed message
- [ ] Commit hash saved

---

## 📊 OUTPUT REQUIRED

When you're done, provide this summary to the user:

```markdown
# ✅ PHASE 4C COMPLETE: Apps/Web Restructure

## Execution Summary
- **Start time:** [timestamp]
- **End time:** [timestamp]
- **Duration:** [X hours Y minutes]

## Changes Made
- **Layout groups created:** 4 (app, shop, account, marketing)
- **Routes moved:** [COUNT]
  - To (app)/(shop)/: [COUNT]
  - To (app)/(account)/: [COUNT]
  - To (marketing)/: [COUNT]
- **Components colocated:** [COUNT]
- **Server files moved:** [COUNT]
- **Imports updated:** [COUNT]

## Verification Results
✅ TypeScript check: PASSED ([X] errors before → [Y] errors after)
✅ Build: SUCCESS
✅ Dev server: WORKS (http://localhost:5173/)
✅ Routes tested: [COUNT] / [COUNT] working
✅ Import scan: 0 broken imports

## Documentation Created
- `PHASE_4C_RESTRUCTURE_SUMMARY.md` - Detailed summary
- `phase4c-route-map.json` - Route categorization
- `phase4c-component-map.json` - Component colocation plan
- `phase4c-server-code-map.json` - Server code moves
- `phase4c-import-map.json` - Import updates
- `phase4c-final-routes-tree.txt` - Final route structure

## Git Commit
**Commit:** [hash]
**Message:** "feat(web): restructure app with SvelteKit 2 layout groups and colocation"
**Files changed:** [COUNT]

## Files Generated for Audit
1. `K:\driplo-turbo-1\PHASE_4C_RESTRUCTURE_SUMMARY.md`
2. `K:\driplo-turbo-1\phase4c-route-map.json`
3. `K:\driplo-turbo-1\phase4c-component-map.json`
4. `K:\driplo-turbo-1\phase4c-server-code-map.json`
5. `K:\driplo-turbo-1\phase4c-import-map.json`
6. `K:\driplo-turbo-1\phase4c-final-routes-tree.txt`

## Ready for Copilot Audit
All documentation generated. User should now run Copilot audit checklist to score this work.
```

---

## 🚨 TROUBLESHOOTING

### Issue: TypeScript errors after imports updated
**Solution:** 
```powershell
# Clear .svelte-kit and rebuild
Remove-Item -Recurse -Force ".svelte-kit"
pnpm run dev
```

### Issue: Routes not loading in browser
**Solution:**
- Check layout files exist (+layout.svelte)
- Verify +page.svelte files moved correctly
- Check for typos in route group names (must be exact)

### Issue: Server code still accessible from client
**Solution:**
- Verify files moved to $lib/server/
- Check imports updated to use $lib/server/ paths
- Ensure no barrel exports exposing server code

### Issue: Components not found after move
**Solution:**
- Check import paths updated (relative paths for colocated)
- Verify component files moved to correct location
- Clear Vite cache: `rm -rf .svelte-kit node_modules/.vite`

---

## 💡 REMEMBER

1. **Audit first** - Understand current structure before moving anything
2. **Create mappings** - JSON maps for routes, components, server code
3. **Move systematically** - Routes first, then components, then server code
4. **Update imports thoroughly** - Use PowerShell scripts for consistency
5. **Test incrementally** - Verify build after each major group of changes
6. **Document everything** - Create detailed summary for audit
7. **One atomic commit** - All changes together with excellent commit message

This is THE BIG ONE - the restructure that transforms the app from messy to clean. Be thorough, be systematic, be excellent. 🚀
