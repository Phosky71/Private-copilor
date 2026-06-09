# LocalCopilot

> A self-hosted AI coding assistant with workspace isolation, RAG-powered context retrieval, and a streaming chat interface — all running locally via Ollama.

![Python](https://img.shields.io/badge/Python-3.11+-blue?logo=python&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-qwen2.5--coder-black?logo=llama&logoColor=white)
![ChromaDB](https://img.shields.io/badge/RAG-ChromaDB-orange)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## What it does

LocalCopilot is a private, offline-first AI assistant designed for developers who want Copilot-like features without sending their code to the cloud.

- **Multi-workspace isolation** — each project folder is a separate workspace; the model only sees context relevant to the active one.
- **Custom RAG pipeline** — built from scratch using [ChromaDB](https://www.trychroma.com/) and [SentenceTransformers](https://www.sbert.net/) for local semantic search over your codebase.
- **Streaming chat interface** — real-time token streaming via [Ollama](https://ollama.com/), with a clean frontend UI.
- **No telemetry, no API keys** — everything stays on your machine.

---

## Stack

| Layer | Technology |
|---|---|
| LLM runtime | Ollama (`qwen2.5-coder:7b`) |
| Vector store | ChromaDB |
| Embeddings | SentenceTransformers |
| Backend | Python (FastAPI) |
| Frontend | Node.js + React |

---

## Getting started

### Prerequisites

- Python 3.11+
- Node.js 18+
- [Ollama](https://ollama.com/) installed and running

### 1. Pull the model

```bash
ollama run qwen2.5-coder:7b
```

### 2. Set up the backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac / Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Set up the frontend

```bash
cd frontend
npm install
```

---

## Running

Launch both backend and frontend from the project root:

**Windows**
```cmd
start.bat
```

**Cross-platform**
```bash
python run.py
```

The app will be available at `http://localhost:3000` by default.

---

## Workspaces

Each workspace maps to a local folder. When you switch workspaces, the RAG index is reloaded so the model has context only for that project. Workspace configs are stored under `/workspaces`.

---

## Roadmap

- [ ] File-level diff view in chat
- [ ] Support for additional Ollama models (Mistral, DeepSeek Coder)
- [ ] VSCode extension
- [ ] Workspace auto-indexing on file change (watchdog)
