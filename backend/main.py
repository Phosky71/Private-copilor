from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from api.workspace_routes import router as workspace_router
from api.chat_routes import router as chat_router
from api.index_routes import router as index_router
from api.model_routes import router as model_router
from api.fs_routes import router as fs_router

app = FastAPI(title="PrivateCopilot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(workspace_router, prefix="/workspace", tags=["Workspace"])
app.include_router(chat_router, prefix="/chat", tags=["Chat"])
app.include_router(index_router, prefix="/index", tags=["Index"])
app.include_router(model_router, prefix="/model", tags=["Model"])
app.include_router(fs_router, prefix="/fs", tags=["FileSystem"])

@app.get("/")
def read_root():
    return {"message": "PrivateCopilot API is running"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
