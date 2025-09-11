param(
  [int]$Port = 5173
)

Write-Host "Scanning for listeners on port $Port..."

try {
  $conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
} catch {
  $conns = $null
}

if ($conns) {
  $pids = $conns | Select-Object -ExpandProperty OwningProcess | Sort-Object -Unique
  foreach ($pid in $pids) {
    try {
      $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
      if ($proc) {
        Write-Host "Killing PID $pid ($($proc.ProcessName)) listening on port $Port..."
      } else {
        Write-Host "Killing PID $pid listening on port $Port..."
      }
      Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    } catch {
      Write-Warning "Failed to kill PID $pid: $_"
    }
  }
  Write-Host "Done."
  exit 0
}

# Fallback to netstat parsing if Get-NetTCPConnection fails
Write-Host "Get-NetTCPConnection returned no listeners. Trying netstat..."
$lines = & cmd /c "netstat -ano | findstr :$Port | findstr LISTENING" 2>$null
if (-not $lines) {
  Write-Host "No process is listening on port $Port."
  exit 0
}

foreach ($line in $lines) {
  $parts = $line -split "\s+" | Where-Object { $_ -ne '' }
  $pid = $parts[-1]
  try {
    Write-Host "Killing PID $pid listening on port $Port..."
    & taskkill /PID $pid /F | Out-Null
  } catch {
    Write-Warning "Failed to kill PID $pid: $_"
  }
}
Write-Host "Done."

