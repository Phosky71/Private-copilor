import subprocess
import sys
import threading
import time

def run_backend():
    print("Starting backend...")
    # Run uvicorn using the python executable to avoid path issues
    subprocess.run([sys.executable, "-m", "uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"], cwd="backend")

def run_frontend():
    print("Starting frontend...")
    # Run npm run dev in the frontend directory
    # Using shell=True for npm execution on Windows
    subprocess.run("npm run dev", shell=True, cwd="frontend")

if __name__ == "__main__":
    try:
        backend_thread = threading.Thread(target=run_backend)
        backend_thread.daemon = True
        backend_thread.start()

        time.sleep(2)  # Give backend a moment to start

        frontend_thread = threading.Thread(target=run_frontend)
        frontend_thread.daemon = True
        frontend_thread.start()

        # Keep main thread alive
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down PrivateCopilot...")
        sys.exit(0)
