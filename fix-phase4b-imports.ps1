# Phase 4B Import Fix Script (PowerShell version)
# This script fixes all imports after domain package restructure

param(
    [switch]$DryRun = $false
)

$ErrorActionPreference = "Stop"

Write-Host "🔧 Phase 4B: Domain Package Import Fix Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No files will be modified" -ForegroundColor Yellow
}

$RootDir = "K:\driplo-turbo-1"
$DomainDir = "$RootDir\packages\domain"

function Fix-ImportsInFile {
    param([string]$FilePath)

    if (-not (Test-Path $FilePath)) {
        return
    }

    # Skip certain directories
    if ($FilePath -match 'node_modules|dist|\.svelte-kit|build') {
        return
    }

    try {
        $content = Get-Content $FilePath -Raw
        $originalContent = $content

        # Fix import patterns
        $content = $content -replace "from '@repo/domain/services/products'", "from '@repo/domain/products'"
        $content = $content -replace "from '@repo/domain/services/orders'", "from '@repo/domain/orders'"
        $content = $content -replace "from '@repo/domain/services/profiles'", "from '@repo/domain/users'"
        $content = $content -replace "from '@repo/domain/services/payments'", "from '@repo/domain/payments'"
        $content = $content -replace "from '@repo/domain/services/messaging'", "from '@repo/domain/shared'"
        $content = $content -replace "from '@repo/domain/types'", "from '@repo/domain/shared'"
        $content = $content -replace "from '@repo/domain/validation'", "from '@repo/domain/shared'"
        $content = $content -replace "from '@repo/domain/adapters'", "# TODO: Remove or update to application layer"
        $content = $content -replace "from '@repo/domain'", "# TODO: Update to specific domain import"

        if ($content -ne $originalContent) {
            if (-not $DryRun) {
                Set-Content -Path $FilePath -Value $content -NoNewline
                Write-Host "✅ Fixed imports in: $FilePath" -ForegroundColor Green
            } else {
                Write-Host "🔍 Would fix imports in: $FilePath" -ForegroundColor Yellow
            }
        }
    }
    catch {
        Write-Host "❌ Error fixing $FilePath`: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Fix-ImportsInDirectory {
    param([string]$Directory)

    Write-Host "🔍 Fixing imports in directory: $Directory" -ForegroundColor Blue

    Get-ChildItem -Path $Directory -Recurse -File |
        Where-Object { $_.Extension -match '\.(ts|js|svelte)$' } |
        ForEach-Object {
            Fix-ImportsInFile -FilePath $_.FullName
        }
}

Write-Host ""
Write-Host "📦 Step 1: Fix domain internal imports" -ForegroundColor Magenta
Write-Host "=======================================" -ForegroundColor Magenta

# Fix imports in domain package
Get-ChildItem -Path "$DomainDir\src" -Filter "*.ts" -Recurse | ForEach-Object {
    Fix-ImportsInFile -FilePath $_.FullName
}

Write-Host ""
Write-Host "🌐 Step 2: Fix imports in apps" -ForegroundColor Magenta
Write-Host "=============================" -ForegroundColor Magenta

# Fix imports in apps directory
$AppsDir = "$RootDir\apps"
if (Test-Path $AppsDir) {
    Fix-ImportsInDirectory -Directory $AppsDir
}

Write-Host ""
Write-Host "📚 Step 3: Fix imports in packages" -ForegroundColor Magenta
Write-Host "===============================" -ForegroundColor Magenta

# Fix imports in packages directory (excluding domain)
Get-ChildItem -Path "$RootDir\packages" -Directory | ForEach-Object {
    if ($_.FullName -ne $DomainDir -and $_.FullName -ne "$RootDir\packages") {
        Fix-ImportsInDirectory -Directory $_.FullName
    }
}

Write-Host ""
Write-Host "🔧 Step 4: Fix main index.ts imports" -ForegroundColor Magenta
Write-Host "=================================" -ForegroundColor Magenta

# Fix the main index.ts
$MainIndex = "$DomainDir\src\index.ts"
if (Test-Path $MainIndex) {
    Fix-ImportsInFile -FilePath $MainIndex
}

Write-Host ""
if ($DryRun) {
    Write-Host "🔍 DRY RUN COMPLETED - No files were modified" -ForegroundColor Yellow
} else {
    Write-Host "✅ Import fixing completed!" -ForegroundColor Green
}

Write-Host ""
Write-Host "📊 Summary of changes:" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan
Write-Host "- Fixed @repo/domain/services/* imports to @repo/domain/*"
Write-Host "- Updated @repo/domain/types to @repo/domain/shared"
Write-Host "- Updated @repo/domain/validation to @repo/domain/shared"
Write-Host "- Marked @repo/domain/adapters imports for manual review"
Write-Host ""
Write-Host "🔍 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Test domain package build: cd packages/domain && pnpm run build"
Write-Host "2. Test monorepo build: cd K:/driplo-turbo-1 && pnpm run build"
Write-Host "3. Test dev server: pnpm --filter @repo/web dev"
Write-Host "4. Manual review of any remaining import issues"
Write-Host ""
Write-Host "⚠️  MANUAL REVIEW REQUIRED:" -ForegroundColor Red
Write-Host "- Check for any remaining @repo/domain/adapters imports"
Write-Host "- Verify all @repo/domain imports are working correctly"
Write-Host "- Update any TODO comments added by this script"