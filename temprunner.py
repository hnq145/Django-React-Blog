
import subprocess
import sys

try:
    result = subprocess.run(
        [sys.executable, 'backend/add_categories.py'],
        capture_output=True,
        text=True,
        check=True
    )
    print(result.stdout)
    print(result.stderr)
except subprocess.CalledProcessError as e:
    print(e.stdout)
    print(e.stderr)

