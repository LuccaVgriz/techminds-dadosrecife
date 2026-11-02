@echo off
chcp 65001 >nul
title DadosRecife - Servidor
cd /d "%~dp0"

rem Usa o Node que vem junto na pasta "node"; se nao existir, usa o Node instalado
set "NODE_EXE=node"
if exist "%~dp0node\node.exe" set "NODE_EXE=%~dp0node\node.exe"

"%NODE_EXE%" --version >nul 2>&1
if errorlevel 1 (
  echo.
  echo  Node.js nao encontrado.
  echo  Coloque o node.exe na pasta "node" ou instale o Node.js: https://nodejs.org
  echo.
  pause
  exit /b 1
)

echo.
echo  ==============================================
echo    DadosRecife - Tech Minds
echo    O navegador vai abrir sozinho.
echo    NAO feche esta janela durante a apresentacao.
echo  ==============================================
echo.

set ABRIR_NAVEGADOR=1
"%NODE_EXE%" backend\server.js

echo.
echo  O servidor foi encerrado.
pause
