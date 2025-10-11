# Generate Route Map Script for Phase 4C (Version 2)
# This script analyzes all routes in apps/web/src/routes and generates a JSON mapping

$routesPath = "K:\driplo-turbo-1\apps\web\src\routes"
$outputFile = "K:\driplo-turbo-1\phase4c-route-map.json"

# Function to determine if a directory is a route (has +page.svelte or +page.ts)
function Is-PageRoute {
    param($dirPath)

    $hasPageSvelte = Test-Path "$dirPath\+page.svelte"
    $hasPageTs = Test-Path "$dirPath\+page.ts"
    $hasPageServer = Test-Path "$dirPath\+page.server.ts"

    return $hasPageSvelte -or $hasPageTs -or $hasPageServer
}

# Function to check for layout files
function Get-LayoutInfo {
    param($dirPath)

    return @{
        HasLayout = Test-Path "$dirPath\+layout.svelte"
        HasServer = Test-Path "$dirPath\+layout.server.ts"
    }
}

# Function to determine proposed group based on route categorization
function Get-ProposedGroup {
    param($routePath, $relativePath)

    # Already grouped routes - keep at root level
    if ($relativePath -match '^\(admin\)' -or
        $relativePath -match '^\(api\)' -or
        $relativePath -match '^\(auth\)' -or
        $relativePath -match '^\(protected\)') {
        return $relativePath
    }

    # API routes - keep as is
    if ($relativePath -match '^api/') {
        return $relativePath
    }

    # Shop routes
    if ($relativePath -match '^(search|product|brands|category|collection|designer|drip|wishlist|sellers)(/.*)?$') {
        return "(app)/(shop)/$relativePath"
    }

    # Account routes
    if ($relativePath -match '^(profile|pro)(/.*)?$') {
        return "(app)/(account)/$relativePath"
    }

    # Marketing routes
    if ($relativePath -match '^(about|blog|careers|help|privacy|terms|returns|trust-safety)(/.*)?$') {
        return "(marketing)/$relativePath"
    }

    # Root files and SEO/utility routes - keep at root
    if ($relativePath -match '^(\[\.\.\.slug\]|sitemap\.xml|robots\.txt|offline|auth|logout|register)$') {
        return $relativePath
    }

    # Default - keep as is
    return $relativePath
}

# Get all route directories
$routeDirs = Get-ChildItem -Path $routesPath -Recurse -Directory | Where-Object {
    $_.FullName -ne $routesPath -and
    (Is-PageRoute $_.FullName)
}

$routeMap = @()

# Process each route directory
foreach ($dir in $routeDirs) {
    $relativePath = $dir.FullName.Replace($routesPath, "").TrimStart('\').Replace('\', '/')
    $layoutInfo = Get-LayoutInfo $dir.FullName
    $hasPage = (Test-Path "$($dir.FullName)\+page.svelte") -or
               (Test-Path "$($dir.FullName)\+page.ts") -or
               (Test-Path "$($dir.FullName)\+page.server.ts")

    $routeObject = [PSCustomObject]@{
        Path = $relativePath
        HasPage = $hasPage
        HasLayout = $layoutInfo.HasLayout
        HasServer = $layoutInfo.HasServer
        ProposedGroup = Get-ProposedGroup $dir.FullName $relativePath
    }

    $routeMap += $routeObject
}

# Sort by path
$routeMap = $routeMap | Sort-Object -Property Path

# Create JSON manually to ensure proper formatting
$jsonBuilder = "[`r`n"
for ($i = 0; $i -lt $routeMap.Count; $i++) {
    $route = $routeMap[$i]
    $jsonBuilder += "  {`r`n"
    $jsonBuilder += "    `"Path`": `"$($route.Path)`",`r`n"
    $jsonBuilder += "    `"HasPage`": $($route.HasPage.ToString().ToLower()),`r`n"
    $jsonBuilder += "    `"HasLayout`": $($route.HasLayout.ToString().ToLower()),`r`n"
    $jsonBuilder += "    `"HasServer`": $($route.HasServer.ToString().ToLower()),`r`n"
    $jsonBuilder += "    `"ProposedGroup`": `"$($route.ProposedGroup)`"`r`n"
    $jsonBuilder += "  }"
    if ($i -lt $routeMap.Count - 1) {
        $jsonBuilder += ","
    }
    $jsonBuilder += "`r`n"
}
$jsonBuilder += "]"

# Save to file
$jsonBuilder | Out-File -FilePath $outputFile -Encoding UTF8

Write-Host "Route map generated successfully!"
Write-Host "Output file: $outputFile"
Write-Host "Total routes processed: $($routeMap.Count)"

# Show summary
$summary = $routeMap | Group-Object -Property {
    if ($_.ProposedGroup -match '^\(app\)/\(shop\)/') { "Shop Routes" }
    elseif ($_.ProposedGroup -match '^\(app\)/\(account\)/') { "Account Routes" }
    elseif ($_.ProposedGroup -match '^\(marketing\)/') { "Marketing Routes" }
    elseif ($_.ProposedGroup -match '^\((admin|api|auth|protected)\)') { "Already Grouped" }
    else { "Root Level" }
} | Sort-Object Name

Write-Host "`nRoute Summary:"
foreach ($group in $summary) {
    Write-Host "$($group.Name): $($group.Count) routes"
}