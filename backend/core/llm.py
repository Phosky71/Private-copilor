import requests
import json
import os
from typing import List, Dict, Any, Tuple
from core.rag import rag_service
from services.workspace_service import workspace_service

class LLMClient:
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url
        self.active_model_id = None

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
                
                default_model = models[0]["id"] if models else None
                return {
                    "default": default_model,
                    "models": models
                }
        except Exception as e:
            print(f"Error fetching Ollama models: {e}")
            
        return {
            "default": None,
            "models": []
        }

    def set_active_model(self, model_id: str) -> str:
        self.active_model_id = model_id
        return model_id

    def resolve_model_details(self, workspace_id: str = None) -> Tuple[str, str]:
        # 1. Workspace model
        if workspace_id:
            try:
                ws = workspace_service.get_workspace(workspace_id)
                ws_model = ws.get("model")
                if ws_model:
                    return ws_model, "workspace"
            except:
                pass
                
        # 2. Global selected model
        if self.active_model_id:
            return self.active_model_id, "global"
            
        # 3. Default model
        config = self.get_models_config()
        if config.get("default"):
            return config["default"], "default"
            
        return "", "none"

    def resolve_model(self, workspace_id: str = None) -> str:
        model, _ = self.resolve_model_details(workspace_id)
        return model

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

    def _log_request(self, workspace_id: str, model_name: str):
        print(f"\n[LLM]\nworkspace={workspace_id}\nselected_model={model_name}\n")

    def generate(self, workspace_id: str, query: str) -> str:
        model = self.resolve_model(workspace_id)
        self._log_request(workspace_id, model)
        
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
        self._log_request(workspace_id, model)
        
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
