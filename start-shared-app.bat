@echo off
cd /d "%~dp0"
echo Starting CORE Research Atlas shared backend at http://0.0.0.0:5177/
echo.
echo Same-network users should open http://YOUR-COMPUTER-IP:5177/
echo Or paste http://YOUR-COMPUTER-IP:5177 into the Team Sync Server URL field.
echo.
echo To find your IP address, run: ipconfig
echo Leave this window open while the team uses the app.
echo Press Ctrl+C to stop the server.
start "" "http://127.0.0.1:5177/"
python .\server.py --host 0.0.0.0 --port 5177
pause
