from fastapi import APIRouter, HTTPException
from api.schemas import GitApplyRequest
from services.git_service import git_service

router = APIRouter()

@router.get("/status")
def get_git_status(workspace_id: str):
    if not workspace_id:
        raise HTTPException(status_code=400, detail="workspace_id is required")
    return git_service.get_status(workspace_id)

@router.post("/apply")
def apply_git_edit(request: GitApplyRequest):
    try:
        branch = git_service.apply_edit_and_commit(
            request.workspace_id,
            request.file_path,
            request.original,
            request.replacement
        )
        return {"status": "success", "branch": branch}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
