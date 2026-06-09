from fastapi import APIRouter

router = APIRouter()

@router.post("/")
def index_workspace():
    return {"status": "not implemented"}
