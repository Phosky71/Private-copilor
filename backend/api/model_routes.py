from fastapi import APIRouter, HTTPException
from api.schemas import SetModelRequest
from core.llm import llm_client

router = APIRouter()

@router.get("/")
def get_models():
    return llm_client.get_models_config()

@router.get("/current")
def get_current_model(workspace_id: str = None):
    model_name, source = llm_client.resolve_model_details(workspace_id)
    return {
        "workspace_id": workspace_id,
        "selected_model": model_name,
        "source": source
    }

@router.post("/set")
def set_model(request: SetModelRequest):
    try:
        from services.workspace_service import workspace_service
        if request.workspace_id:
            workspace_service.update_model(request.workspace_id, request.model_id)
            active_model_str = request.model_id
        else:
            active_model_str = llm_client.set_active_model(request.model_id)
            
        return {
            "status": "ok",
            "active_model": active_model_str
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
