import requests
import json
import os
from typing import List, Dict, Any
from core.rag import rag_service
from services.workspace_service import workspace_service

CONFIG_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "config", "models.json")

class LLMClient:
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url
        self.models_config = self._load_config()
        self.active_model_id = self._get_default_model_id()
        
    def _load_config(self) -> Dict[str, Any]:
        if os.path.exists(CONFIG_PATH):
            with open(CONFIG_PATH, "r") as f:
                return json.load(f)
        return {"default": "qwen2.5-coder:7b", "models": []}
        
    def _get_default_model_id(self) -> str:
        default_model_str = self.models_config.get("default", "qwen2.5-coder:7b")
        for m in self.models_config.get("models", []):
            if m["model"] == default_model_str:
                return m["id"]
        return "qwen"

    def get_models_config(self) -> Dict[str, Any]:
        return self.models_config

    def set_active_model(self, model_id: str) -> str:
        # Verify model exists
        for m in self.models_config.get("models", []):
            if m["id"] == model_id:
                self.active_model_id = model_id
                return m["model"]
        raise ValueError(f"Model ID {model_id} not found in config")

    def resolve_model(self, workspace_id: str = None) -> str:
        if workspace_id:
            try:
                ws = workspace_service.get_workspace(workspace_id)
                ws_model = ws.get("model")
                if ws_model:
                    return ws_model
            except:
                pass
                
        # Resolve from active_model_id
        for m in self.models_config.get("models", []):
            if m["id"] == self.active_model_id:
                return m["model"]
                
        return self.models_config.get("default", "qwen2.5-coder:7b")

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
