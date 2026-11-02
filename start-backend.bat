@echo off
cd /d D:\waterqualityanalysis\server
echo Starting Django Server on port 8000...
python manage.py runserver 8000
pause
