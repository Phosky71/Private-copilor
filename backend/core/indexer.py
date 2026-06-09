import os
import json
import hashlib
from typing import List, Dict, Any
from services.workspace_service import workspace_service
from services.file_scanner import FileScanner
from core.embeddings import embedding_service
from db.chroma_manager import chroma_manager

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
    chunks = []
    start = 0
    text_length = len(text)
    while start < text_length:
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks

class Indexer:
    def __init__(self):
        pass

    def _get_metadata_path(self, workspace_id: str) -> str:
        # We store last modified times here
        ws_dir = workspace_service._get_workspace_dir(workspace_id)
        return os.path.join(ws_dir, "index_metadata.json")

    def _load_metadata(self, workspace_id: str) -> Dict[str, float]:
        path = self._get_metadata_path(workspace_id)
        if os.path.exists(path):
            with open(path, "r") as f:
                return json.load(f)
        return {}

    def _save_metadata(self, workspace_id: str, metadata: Dict[str, float]):
        path = self._get_metadata_path(workspace_id)
        with open(path, "w") as f:
            json.dump(metadata, f, indent=4)

    def index_workspace(self, workspace_id: str):
        workspace = workspace_service.get_workspace(workspace_id)
        folders = workspace.get("folders", [])
        
        collection = chroma_manager.get_collection(workspace_id)
        metadata_cache = self._load_metadata(workspace_id)
        new_metadata_cache = {}

        for folder in folders:
            if not os.path.exists(folder):
                continue
                
            file_paths = FileScanner.scan_directory(folder)
            
            for file_path in file_paths:
                try:
                    mtime = os.path.getmtime(file_path)
                    new_metadata_cache[file_path] = mtime
                    
                    # Incremental check
                    if file_path in metadata_cache and metadata_cache[file_path] == mtime:
                        continue # Unchanged

                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()

                    # Simple chunking
                    chunks = chunk_text(content)
                    if not chunks:
                        continue

                    # Create ids and metadata
                    ids = [f"{file_path}_{i}" for i in range(len(chunks))]
                    metadatas = [{"source": file_path, "chunk": i} for i in range(len(chunks))]
                    
                    # Embed
                    embeddings = embedding_service.embed_texts(chunks)
                    
                    # Store in Chroma
                    # Note: For existing files that changed, we could delete old chunks first, 
                    # but for simplicity we'll just upsert which works if chunk count is the same, 
                    # though ideally we delete by source metadata first.
                    # Let's delete existing chunks for this file
                    collection.delete(where={"source": file_path})
                    
                    collection.add(
                        ids=ids,
                        embeddings=embeddings,
                        metadatas=metadatas,
                        documents=chunks
                    )
                except Exception as e:
                    print(f"Error indexing {file_path}: {e}")

        self._save_metadata(workspace_id, new_metadata_cache)
        return {"status": "success", "indexed_files": len(new_metadata_cache)}

indexer = Indexer()
