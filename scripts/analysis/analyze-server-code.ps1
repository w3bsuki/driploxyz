# Phase 4C Server Code Analysis Script
# Analyzes lib directory files to identify server-only code that should move to $lib/server/

param(
    [string]$LibPath = "K:\driplo-turbo-1\apps\web\src\lib",
    [string]$OutputFile = "K:\driplo-turbo-1\phase4c-server-code-map.json"
)

# Server-only patterns to detect
$serverPatterns = @{
    "env_private" = @(
        '\$env/static/private',
        '\$env/dynamic/private',
        'PRIVATE_',
        'SERVICE_ROLE_KEY',
        'SUPABASE_SERVICE_ROLE'
    )
    "supabase_admin" = @(
        'createAdminClient',
        'serviceRoleKey',
        'admin\.supabase',
        'serviceRole'
    )
    "database_direct" = @(
        'from\s*\(',
        '\.from\s*\(',
        '\.rpc\s*\(',
        '\.sql\s*\(',
        'pool\.',
        'connection\.',
        'postgres\.',
        'pg\.'
    )
    "nodejs_apis" = @(
        'require.*fs',
        'require.*path',
        'import.*fs',
        'import.*path',
        'readFileSync',
        'writeFileSync',
        'existsSync',
        'mkdirSync'
    )
    "stripe_api" = @(
        'stripe\.',
        'require.*stripe',
        'import.*stripe',
        'Stripe\(',
        '\.charges\.',
        '\.customers\.',
        '\.payment_intents\.',
        '\.webhooks\.'
    )
    "server_auth" = @(
        'decodeJWT',
        'verifyJWT',
        'createJWT',
        'jwt\.verify',
        'jwt\.sign',
        'bcrypt\.',
        'crypto\.createHmac'
    )
    "http_server" = @(
        'fetch.*https?://',
        'createServer',
        'http\.',
        'https\.',
        'node-fetch'
    )
    "file_system" = @(
        'uploadFile',
        'downloadFile',
        'createSignedUploadUrl',
        'createSignedDownloadUrl'
    )
}

# Files that are definitely server-only based on naming and purpose
$knownServerFiles = @(
    "env/server.ts",
    "env/validation.ts",
    "cookies/production-cookie-system.ts",
    "middleware/error-handler.ts",
    "middleware/rate-limiter.ts",
    "middleware/security.ts",
    "middleware/validation.ts",
    "monitoring/performance.ts",
    "supabase/server.ts",
    "cache.ts",
    "jobs/slug-processor.ts"
)

# Files to analyze (from the provided list)
$filesToAnalyze = @(
    "analytics/product.ts",
    "auth.ts",
    "auth/hooks.ts",
    "auth/index.ts",
    "auth/oauth.ts",
    "auth/onboarding.ts",
    "auth/store.svelte.ts",
    "cache.ts",
    "categories/mapping.ts",
    "categories/translation-test.ts",
    "cookies/production-cookie-system.ts",
    "country/detection.ts",
    "data/collections.ts",
    "env/server.ts",
    "env/validation.ts",
    "jobs/slug-processor.ts",
    "links.ts",
    "locale/detection.ts",
    "middleware/error-handler.ts",
    "middleware/rate-limiter.ts",
    "middleware/security.ts",
    "middleware/validation.ts",
    "monitoring/performance.ts",
    "realtime/notifications.ts",
    "security/rate-limiter.ts",
    "seo.ts",
    "stripe/client.ts",
    "supabase/server.ts",
    "tutorial/manager.svelte.ts",
    "utils/payments.ts",
    "utils/rate-limiting.ts",
    "validation/auth.ts",
    "validation/product.ts"
)

# Results array
$results = @()

Write-Host "Phase 4C Server Code Analysis" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
Write-Host ""

# Function to check if file contains server-only patterns
function Test-ServerOnlyCode {
    param(
        [string]$FilePath,
        [string]$Content
    )

    $reasons = @()
    $patternMatches = @{}

    # Check each pattern category
    foreach ($category in $serverPatterns.Keys) {
        $matches = @()
        foreach ($pattern in $serverPatterns[$category]) {
            if ($Content -match $pattern) {
                $matches += $pattern
            }
        }
        if ($matches.Count -gt 0) {
            $patternMatches[$category] = $matches
        }
    }

    # Determine if file should move to server
    $shouldMove = $false
    $reason = ""

    # Known server files
    if ($knownServerFiles -contains $FilePath.Replace("$LibPath\", "").Replace("/", "\")) {
        $shouldMove = $true
        $reason = "Known server-only file based on naming and purpose"
    }

    # Check for server patterns
    if (-not $shouldMove -and $patternMatches.Count -gt 0) {
        $shouldMove = $true
        $reasonParts = @()

        if ($patternMatches.ContainsKey("env_private")) {
            $reasonParts += "Uses private environment variables"
        }
        if ($patternMatches.ContainsKey("supabase_admin")) {
            $reasonParts += "Creates Supabase admin client"
        }
        if ($patternMatches.ContainsKey("database_direct")) {
            $reasonParts += "Makes direct database calls"
        }
        if ($patternMatches.ContainsKey("nodejs_apis")) {
            $reasonParts += "Uses Node.js-only APIs"
        }
        if ($patternMatches.ContainsKey("stripe_api")) {
            $reasonParts += "Contains Stripe API calls"
        }
        if ($patternMatches.ContainsKey("server_auth")) {
            $reasonParts += "Performs server-side authentication"
        }
        if ($patternMatches.ContainsKey("http_server")) {
            $reasonParts += "Makes HTTP server calls"
        }
        if ($patternMatches.ContainsKey("file_system")) {
            $reasonParts += "Performs file system operations"
        }

        $reason = $reasonParts -join ", "
    }

    # Check file path indicators
    if (-not $shouldMove) {
        if ($FilePath -match "env/" -or $FilePath -match "middleware/" -or $FilePath -match "server\.ts") {
            $shouldMove = $true
            $reason = "File path indicates server-only code"
        }
        if ($FilePath -match "auth/" -and ($Content -match "createClient" -or $Content -match "serviceRole")) {
            $shouldMove = $true
            $reason = "Authentication with admin privileges"
        }
    }

    # Special checks for specific files
    if ($FilePath -match "cache\.ts$") {
        $shouldMove = $true
        $reason = "Server-side caching logic"
    }

    if ($FilePath -match "payments\.ts$") {
        $shouldMove = $true
        $reason = "Payment processing requires server-side security"
    }

    if ($FilePath -match "rate-limiting\.ts$") {
        $shouldMove = $true
        $reason = "Rate limiting should be server-side"
    }

    if ($FilePath -match "seo\.ts$" -and $Content -match "generateMeta|generateSitemap") {
        $shouldMove = $true
        $reason = "SEO generation typically server-side"
    }

    return @{
        ShouldMove = $shouldMove
        Reason = $reason
        PatternMatches = $patternMatches
    }
}

# Analyze each file
foreach ($relativePath in $filesToAnalyze) {
    $fullPath = Join-Path $LibPath $relativePath.Replace("/", "\")

    Write-Host "Analyzing: $relativePath" -ForegroundColor Yellow

    if (Test-Path $fullPath) {
        try {
            $content = Get-Content $fullPath -Raw -Encoding UTF8
            $analysis = Test-ServerOnlyCode -FilePath $relativePath -Content $content

            if ($analysis.ShouldMove) {
                # Determine target path
                $targetPath = "server/$relativePath"
                if ($relativePath -match "^server/") {
                    $targetPath = $relativePath
                }

                $result = @{
                    CurrentPath = $relativePath
                    TargetPath = $targetPath
                    Reason = $analysis.Reason
                    PatternMatches = $analysis.PatternMatches
                }

                $results += $result
                Write-Host "  → MOVE to $targetPath" -ForegroundColor Red
                Write-Host "    Reason: $($analysis.Reason)" -ForegroundColor Gray
            } else {
                Write-Host "  → STAYS in lib/" -ForegroundColor Green
            }
        } catch {
            Write-Host "  ERROR reading file: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "  File not found: $fullPath" -ForegroundColor Red
    }

    Write-Host ""
}

# Generate JSON output
$jsonOutput = $results | ConvertTo-Json -Depth 3

# Write to file
try {
    $jsonOutput | Out-File -FilePath $OutputFile -Encoding UTF8
    Write-Host "Results written to: $OutputFile" -ForegroundColor Green
} catch {
    Write-Host "ERROR writing output file: $($_.Exception.Message)" -ForegroundColor Red
}

# Summary
Write-Host ""
Write-Host "Analysis Summary" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan
Write-Host "Total files analyzed: $($filesToAnalyze.Count)"
Write-Host "Files to move to server/: $($results.Count)"
Write-Host "Files that can stay in lib/: $($filesToAnalyze.Count - $results.Count)"

if ($results.Count -gt 0) {
    Write-Host ""
    Write-Host "Files requiring server relocation:" -ForegroundColor Yellow
    foreach ($result in $results) {
        Write-Host "  $($result.CurrentPath) → $($result.TargetPath)" -ForegroundColor White
    }
}

# Generate detailed report
$reportPath = $OutputFile.Replace(".json", "-report.md")
$reportContent = @"
# Phase 4C Server Code Analysis Report

## Summary
**Total files analyzed**: $($filesToAnalyze.Count)
**Files to move to server/**: $($results.Count)
**Files that can stay in lib/**: $($filesToAnalyze.Count - $results.Count)

## Files Requiring Server Relocation

| Current Path | Target Path | Reason |
|--------------|-------------|--------|
"@

foreach ($result in $results) {
    $reportContent += "`n| $($result.CurrentPath) | $($result.TargetPath) | $($result.Reason) |"
}

$reportContent += @"

## Analysis Details

### Server-Only Patterns Detected:
- **Private environment variables**: `$env/static/private`, `$env/dynamic/private`, `PRIVATE_*` constants
- **Supabase admin client**: `createAdminClient`, `serviceRoleKey`
- **Direct database calls**: Database queries and RPC calls
- **Node.js APIs**: File system, path operations
- **Stripe API**: Server-side payment processing
- **Server authentication**: JWT verification, bcrypt
- **HTTP server calls**: Server-to-server communication
- **File system operations**: Upload/download operations

### Recommendations:
1. Move all identified files to `$lib/server/`
2. Update import statements in consuming files
3. Ensure server-only code is properly isolated
4. Add type guards where necessary for mixed client/server code
5. Review dependency injection patterns for better separation

Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
"@

try {
    $reportContent | Out-File -FilePath $reportPath -Encoding UTF8
    Write-Host "Detailed report written to: $reportPath" -ForegroundColor Green
} catch {
    Write-Host "ERROR writing report file: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Analysis complete!" -ForegroundColor Green