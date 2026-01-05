import os
import shutil

src = r"C:\Users\admin\.gemini\antigravity\brain\7dae3623-0843-4642-ad4d-357ef8c54444\adv_3_retry_1767623570608.png"
dst_dir = r"c:\Users\admin\Django React Blog\frontend\public\assets\images"
dst_file = os.path.join(dst_dir, "adv-3.png")

print(f"Moving from: {src}")
print(f"Moving to: {dst_file}")

try:
    if os.path.exists(src):
        os.makedirs(dst_dir, exist_ok=True)
        shutil.copy2(src, dst_file)
        print("Success: Image copied successfully.")
    else:
        print(f"Error: Source file does not exist at {src}")
except Exception as e:
    print(f"Error moving file: {e}")
