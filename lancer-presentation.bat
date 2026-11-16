@echo off
setlocal EnableExtensions
chcp 65001 >nul
title Présentation EST Salé - ne pas fermer pendant la présentation

rem ==================================================================
rem  Lancement de la présentation (à chaque fois)
rem  1. Récupère la dernière version (si Internet est disponible)
rem  2. Prépare la présentation (build)
rem  3. L'ouvre dans le navigateur
rem ==================================================================

if not defined PRESENTATION_DIR set "PRESENTATION_DIR=%USERPROFILE%\Aya-Hassna-Presentation"
if not defined PRESENTATION_PORT set "PRESENTATION_PORT=4173"
set "PATH=%ProgramFiles%\nodejs;%ProgramFiles%\Git\cmd;%PATH%"
set "URL=http://localhost:%PRESENTATION_PORT%"

if not exist "%PRESENTATION_DIR%\package.json" (
  echo.
  echo  La présentation n'est pas installée sur cet ordinateur.
  echo  Lancez d'abord "installer-presentation".
  echo.
  if not defined NO_PROMPT pause
  exit /b 1
)
cd /d "%PRESENTATION_DIR%"

echo.
echo  ============================================================
echo    Présentation : Le changement, l'innovation et l'apprentissage
echo  ============================================================
echo.

rem ---------------------------------------------------------------- Mise à jour
echo  [1/3] Recherche d'une nouvelle version...
git pull --ff-only >nul 2>nul
if errorlevel 1 (
  echo        Pas de mise à jour ^(hors ligne ?^) : on garde la version actuelle.
) else (
  echo        OK, version à jour.
)
call npm install --no-audit --no-fund --prefer-offline >nul 2>nul
if errorlevel 1 if not exist "node_modules" (
  echo.
  echo  [ERREUR] Les composants ne sont pas installés. Connectez-vous à Internet
  echo           et relancez "installer-presentation".
  if not defined NO_PROMPT pause
  exit /b 1
)

rem ---------------------------------------------------------------- Build
echo  [2/3] Préparation de la présentation...
call npm run build >nul 2>"%TEMP%\presentation-build.log"
if errorlevel 1 (
  echo.
  echo  [ERREUR] La préparation a échoué :
  type "%TEMP%\presentation-build.log"
  if not defined NO_PROMPT pause
  exit /b 1
)
echo        OK

rem ---------------------------------------------------------------- Ouverture
echo  [3/3] Ouverture de la présentation : %URL%
echo.
echo  ------------------------------------------------------------
echo   - Laissez cette fenêtre OUVERTE pendant la présentation.
echo   - Dans le navigateur : F = plein écran, flèches = naviguer,
echo     H = aide. Utilisez Google Chrome ou Microsoft Edge.
echo   - Pour arrêter : fermez cette fenêtre.
echo  ------------------------------------------------------------
echo.
if not defined NO_BROWSER (
  start "" /b powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 3; Start-Process '%URL%'"
)
call npm run preview -- --port %PRESENTATION_PORT% --strictPort
if errorlevel 1 (
  echo.
  echo  La présentation est peut-être déjà ouverte dans une autre fenêtre.
  echo  Ouvrez simplement %URL% dans le navigateur.
  if not defined NO_PROMPT pause
)
endlocal
