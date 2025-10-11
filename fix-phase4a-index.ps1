# Phase 4A: Update main index.ts to import from new locations

$ErrorActionPreference = "Stop"

Write-Host "=== Phase 4A: Updating packages/ui/src/lib/index.ts ===" -ForegroundColor Cyan
Write-Host ""

$indexPath = "K:\driplo-turbo-1\packages\ui\src\lib\index.ts"
$importMapPath = "K:\driplo-turbo-1\phase4a-import-map.json"

# Load files
$content = [System.IO.File]::ReadAllText($indexPath)
$importMapContent = [System.IO.File]::ReadAllText($importMapPath)
$importMap = $importMapContent | ConvertFrom-Json

$originalContent = $content
$changes = 0

# Build all path mappings
$allMappings = @{}

foreach ($category in @('primitives', 'compositions', 'layouts')) {
    $mappings = $importMap.$category
    if (-not $mappings) { continue }
    
    foreach ($prop in $mappings.PSObject.Properties) {
        $oldPath = $prop.Name
        $newPath = $prop.Value
        
        # Store mapping
        $allMappings[$oldPath] = $newPath
    }
}

Write-Host "Processing $($allMappings.Count) path mappings..." -ForegroundColor Yellow
Write-Host ""

# Replace each import path
foreach ($oldPath in $allMappings.Keys) {
    $newPath = $allMappings[$oldPath]
    
    # Pattern: export { default as X } from './components/...';
    $oldImport = "./$oldPath"
    $newImport = "./$newPath"
    
    if ($content -match [regex]::Escape($oldImport)) {
        $content = $content -replace [regex]::Escape($oldImport), $newImport
        $componentName = [System.IO.Path]::GetFileNameWithoutExtension($oldPath)
        Write-Host "UPDATED: $componentName" -ForegroundColor Green
        Write-Host "  $oldImport -> $newImport" -ForegroundColor Gray
        $changes++
    }
}

if ($changes -gt 0) {
    [System.IO.File]::WriteAllText($indexPath, $content)
    Write-Host ""
    Write-Host "=== Updated $changes imports in index.ts ===" -ForegroundColor Green
}
else {
    Write-Host "No changes needed" -ForegroundColor Yellow
}
