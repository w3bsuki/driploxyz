# Comprehensive Phase 4C Import Update Script
# Updates all import statements after the restructure

param(
    [string]$ProjectRoot = "K:\driplo-turbo-1",
    [switch]$DryRun = $false,
    [switch]$WhatIf = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Stop"

# Enable verbose output if requested
if ($Verbose) {
    $VerbosePreference = "Continue"
}

Write-Host "🔄 Comprehensive Phase 4C Import Update Script" -ForegroundColor Cyan
Write-Host "Project Root: $ProjectRoot" -ForegroundColor Gray
Write-Host "Mode: $(if ($DryRun -or $WhatIf) { 'DRY RUN' } else { 'LIVE UPDATE' })" -ForegroundColor $(if ($DryRun -or $WhatIf) { 'Yellow' } else { 'Green' })
Write-Host ""

# Paths
$WebSrcPath = Join-Path $ProjectRoot "apps\web\src"
$LogPath = Join-Path $ProjectRoot "phase4c-comprehensive-import-updates.log"

# Initialize counters
$TotalFiles = 0
$UpdatedFiles = 0
$SkippedFiles = 0
$ErrorFiles = 0

# Logging function
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogEntry = "[$Timestamp] [$Level] $Message"
    Add-Content -Path $LogPath -Value $LogEntry
    if ($Verbose -or $Level -eq "ERROR") {
        Write-Host $Message -ForegroundColor $(if ($Level -eq "ERROR") { "Red" } elseif ($Level -eq "WARN") { "Yellow" } else { "Gray" })
    }
}

# Update file function
function Update-FileImports {
    param(
        [string]$FilePath,
        [hashtable]$Replacements,
        [string]$Description = ""
    )

    try {
        $TotalFiles++

        if (-not (Test-Path $FilePath)) {
            Write-Log "File not found: $FilePath" "WARN"
            $SkippedFiles++
            return
        }

        $OriginalContent = Get-Content -Path $FilePath -Raw -Encoding UTF8
        $UpdatedContent = $OriginalContent

        $HasChanges = $false
        $AppliedReplacements = @()

        # Apply all replacements
        foreach ($Entry in $Replacements.GetEnumerator()) {
            $Pattern = $Entry.Key
            $Replacement = $Entry.Value

            if ($UpdatedContent -match $Pattern) {
                $UpdatedContent = $UpdatedContent -replace $Pattern, $Replacement
                $HasChanges = $true
                $AppliedReplacements += $Replacement
            }
        }

        if ($HasChanges) {
            if ($DryRun -or $WhatIf) {
                Write-Host "  [DRY RUN] Would update: $FilePath" -ForegroundColor Cyan
                foreach ($Replace in $AppliedReplacements) {
                    Write-Host "    → $Replace" -ForegroundColor Gray
                }
            } else {
                # Backup original file
                $BackupPath = "$FilePath.backup"
                Copy-Item -Path $FilePath -Destination $BackupPath -Force

                # Write updated content
                Set-Content -Path $FilePath -Value $UpdatedContent -Encoding UTF8 -NoNewline

                Write-Host "  ✅ Updated: $FilePath" -ForegroundColor Green
                foreach ($Replace in $AppliedReplacements) {
                    Write-Host "    → $Replace" -ForegroundColor Gray
                }

                $UpdatedFiles++
                Write-Log "Updated imports in $FilePath: $($AppliedReplacements -join ', ')"
            }
        } else {
            $SkippedFiles++
        }
    } catch {
        $ErrorFiles++
        Write-Log "Error processing $FilePath`: $($_.Exception.Message)" "ERROR"
        Write-Host "  ❌ Error: $FilePath" -ForegroundColor Red
    }
}

# Main execution
try {
    Write-Log "Starting comprehensive Phase 4C import updates"

    # Clear log file
    if (Test-Path $LogPath) {
        Remove-Item $LogPath -Force
    }

    Write-Log "Processing project root: $ProjectRoot"

    # 1. Update modular component imports in messages route
    Write-Host "`n📦 1. Updating modular component imports in messages route..." -ForegroundColor Magenta

    $MessagesFiles = @(
        "$WebSrcPath\routes\(protected)\messages\ModularMessages.svelte",
        "$WebSrcPath\routes\(protected)\messages\+page.svelte",
        "$WebSrcPath\routes\(protected)\messages\new\+page.svelte"
    )

    $ModularComponentReplacements = @{
        # Replace from $lib/components/modular/ to ./components/
        "from\s+['`"]\`\$lib/components/modular/ChatWindow\.svelte['`"]" = "from './components/ChatWindow.svelte'"
        "from\s+['`"]\`\$lib/components/modular/ConversationSidebar\.svelte['`"]" = "from './components/ConversationSidebar.svelte'"
        "from\s+['`"]\`\$lib/components/modular/ConnectionStatus\.svelte['`"]" = "from './components/ConnectionStatus.svelte'"

        # Handle various import styles
        "import\s+ChatWindow\s+from\s+['`"]\`\$lib/components/modular/ChatWindow\.svelte['`"]" = "import ChatWindow from './components/ChatWindow.svelte'"
        "import\s+ConversationSidebar\s+from\s+['`"]\`\$lib/components/modular/ConversationSidebar\.svelte['`"]" = "import ConversationSidebar from './components/ConversationSidebar.svelte'"
        "import\s+ConnectionStatus\s+from\s+['`"]\`\$lib/components/modular/ConnectionStatus\.svelte['`"]" = "import ConnectionStatus from './components/ConnectionStatus.svelte'"
    }

    foreach ($File in $MessagesFiles) {
        if (Test-Path $File) {
            Write-Host "Processing messages file: $(Split-Path $File -Leaf)" -ForegroundColor White
            Update-FileImports -FilePath $File -Replacements $ModularComponentReplacements -Description "Modular components in messages"
        } else {
            Write-Log "Messages file not found: $File" "WARN"
        }
    }

    # 2. Update Header, RealtimeErrorBoundary, RegionSwitchModal imports in root layout
    Write-Host "`n🎨 2. Updating Header, RealtimeErrorBoundary, RegionSwitchModal imports..." -ForegroundColor Magenta

    $RootLayoutFiles = @(
        "$WebSrcPath\routes\+layout.svelte"
    )

    $RootLayoutReplacements = @{
        # Replace from $lib/components/ to ./components/
        "from\s+['`"]\`\$lib/components/Header\.svelte['`"]" = "from './components/Header.svelte'"
        "from\s+['`"]\`\$lib/components/RealtimeErrorBoundary\.svelte['`"]" = "from './components/RealtimeErrorBoundary.svelte'"
        "from\s+['`"]\`\$lib/components/RegionSwitchModal\.svelte['`"]" = "from './components/RegionSwitchModal.svelte'"

        # Handle various import styles
        "import\s+Header\s+from\s+['`"]\`\$lib/components/Header\.svelte['`"]" = "import Header from './components/Header.svelte'"
        "import\s+RealtimeErrorBoundary\s+from\s+['`"]\`\$lib/components/RealtimeErrorBoundary\.svelte['`"]" = "import RealtimeErrorBoundary from './components/RealtimeErrorBoundary.svelte'"
        "import\s+RegionSwitchModal\s+from\s+['`"]\`\$lib/components/RegionSwitchModal\.svelte['`"]" = "import RegionSwitchModal from './components/RegionSwitchModal.svelte'"
    }

    foreach ($File in $RootLayoutFiles) {
        if (Test-Path $File) {
            Write-Host "Processing root layout: $(Split-Path $File -Leaf)" -ForegroundColor White
            Update-FileImports -FilePath $File -Replacements $RootLayoutReplacements -Description "Root layout components"
        } else {
            Write-Log "Root layout file not found: $File" "WARN"
        }
    }

    # 3. Update server imports across all files
    Write-Host "`n🖥️ 3. Updating server imports..." -ForegroundColor Magenta

    # Find all TypeScript and Svelte files
    $AllFiles = Get-ChildItem -Path $WebSrcPath -Recurse -Include ("*.ts", "*.js", "*.svelte") |
                Where-Object { $_.FullName -notlike "*backup*" -and $_.FullName -notlike "*node_modules*" }

    Write-Host "Found $($AllFiles.Count) files to check for server imports..." -ForegroundColor Gray

    # Define server import replacements
    $ServerReplacements = @{
        # env/ directory moves
        "from\s+['`"]\`\$lib/env/" = "from '`$lib/server/env/"
        "import.*from\s+['`"]\`\$lib/env/" = "import { validateEnv } from '`$lib/server/env/"

        # supabase/server moves
        "from\s+['`"]\`\$lib/supabase/server['`"]" = "from '`$lib/server/supabase/server'"
        "import.*from\s+['`"]\`\$lib/supabase/server['`"]" = "import { createServerSupabaseClient } from '`$lib/server/supabase/server'"

        # middleware/ directory moves
        "from\s+['`"]\`\$lib/middleware/" = "from '`$lib/server/middleware/"
        "import.*from\s+['`"]\`\$lib/middleware/" = "import { handleError } from '`$lib/server/middleware/"

        # analytics/ directory moves
        "from\s+['`"]\`\$lib/analytics/" = "from '`$lib/server/analytics/"
        "import.*from\s+['`"]\`\$lib/analytics/" = "import { analytics } from '`$lib/server/analytics/"

        # monitoring/ directory moves
        "from\s+['`"]\`\$lib/monitoring/" = "from '`$lib/server/monitoring/"
        "import.*from\s+['`"]\`\$lib/monitoring/" = "import { performanceMonitor } from '`$lib/server/monitoring/'"

        # security/ directory moves
        "from\s+['`"]\`\$lib/security/" = "from '`$lib/server/security/"
        "import.*from\s+['`"]\`\$lib/security/" = "import { checkRateLimit } from '`$lib/server/security/'"

        # utils/rate-limiting moves
        "from\s+['`"]\`\$lib/utils/rate-limiting['`"]" = "from '`$lib/server/utils/rate-limiting'"
        "from\s+['`"]\`\$lib/utils/rate-limiting\.ts['`"]" = "from '`$lib/server/utils/rate-limiting'"
        "import.*from\s+['`"]\`\$lib/utils/rate-limiting['`"]" = "import { checkRateLimit, enforceRateLimit } from '`$lib/server/utils/rate-limiting'"

        # utils/payments moves
        "from\s+['`"]\`\$lib/utils/payments['`"]" = "from '`$lib/server/utils/payments'"
        "from\s+['`"]\`\$lib/utils/payments\.ts['`"]" = "from '`$lib/server/utils/payments'"
        "import.*from\s+['`"]\`\$lib/utils/payments['`"]" = "import * as PaymentsUtils from '`$lib/server/utils/payments'"

        # cache.ts moves
        "from\s+['`"]\`\$lib/cache['`"]" = "from '`$lib/server/utils/cache'"
        "from\s+['`"]\`\$lib/cache\.ts['`"]" = "from '`$lib/server/utils/cache'"
        "import.*from\s+['`"]\`\$lib/cache['`"]" = "import * as CacheUtils from '`$lib/server/utils/cache'"

        # jobs/ directory moves
        "from\s+['`"]\`\$lib/jobs/" = "from '`$lib/server/jobs/"
        "import.*from\s+['`"]\`\$lib/jobs/" = "import { processSlugQueue } from '`$lib/server/jobs/'"

        # cookies/ directory moves
        "from\s+['`"]\`\$lib/cookies/" = "from '`$lib/server/cookies/"
        "import.*from\s+['`"]\`\$lib/cookies/" = "import { COOKIES } from '`$lib/server/cookies/'"
    }

    foreach ($File in $AllFiles) {
        $RelativePath = $File.FullName.Replace($WebSrcPath, "").TrimStart("\", "/")

        # Check if file contains any server imports before processing
        $Content = Get-Content -Path $File.FullName -Raw -Encoding UTF8
        $HasServerImports = $false

        foreach ($Pattern in $ServerReplacements.Keys) {
            if ($Content -match $Pattern) {
                $HasServerImports = $true
                break
            }
        }

        if ($HasServerImports) {
            if ($Verbose) {
                Write-Host "Processing: $RelativePath" -ForegroundColor White
            }
            Update-FileImports -FilePath $File.FullName -Replacements $ServerReplacements -Description "Server imports"
        } else {
            $SkippedFiles++
        }
    }

    # 4. Fix core package import paths
    Write-Host "`n📚 4. Fixing core package import paths..." -ForegroundColor Magenta

    $CoreImportReplacements = @{
        # Fix ProductService import
        "from\s+['`"]@repo/core/services/products['`"]" = "from '@repo/domain/products'"
        "import.*from\s+['`"]@repo/core/services/products['`"]" = "import { ProductService } from '@repo/domain/products'"

        # Fix ConversationService if it exists
        "from\s+['`"]@repo/core/services/ConversationService['`"]" = "from '@repo/domain/conversations'"
        "import.*from\s+['`"]@repo/core/services/ConversationService['`"]" = "import { ConversationService } from '@repo/domain/conversations'"
    }

    foreach ($File in $AllFiles) {
        $Content = Get-Content -Path $File.FullName -Raw -Encoding UTF8
        $HasCoreImports = $false

        foreach ($Pattern in $CoreImportReplacements.Keys) {
            if ($Content -match $Pattern) {
                $HasCoreImports = $true
                break
            }
        }

        if ($HasCoreImports) {
            if ($Verbose) {
                $RelativePath = $File.FullName.Replace($WebSrcPath, "").TrimStart("\", "/")
                Write-Host "Processing core imports: $RelativePath" -ForegroundColor White
            }
            Update-FileImports -FilePath $File.FullName -Replacements $CoreImportReplacements -Description "Core package imports"
        }
    }

    # 5. Clean up duplicate files if they exist
    Write-Host "`n🧹 5. Checking for duplicate component files..." -ForegroundColor Magenta

    $DuplicateChecks = @(
        "Header.svelte",
        "RealtimeErrorBoundary.svelte",
        "RegionSwitchModal.svelte"
    )

    foreach ($FileName in $DuplicateChecks) {
        $Duplicates = Get-ChildItem -Path $WebSrcPath -Recurse -Filter $FileName | Where-Object { $_.FullName -notlike "*backup*" -and $_.FullName -notlike "*node_modules*" }

        if ($Duplicates.Count -gt 1) {
            Write-Host "Found duplicate $FileName files:" -ForegroundColor Yellow
            foreach ($Dup in $Duplicates) {
                $RelativePath = $Dup.FullName.Replace($ProjectRoot, "").TrimStart("\", "/")
                Write-Host "  - $RelativePath" -ForegroundColor Gray
            }

            # Keep the one in routes/components/ and backup others
            $RoutesComponent = $Duplicates | Where-Object { $_.FullName -like "*routes\components*" }
            $LibComponents = $Duplicates | Where-Object { $_.FullName -like "*lib\components*" -and $_.FullName -notlike "*routes\components*" }

            if ($RoutesComponent -and $LibComponents) {
                Write-Host "  Keeping routes/components version, backing up lib/components version" -ForegroundColor Green
                foreach ($LibFile in $LibComponents) {
                    if (-not ($DryRun -or $WhatIf)) {
                        $BackupPath = "$($LibFile.FullName).moved-to-routes-components"
                        Move-Item -Path $LibFile.FullName -Destination $BackupPath -Force
                        Write-Log "Moved duplicate $FileName to backup: $BackupPath"
                    } else {
                        Write-Host "  [DRY RUN] Would move duplicate $FileName to backup" -ForegroundColor Cyan
                    }
                }
            }
        }
    }

    # 6. Summary
    Write-Host "`n📊 Summary" -ForegroundColor Cyan
    Write-Host "Total files processed: $TotalFiles" -ForegroundColor White
    Write-Host "Files updated: $UpdatedFiles" -ForegroundColor Green
    Write-Host "Files skipped (no changes needed): $SkippedFiles" -ForegroundColor Yellow
    Write-Host "Files with errors: $ErrorFiles" -ForegroundColor Red

    if ($DryRun -or $WhatIf) {
        Write-Host "`n💡 This was a DRY RUN. No files were actually modified." -ForegroundColor Cyan
        Write-Host "   Run without -DryRun or -WhatIf to apply the changes." -ForegroundColor Gray
    } else {
        Write-Host "`n✅ Import updates completed successfully!" -ForegroundColor Green
        Write-Host "   Log file saved to: $LogPath" -ForegroundColor Gray
        Write-Host "   Backup files created with .backup extension" -ForegroundColor Gray

        # Suggest next steps
        Write-Host "`n🎯 Next steps:" -ForegroundColor Magenta
        Write-Host "1. Run 'pnpm run check' in apps/web to verify TypeScript compilation" -ForegroundColor White
        Write-Host "2. Run 'pnpm run lint' in apps/web to check for linting issues" -ForegroundColor White
        Write-Host "3. Test the application to ensure all imports work correctly" -ForegroundColor White
        Write-Host "4. Remove .backup files if everything is working correctly" -ForegroundColor Gray
    }

    Write-Log "Phase 4C comprehensive import updates completed. Total: $TotalFiles, Updated: $UpdatedFiles, Skipped: $SkippedFiles, Errors: $ErrorFiles"

} catch {
    Write-Log "Script failed: $($_.Exception.Message)" "ERROR"
    Write-Host "❌ Script failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}