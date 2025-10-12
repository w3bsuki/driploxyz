# IMMEDIATE EXECUTION: Phase 4C - Apps/Web Restructure

> **CRITICAL**: You MUST execute this phase NOW. Do NOT just plan or analyze. START EXECUTING IMMEDIATELY.

---

## YOUR DIRECTIVE

You are in the `K:\driplo-turbo-1` monorepo on Windows PowerShell. You will NOW restructure `apps/web/` following SvelteKit 2 best practices.

**Background:**
- Phase 4A ✅ COMPLETE: UI package restructured (115/120)
- Phase 4B ✅ COMPLETE: Domain package restructured (115/120)
- Phase 4C ⏳ YOU ARE HERE: Apps/web restructure

**You will execute this in ONE session. Do NOT stop until complete.**

---

## EXECUTION SEQUENCE

### ⚡ STEP 1: CREATE LAYOUT GROUPS (DO THIS NOW)

```powershell
# Navigate to routes
cd K:\driplo-turbo-1\apps\web\src\routes

# Create (app) parent layout
New-Item -Path "(app)" -ItemType Directory -Force
@"
<script lang="ts">
  // Main app layout (wraps shop and account)
</script>

<slot />
"@ | Out-File -FilePath "(app)\+layout.svelte" -Encoding UTF8

# Create (app)/(shop) layout
New-Item -Path "(app)\(shop)" -ItemType Directory -Force
@"
<script lang="ts">
  // Shop layout
</script>

<div class="shop-layout">
  <slot />
</div>
"@ | Out-File -FilePath "(app)\(shop)\+layout.svelte" -Encoding UTF8

# Create (app)/(account) layout
New-Item -Path "(app)\(account)" -ItemType Directory -Force
@"
<script lang="ts">
  // Account layout
</script>

<div class="account-layout">
  <slot />
</div>
"@ | Out-File -FilePath "(app)\(account)\+layout.svelte" -Encoding UTF8

# Create (marketing) layout
New-Item -Path "(marketing)" -ItemType Directory -Force
@"
<script lang="ts">
  // Marketing layout
</script>

<div class="marketing-layout">
  <slot />
</div>
"@ | Out-File -FilePath "(marketing)\+layout.svelte" -Encoding UTF8

Write-Host "✅ Layout groups created"
```

**EXECUTE THE ABOVE COMMANDS NOW. DO NOT PROCEED UNTIL DONE.**

---

### ⚡ STEP 2: MOVE SHOP ROUTES (DO THIS NOW)

```powershell
cd K:\driplo-turbo-1\apps\web\src\routes

# Move shop routes to (app)/(shop)
$shopRoutes = @("search", "product", "category", "brands", "collection", "designer", "wishlist", "sellers")

foreach ($route in $shopRoutes) {
    if (Test-Path $route) {
        $target = "(app)\(shop)\$route"
        Write-Host "Moving $route to $target"
        Move-Item -Path $route -Destination $target -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "✅ Shop routes moved"
```

**EXECUTE THE ABOVE COMMANDS NOW.**

---

### ⚡ STEP 3: MOVE ACCOUNT ROUTES (DO THIS NOW)

```powershell
cd K:\driplo-turbo-1\apps\web\src\routes

# Move account routes to (app)/(account)
$accountRoutes = @("profile", "pro")

foreach ($route in $accountRoutes) {
    if (Test-Path $route) {
        $target = "(app)\(account)\$route"
        Write-Host "Moving $route to $target"
        Move-Item -Path $route -Destination $target -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "✅ Account routes moved"
```

**EXECUTE THE ABOVE COMMANDS NOW.**

---

### ⚡ STEP 4: MOVE MARKETING ROUTES (DO THIS NOW)

```powershell
cd K:\driplo-turbo-1\apps\web\src\routes

# Move marketing routes
$marketingRoutes = @("about", "blog", "careers", "help", "privacy", "terms", "returns", "trust-safety")

foreach ($route in $marketingRoutes) {
    if (Test-Path $route) {
        $target = "(marketing)\$route"
        Write-Host "Moving $route to $target"
        Move-Item -Path $route -Destination $target -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "✅ Marketing routes moved"
```

**EXECUTE THE ABOVE COMMANDS NOW.**

---

### ⚡ STEP 5: COLOCATE MESSAGES COMPONENTS (DO THIS NOW)

```powershell
cd K:\driplo-turbo-1\apps\web\src

# Create components folder in messages route
$messagesComponents = "routes\(protected)\messages\components"
New-Item -Path $messagesComponents -ItemType Directory -Force

# Move modular components
if (Test-Path "lib\components\modular") {
    Get-ChildItem "lib\components\modular\*.svelte" | ForEach-Object {
        Write-Host "Moving $($_.Name) to messages/components/"
        Move-Item $_.FullName "$messagesComponents\$($_.Name)" -Force -ErrorAction SilentlyContinue
    }
    
    # Remove empty modular directory
    Remove-Item "lib\components\modular" -Force -ErrorAction SilentlyContinue
}

Write-Host "✅ Messages components colocated"
```

**EXECUTE THE ABOVE COMMANDS NOW.**

---

### ⚡ STEP 6: UPDATE MODULAR COMPONENT IMPORTS (DO THIS NOW)

```powershell
cd K:\driplo-turbo-1\apps\web\src

# Fix imports in ModularMessages.svelte
$messagesFile = "routes\(protected)\messages\ModularMessages.svelte"

if (Test-Path $messagesFile) {
    $content = Get-Content $messagesFile -Raw
    
    # Update modular component imports to relative paths
    $content = $content -replace "from '\`$lib/components/modular/ConversationSidebar\.svelte'", "from './components/ConversationSidebar.svelte'"
    $content = $content -replace "from '\`$lib/components/modular/ChatWindow\.svelte'", "from './components/ChatWindow.svelte'"
    $content = $content -replace "from '\`$lib/components/modular/ConnectionStatus\.svelte'", "from './components/ConnectionStatus.svelte'"
    
    $content | Out-File -FilePath $messagesFile -Encoding UTF8 -NoNewline
    Write-Host "✅ Updated imports in ModularMessages.svelte"
}
```

**EXECUTE THE ABOVE COMMANDS NOW.**

---

### ⚡ STEP 7: MOVE SERVER CODE (DO THIS NOW)

```powershell
cd K:\driplo-turbo-1\apps\web\src\lib

# Create server directories
New-Item -Path "server\stripe" -ItemType Directory -Force -ErrorAction SilentlyContinue
New-Item -Path "server\monitoring" -ItemType Directory -Force -ErrorAction SilentlyContinue

# Move stripe to server (if exists and not already there)
if ((Test-Path "stripe") -and -not (Test-Path "server\stripe\index.ts")) {
    Write-Host "Moving stripe to server/"
    Get-ChildItem "stripe" -Recurse | ForEach-Object {
        $target = $_.FullName.Replace("\lib\stripe", "\lib\server\stripe")
        $targetDir = Split-Path $target -Parent
        New-Item -Path $targetDir -ItemType Directory -Force -ErrorAction SilentlyContinue | Out-Null
        Copy-Item $_.FullName $target -Force -ErrorAction SilentlyContinue
    }
}

# Move monitoring to server (if exists and not already there)
if ((Test-Path "monitoring") -and -not (Test-Path "server\monitoring\index.ts")) {
    Write-Host "Moving monitoring to server/"
    Get-ChildItem "monitoring" -Recurse | ForEach-Object {
        $target = $_.FullName.Replace("\lib\monitoring", "\lib\server\monitoring")
        $targetDir = Split-Path $target -Parent
        New-Item -Path $targetDir -ItemType Directory -Force -ErrorAction SilentlyContinue | Out-Null
        Copy-Item $_.FullName $target -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "✅ Server code organized"
```

**EXECUTE THE ABOVE COMMANDS NOW.**

---

### ⚡ STEP 8: UPDATE SERVER IMPORTS (DO THIS NOW)

```powershell
cd K:\driplo-turbo-1\apps\web\src

# Find and update stripe imports
$files = Get-ChildItem -Path . -Recurse -Include *.svelte,*.ts,*.js | Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*.svelte-kit*" }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content) {
        $updated = $false
        
        # Update stripe imports (only if not already in server/)
        if ($content -match "from ['\`"]\`$lib/stripe/" -and $content -notmatch "from ['\`"]\`$lib/server/stripe/") {
            $content = $content -replace "from ['\`"]\`$lib/stripe/", "from '\`$lib/server/stripe/"
            $updated = $true
        }
        
        # Update monitoring imports
        if ($content -match "from ['\`"]\`$lib/monitoring/" -and $content -notmatch "from ['\`"]\`$lib/server/monitoring/") {
            $content = $content -replace "from ['\`"]\`$lib/monitoring/", "from '\`$lib/server/monitoring/"
            $updated = $true
        }
        
        if ($updated) {
            $content | Out-File -FilePath $file.FullName -Encoding UTF8 -NoNewline
            Write-Host "Updated imports in $($file.Name)"
        }
    }
}

Write-Host "✅ Server imports updated"
```

**EXECUTE THE ABOVE COMMANDS NOW.**

---

### ⚡ STEP 9: VERIFY BUILD (DO THIS NOW)

```powershell
cd K:\driplo-turbo-1\apps\web

Write-Host "`n🔍 Running TypeScript check..."
pnpm run check

Write-Host "`n🔨 Building..."
pnpm run build

Write-Host "`n✅ Verification complete"
```

**EXECUTE THE ABOVE COMMANDS NOW.**

---

### ⚡ STEP 10: CREATE DOCUMENTATION (DO THIS NOW)

```powershell
cd K:\driplo-turbo-1

# Create summary document
@"
# Phase 4C: Apps/Web Restructure - COMPLETE ✅

## Execution Date
$(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Changes Made

### Layout Groups Created
- (app)/+layout.svelte - Parent app layout
- (app)/(shop)/+layout.svelte - Shop layout
- (app)/(account)/+layout.svelte - Account layout
- (marketing)/+layout.svelte - Marketing layout

### Routes Reorganized

**Moved to (app)/(shop)/**
- search → (app)/(shop)/search
- product → (app)/(shop)/product
- category → (app)/(shop)/category
- brands → (app)/(shop)/brands
- collection → (app)/(shop)/collection
- designer → (app)/(shop)/designer
- wishlist → (app)/(shop)/wishlist
- sellers → (app)/(shop)/sellers

**Moved to (app)/(account)/**
- profile → (app)/(account)/profile
- pro → (app)/(account)/pro

**Moved to (marketing)/**
- about → (marketing)/about
- blog → (marketing)/blog
- careers → (marketing)/careers
- help → (marketing)/help
- privacy → (marketing)/privacy
- terms → (marketing)/terms
- returns → (marketing)/returns
- trust-safety → (marketing)/trust-safety

### Components Colocated
- modular/* → (protected)/messages/components/
  - ConversationSidebar.svelte
  - ChatWindow.svelte
  - ConnectionStatus.svelte

### Server Code Organized
- stripe/* → lib/server/stripe/
- monitoring/* → lib/server/monitoring/

### Import Updates
- Modular component imports updated to relative paths
- Server imports updated to use `\$lib/server/` paths

## Verification
✅ TypeScript check completed
✅ Build completed
✅ All routes organized into layout groups
✅ Route-specific components colocated
✅ Server code properly separated

## Next Steps
Ready for Copilot audit using COPILOT_AUDIT_CHECKLIST_4C.md
"@ | Out-File -FilePath "PHASE_4C_EXECUTION_COMPLETE.md" -Encoding UTF8

Write-Host "✅ Documentation created"
```

**EXECUTE THE ABOVE COMMANDS NOW.**

---

### ⚡ STEP 11: CREATE COMMIT (DO THIS NOW)

```powershell
cd K:\driplo-turbo-1

# Stage all changes
git add -A

# Count changes
$status = git status --short
$fileCount = ($status | Measure-Object).Count

# Create commit
git commit -m "feat(web): restructure app with SvelteKit 2 layout groups

Phase 4C: Apps/Web Restructure

Layout Groups:
- Created (app)/(shop) for shop/commerce routes
- Created (app)/(account) for user account routes  
- Created (marketing) for marketing/info pages

Routes Moved:
- 8 routes to (app)/(shop): search, product, category, brands, collection, designer, wishlist, sellers
- 2 routes to (app)/(account): profile, pro
- 8 routes to (marketing): about, blog, careers, help, privacy, terms, returns, trust-safety

Components Colocated:
- modular/* → (protected)/messages/components/

Server Code:
- stripe → lib/server/stripe
- monitoring → lib/server/monitoring

All imports updated accordingly.

Files changed: $fileCount
Follows SvelteKit 2 best practices for route organization.

Phase 4C complete."

# Get commit hash
$commitHash = git log -1 --format="%h"
Write-Host "`n✅ COMMIT CREATED: $commitHash"
```

**EXECUTE THE ABOVE COMMANDS NOW.**

---

## 📊 FINAL OUTPUT REQUIRED

After executing ALL steps above, provide this summary:

```
✅ PHASE 4C COMPLETE

Commit: [hash]
Files changed: [count]

Layout groups created: 4
Routes moved: 18
Components colocated: 3
Server code organized: 2 directories

TypeScript check: [PASS/FAIL]
Build: [SUCCESS/FAIL]

Documentation: PHASE_4C_EXECUTION_COMPLETE.md

Ready for audit.
```

---

## 🚨 CRITICAL REMINDERS

1. **EXECUTE, DON'T PLAN** - Run each PowerShell block immediately
2. **WORK SEQUENTIALLY** - Complete step 1 before step 2, etc.
3. **HANDLE ERRORS** - If a file doesn't exist, skip it and continue
4. **ONE COMMIT** - All changes in a single atomic commit
5. **PROVIDE OUTPUT** - Show the commit hash and file count at the end

**START EXECUTING NOW.** Do not analyze, do not plan more, just EXECUTE the commands above in order.
