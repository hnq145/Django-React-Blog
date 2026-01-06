import subprocess
import os
import sys

python_exe = r"venv\Scripts\python.exe"
if not os.path.exists(python_exe):
    python_exe = sys.executable

print(f"Using python: {python_exe}")
cmd = [python_exe, 'manage.py', 'runserver', '0.0.0.0:8002']
print(f"Running: {cmd}")

process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)

# Read output line by line
try:
    for line in process.stdout:
        print(line, end='')
except KeyboardInterrupt:
    process.terminate()
