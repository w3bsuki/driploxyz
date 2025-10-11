# Phase 4D: Fix Package Imports Script
# Compatible with PowerShell 5.1

Write-Host "=== STEP 2: FIXING PACKAGE IMPORTS ==="

# Fix 1: ProductService should come from @repo/domain/products
Write-Host "`n1. Fixing ProductService imports..."
$files = Get-ChildItem -Path "apps\web\src" -Recurse -Include *.svelte,*.ts | Where-Object { $_.FullName -notlike "*node_modules*" }

$productServiceFixed = 0
foreach ($file in $files) {
    $content = Get-Content $file.FullName | Out-String
    if ($content -match "@repo/core/services/products") {
        $content = $content -replace "@repo/core/services/products", "@repo/domain/products"
        $content | Set-Content -Path $file.FullName -NoNewline
        $productServiceFixed++
        Write-Host "  Fixed $($file.Name)"
    }
}
Write-Host "  Total files fixed: $productServiceFixed"

# Fix 2: ConversationService - check if it exists
Write-Host "`n2. Checking ConversationService location..."
$conversationFiles = Get-ChildItem -Path "packages" -Recurse -Filter "*Conversation*" -Include *.ts | Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*.d.ts" }

if ($conversationFiles.Count -gt 0) {
    Write-Host "  Found ConversationService at:"
    $conversationFiles | ForEach-Object { Write-Host "    $($_.FullName)" }
    
    # Determine correct import path
    $conversationPath = $conversationFiles[0].FullName
    if ($conversationPath -like "*packages\domain*") {
        $correctImport = "@repo/domain/conversations"
        Write-Host "  Correct import: $correctImport"
        
        # Fix imports
        $conversationFixed = 0
        foreach ($file in $files) {
            $content = Get-Content $file.FullName | Out-String
            if ($content -match "@repo/core/services/ConversationService") {
                $content = $content -replace "@repo/core/services/ConversationService", $correctImport
                $content | Set-Content -Path $file.FullName -NoNewline
                $conversationFixed++
                Write-Host "  Fixed $($file.Name)"
            }
        }
        Write-Host "  Total conversation imports fixed: $conversationFixed"
    }
} else {
    Write-Host "  ⚠️ ConversationService not found - may need to create or remove imports"
}

Write-Host "`n✅ Package imports fixed"
