# Fix Phase 4C Import Errors
# Run this to fix all the broken imports Claude's restructure revealed

cd K:\driplo-turbo-1

Write-Host "Fixing broken imports from Phase 4C..."

# Fix 1: Change @repo/core/services/products to @repo/domain/products
Write-Host "`n1. Fixing ProductService imports..."
$files = Get-ChildItem -Path "apps\web\src" -Recurse -Include *.svelte,*.ts | Where-Object { $_.FullName -notlike "*node_modules*" }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -and ($content -match "@repo/core/services/products")) {
        $content = $content -replace "@repo/core/services/products", "@repo/domain/products"
        $content | Out-File -FilePath $file.FullName -Encoding UTF8 -NoNewline
        Write-Host "  Fixed $($file.Name)"
    }
}

# Fix 2: Change @repo/core/services/ConversationService to correct path
Write-Host "`n2. Checking ConversationService location..."
$conversationService = Get-ChildItem -Path "packages" -Recurse -Filter "*Conversation*" -Include *.ts | Where-Object { $_.FullName -notlike "*node_modules*" }

if ($conversationService) {
    Write-Host "  Found ConversationService at: $($conversationService.FullName)"
    Write-Host "  Update ModularMessages.svelte import manually based on actual location"
} else {
    Write-Host "  ConversationService not found - may need to be created or import removed"
}

# Fix 3: Check what actually got moved by Claude
Write-Host "`n3. Verifying route structure..."
$appShop = Test-Path "apps\web\src\routes\(app)\(shop)"
$appAccount = Test-Path "apps\web\src\routes\(app)\(account)"
$marketing = Test-Path "apps\web\src\routes\(marketing)"

Write-Host "  (app)/(shop): $(if ($appShop) { 'EXISTS' } else { 'MISSING' })"
Write-Host "  (app)/(account): $(if ($appAccount) { 'EXISTS' } else { 'MISSING' })"
Write-Host "  (marketing): $(if ($marketing) { 'EXISTS' } else { 'MISSING' })"

# Fix 4: Check for duplicate Header.svelte files
Write-Host "`n4. Checking for duplicate files..."
$headers = Get-ChildItem -Path "apps\web\src" -Recurse -Filter "Header.svelte" | Where-Object { $_.FullName -notlike "*node_modules*" }

if ($headers.Count -gt 1) {
    Write-Host "  Multiple Header.svelte files found:"
    foreach ($header in $headers) {
        Write-Host "    - $($header.FullName.Replace('K:\driplo-turbo-1\', ''))"
    }
    Write-Host "  May need to remove duplicates or fix imports"
} else {
    Write-Host "  Single Header.svelte found"
}

# Fix 5: Run TypeScript check to see remaining errors
Write-Host "`n5. Running TypeScript check..."
cd apps\web
$errors = pnpm run check 2>&1 | Select-String "error" | Select-Object -First 20
$errors | ForEach-Object { Write-Host $_ }

Write-Host "`nImport fix script complete!"
