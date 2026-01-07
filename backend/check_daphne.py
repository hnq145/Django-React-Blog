import sys
try:
    import daphne
    with open("daphne_status.txt", "w") as f:
        f.write("Daphne is installed")
except ImportError as e:
    with open("daphne_status.txt", "w") as f:
        f.write(f"Error: {e}")
except Exception as e:
    with open("daphne_status.txt", "w") as f:
        f.write(f"Unexpected error: {e}")
