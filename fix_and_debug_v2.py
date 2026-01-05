import os
import shutil

# 1. Debug Key (Manual parsing to avoid dotenv dependency)
print("--- Debugging Key ---")
try:
    env_path = os.path.join("backend", ".env")
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                if line.strip().startswith("GEMINI_API_KEY"):
                    parts = line.split("=", 1)
                    if len(parts) == 2:
                        key = parts[1].strip()
                        # Remove quotes if present
                        if (key.startswith('"') and key.endswith('"')) or (key.startswith("'") and key.endswith("'")):
                             print("WARNING: Key is quoted in .env")
                             key = key[1:-1]
                        
                        print(f"Key found. Length: {len(key)}")
                        print(f"First 5: {key[:5]}")
                        print(f"Last 5: {key[-5:]}")
                        if " " in key:
                             print("WARNING: Key contains spaces.")
    else:
        print(f"Error: .env file not found at {env_path}")
except Exception as e:
    print(f"Error checking key: {e}")

# 2. Copy Image
print("\n--- Copying Image ---")
src = r"C:\Users\admin\.gemini\antigravity\brain\7dae3623-0843-4642-ad4d-357ef8c54444\adv_3_1767621079554.png"
dst = r"c:\Users\admin\Django React Blog\frontend\public\assets\images\adv-3.png"

try:
    if os.path.exists(src):
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy2(src, dst)
        print(f"Success: Copied to {dst}")
    else:
        print(f"Error: Source image not found at {src}")
except Exception as e:
    print(f"Error copying image: {e}")
