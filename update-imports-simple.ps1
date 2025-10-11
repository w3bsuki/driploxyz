# Simple Phase 4C Import Update Script
# Updates import statements after the restructure

param(
    [switch]$DryRun = $false
)

$ProjectRoot = "K:\driplo-turbo-1"
$WebSrcPath = "$ProjectRoot\apps\web\src"

Write-Host "🔄 Phase 4C Import Update Script" -ForegroundColor Cyan
if ($DryRun) {
    Write-Host "Mode: DRY RUN" -ForegroundColor Yellow
} else {
    Write-Host "Mode: LIVE UPDATE" -ForegroundColor Green
}
Write-Host ""

# 1. Update modular component imports in messages route
Write-Host "📦 1. Updating modular component imports in messages route..." -ForegroundColor Magenta

$MessagesFiles = @(
    "$WebSrcPath\routes\(protected)\messages\ModularMessages.svelte",
    "$WebSrcPath\routes\(protected)\messages\+page.svelte"
)

foreach ($File in $MessagesFiles) {
    if (Test-Path $File) {
        Write-Host "Processing: $(Split-Path $File -Leaf)" -ForegroundColor White

        $Content = Get-Content $File -Raw

        # Check if file has modular imports
        if ($Content -match '\$lib/components/modular/') {
            Write-Host "  Found modular imports, updating..." -ForegroundColor Gray

            # Update imports
            $Content = $Content -replace 'from\s+[''"]\$\lib/components/modular/ChatWindow\.svelte[''"]', 'from ''./components/ChatWindow.svelte'''
            $Content = $Content -replace 'from\s+[''"]\$\lib/components/modular/ConversationSidebar\.svelte[''"]', 'from ''./components/ConversationSidebar.svelte'''
            $Content = $Content -replace 'from\s+[''"]\$\lib/components/modular/ConnectionStatus\.svelte[''"]', 'from ''./components/ConnectionStatus.svelte'''

            $Content = $Content -replace 'import\s+ChatWindow\s+from\s+[''"]\$\lib/components/modular/ChatWindow\.svelte[''"]', 'import ChatWindow from ''./components/ChatWindow.svelte'''
            $Content = $Content -replace 'import\s+ConversationSidebar\s+from\s+[''"]\$\lib/components/modular/ConversationSidebar\.svelte[''"]', 'import ConversationSidebar from ''./components/ConversationSidebar.svelte'''
            $Content = $Content -replace 'import\s+ConnectionStatus\s+from\s+[''"]\$\lib/components/modular/ConnectionStatus\.svelte[''"]', 'import ConnectionStatus from ''./components/ConnectionStatus.svelte'''

            if ($DryRun) {
                Write-Host "  [DRY RUN] Would update modular imports" -ForegroundColor Cyan
            } else {
                Copy-Item $File "$File.backup" -Force
                Set-Content $File $Content -NoNewline
                Write-Host "  ✅ Updated modular imports" -ForegroundColor Green
            }
        } else {
            Write-Host "  No modular imports found" -ForegroundColor Gray
        }
    } else {
        Write-Host "File not found: $File" -ForegroundColor Yellow
    }
}

# 2. Update Header, RealtimeErrorBoundary, RegionSwitchModal imports in root layout
Write-Host "`n🎨 2. Updating Header, RealtimeErrorBoundary, RegionSwitchModal imports..." -ForegroundColor Magenta

$RootLayoutFile = "$WebSrcPath\routes\+layout.svelte"
if (Test-Path $RootLayoutFile) {
    Write-Host "Processing: +layout.svelte" -ForegroundColor White

    $Content = Get-Content $RootLayoutFile -Raw

    $HasChanges = $false

    if ($Content -match '\$lib/components/Header\.svelte') {
        $Content = $Content -replace 'from\s+[''"]\$\lib/components/Header\.svelte[''"]', 'from ''./components/Header.svelte'''
        $Content = $Content -replace 'import\s+Header\s+from\s+[''"]\$\lib/components/Header\.svelte[''"]', 'import Header from ''./components/Header.svelte'''
        $HasChanges = $true
    }

    if ($Content -match '\$lib/components/RealtimeErrorBoundary\.svelte') {
        $Content = $Content -replace 'from\s+[''"]\$\lib/components/RealtimeErrorBoundary\.svelte[''"]', 'from ''./components/RealtimeErrorBoundary.svelte'''
        $Content = $Content -replace 'import\s+RealtimeErrorBoundary\s+from\s+[''"]\$\lib/components/RealtimeErrorBoundary\.svelte[''"]', 'import RealtimeErrorBoundary from ''./components/RealtimeErrorBoundary.svelte'''
        $HasChanges = $true
    }

    if ($Content -match '\$lib/components/RegionSwitchModal\.svelte') {
        $Content = $Content -replace 'from\s+[''"]\$\lib/components/RegionSwitchModal\.svelte[''"]', 'from ''./components/RegionSwitchModal.svelte'''
        $Content = $Content -replace 'import\s+RegionSwitchModal\s+from\s+[''"]\$\lib/components/RegionSwitchModal\.svelte[''"]', 'import RegionSwitchModal from ''./components/RegionSwitchModal.svelte'''
        $HasChanges = $true
    }

    if ($HasChanges) {
        if ($DryRun) {
            Write-Host "  [DRY RUN] Would update root layout imports" -ForegroundColor Cyan
        } else {
            Copy-Item $RootLayoutFile "$RootLayoutFile.backup" -Force
            Set-Content $RootLayoutFile $Content -NoNewline
            Write-Host "  ✅ Updated root layout imports" -ForegroundColor Green
        }
    } else {
        Write-Host "  No root layout imports to update" -ForegroundColor Gray
    }
} else {
    Write-Host "Root layout file not found" -ForegroundColor Yellow
}

# 3. Update server imports across all files
Write-Host "`n🖥️ 3. Updating server imports..." -ForegroundColor Magenta

$AllFiles = Get-ChildItem -Path $WebSrcPath -Recurse -Include ("*.ts", "*.js", "*.svelte") |
            Where-Object { $_.FullName -notlike "*backup*" -and $_.FullName -notlike "*node_modules*" }

Write-Host "Found $($AllFiles.Count) files to check for server imports..." -ForegroundColor Gray

$UpdatedCount = 0
$SkippedCount = 0

foreach ($File in $AllFiles) {
    $Content = Get-Content $File.FullName -Raw
    $HasChanges = $false

    # Update server import paths
    if ($Content -match '\$lib/env/') {
        $Content = $Content -replace 'from\s+[''"]\$\lib/env/', 'from ''$lib/server/env/'
        $HasChanges = $true
    }

    if ($Content -match '\$lib/supabase/server') {
        $Content = $Content -replace 'from\s+[''"]\$\lib/supabase/server[''"]', 'from ''$lib/server/supabase/server'''
        $HasChanges = $true
    }

    if ($Content -match '\$lib/middleware/') {
        $Content = $Content -replace 'from\s+[''"]\$\lib/middleware/', 'from ''$lib/server/middleware/'
        $HasChanges = $true
    }

    if ($Content -match '\$lib/analytics/') {
        $Content = $Content -replace 'from\s+[''"]\$\lib/analytics/', 'from ''$lib/server/analytics/'
        $HasChanges = $true
    }

    if ($Content -match '\$lib/monitoring/') {
        $Content = $Content -replace 'from\s+[''"]\$\lib/monitoring/', 'from ''$lib/server/monitoring/'
        $HasChanges = $true
    }

    if ($Content -match '\$lib/security/') {
        $Content = $Content -replace 'from\s+[''"]\$\lib/security/', 'from ''$lib/server/security/'
        $HasChanges = $true
    }

    if ($Content -match '\$lib/utils/rate-limiting') {
        $Content = $Content -replace 'from\s+[''"]\$\lib/utils/rate-limiting[''"]', 'from ''$lib/server/utils/rate-limiting'''
        $HasChanges = $true
    }

    if ($Content -match '\$lib/utils/payments') {
        $Content = $Content -replace 'from\s+[''"]\$\lib/utils/payments[''"]', 'from ''$lib/server/utils/payments'''
        $HasChanges = $true
    }

    if ($Content -match '\$lib/cache[^/]') {
        $Content = $Content -replace 'from\s+[''"]\$\lib/cache[''"]', 'from ''$lib/server/utils/cache'''
        $HasChanges = $true
    }

    if ($Content -match '\$lib/jobs/') {
        $Content = $Content -replace 'from\s+[''"]\$\lib/jobs/', 'from ''$lib/server/jobs/'
        $HasChanges = $true
    }

    if ($Content -match '\$lib/cookies/') {
        $Content = $Content -replace 'from\s+[''"]\$\lib/cookies/', 'from ''$lib/server/cookies/'
        $HasChanges = $true
    }

    if ($HasChanges) {
        $RelativePath = $File.FullName.Replace($WebSrcPath, "").TrimStart("\", "/")
        Write-Host "  Updating: $RelativePath" -ForegroundColor White

        if ($DryRun) {
            Write-Host "    [DRY RUN] Would update server imports" -ForegroundColor Cyan
        } else {
            Copy-Item $File.FullName "$($File.FullName).backup" -Force
            Set-Content $File.FullName $Content -NoNewline
            Write-Host "    ✅ Updated server imports" -ForegroundColor Green
        }
        $UpdatedCount++
    } else {
        $SkippedCount++
    }
}

# 4. Fix core package import paths
Write-Host "`n📚 4. Fixing core package import paths..." -ForegroundColor Magenta

$CoreUpdatedCount = 0
foreach ($File in $AllFiles) {
    $Content = Get-Content $File.FullName -Raw
    $HasChanges = $false

    if ($Content -match '@repo/core/services/products') {
        $Content = $Content -replace '@repo/core/services/products', '@repo/domain/products'
        $HasChanges = $true
    }

    if ($Content -match '@repo/core/services/ConversationService') {
        $Content = $Content -replace '@repo/core/services/ConversationService', '@repo/domain/conversations'
        $HasChanges = $true
    }

    if ($HasChanges) {
        $RelativePath = $File.FullName.Replace($WebSrcPath, "").TrimStart("\", "/")
        Write-Host "  Updating core imports: $RelativePath" -ForegroundColor White

        if ($DryRun) {
            Write-Host "    [DRY RUN] Would update core package imports" -ForegroundColor Cyan
        } else {
            Copy-Item $File.FullName "$($File.FullName).backup" -Force
            Set-Content $File.FullName $Content -NoNewline
            Write-Host "    ✅ Updated core package imports" -ForegroundColor Green
        }
        $CoreUpdatedCount++
    }
}

# Summary
Write-Host "`n📊 Summary" -ForegroundColor Cyan
Write-Host "Server import updates: $UpdatedCount files" -ForegroundColor Green
Write-Host "Core package updates: $CoreUpdatedCount files" -ForegroundColor Green
Write-Host "Files skipped: $SkippedCount files" -ForegroundColor Yellow

if ($DryRun) {
    Write-Host "`n💡 This was a DRY RUN. No files were actually modified." -ForegroundColor Cyan
    Write-Host "   Run without -DryRun to apply the changes." -ForegroundColor Gray
} else {
    Write-Host "`n✅ Import updates completed!" -ForegroundColor Green
    Write-Host "   Backup files created with .backup extension" -ForegroundColor Gray

    Write-Host "`n🎯 Next steps:" -ForegroundColor Magenta
    Write-Host "1. Run 'pnpm run check' in apps/web to verify TypeScript compilation" -ForegroundColor White
    Write-Host "2. Run 'pnpm run lint' in apps/web to check for linting issues" -ForegroundColor White
    Write-Host "3. Test the application to ensure all imports work correctly" -ForegroundColor White
    Write-Host "4. Remove .backup files if everything is working correctly" -ForegroundColor Gray
}