@echo off
title BSNL Status Hub - Full Stack

echo.
echo  ╔═══════════════════════════════════════════════╗
echo  ║       BSNL Status Hub - Full Stack Dev        ║
echo  ║                                               ║
echo  ║   Frontend : http://localhost:5173             ║
echo  ║   Backend  : http://localhost:4000             ║
echo  ╚═══════════════════════════════════════════════╝
echo.

:: Start backend in a new window
echo [*] Starting Backend...
start "BSNL Backend" cmd /k "cd /d %~dp0backend && npm run dev"

:: Small delay to let backend boot first
timeout /t 3 /nobreak >nul

:: Start frontend in a new window
echo [*] Starting Frontend...
start "BSNL Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo [✓] Both servers launched in separate windows.
echo     Close this window or press any key to exit.
echo.
pause >nul
