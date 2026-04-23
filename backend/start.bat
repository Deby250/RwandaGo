@echo off
echo Starting RwandaGo Backend...
start cmd /k "cd rwandago-backend && npm run dev"

timeout /t 3

echo Opening frontend...
start index.html

echo RwandaGo is running!
echo Backend: http://localhost:5000