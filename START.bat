@echo off
title TalkBridge Dev Server
cd /d "%~dp0"
echo.
echo  ╔══════════════════════════════════╗
echo  ║   TalkBridge - Starting Server   ║
echo  ╚══════════════════════════════════╝
echo.
echo  Directory: %CD%
echo  Running: npm run dev
echo.
npm run dev
pause
