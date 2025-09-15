@echo off
title Wordie Budie v2.0.0 - Fresh Launcher
color 0E
cls

echo.
echo  ╔═══════════════════════════════════════════════════════════════╗
echo  ║                🚀 Launch Wordie Budie v2.0.0                  ║
echo  ║              Fresh Cache-Free Experience                      ║
echo  ╚═══════════════════════════════════════════════════════════════╝
echo.
echo  ⚡ ENHANCED FEATURES READY:
echo  • ⏱️  Adjustable timer settings
echo  • 🔊 TTS pronunciation replay
echo  • 🎲 Random question modes
echo  • ⏭️  Manual navigation controls
echo  • 🎨 Beautiful doodle design
echo  • 📱 PWA mobile support
echo.

cd /d "%~dp0"

echo  🔍 Checking for Node.js...
where node >nul 2>nul
if %errorlevel% == 0 (
    echo  ✓ Node.js detected! Preparing fresh launch...
    echo.

    REM Generate random cache-busting parameter
    set /a CACHE_BUSTER=%RANDOM% * %RANDOM%

    echo  🧹 Using cache-buster: %CACHE_BUSTER%
    echo  🌐 Opening fresh browser session...

    REM Start server on different port with no caching
    start /min npx http-server -p 8001 --cache=-1 --cors

    REM Wait 2 seconds for server to start
    timeout /t 2 >nul

    REM Open browser with cache-busting URL and incognito mode
    start "" "http://localhost:8001/?v=%CACHE_BUSTER%&fresh=true"

    echo  ✅ Wordie Budie v2.0.0 launched successfully!
    echo  🎯 Fresh version loaded automatically - no refresh needed!
    echo  🔒 Close this window to stop the server
    echo.
    echo  Press any key to stop the server...
    pause >nul

    REM Kill the server process
    taskkill /f /im node.exe >nul 2>nul
    echo  Server stopped.

) else (
    echo  ❌ Node.js not found!
    echo.
    echo  📥 Please install Node.js from: https://nodejs.org
    echo  Then run this launcher again.
    echo.
    pause
)