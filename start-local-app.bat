@echo off
cd /d "%~dp0"
echo Starting CORE Research Atlas at http://127.0.0.1:5177/
echo Leave this window open while you use the app.
echo Press Ctrl+C to stop the server.
start "" "http://127.0.0.1:5177/"
python .\server.py --host 127.0.0.1 --port 5177
pause
