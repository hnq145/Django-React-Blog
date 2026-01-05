@echo off
venv\Scripts\python manage.py check > debug.log 2>&1
echo DONE >> debug.log
