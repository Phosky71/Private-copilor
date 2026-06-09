from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from core.llm import llm_client

router = APIRouter()

class ChatRequest(BaseModel):
    workspace_id: str
    query: str

@router.post("/")
def chat(request: ChatRequest):
    try:
        response = llm_client.generate(request.workspace_id, request.query)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/stream")
def chat_stream(request: ChatRequest):
    return StreamingResponse(
        llm_client.generate_stream(request.workspace_id, request.query), 
        media_type="text/event-stream"
    )
