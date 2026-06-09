import os
import json
import uuid
from typing import List, Dict, Any

WORKSPACES_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "workspaces")

class WorkspaceService:
    def __init__(self):
        if not os.path.exists(WORKSPACES_DIR):
            os.makedirs(WORKSPACES_DIR)
            
    def _get_workspace_dir(self, workspace_id: str) -> str:
        return os.path.join(WORKSPACES_DIR, workspace_id)
        
    def _get_config_path(self, workspace_id: str) -> str:
        return os.path.join(self._get_workspace_dir(workspace_id), "config.json")
        
    def create_workspace(self, name: str) -> Dict[str, Any]:
        workspace_id = str(uuid.uuid4())
        ws_dir = self._get_workspace_dir(workspace_id)
        os.makedirs(ws_dir, exist_ok=True)
        
        config = {
            "id": workspace_id,
            "name": name,
            "folders": [],
            "model": "qwen2.5-coder:7b"
        }
        
        with open(self._get_config_path(workspace_id), "w") as f:
            json.dump(config, f, indent=4)
            
        return config
        
    def get_workspaces(self) -> List[Dict[str, Any]]:
        workspaces = []
        if not os.path.exists(WORKSPACES_DIR):
            return workspaces
            
        for ws_id in os.listdir(WORKSPACES_DIR):
            config_path = self._get_config_path(ws_id)
            if os.path.exists(config_path):
                with open(config_path, "r") as f:
                    workspaces.append(json.load(f))
        return workspaces
        
    def get_workspace(self, workspace_id: str) -> Dict[str, Any]:
        config_path = self._get_config_path(workspace_id)
        if not os.path.exists(config_path):
            raise ValueError(f"Workspace {workspace_id} not found")
            
        with open(config_path, "r") as f:
            return json.load(f)
            
    def add_folder(self, workspace_id: str, folder_path: str) -> Dict[str, Any]:
        if not os.path.exists(folder_path):
            raise ValueError(f"Folder path does not exist: {folder_path}")
            
        config = self.get_workspace(workspace_id)
        
        if folder_path not in config["folders"]:
            config["folders"].append(folder_path)
            with open(self._get_config_path(workspace_id), "w") as f:
                json.dump(config, f, indent=4)
                
        return config
        
    def remove_folder(self, workspace_id: str, folder_path: str) -> Dict[str, Any]:
        config = self.get_workspace(workspace_id)
        
        if folder_path in config["folders"]:
            config["folders"].remove(folder_path)
            with open(self._get_config_path(workspace_id), "w") as f:
                json.dump(config, f, indent=4)
                
        return config
        
    def update_model(self, workspace_id: str, model: str) -> Dict[str, Any]:
        config = self.get_workspace(workspace_id)
        config["model"] = model
        with open(self._get_config_path(workspace_id), "w") as f:
            json.dump(config, f, indent=4)
        return config

workspace_service = WorkspaceService()
