from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from services.workspace_service import workspace_service
from api.schemas import CreateWorkspaceRequest, AddFolderRequest, SwitchWorkspaceRequest

router = APIRouter()

active_workspace_id = None

@router.post("/create")
def create_workspace(request: CreateWorkspaceRequest):
    try:
        ws = workspace_service.create_workspace(request.name)
        global active_workspace_id
        if active_workspace_id is None:
            active_workspace_id = ws["id"]
        return ws
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/")
def get_workspaces():
    return workspace_service.get_workspaces()

@router.post("/add-folder")
def add_folder(request: AddFolderRequest):
    try:
        ws = workspace_service.add_folder(request.workspace_id, request.folder_path)
        return ws
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/switch")
def switch_workspace(request: SwitchWorkspaceRequest):
    try:
        ws = workspace_service.get_workspace(request.workspace_id)
        global active_workspace_id
        active_workspace_id = ws["id"]
        return {"status": "success", "active_workspace": ws}
    except Exception as e:
        raise HTTPException(status_code=404, detail="Workspace not found")

@router.get("/status")
def get_status():
    if active_workspace_id:
        try:
            ws = workspace_service.get_workspace(active_workspace_id)
            return {"active_workspace": ws}
        except:
            return {"active_workspace": None}
    return {"active_workspace": None}
