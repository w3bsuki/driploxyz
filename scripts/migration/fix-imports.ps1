# Phase 4C Import Fix Script
param(
    [switch]$DryRun = $false
)

$WebSrcPath = "K:\driplo-turbo-1\apps\web\src"

Write-Host "Phase 4C Import Fix Script" -ForegroundColor Cyan
if ($DryRun) {
    Write-Host "DRY RUN MODE" -ForegroundColor Yellow
} else {
    Write-Host "LIVE UPDATE MODE" -ForegroundColor Green
}

# 1. Fix modular component imports
Write-Host "`n1. Fixing modular component imports..." -ForegroundColor Magenta

$ModularMessages = "$WebSrcPath\routes\(protected)\messages\ModularMessages.svelte"
if (Test-Path $ModularMessages) {
    $content = Get-Content $ModularMessages -Raw
    $original = $content

    $content = $content -replace "from '`$lib/components/modular/", "from './components/"

    if ($content -ne $original) {
        if ($DryRun) {
            Write-Host "Would update ModularMessages.svelte" -ForegroundColor Cyan
        } else {
            Copy-Item $ModularMessages "$ModularMessages.backup"
            Set-Content $ModularMessages $content -NoNewline
            Write-Host "Updated ModularMessages.svelte" -ForegroundColor Green
        }
    }
}

# 2. Fix root layout imports
Write-Host "`n2. Fixing root layout imports..." -ForegroundColor Magenta

$RootLayout = "$WebSrcPath\routes\+layout.svelte"
if (Test-Path $RootLayout) {
    $content = Get-Content $RootLayout -Raw
    $original = $content

    $content = $content -replace "from '`$lib/components/Header\.svelte'", "from './components/Header.svelte'"
    $content = $content -replace "from '`$lib/components/RealtimeErrorBoundary\.svelte'", "from './components/RealtimeErrorBoundary.svelte'"
    $content = $content -replace "from '`$lib/components/RegionSwitchModal\.svelte'", "from './components/RegionSwitchModal.svelte'"

    if ($content -ne $original) {
        if ($DryRun) {
            Write-Host "Would update +layout.svelte" -ForegroundColor Cyan
        } else {
            Copy-Item $RootLayout "$RootLayout.backup"
            Set-Content $RootLayout $content -NoNewline
            Write-Host "Updated +layout.svelte" -ForegroundColor Green
        }
    }
}

# 3. Fix server imports
Write-Host "`n3. Fixing server imports..." -ForegroundColor Magenta

$files = Get-ChildItem -Path $WebSrcPath -Recurse -Include *.ts,*.js,*.svelte | Where-Object { $_.FullName -notlike "*backup*" }

$serverUpdateCount = 0
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $original = $content

    # Update server import paths
    $content = $content -replace "from '`$lib/env/", "from '`$lib/server/env/"
    $content = $content -replace "from '`$lib/supabase/server'", "from '`$lib/server/supabase/server'"
    $content = $content -replace "from '`$lib/middleware/", "from '`$lib/server/middleware/"
    $content = $content -replace "from '`$lib/analytics/", "from '`$lib/server/analytics/"
    $content = $content -replace "from '`$lib/monitoring/", "from '`$lib/server/monitoring/"
    $content = $content -replace "from '`$lib/security/", "from '`$lib/server/security/"
    $content = $content -replace "from '`$lib/utils/rate-limiting", "from '`$lib/server/utils/rate-limiting"
    $content = $content -replace "from '`$lib/utils/payments", "from '`$lib/server/utils/payments"
    $content = $content -replace "from '`$lib/cache", "from '`$lib/server/utils/cache"
    $content = $content -replace "from '`$lib/jobs/", "from '`$lib/server/jobs/"
    $content = $content -replace "from '`$lib/cookies/", "from '`$lib/server/cookies/"

    # Fix core package imports
    $content = $content -replace "@repo/core/services/products", "@repo/domain/products"
    $content = $content -replace "@repo/core/services/ConversationService", "@repo/domain/conversations"

    if ($content -ne $original) {
        $relativePath = $file.FullName.Replace($WebSrcPath, "").TrimStart("\", "/")
        Write-Host "  Updating: $relativePath" -ForegroundColor White

        if ($DryRun) {
            Write-Host "    [DRY RUN] Would update" -ForegroundColor Cyan
        } else {
            Copy-Item $file.FullName "$($file.FullName).backup"
            Set-Content $file.FullName $content -NoNewline
            Write-Host "    Updated" -ForegroundColor Green
        }
        $serverUpdateCount++
    }
}

Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "Files updated: $serverUpdateCount" -ForegroundColor Green

if ($DryRun) {
    Write-Host "This was a dry run. No files were modified." -ForegroundColor Yellow
    Write-Host "Run without -DryRun to apply changes." -ForegroundColor Gray
} else {
    Write-Host "Import updates completed!" -ForegroundColor Green
    Write-Host "Backup files created with .backup extension" -ForegroundColor Gray
    Write-Host "Next steps: Run 'pnpm run check' to verify compilation" -ForegroundColor White
}