
import subprocess
import sys
import time
import os

def run_server():
    print("Starting server on port 8001...")
    # Use the specific python from venv if possible, or sys.executable
    python_exe = r"c:\Users\admin\Django React Blog\backend\venv\Scripts\python.exe"
    if not os.path.exists(python_exe):
        python_exe = sys.executable
        
    cmd = [python_exe, 'manage.py', 'runserver', '127.0.0.1:8001']
    
    print(f"Executing: {' '.join(cmd)}")
    
    with open('server_launch.log', 'w') as logfile:
        process = subprocess.Popen(
            cmd,
            stdout=logfile,
            stderr=subprocess.STDOUT,
            cwd=r"c:\Users\admin\Django React Blog\backend"
        )
        print(f"Server process started with PID: {process.pid}")
        
        # Monitor for a few seconds
        for _ in range(5):
            time.sleep(1)
            if process.poll() is not None:
                print(f"Server exited immediately with code {process.returncode}")
                return
            print("Server appears to be running...")

if __name__ == "__main__":
    run_server()
