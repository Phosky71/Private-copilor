from fastapi import APIRouter, HTTPException
from api.schemas import SetModelRequest
from core.llm import llm_client

router = APIRouter()

@router.get("/")
def get_models():
    return llm_client.get_models_config()

@router.post("/set")
def set_model(request: SetModelRequest):
    try:
        active_model_str = llm_client.set_active_model(request.model_id)
        return {
            "status": "ok",
            "active_model": active_model_str
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
