# PrivateCopilot

A local AI coding assistant featuring multi-folder workspace isolation, a from-scratch RAG system using ChromaDB and SentenceTransformers, and a streaming chat interface via Ollama.

## Setup

1. Make sure you have Python 3.11+ and Node.js installed.
2. Install Ollama and pull the `qwen2.5-coder:7b` model:
   ```bash
   ollama run qwen2.5-coder:7b
   ```
3. Set up the backend:
   ```bash
   cd backend
   python -m venv venv
   # On Windows: venv\Scripts\activate
   # On Mac/Linux: source venv/bin/activate
   pip install -r requirements.txt
   ```
4. Set up the frontend:
   ```bash
   cd frontend
   npm install
   ```

## Running the App

You can run both the frontend and backend using the provided scripts from the root directory:

**Windows:**
```cmd
start.bat
```

**Cross-platform:**
```bash
python run.py
```
