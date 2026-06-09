from pydantic import BaseModel

class CreateWorkspaceRequest(BaseModel):
    name: str

class AddFolderRequest(BaseModel):
    workspace_id: str
    folder_path: str
    
class SwitchWorkspaceRequest(BaseModel):
    workspace_id: str
