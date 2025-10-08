# Development Helper Script
# This script helps start the development environment

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AI Molecular Research Platform - Dev Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found!" -ForegroundColor Yellow
    Write-Host "Creating .env from env.example..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
    Write-Host "✅ .env created. Please configure VITE_API_URL if needed." -ForegroundColor Green
    Write-Host ""
}

# Check current API URL
$envContent = Get-Content ".env" -Raw
if ($envContent -match "VITE_API_URL=(.*)") {
    $apiUrl = $matches[1].Trim()
    Write-Host "📡 Current API URL: $apiUrl" -ForegroundColor Blue
    Write-Host ""
}

# Ask user which mode to run
Write-Host "Choose development mode:" -ForegroundColor Yellow
Write-Host "1. Frontend Only (uses deployed Cloudflare Worker)" -ForegroundColor White
Write-Host "2. Full Stack (starts local Cloudflare Worker + Frontend)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter choice (1 or 2)"

if ($choice -eq "2") {
    Write-Host ""
    Write-Host "🚀 Starting Full Stack Development..." -ForegroundColor Green
    Write-Host ""
    Write-Host "Note: Make sure to update .env to use http://localhost:8787" -ForegroundColor Yellow
    Write-Host ""
    
    # Start worker in background
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run worker:dev"
    Start-Sleep -Seconds 3
    
    # Start frontend
    Write-Host "Starting frontend..." -ForegroundColor Green
    npm run dev
} else {
    Write-Host ""
    Write-Host "🚀 Starting Frontend Only..." -ForegroundColor Green
    Write-Host ""
    Write-Host "Using deployed worker: $apiUrl" -ForegroundColor Blue
    Write-Host ""
    npm run dev
}
