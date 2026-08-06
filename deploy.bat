@echo off
REM ============================================================
REM Smart QR Menu - GitHub Pages deploy script
REM Bypasses the gh-pages npm package (same workaround used in
REM Al-Amal / Al-Daleel Al-Shamil) by pushing dist/ straight to
REM the gh-pages branch with a worktree.
REM ============================================================

echo [1/5] Building the project...
call npm run build
if errorlevel 1 (
  echo Build failed. Aborting deploy.
  exit /b 1
)

echo [2/5] Adding SPA fallback (404.html) for React Router...
copy /Y dist\index.html dist\404.html

echo [3/5] Preparing gh-pages worktree...
git worktree remove gh-pages-temp --force 2>nul
git branch -D gh-pages 2>nul
git worktree add -B gh-pages gh-pages-temp

echo [4/5] Copying build output...
del /Q gh-pages-temp\* 2>nul
for /d %%D in (gh-pages-temp\*) do rd /s /q "%%D"
xcopy /E /Y dist\* gh-pages-temp\

echo [5/5] Committing and pushing gh-pages branch...
cd gh-pages-temp
git add -A
git commit -m "Deploy: %date% %time%"
git push origin gh-pages --force
cd ..
git worktree remove gh-pages-temp --force

echo.
echo Done. Check GitHub repo Settings > Pages: source = gh-pages branch, folder = / (root).
