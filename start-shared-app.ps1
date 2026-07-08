$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

$port = 5177
$localUrl = "http://127.0.0.1:$port/"
$addresses = Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.IPAddress -notlike "127.*" -and $_.PrefixOrigin -ne "WellKnown" } |
  Select-Object -ExpandProperty IPAddress

Write-Host "Starting CORE Research Atlas shared backend on port $port"
Write-Host "Leave this PowerShell window open while the team uses the app."
Write-Host ""
Write-Host "Local app URL: $localUrl"
foreach ($address in $addresses) {
  Write-Host "Same-network URL: http://$address`:$port/"
  Write-Host "Team Sync Server URL: http://$address`:$port"
}
Write-Host ""
Write-Host "Put the same Team Sync Server URL into the Team tab on all 3 devices."
Write-Host "Press Ctrl+C in this window to stop the server."

Start-Job -ScriptBlock {
  Start-Sleep -Seconds 2
  Start-Process "http://127.0.0.1:5177/"
} | Out-Null

python .\server.py --host 0.0.0.0 --port $port
