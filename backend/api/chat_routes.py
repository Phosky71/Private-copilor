from fastapi import APIRouter

router = APIRouter()

@router.post("/")
def chat():
    return {"status": "not implemented"}

@router.post("/stream")
def chat_stream():
    return {"status": "not implemented"}
