from typing import List, Dict, Any
from core.embeddings import embedding_service
from db.chroma_manager import chroma_manager

class RAGService:
    def __init__(self):
        pass

    def search(self, workspace_id: str, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        collection = chroma_manager.get_collection(workspace_id)
        
        # Check if collection is empty
        if collection.count() == 0:
            return []

        query_embedding = embedding_service.embed_text(query)

        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k
        )

        formatted_results = []
        if results and results['documents'] and results['documents'][0]:
            for i in range(len(results['documents'][0])):
                formatted_results.append({
                    "document": results['documents'][0][i],
                    "metadata": results['metadatas'][0][i] if results['metadatas'] else {},
                    "distance": results['distances'][0][i] if results['distances'] else 0.0
                })
                
        return formatted_results

rag_service = RAGService()
