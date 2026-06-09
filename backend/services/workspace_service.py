import os
import json
import uuid
import shutil
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
            "files": []
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
            config = json.load(f)
            if "files" not in config:
                config["files"] = []
            return config
            
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

    def update_workspace_name(self, workspace_id: str, name: str) -> Dict[str, Any]:
        config = self.get_workspace(workspace_id)
        config["name"] = name
        with open(self._get_config_path(workspace_id), "w") as f:
            json.dump(config, f, indent=4)
        return config

    def delete_workspace(self, workspace_id: str):
        ws_dir = self._get_workspace_dir(workspace_id)
        if os.path.exists(ws_dir):
            shutil.rmtree(ws_dir)
        from db.chroma_manager import chroma_manager
        if workspace_id in chroma_manager.clients:
            del chroma_manager.clients[workspace_id]

    def add_file(self, workspace_id: str, file_path: str) -> Dict[str, Any]:
        if not os.path.exists(file_path):
            raise ValueError(f"File path does not exist: {file_path}")
            
        config = self.get_workspace(workspace_id)
        
        if file_path not in config.get("files", []):
            config.setdefault("files", []).append(file_path)
            with open(self._get_config_path(workspace_id), "w") as f:
                json.dump(config, f, indent=4)
                
        return config
        
    def remove_file(self, workspace_id: str, file_path: str) -> Dict[str, Any]:
        config = self.get_workspace(workspace_id)
        
        if file_path in config.get("files", []):
            config["files"].remove(file_path)
            with open(self._get_config_path(workspace_id), "w") as f:
                json.dump(config, f, indent=4)
                
        return config

workspace_service = WorkspaceService()
