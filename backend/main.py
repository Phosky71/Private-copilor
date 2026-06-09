from fastapi import FastAPI
from db import init_db
from workspace_service import *
from indexer import index_workspace
from rag import load_chain

app = FastAPI()

init_db()

chains = {}


@app.post("/workspace/create")
def create(name: str):
    create_workspace(name)
    return {"ok": True}


@app.post("/workspace/add-path")
def add(name: str, path: str):
    add_path(name, path)
    return {"ok": True}


@app.get("/workspace/list")
def list_ws():
    return list_workspaces()


@app.post("/workspace/index")
def index(name: str):
    return index_workspace(name)


@app.post("/chat")
def chat(name: str, query: str):

    if name not in chains:
        chains[name] = load_chain(name)

    return {
        "response": chains[name].run(query)
    }