@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul
title Installation - Présentation EST Salé

rem ==================================================================
rem  Installation de la présentation (à lancer UNE seule fois)
rem  1. Installe Git et Node.js si nécessaire (via winget)
rem  2. Télécharge la présentation depuis GitHub
rem  3. Installe les dépendances et prépare la présentation
rem  4. Place le fichier "lancer-presentation" sur le Bureau
rem ==================================================================

set "REPO=https://github.com/aminehalal/Aya-Hassna-Presentation.git"
if not defined PRESENTATION_DIR set "PRESENTATION_DIR=%USERPROFILE%\Aya-Hassna-Presentation"
set "PATH=%ProgramFiles%\nodejs;%ProgramFiles%\Git\cmd;%PATH%"

echo.
echo  ============================================================
echo    Installation de la présentation
echo    Le changement, l'innovation et l'apprentissage
echo  ============================================================
echo.
echo  Dossier d'installation : %PRESENTATION_DIR%
echo  Gardez cette fenêtre ouverte jusqu'à la fin (5 à 10 minutes).
echo  Si Windows demande une autorisation, cliquez sur "Oui".
echo.

rem ---------------------------------------------------------------- winget
where winget >nul 2>nul
if errorlevel 1 (
  where git >nul 2>nul
  if errorlevel 1 goto :no_winget
  where node >nul 2>nul
  if errorlevel 1 goto :no_winget
)

rem ---------------------------------------------------------------- Git
echo  [1/5] Git...
where git >nul 2>nul
if errorlevel 1 (
  echo        Installation de Git en cours...
  winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements
  set "PATH=%ProgramFiles%\Git\cmd;!PATH!"
)
where git >nul 2>nul
if errorlevel 1 (
  echo.
  echo  [ERREUR] Git n'a pas pu être installé.
  echo           Installez-le à la main : https://git-scm.com/download/win
  goto :fail
)
echo        OK

rem ---------------------------------------------------------------- Node.js (version 20 ou plus)
echo  [2/5] Node.js...
call :node_ok
if "!NODE_OK!"=="0" (
  echo        Installation de Node.js LTS en cours...
  winget install --id OpenJS.NodeJS.LTS -e --source winget --accept-package-agreements --accept-source-agreements
  set "PATH=%ProgramFiles%\nodejs;!PATH!"
  call :node_ok
)
if "!NODE_OK!"=="0" (
  echo.
  echo  [ERREUR] Node.js 20 ou plus est nécessaire.
  echo           Installez la version LTS à la main : https://nodejs.org
  echo           puis relancez ce fichier.
  goto :fail
)
echo        OK

rem ---------------------------------------------------------------- Téléchargement
echo  [3/5] Téléchargement de la présentation...
if exist "%PRESENTATION_DIR%\.git" (
  pushd "%PRESENTATION_DIR%"
  git pull --ff-only
  popd
) else (
  git clone "%REPO%" "%PRESENTATION_DIR%"
  if errorlevel 1 (
    echo.
    echo  [ERREUR] Téléchargement impossible. Vérifiez la connexion Internet.
    goto :fail
  )
)
echo        OK

rem ---------------------------------------------------------------- Dépendances + build
cd /d "%PRESENTATION_DIR%"
echo  [4/5] Installation des composants (quelques minutes)...
call npm ci --no-audit --no-fund
if errorlevel 1 (
  echo.
  echo  [ERREUR] L'installation des composants a échoué. Vérifiez Internet et relancez.
  goto :fail
)
echo  [5/5] Préparation de la présentation...
call npm run build
if errorlevel 1 (
  echo.
  echo  [ERREUR] La préparation a échoué.
  goto :fail
)

rem ---------------------------------------------------------------- Raccourci sur le Bureau
if not defined NO_SHORTCUT (
  for /f "usebackq delims=" %%d in (`powershell -NoProfile -Command "[Environment]::GetFolderPath('Desktop')"`) do set "DESKTOP=%%d"
  if defined DESKTOP (
    copy /y "%PRESENTATION_DIR%\lancer-presentation.bat" "!DESKTOP!\lancer-presentation.bat" >nul
    echo.
    echo  Le fichier "lancer-presentation" a été placé sur votre Bureau.
  )
)

echo.
echo  ============================================================
echo    Installation terminée.
echo    Pour voir la présentation : double-cliquez sur
echo    "lancer-presentation" (sur le Bureau).
echo  ============================================================
echo.
if defined NO_PROMPT goto :end
choice /c ON /n /m "  Lancer la présentation maintenant ? (O = oui, N = non) "
if errorlevel 2 goto :end
call "%PRESENTATION_DIR%\lancer-presentation.bat"
goto :end

rem ================================================================== helpers
:node_ok
set "NODE_OK=0"
where node >nul 2>nul
if errorlevel 1 exit /b 0
set "NODE_MAJOR="
for /f "tokens=1 delims=." %%v in ('node -v') do set "NODE_MAJOR=%%v"
set "NODE_MAJOR=!NODE_MAJOR:v=!"
if defined NODE_MAJOR if !NODE_MAJOR! GEQ 20 set "NODE_OK=1"
exit /b 0

:no_winget
echo.
echo  [ERREUR] L'outil "winget" de Windows est introuvable.
echo           1. Installez "App Installer" depuis le Microsoft Store
echo              (ou installez Git : https://git-scm.com/download/win
echo               et Node.js LTS : https://nodejs.org)
echo           2. Relancez ce fichier.
goto :fail

:fail
echo.
echo  L'installation n'est pas terminée. Faites une capture d'écran de
echo  cette fenêtre pour demander de l'aide, puis relancez ce fichier.
echo.
if not defined NO_PROMPT pause
exit /b 1

:end
endlocal
exit /b 0
