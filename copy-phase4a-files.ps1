# Phase 4A: Copy components to new locations
# This script reads phase4a-import-map.json and copies all files to their new locations
# Old files are kept as backup until tests pass

$ErrorActionPreference = "Stop"

# Load the import map
$importMapPath = "K:\driplo-turbo-1\phase4a-import-map.json"
$importMap = Get-Content $importMapPath -Raw | ConvertFrom-Json

$basePath = "K:\driplo-turbo-1\packages\ui\src\lib"
$copiedCount = 0
$skippedCount = 0
$errors = @()

Write-Host "=== Phase 4A: Copying Components ===" -ForegroundColor Cyan
Write-Host ""

# Function to copy a file
function Copy-Component {
    param (
        [string]$oldPath,
        [string]$newPath
    )
    
    $fullOldPath = Join-Path $basePath $oldPath
    $fullNewPath = Join-Path $basePath $newPath
    
    # Check if source exists
    if (-not (Test-Path $fullOldPath)) {
        Write-Host "SKIP: Source not found: $oldPath" -ForegroundColor Yellow
        $script:skippedCount++
        return
    }
    
    # Check if destination already exists
    if (Test-Path $fullNewPath) {
        Write-Host "EXISTS: $newPath" -ForegroundColor Gray
        $script:skippedCount++
        return
    }
    
    # Create destination directory
    $destDir = Split-Path $fullNewPath -Parent
    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }
    
    # Copy the file
    try {
        Copy-Item -Path $fullOldPath -Destination $fullNewPath -Force
        Write-Host "COPIED: $oldPath -> $newPath" -ForegroundColor Green
        $script:copiedCount++
    }
    catch {
        Write-Host "ERROR: Failed to copy $oldPath" -ForegroundColor Red
        $script:errors += "Failed to copy $oldPath : $_"
    }
}

# Copy primitives
Write-Host "--- Copying Primitives ---" -ForegroundColor Yellow
foreach ($prop in $importMap.primitives.PSObject.Properties) {
    Copy-Component -oldPath $prop.Name -newPath $prop.Value
}

# Copy compositions
Write-Host ""
Write-Host "--- Copying Compositions ---" -ForegroundColor Yellow
foreach ($prop in $importMap.compositions.PSObject.Properties) {
    Copy-Component -oldPath $prop.Name -newPath $prop.Value
}

# Copy layouts
Write-Host ""
Write-Host "--- Copying Layouts ---" -ForegroundColor Yellow
foreach ($prop in $importMap.layouts.PSObject.Properties) {
    Copy-Component -oldPath $prop.Name -newPath $prop.Value
}

# Summary
Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Copied: $copiedCount files" -ForegroundColor Green
Write-Host "Skipped: $skippedCount files (already exist or not found)" -ForegroundColor Yellow

if ($errors.Count -gt 0) {
    Write-Host ""
    Write-Host "=== Errors ===" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host $_ -ForegroundColor Red }
    exit 1
}

Write-Host ""
Write-Host "=== Copy Complete ===" -ForegroundColor Green
Write-Host "Old files kept in place as backup until tests pass"
