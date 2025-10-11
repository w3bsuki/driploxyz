# Phase 4A: Fix ALL imports after UI package restructure
# This script updates imports across the entire monorepo systematically

$ErrorActionPreference = "Stop"

Write-Host "=== Phase 4A: Fixing Imports ===" -ForegroundColor Cyan
Write-Host ""

# Load the import map
$importMapPath = "K:\driplo-turbo-1\phase4a-import-map.json"
$importMapContent = [System.IO.File]::ReadAllText($importMapPath)
$importMap = $importMapContent | ConvertFrom-Json

# Build comprehensive mapping of old -> new paths
$pathMappings = @{}

# Process primitives
foreach ($prop in $importMap.primitives.PSObject.Properties) {
    $oldPath = $prop.Name -replace 'components/', ''
    $newPath = $prop.Value
    
    # Extract component name from path
    $componentName = [System.IO.Path]::GetFileNameWithoutExtension($oldPath)
    $pathMappings[$oldPath] = $newPath
}

# Process compositions
foreach ($prop in $importMap.compositions.PSObject.Properties) {
    $oldPath = $prop.Name -replace 'components/', ''
    $newPath = $prop.Value
    $pathMappings[$oldPath] = $newPath
}

# Process layouts
foreach ($prop in $importMap.layouts.PSObject.Properties) {
    $oldPath = $prop.Name -replace 'components/', ''
    $newPath = $prop.Value
    $pathMappings[$oldPath] = $newPath
}

Write-Host "Built $($pathMappings.Count) path mappings" -ForegroundColor Yellow
Write-Host ""

# Find all files to process
$files = Get-ChildItem -Path "K:\driplo-turbo-1" -Recurse `
    -Include "*.svelte","*.ts","*.js" `
    -Exclude "node_modules","dist",".turbo",".svelte-kit","*.min.js","*.d.ts" |
    Where-Object { $_.FullName -notmatch '[\\/]node_modules[\\/]' -and 
                   $_.FullName -notmatch '[\\/]dist[\\/]' -and
                   $_.FullName -notmatch '[\\/]\.svelte-kit[\\/]' -and
                   $_.FullName -notmatch '[\\/]\.turbo[\\/]' }

Write-Host "Found $($files.Count) files to process" -ForegroundColor Yellow
Write-Host ""

$fixedCount = 0
$changeLog = @()

foreach ($file in $files) {
    try {
        $content = [System.IO.File]::ReadAllText($file.FullName)
    }
    catch {
        continue
    }
    if (-not $content) { continue }
    
    $originalContent = $content
    $fileChanged = $false
    $changes = @()
    
    # For each mapping, try to find and replace imports
    foreach ($oldPath in $pathMappings.Keys) {
        $newPath = $pathMappings[$oldPath]
        
        # Extract the old and new directories and component names
        $oldDir = [System.IO.Path]::GetDirectoryName($oldPath) -replace '\\', '/'
        $oldFile = [System.IO.Path]::GetFileName($oldPath)
        $oldFileNoExt = [System.IO.Path]::GetFileNameWithoutExtension($oldPath)
        
        $newDir = [System.IO.Path]::GetDirectoryName($newPath) -replace '\\', '/'
        $newFile = [System.IO.Path]::GetFileName($newPath)
        $newFileNoExt = [System.IO.Path]::GetFileNameWithoutExtension($newPath)
        
        # Pattern 1: $lib imports from within UI package
        # from '$lib/components/ui/Button' -> from '$lib/primitives/button/Button'
        $pattern1 = "from\s+[`"'](\$lib/)?components/$oldDir/$oldFileNoExt[`"']"
        $replace1 = "from '`$1$newDir/$newFileNoExt'"
        if ($content -match $pattern1) {
            $content = $content -replace $pattern1, $replace1
            $changes += "Pattern1: components/$oldDir/$oldFileNoExt -> $newDir/$newFileNoExt"
            $fileChanged = $true
        }
        
        # Pattern 2: $lib imports with .svelte extension
        # from '$lib/components/ui/Button.svelte' -> from '$lib/primitives/button/Button.svelte'
        $pattern2 = "from\s+[`"'](\$lib/)?components/$oldDir/$oldFile[`"']"
        $replace2 = "from '`$1$newDir/$newFile'"
        if ($content -match $pattern2) {
            $content = $content -replace $pattern2, $replace2
            $changes += "Pattern2: components/$oldDir/$oldFile -> $newDir/$newFile"
            $fileChanged = $true
        }
        
        # Pattern 3: Relative imports within UI package
        # from '../ui/Button' -> from '../../primitives/button/Button'
        # This is complex - need to calculate relative depth
        $pattern3 = "from\s+[`"']\.\./$oldDir/$oldFileNoExt[`"']"
        if ($content -match $pattern3) {
            # Simple replace for now - may need depth calculation
            $content = $content -replace $pattern3, "from '../../$newDir/$newFileNoExt'"
            $changes += "Pattern3: ../$oldDir/$oldFileNoExt -> ../../$newDir/$newFileNoExt"
            $fileChanged = $true
        }
        
        # Pattern 4: Relative imports with .svelte
        $pattern4 = "from\s+[`"']\.\./$oldDir/$oldFile[`"']"
        if ($content -match $pattern4) {
            $content = $content -replace $pattern4, "from '../../$newDir/$newFile'"
            $changes += "Pattern4: ../$oldDir/$oldFile -> ../../$newDir/$newFile"
            $fileChanged = $true
        }
        
        # Pattern 5: @repo/ui imports from apps (rare, but possible)
        # import Button from '@repo/ui/components/ui/Button'
        $pattern5 = "from\s+[`"']@repo/ui/components/$oldDir/$oldFileNoExt[`"']"
        $replace5 = "from '@repo/ui/$newDir/$newFileNoExt'"
        if ($content -match $pattern5) {
            $content = $content -replace $pattern5, $replace5
            $changes += "Pattern5: @repo/ui/components/$oldDir/$oldFileNoExt -> @repo/ui/$newDir/$newFileNoExt"
            $fileChanged = $true
        }
    }
    
    # Save if changed
    if ($fileChanged -and $content -ne $originalContent) {
        [System.IO.File]::WriteAllText($file.FullName, $content)
        $relativePath = $file.FullName -replace [regex]::Escape("K:\driplo-turbo-1\"), ""
        Write-Host "FIXED: $relativePath" -ForegroundColor Green
        foreach ($change in $changes) {
            Write-Host "  $change" -ForegroundColor Gray
        }
        $fixedCount++
        $changeLog += @{
            File = $relativePath
            Changes = $changes
        }
    }
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Fixed: $fixedCount files" -ForegroundColor Green
Write-Host ""

# Save change log
$changeLogJson = $changeLog | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText("K:\driplo-turbo-1\phase4a-import-fixes.json", $changeLogJson)
Write-Host "Change log saved to phase4a-import-fixes.json" -ForegroundColor Yellow
Write-Host ""
Write-Host "=== Import Fix Complete ===" -ForegroundColor Green
