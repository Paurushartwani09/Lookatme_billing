@echo off
echo.
echo ========================================
echo Look @ me - Billing System
echo ========================================
echo.
echo Starting backend server...
echo.
start cmd /k "node server.js"
echo.
echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak
echo.
echo Starting frontend...
echo.
start cmd /k "npm run dev"
echo.
echo ========================================
echo System is starting!
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Default Login:
echo Username: admin
echo Password: admin123
echo ========================================
echo.
pause
