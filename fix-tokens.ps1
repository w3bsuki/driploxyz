$file = "k:\driplo-turbo-1\packages\ui\src\lib\compositions\product\FilterDrawer.svelte"
$content = Get-Content -Path $file -Raw

# Fix all token references
$content = $content -replace '([a-z-]+)-\(--([a-z-]+(?:-[a-z-]+)*)\)', '$1-[var(--$2)]'

Set-Content -Path $file -Value $content -NoNewline
Write-Host "Fixed token syntax in FilterDrawer.svelte"
