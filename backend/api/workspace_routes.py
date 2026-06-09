from fastapi import APIRouter

router = APIRouter()

@router.post("/create")
def create_workspace():
    return {"status": "not implemented"}

@router.post("/add-folder")
def add_folder():
    return {"status": "not implemented"}

@router.post("/switch")
def switch_workspace():
    return {"status": "not implemented"}

@router.get("/status")
def get_status():
    return {"status": "not implemented"}
