@echo off
echo ========================================
echo   Iniciando Backend do VisitaVirtual
echo ========================================
echo.

cd backend

echo Verificando dependencias...
call npm install

echo.
echo Instalando PM2 globalmente (se necessario)...
call npm install -g pm2

echo.
echo Verificando se o backend ja esta rodando...
call pm2 describe backend-api >nul 2>&1
if %errorlevel% equ 0 (
    echo Backend ja esta rodando. Reiniciando...
    call pm2 restart backend-api
) else (
    echo Iniciando servidor backend na porta 5000 com PM2...
    call pm2 start ecosystem.config.js
    call pm2 save
)

echo.
echo ========================================
echo   Backend rodando com PM2!
echo ========================================
echo.
echo Comandos uteis:
echo   pm2 logs backend-api      - Ver logs
echo   pm2 status                - Ver status
echo   pm2 restart backend-api   - Reiniciar
echo   pm2 stop backend-api      - Parar
echo.
echo Pressione qualquer tecla para ver os logs...
pause >nul

echo.
echo Mostrando logs do backend (Ctrl+C para sair)...
call pm2 logs backend-api
