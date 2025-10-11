# Phase 4C Component Analysis Script
# Analyzes component usage across apps/web/src to determine shared vs route-specific components

param(
    [string]$ComponentsDir = "K:\driplo-turbo-1\apps\web\src\lib\components",
    [string]$SearchDir = "K:\driplo-turbo-1\apps\web\src",
    [string]$OutputFile = "K:\driplo-turbo-1\phase4c-component-map.json"
)

Write-Host "Phase 4C Component Analysis Starting..." -ForegroundColor Green
Write-Host "Components Directory: $ComponentsDir" -ForegroundColor Cyan
Write-Host "Search Directory: $SearchDir" -ForegroundColor Cyan
Write-Host "Output File: $OutputFile" -ForegroundColor Cyan

# Get all .svelte files in components directory
$components = Get-ChildItem -Path $ComponentsDir -Recurse -Filter "*.svelte" |
    ForEach-Object {
        $relativePath = $_.FullName.Replace("$ComponentsDir\", "").Replace("\", "/")
        @{
            Name = $_.BaseName
            Path = $relativePath
            FullPath = $_.FullName
        }
    }

Write-Host "Found $($components.Count) components to analyze" -ForegroundColor Yellow

# Initialize results array
$results = @()

# Function to extract component name from import statement
function GetImportName {
    param([string]$Line, [string]$ComponentName)

    # Match patterns like:
    # import ComponentName from './path/Component.svelte';
    # import { ComponentName } from './path/Component.svelte';
    # import Component as Alias from './path/Component.svelte';
    # import { Component as Alias } from './path/Component.svelte';

    $patterns = @(
        "import\s+($ComponentName)\s+from",
        "import\s+\{\s*($ComponentName)\s*\}",
        "import\s+\{\s*($ComponentName)\s+as\s+\w+\s*\}",
        "import\s+($ComponentName)\s+as\s+\w+\s+from"
    )

    foreach ($pattern in $patterns) {
        if ($Line -match $pattern) {
            return $matches[1]
        }
    }

    return $null
}

# Function to search for component usage
function FindComponentUsage {
    param(
        [string]$ComponentName,
        [string]$ComponentPath,
        [string]$SearchDirectory
    )

    $usageInfo = @{
        UsedBy = @()
        UsageCount = 0
        Routes = @()
    }

    # Search for imports of this component
    $importPatterns = @(
        "import.*$ComponentName.*from.*['`"].*components/$ComponentPath['`"]",
        "import.*from.*['`"].*components/$ComponentPath['`"]",
        "import.*['`"].*components/$ComponentPath['`"]"
    )

    $allFiles = Get-ChildItem -Path $SearchDirectory -Recurse -Include ("*.svelte", "*.ts", "*.js") |
        Where-Object { $_.FullName -notlike "*components*" }

    foreach ($file in $allFiles) {
        $content = Get-Content $file.FullName -Raw
        $relativePath = $file.FullName.Replace("$SearchDirectory\", "").Replace("\", "/")

        # Check if file imports this component
        $hasImport = $false
        $importName = $ComponentName

        foreach ($pattern in $importPatterns) {
            if ($content -match $pattern) {
                $hasImport = $true
                # Try to extract the actual import name
                $lines = $content -split "`n"
                foreach ($line in $lines) {
                    if ($line -match $pattern) {
                        $importName = GetImportName -Line $line -ComponentName $ComponentName
                        if ($importName) { break }
                    }
                }
                break
            }
        }

        if ($hasImport) {
            # Additional check: look for component usage in the file
            $componentUsagePattern = "<\s*$importName"
            if ($content -match $componentUsagePattern) {
                $usageInfo.UsedBy += $relativePath
                $usageInfo.UsageCount++

                # Extract route path
                if ($relativePath -match "^\(([^)]+)\)/(.+)$") {
                    $routePath = "($($matches[1]))/$($matches[2])"
                } elseif ($relativePath -match "^(routes/)?(.+)\.svelte$") {
                    $routePath = $matches[2]
                } else {
                    $routePath = $relativePath
                }

                if ($routePath -notin $usageInfo.Routes) {
                    $usageInfo.Routes += $routePath
                }
            }
        }
    }

    return $usageInfo
}

# Analyze each component
foreach ($component in $components) {
    Write-Host "Analyzing $($component.Name)..." -ForegroundColor Blue

    $usage = FindComponentUsage -ComponentName $component.Name -ComponentPath $component.Path -SearchDirectory $SearchDir

    # Determine action based on usage
    $action = "KEEP in lib"
    $targetRoute = ""

    if ($usage.UsageCount -eq 0) {
        $action = "UNUSED - review for removal"
    } elseif ($usage.UsageCount -eq 1 -and $usage.Routes.Count -eq 1) {
        $action = "MOVE to route"
        $targetRoute = $usage.Routes[0]
    }

    # Special handling for known route-specific patterns
    if ($component.Path -like "modular/*" -or $component.Path -like "Message*" -or $component.Path -like "Conversation*") {
        if ($usage.Routes.Count -eq 1 -and $usage.Routes[0] -like "*messages*") {
            $action = "MOVE to route"
            $targetRoute = $usage.Routes[0]
        }
    }

    if ($component.Name -eq "VirtualProductGrid" -and $usage.Routes.Count -eq 1) {
        $action = "MOVE to route"
        $targetRoute = $usage.Routes[0]
    }

    $result = @{
        Path = $component.Path
        UsageCount = $usage.UsageCount
        Action = $action
        TargetRoute = $targetRoute
        UsedBy = $usage.UsedBy
        Routes = $usage.Routes
    }

    $results += $result

    Write-Host "  Usage Count: $($usage.UsageCount)" -ForegroundColor Gray
    Write-Host "  Action: $action" -ForegroundColor Gray
    if ($targetRoute) {
        Write-Host "  Target Route: $targetRoute" -ForegroundColor Gray
    }
}

# Convert to JSON and save
$json = $results | ConvertTo-Json -Depth 10
$json | Out-File -FilePath $OutputFile -Encoding UTF8

Write-Host "`nAnalysis complete!" -ForegroundColor Green
Write-Host "Results saved to: $OutputFile" -ForegroundColor Cyan

# Summary statistics
$sharedCount = ($results | Where-Object { $_.Action -eq "KEEP in lib" }).Count
$moveCount = ($results | Where-Object { $_.Action -eq "MOVE to route" }).Count
$unusedCount = ($results | Where-Object { $_.Action -like "UNUSED*" }).Count

Write-Host "`nSummary:" -ForegroundColor Yellow
Write-Host "  Shared components (KEEP): $sharedCount" -ForegroundColor Green
Write-Host "  Route-specific components (MOVE): $moveCount" -ForegroundColor Yellow
Write-Host "  Unused components: $unusedCount" -ForegroundColor Red

# Show components to move
$moveComponents = $results | Where-Object { $_.Action -eq "MOVE to route" }
if ($moveComponents.Count -gt 0) {
    Write-Host "`nComponents to move to routes:" -ForegroundColor Yellow
    foreach ($comp in $moveComponents) {
        Write-Host "  $($comp.Path) → $($comp.TargetRoute)" -ForegroundColor Cyan
    }
}

# Show unused components
$unusedComponents = $results | Where-Object { $_.Action -like "UNUSED*" }
if ($unusedComponents.Count -gt 0) {
    Write-Host "`nUnused components (review for removal):" -ForegroundColor Red
    foreach ($comp in $unusedComponents) {
        Write-Host "  $($comp.Path)" -ForegroundColor Red
    }
}

Write-Host "`nPhase 4C Component Analysis Complete!" -ForegroundColor Green