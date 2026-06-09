import requests
from typing import List, Dict, Any
from core.rag import rag_service
from services.workspace_service import workspace_service

class LLMClient:
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url

    def build_prompt(self, workspace_id: str, query: str) -> str:
        results = rag_service.search(workspace_id, query, top_k=5)
        
        context_parts = []
        for r in results:
            source = r['metadata'].get('source', 'Unknown')
            content = r['document']
            context_parts.append(f"--- File: {source} ---\n{content}")
            
        context_str = "\n\n".join(context_parts)
        
        system_prompt = (
            "You are a local AI coding assistant. You have access to the user's workspace files. "
            "Use the provided context to answer the user's questions about their codebase. "
            "If the answer is not in the context, you can use your general knowledge but mention it."
        )
        
        prompt = f"{system_prompt}\n\nContext:\n{context_str}\n\nUser Question:\n{query}"
        return prompt

    def generate(self, workspace_id: str, query: str) -> str:
        workspace = workspace_service.get_workspace(workspace_id)
        model = workspace.get("model", "qwen2.5-coder:7b")
        
        prompt = self.build_prompt(workspace_id, query)
        
        response = requests.post(f"{self.base_url}/api/generate", json={
            "model": model,
            "prompt": prompt,
            "stream": False
        })
        
        if response.status_code == 200:
            return response.json().get("response", "")
        else:
            raise Exception(f"Ollama API Error: {response.text}")

llm_client = LLMClient()
