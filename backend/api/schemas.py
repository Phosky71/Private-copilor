from pydantic import BaseModel

class CreateWorkspaceRequest(BaseModel):
    name: str

class AddFolderRequest(BaseModel):
    workspace_id: str
    folder_path: str
    
class SwitchWorkspaceRequest(BaseModel):
    workspace_id: str

class UpdateWorkspaceRequest(BaseModel):
    workspace_id: str
    name: str

class FileRequest(BaseModel):
    workspace_id: str
    file_path: str

class RemoveFolderRequest(BaseModel):
    workspace_id: str
    folder_path: str

from typing import Optional

class SetModelRequest(BaseModel):
    model_id: str
    workspace_id: Optional[str] = None
