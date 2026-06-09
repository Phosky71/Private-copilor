import requests
import json
import os
from typing import List, Dict, Any
from core.rag import rag_service
from services.workspace_service import workspace_service

class LLMClient:
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url
        self.active_model_id = "qwen2.5-coder:7b"

    def get_models_config(self) -> Dict[str, Any]:
        try:
            res = requests.get(f"{self.base_url}/api/tags", timeout=5)
            if res.status_code == 200:
                data = res.json()
                models = []
                for m in data.get("models", []):
                    model_name = m.get("name")
                    models.append({
                        "id": model_name,
                        "name": model_name,
                        "model": model_name
                    })
                
                default_model = "qwen2.5-coder:7b"
                if models and not any(m["id"] == default_model for m in models):
                    default_model = models[0]["id"]
                    
                return {
                    "default": default_model,
                    "models": models
                }
        except Exception as e:
            print(f"Error fetching Ollama models: {e}")
            
        # Fallback
        return {
            "default": "qwen2.5-coder:7b",
            "models": [{"id": "qwen2.5-coder:7b", "name": "Qwen 2.5 Coder 7B", "model": "qwen2.5-coder:7b"}]
        }

    def set_active_model(self, model_id: str) -> str:
        self.active_model_id = model_id
        return model_id

    def resolve_model(self, workspace_id: str = None) -> str:
        if workspace_id:
            try:
                ws = workspace_service.get_workspace(workspace_id)
                ws_model = ws.get("model")
                if ws_model:
                    return ws_model
            except:
                pass
        return self.active_model_id

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
        model = self.resolve_model(workspace_id)
        
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

    def generate_stream(self, workspace_id: str, query: str):
        model = self.resolve_model(workspace_id)
        
        prompt = self.build_prompt(workspace_id, query)
        
        import json
        response = requests.post(f"{self.base_url}/api/generate", json={
            "model": model,
            "prompt": prompt,
            "stream": True
        }, stream=True)
        
        if response.status_code == 200:
            for line in response.iter_lines():
                if line:
                    data = json.loads(line)
                    yield f"data: {json.dumps({'response': data.get('response', ''), 'done': data.get('done', False)})}\n\n"
        else:
            yield f"data: {json.dumps({'error': f'Ollama API Error: {response.text}'})}\n\n"

llm_client = LLMClient()
