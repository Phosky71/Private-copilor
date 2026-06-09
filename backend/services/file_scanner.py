import os
from typing import List

IGNORE_DIRS = {".git", "node_modules", "venv", "dist", "build", "__pycache__", "chroma_db"}

class FileScanner:
    @staticmethod
    def scan_directory(directory: str) -> List[str]:
        file_paths = []
        for root, dirs, files in os.walk(directory):
            # Modify dirs in-place to skip ignored directories
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS and not d.startswith('.')]
            
            for file in files:
                # Skip hidden files or lock files
                if file.startswith('.') or file.endswith('.lock'):
                    continue
                file_paths.append(os.path.join(root, file))
        return file_paths
