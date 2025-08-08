# Kill YApi Process Script
Write-Host "Looking for and killing YApi processes..." -ForegroundColor Green

# Find processes using port 3000
$processes = netstat -ano | Select-String ":3000" | ForEach-Object {
    $parts = $_ -split '\s+'
    $parts[-1]  # Get process ID
}

if ($processes) {
    foreach ($pid in $processes) {
        Write-Host "Found process ID: $pid" -ForegroundColor Yellow
        try {
            $process = Get-Process -Id $pid -ErrorAction Stop
            Write-Host "Killing process: $($process.ProcessName) (PID: $pid)" -ForegroundColor Cyan
            Stop-Process -Id $pid -Force -ErrorAction Stop
            Write-Host "Successfully killed process $pid" -ForegroundColor Green
        }
        catch {
            Write-Host "Cannot kill process $pid`: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "Please try running this script as Administrator" -ForegroundColor Red
        }
    }
} else {
    Write-Host "No process found using port 3000" -ForegroundColor Yellow
}

Write-Host "Done!" -ForegroundColor Green 