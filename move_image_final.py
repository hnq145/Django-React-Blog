import os
import shutil

# Correct source based on previous generation
src_dir = r"C:\Users\admin\.gemini\antigravity\brain\7dae3623-0843-4642-ad4d-357ef8c54444"
src_file = "adv_3_retry_1767623570608.png"
src_path = os.path.join(src_dir, src_file)

dst_dir = r"c:\Users\admin\Django React Blog\frontend\public\assets\images"
dst_path = os.path.join(dst_dir, "adv-3.png")

print(f"Checking source: {src_path}")
if not os.path.exists(src_path):
    print("Source NOT found!")
    # List dir to help debugging
    print(f"Contents of {src_dir}:")
    for f in os.listdir(src_dir):
        if f.endswith(".png"):
            print(f" - {f}")
else:
    print("Source FOUND.")
    try:
        os.makedirs(dst_dir, exist_ok=True)
        shutil.copy2(src_path, dst_path)
        print(f"Copied to {dst_path}")
    except Exception as e:
        print(f"Copy failed: {e}")
