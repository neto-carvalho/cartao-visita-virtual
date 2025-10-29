@echo off
echo ========================================
echo   Parando Backend do VisitaVirtual
echo ========================================
echo.

cd backend

echo Parando servidor backend...
call pm2 stop backend-api

echo.
echo ========================================
echo   Backend parado!
echo ========================================
echo.
pause


