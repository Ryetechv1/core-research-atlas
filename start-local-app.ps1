$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

$url = "http://127.0.0.1:5177/"
$healthUrl = "http://127.0.0.1:5177/api/health"

try {
  $health = Invoke-WebRequest -UseBasicParsing $healthUrl -TimeoutSec 2
  if ($health.StatusCode -eq 200) {
    Write-Host "CORE Research Atlas is already running at $url"
    Start-Process $url
    exit 0
  }
} catch {
  # Not running yet.
}

Write-Host "Starting CORE Research Atlas at $url"
Write-Host "Leave this PowerShell window open while you use the app."
Write-Host "Press Ctrl+C in this window to stop the server."

Start-Job -ScriptBlock {
  Start-Sleep -Seconds 2
  Start-Process "http://127.0.0.1:5177/"
} | Out-Null

python .\server.py --host 127.0.0.1 --port 5177
