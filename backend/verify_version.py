import os
import sys

# Setup Django standalone
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

import django
try:
    django.setup()
except Exception as e:
    print(f"Django setup failed: {e}")

try:
    from api.ai_services import AIServiceClientRaw
    print("Importing AIServiceClientRaw...")
    client = AIServiceClientRaw()
    print("Successfully instantiated client.")
except Exception as e:
    print(f"Failed to import/init: {e}")
