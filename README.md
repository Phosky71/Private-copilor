# workspace-copilot

Self-hosted AI coding assistant that runs entirely on your machine. Chat with your codebase using a local LLM, browse and edit files, and commit changes — all without sending code to external services.

---

## What it does

workspace-copilot indexes your project files and lets you query them through a streaming chat interface backed by a local LLM via Ollama. Each project lives in its own isolated workspace, so the model only receives context relevant to the active one.

Beyond chat, it exposes a file browser, a diff viewer to review AI-suggested changes before applying them, and a Git integration layer that can stage and commit edits automatically.

**Core features**

- **Workspace isolation** — each workspace has its own ChromaDB collection and indexed files; switching workspaces resets the retrieval context completely
- **RAG pipeline** — files are scanned with `file_scanner.py`, embedded with SentenceTransformers, and stored in ChromaDB for semantic retrieval at query time
- **Streaming chat** — responses are streamed token by token via SSE (`/chat/stream`) using Ollama's HTTP API
- **File browser** — navigate, read, and edit files inside a workspace directly from the UI (`FileBrowserModal`)
- **Diff viewer** — AI-proposed edits are shown as diffs (`DiffViewerComponent`) before being written to disk
- **Git integration** — `GitService` initialises a repo if none exists, reads `git status`, and can apply an edit and commit it in one call (`apply_edit_and_commit`)
- **Model switcher** — change the active Ollama model at runtime from `SettingsModal` without restarting the backend
- **No telemetry** — no API keys, no cloud calls, everything runs on `localhost`

---

## Stack

| Layer | Technology |
|---|---|
| LLM runtime | [Ollama](https://ollama.com) |
| Vector store | [ChromaDB](https://www.trychroma.com) |
| Embeddings | SentenceTransformers |
| Backend | Python 3.11 · FastAPI · Uvicorn |
| Frontend | React · Vite · TypeScript · Tailwind CSS |

---

## Project structure

```
workspace-copilot/
├── backend/
│   ├── api/          # FastAPI routers (chat, workspace, index, model, fs, git)
│   ├── core/         # LLM client and shared infrastructure
│   ├── db/           # ChromaDB setup and RAG retrieval logic
│   ├── services/     # Business logic (file_scanner, git_service, workspace_service)
│   └── main.py       # Uvicorn entry point (port 8000)
├── frontend/
│   └── src/
│       ├── components/   # ChatMessage, DiffViewerComponent, FileBrowserModal, SettingsModal
│       └── App.tsx
├── workspaces/       # Per-project data and indexed files
├── run.py            # Launches backend + frontend together
└── start.bat         # Windows launcher
```

---

## Getting started

### Requirements

- Python 3.11+
- Node.js 18+
- [Ollama](https://ollama.com) installed and running locally

### 1. Pull a model

```bash
ollama pull qwen2.5-coder:7b
```

Any model available in Ollama works. `qwen2.5-coder:7b` is the default.

### 2. Install backend dependencies

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Install frontend dependencies

```bash
cd frontend
npm install
```

### 4. Start everything

**Windows:**
```cmd
start.bat
```

**Any platform:**
```bash
python run.py
```

The backend starts on `http://localhost:8000` and the frontend on `http://localhost:5173`.

---

## API routes

| Method | Path | Description |
|---|---|---|
| POST | `/chat` | Single-turn chat with workspace context |
| POST | `/chat/stream` | Streaming chat (SSE) |
| GET/POST | `/workspace` | List and create workspaces |
| POST | `/index` | Index files in a workspace |
| GET/POST | `/model` | Get or set the active Ollama model |
| GET/POST | `/fs` | Browse and read files |
| GET | `/git/status` | Git status for the active workspace |
| POST | `/git/apply` | Apply an AI edit and commit it |

---

## License

MIT
