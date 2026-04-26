@echo off
cd /d "%~dp0"
echo Instalando dependencias...
npm install
if errorlevel 1 pause && exit /b 1
echo Iniciando projeto...
npm run dev
pause
