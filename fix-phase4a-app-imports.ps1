# Phase 4A: Fix $lib imports in apps (web, admin, docs)
# This script fixes imports like: from '$lib/components/ui/Button' -> from '$lib/primitives/button/Button'

$ErrorActionPreference = "Stop"

Write-Host "=== Phase 4A: Fixing App-Level \$lib Imports ===" -ForegroundColor Cyan
Write-Host ""

# Load the import map
$importMapPath = "K:\driplo-turbo-1\phase4a-import-map.json"
$importMapContent = [System.IO.File]::ReadAllText($importMapPath)
$importMap = $importMapContent | ConvertFrom-Json

# Build import patterns for $lib imports
$importPatterns = @()

# Process all mappings
foreach ($category in @('primitives', 'compositions', 'layouts')) {
    $mappings = $importMap.$category
    if (-not $mappings) { continue }
    
    foreach ($prop in $mappings.PSObject.Properties) {
        $oldPath = $prop.Name
        $newPath = $prop.Value
        
        # Remove 'components/' prefix and .svelte extension
        $oldPathClean = $oldPath -replace '^components/', '' -replace '\.svelte$', ''
        $newPathClean = $newPath -replace '\.svelte$', ''
        
        $importPatterns += @{
            Old = $oldPathClean
            New = $newPathClean
        }
    }
}

Write-Host "Built $($importPatterns.Count) import patterns" -ForegroundColor Yellow
Write-Host ""

# Find all app files
$appDirs = @("K:\driplo-turbo-1\apps\web", "K:\driplo-turbo-1\apps\admin", "K:\driplo-turbo-1\apps\docs")
$files = @()

foreach ($appDir in $appDirs) {
    if (Test-Path $appDir) {
        $files += Get-ChildItem -Path $appDir -Recurse `
            -Include "*.svelte","*.ts","*.js" `
            | Where-Object { $_.FullName -notmatch '[\\/]node_modules[\\/]' -and 
                             $_.FullName -notmatch '[\\/]dist[\\/]' -and
                             $_.FullName -notmatch '[\\/]\.svelte-kit[\\/]' }
    }
}

Write-Host "Found $($files.Count) app files to process" -ForegroundColor Yellow
Write-Host ""

$fixedCount = 0

foreach ($file in $files) {
    try {
        $content = [System.IO.File]::ReadAllText($file.FullName)
    }
    catch {
        continue
    }
    
    $originalContent = $content
    $fileChanged = $false
    $changes = @()
    
    foreach ($pattern in $importPatterns) {
        $oldPath = $pattern.Old
        $newPath = $pattern.New
        
        # Pattern: from '$lib/components/...' or import ... from '$lib/components/...'
        # Match both with and without .svelte extension
        $regex1 = [regex]::Escape("from `'`$lib/$oldPath`'")
        $regex2 = [regex]::Escape("from `"`$lib/$oldPath`"")
        $regex3 = [regex]::Escape("from `'`$lib/$oldPath.svelte`'")
        $regex4 = [regex]::Escape("from `"`$lib/$oldPath.svelte`"")
        
        $newImport1 = "from '`$lib/$newPath'"
        $newImport2 = "from `"`$lib/$newPath`""
        
        if ($content -match $regex1) {
            $content = $content -replace $regex1, $newImport1
            $fileChanged = $true
            $changes += "`$lib/$oldPath -> `$lib/$newPath"
        }
        
        if ($content -match $regex2) {
            $content = $content -replace $regex2, $newImport2
            $fileChanged = $true
            $changes += "`$lib/$oldPath -> `$lib/$newPath"
        }
        
        if ($content -match $regex3) {
            $content = $content -replace $regex3, "from '`$lib/$newPath.svelte'"
            $fileChanged = $true
            $changes += "`$lib/$oldPath.svelte -> `$lib/$newPath.svelte"
        }
        
        if ($content -match $regex4) {
            $content = $content -replace $regex4, "from `"`$lib/$newPath.svelte`""
            $fileChanged = $true
            $changes += "`$lib/$oldPath.svelte -> `$lib/$newPath.svelte"
        }
    }
    
    if ($fileChanged -and $content -ne $originalContent) {
        [System.IO.File]::WriteAllText($file.FullName, $content)
        $relativePath = $file.FullName -replace [regex]::Escape("K:\driplo-turbo-1\"), ""
        Write-Host "FIXED: $relativePath" -ForegroundColor Green
        foreach ($change in $changes | Select-Object -Unique) {
            Write-Host "  $change" -ForegroundColor Gray
        }
        $fixedCount++
    }
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Fixed: $fixedCount app files" -ForegroundColor Green
Write-Host ""
Write-Host "=== App Import Fix Complete ===" -ForegroundColor Green
