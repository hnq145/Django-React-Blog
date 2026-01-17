@echo off
echo ===================================================
echo   FIXING ZOMBIE PYTHON PROCESSES AND RESTARTING
echo ===================================================

echo 1. Killing all running Python processes to clear memory...
taskkill /F /IM python.exe
timeout /t 2 /nobreak >nul

echo 2. Python processes terminated.

echo 3. Starting Django Server with NEW CODE...
echo    (Please wait for the server to start...)
echo.

python manage.py runserver

pause
