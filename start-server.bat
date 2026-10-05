@echo off
setlocal
title AI LMS Studio Portal Server - Port 3005
echo ===================================================================
echo   AI LMS Studio - Enterprise Portal Landing Page (Port 3005)
echo ===================================================================
echo.
echo Launching server on http://localhost:3005 ...
echo.

where npx >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [Node.js Environment Detected]
    echo Starting server on http://localhost:3005 ...
    start http://localhost:3005
    call npx -y serve "%~dp0." -l 3005
    goto end
)

where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [Python Environment Detected]
    echo Starting server on http://localhost:3005 ...
    start http://localhost:3005
    python -m http.server 3005 --directory "%~dp0."
    goto end
)

where py >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [Python Launcher Detected]
    echo Starting server on http://localhost:3005 ...
    start http://localhost:3005
    py -m http.server 3005 --directory "%~dp0."
    goto end
)

echo [Local Browser Direct Mode]
echo Opening landing page directly in browser:
start "" "%~dp0index.html"

:end
pause
