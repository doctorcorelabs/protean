@echo off
setlocal enabledelayedexpansion

REM AI Molecular Research Platform - Windows Deployment Script

echo 🚀 Starting deployment process...

REM Check if required tools are installed
echo [INFO] Checking dependencies...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js first.
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    exit /b 1
)

where wrangler >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] Wrangler CLI not found. Installing...
    npm install -g wrangler
)

echo [SUCCESS] All dependencies are available

REM Install dependencies
echo [INFO] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)
echo [SUCCESS] Dependencies installed successfully

REM Build the project
echo [INFO] Building the project...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed
    exit /b 1
)
echo [SUCCESS] Project built successfully

REM Deploy to Cloudflare Workers
echo [INFO] Deploying Cloudflare Worker...
wrangler whoami >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] Please login to Cloudflare first:
    wrangler login
)

wrangler deploy
if %errorlevel% neq 0 (
    echo [ERROR] Worker deployment failed
    exit /b 1
)
echo [SUCCESS] Cloudflare Worker deployed successfully

REM Deploy to Netlify
echo [INFO] Deploying to Netlify...
where netlify >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] Netlify CLI not found. Installing...
    npm install -g netlify-cli
)

netlify deploy --prod --dir=dist
if %errorlevel% neq 0 (
    echo [ERROR] Netlify deployment failed
    exit /b 1
)
echo [SUCCESS] Netlify deployment successful

echo [SUCCESS] 🎉 Deployment completed successfully!
echo.
echo Next steps:
echo 1. Update your domain settings in Netlify dashboard
echo 2. Configure environment variables
echo 3. Test all functionality
echo 4. Share your platform with researchers!


