import requests
import sys

try:
    print("Testing connection to http://127.0.0.1:8002/ ...")
    response = requests.get("http://127.0.0.1:8002/admin/login/", timeout=5)
    print(f"Status Code: {response.status_code}")
    print("Content snippet:", response.text[:100])
except Exception as e:
    print(f"Error: {e}")
