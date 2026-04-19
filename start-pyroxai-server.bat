@echo off
setlocal

if "%GROQ_API_KEY%"=="" (
  for /f "delims=" %%K in ('powershell -NoProfile -Command "[Environment]::GetEnvironmentVariable('GROQ_API_KEY','User')"') do set "GROQ_API_KEY=%%K"
)

if "%GROQ_API_KEY%"=="" (
  echo GROQ_API_KEY was not found.
  echo Set it once with:
  echo setx GROQ_API_KEY "your_key_here"
  pause
  exit /b 1
)

echo Starting PyroXai local server on http://localhost:8080
powershell -ExecutionPolicy Bypass -File "%~dp0serve-local.ps1" -Port 8080
