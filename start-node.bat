@echo off
title Wordie Budie v2.0.0 - Node.js Launcher
color 0B
echo.
echo  🎯 Wordie Budie v2.0.0 - Enhanced French Learning Game
echo  ═══════════════════════════════════════════════════════
echo.
echo  ✨ New Features Included:
echo  • ⏱️  Adjustable timer (10s, 20s, 30s, off)
echo  • 🔊 TTS pronunciation replay button
echo  • 🎲 Random question modes (A1, A2, Mixed)
echo  • ⏭️  Manual "Next Question" control
echo  • 🎨 Beautiful hand-drawn doodle design
echo  • 📱 Mobile-friendly PWA support
echo.

cd /d "%~dp0"

echo  🔍 Checking for Node.js...
where node >nul 2>nul
if %errorlevel% == 0 (
    echo  ✓ Node.js found! Starting server...
    echo.
    start http://localhost:8000
    echo  ✅ Wordie Budie v2.0.0 is now running!
    echo  🌐 Browser should open automatically with latest version
    echo  🔒 Close this window to stop the server
    echo.
    npx http-server -p 8000 --cache=-1
    pause
) else (
    echo  ❌ Node.js not found!
    echo.
    echo  Please install Node.js from: https://nodejs.org
    echo  Then try running this launcher again!
    echo.
    pause
)