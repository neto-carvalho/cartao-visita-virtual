@echo off
echo Testando login...
powershell -Command "Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method Post -ContentType 'application/json' -Body '{\"email\":\"teste@teste.com\",\"password\":\"senha123\"}'"
pause


