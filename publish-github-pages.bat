@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM ============================================================
REM PYROLYSIS GitHub Pages Publisher
REM
REM Current setup detected on this PC:
REM - Site folder: E:\PYROLYSIS
REM - GitHub repo folder: C:\Users\Lavyansh\Documents\GitHub\PYROLYSIS
REM - Git executable: GitHub Desktop bundled Git
REM ============================================================

set "SITE_DIR=E:\PYROLYSIS"
set "REPO_DIR=C:\Users\Lavyansh\Documents\GitHub\PYROLYSIS"
set "BRANCH=main"
set "GIT_EXE=C:\Users\Lavyansh\AppData\Local\GitHubDesktop\app-3.5.7\resources\app\git\cmd\git.exe"

echo.
echo ==========================================
echo   PYROLYSIS GitHub Pages Publisher
echo ==========================================
echo.
echo Site folder : %SITE_DIR%
echo Repo folder : %REPO_DIR%
echo Branch      : %BRANCH%
echo Git         : %GIT_EXE%
echo.

if not exist "%SITE_DIR%" (
  echo ERROR: Site folder not found.
  pause
  exit /b 1
)

if not exist "%GIT_EXE%" (
  echo ERROR: Git executable not found.
  echo Update the GIT_EXE path in this file if GitHub Desktop moved.
  pause
  exit /b 1
)

if not exist "%REPO_DIR%" (
  echo Repo folder does not exist yet. Creating it...
  mkdir "%REPO_DIR%"
)

echo Syncing website files into the GitHub folder...
robocopy "%SITE_DIR%" "%REPO_DIR%" /E /XD ".git" >nul
if errorlevel 8 (
  echo ERROR: File sync failed.
  pause
  exit /b 1
)

pushd "%REPO_DIR%"

"%GIT_EXE%" rev-parse --is-inside-work-tree >nul 2>nul
if errorlevel 1 (
  echo Initializing Git repository...
  "%GIT_EXE%" init
  if errorlevel 1 (
    echo ERROR: git init failed.
    popd
    pause
    exit /b 1
  )
)

"%GIT_EXE%" branch -M %BRANCH% >nul 2>nul
"%GIT_EXE%" add .

for /f %%I in ('powershell -NoProfile -Command "Get-Date -Format \"yyyy-MM-dd HH:mm:ss\""') do set "STAMP=%%I"
set "COMMIT_MSG=Update pyrolysis site %STAMP%"

"%GIT_EXE%" commit -m "%COMMIT_MSG%" >nul 2>nul
if errorlevel 1 (
  echo No new commit created. This usually means there were no file changes.
) else (
  echo Commit created: %COMMIT_MSG%
)

set "REMOTE_URL="
for /f "delims=" %%R in ('"%GIT_EXE%" remote get-url origin 2^>nul') do set "REMOTE_URL=%%R"

if not defined REMOTE_URL (
  echo.
  echo No remote named origin is configured yet.
  echo.
  echo Next one-time step:
  echo 1. Create or connect the GitHub repository in GitHub Desktop or GitHub.
  echo 2. Set the origin remote for this folder.
  echo 3. Run this file again.
  echo.
  echo Helpful command once you have your repo URL:
  echo "%GIT_EXE%" remote add origin https://github.com/YOUR-USERNAME/PYROLYSIS.git
  echo.
  echo Then enable GitHub Pages from the %BRANCH% branch root in repo settings.
  popd
  pause
  exit /b 0
)

echo Pushing to origin %BRANCH%...
"%GIT_EXE%" push -u origin %BRANCH%
if errorlevel 1 (
  echo.
  echo Push failed.
  echo Check your GitHub sign-in and repo permissions, then run this again.
  popd
  pause
  exit /b 1
)

popd

echo.
echo Success. Your latest website version has been pushed.
echo If GitHub Pages is enabled on the %BRANCH% branch root, it should deploy automatically.
echo.
pause
