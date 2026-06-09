import React, { useState, useEffect } from 'react'
import SettingsModal from './components/SettingsModal'
import FileBrowserModal from './components/FileBrowserModal'
import ChatMessage, { type Message } from './components/ChatMessage'

function App() {
  const [workspaces, setWorkspaces] = useState<any[]>([])
  const [activeWorkspace, setActiveWorkspace] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isIndexing, setIsIndexing] = useState(false)
  const [availableModels, setAvailableModels] = useState<any[]>([])
  const [selectedModelId, setSelectedModelId] = useState<string>('')
  const [showSettings, setShowSettings] = useState(false)
  const [browserMode, setBrowserMode] = useState<'folder'|'file'|null>(null)
  const [gitStatus, setGitStatus] = useState<any>(null)

  const API_URL = 'http://localhost:8000'

  const fetchGitStatus = async () => {
    if (!activeWorkspace) return
    try {
      const res = await fetch(`${API_URL}/git/status?workspace_id=${activeWorkspace.id}`)
      const data = await res.json()
      setGitStatus(data)
    } catch(e) {}
  }

  useEffect(() => {
    fetchGitStatus()
    const interval = setInterval(fetchGitStatus, 5000)
    return () => clearInterval(interval)
  }, [activeWorkspace])

  useEffect(() => {
    fetchWorkspaces()
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      const res = await fetch(`${API_URL}/model`)
      const data = await res.json()
      setAvailableModels(data.models || [])
      const defaultModel = data.models?.find((m: any) => m.model === data.default)
      if (defaultModel) {
        setSelectedModelId(defaultModel.id)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (activeWorkspace && availableModels.length > 0) {
      const wsModel = availableModels.find(m => m.model === activeWorkspace.model)
      if (wsModel) {
        setSelectedModelId(wsModel.id)
      }
    }
  }, [activeWorkspace, availableModels])

  const fetchWorkspaces = async () => {
    try {
      const res = await fetch(`${API_URL}/workspace`)
      const data = await res.json()
      setWorkspaces(data)
      if (data.length > 0 && !activeWorkspace) {
        handleWorkspaceSwitch(data[0])
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleWorkspaceSwitch = async (ws: any) => {
    setActiveWorkspace(ws)
    setMessages([])
    try {
      const res = await fetch(`${API_URL}/workspace/switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspace_id: ws.id })
      })
      const data = await res.json()
      // ensure we use the updated workspace data that includes model
      setActiveWorkspace(data.active_workspace)
    } catch (e) {
      console.error(e)
    }
  }

  const handleCreateWorkspace = async () => {
    const name = prompt("Enter workspace name:")
    if (name) {
      const res = await fetch(`${API_URL}/workspace/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      const ws = await res.json()
      fetchWorkspaces()
      handleWorkspaceSwitch(ws)
    }
  }

  const handleIndexWorkspace = async () => {
    if (!activeWorkspace) return
    setIsIndexing(true)
    try {
      await fetch(`${API_URL}/index`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspace_id: activeWorkspace.id })
      })
      alert("Indexing complete!")
    } catch (e) {
      console.error(e)
    } finally {
      setIsIndexing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !activeWorkspace) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')

    const aiMessage: Message = { role: 'assistant', content: '', status: 'thinking' }
    setMessages(prev => [...prev, aiMessage])

    try {
      const response = await fetch(`${API_URL}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspace_id: activeWorkspace.id, query: userMessage.content })
      })

      if (!response.body) throw new Error("No response body")
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      
      let done = false;
      let buffer = '';
      
      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone
        if (value) {
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // Keep the last incomplete line in the buffer
          
          for (const line of lines) {
            const trimmedLine = line.trim()
            if (trimmedLine.startsWith('data: ')) {
              const jsonStr = trimmedLine.substring(6)
              if (!jsonStr) continue
              try {
                const data = JSON.parse(jsonStr)
                if (data.response !== undefined) {
                  setMessages(prev => {
                    const newMessages = [...prev]
                    const lastMsg = newMessages[newMessages.length - 1]
                    lastMsg.content += data.response
                    lastMsg.status = 'streaming'
                    return newMessages
                  })
                }
              } catch (err) {
                // Ignore silent JSON parse errors for completely broken lines just in case
              }
            }
          }
        }
      }
      
      setMessages(prev => {
        const newMessages = [...prev]
        newMessages[newMessages.length - 1].status = 'done'
        return newMessages
      })
      
    } catch (e) {
      console.error(e)
      setMessages(prev => {
        const newMessages = [...prev]
        const lastMsg = newMessages[newMessages.length - 1]
        lastMsg.content = "Error communicating with AI assistant."
        lastMsg.status = 'done'
        return newMessages
      })
    }
  }

  const handleModelChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const modelId = e.target.value
    setSelectedModelId(modelId)
    try {
      await fetch(`${API_URL}/model/set`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          model_id: modelId,
          workspace_id: activeWorkspace?.id || undefined
        })
      })
      if (activeWorkspace) {
        setActiveWorkspace({ ...activeWorkspace, model: modelId })
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleUpdateWorkspaceName = async (name: string) => {
    try {
      const res = await fetch(`${API_URL}/workspace/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspace_id: activeWorkspace.id, name })
      })
      const ws = await res.json()
      setActiveWorkspace(ws)
      fetchWorkspaces()
    } catch(e) { console.error(e) }
  }

  const handleDeleteWorkspace = async () => {
    try {
      await fetch(`${API_URL}/workspace/${activeWorkspace.id}`, { method: 'DELETE' })
      setActiveWorkspace(null)
      setShowSettings(false)
      fetchWorkspaces()
    } catch(e) { console.error(e) }
  }

  const handleModifyWorkspaceList = async (endpoint: string, payload: any) => {
    try {
      const res = await fetch(`${API_URL}/workspace/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const ws = await res.json()
      setActiveWorkspace(ws)
    } catch(e) { console.error(e) }
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 flex flex-col">
        <h1 className="text-xl font-bold mb-6 text-blue-400">PrivateCopilot</h1>
        
        <div className="flex-1">
          <h2 className="text-xs uppercase text-gray-400 font-semibold mb-3">Workspaces</h2>
          <div className="space-y-2">
            {workspaces.length === 0 ? (
              <p className="text-sm text-gray-500">No workspaces yet.</p>
            ) : (
              workspaces.map(ws => (
                <button 
                  key={ws.id} 
                  onClick={() => handleWorkspaceSwitch(ws)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${activeWorkspace?.id === ws.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-300'}`}
                >
                  {ws.name}
                </button>
              ))
            )}
          </div>
        </div>
        
        {/* Git Status Panel */}
        <div className="flex-1 mt-6 border-t border-gray-700 pt-4 overflow-y-auto">
          <h2 className="text-xs uppercase text-gray-400 font-semibold mb-3">Git Status</h2>
          {gitStatus ? (
            <div className="space-y-2 text-sm bg-gray-900 p-3 rounded-md border border-gray-700">
              <div className="flex items-center gap-2 text-blue-400">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
                <span className="font-mono text-xs font-bold truncate">{gitStatus.branch || 'N/A'}</span>
              </div>
              <div className="text-gray-400 text-xs mt-2">
                Pending Changes: {gitStatus.pending_changes?.length || 0}
              </div>
              {gitStatus.pending_changes && gitStatus.pending_changes.length > 0 && (
                <ul className="text-xs font-mono text-yellow-400 mt-1 max-h-24 overflow-y-auto">
                  {gitStatus.pending_changes.map((c: string, i: number) => <li key={i} className="truncate">{c}</li>)}
                </ul>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No valid workspace or repo loaded.</p>
          )}
        </div>

        <button 
          onClick={handleCreateWorkspace}
          className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors flex items-center justify-center font-medium shadow-sm"
        >
          <span className="mr-2">+</span> New Workspace
        </button>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Settings Header */}
        <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-900 z-10 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-200">
            {activeWorkspace ? activeWorkspace.name : 'Select a workspace'}
          </h2>
          <div className="flex items-center space-x-3">
            {availableModels.length > 0 && (
              <select 
                value={selectedModelId} 
                onChange={handleModelChange}
                className="bg-gray-800 text-sm text-gray-200 border border-gray-700 rounded-md px-3 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {availableModels.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            )}
            {activeWorkspace && (
              <>
                <button 
                  onClick={handleIndexWorkspace}
                  disabled={isIndexing}
                  className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isIndexing ? 'Indexing...' : 'Index Workspace'}
                </button>
                <button 
                  onClick={() => setShowSettings(true)}
                  className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md text-sm font-medium transition-colors"
                >
                  Settings
                </button>
              </>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p className="text-lg font-medium">Ask a question about your codebase</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <ChatMessage 
                key={i} 
                message={msg} 
                workspaceId={activeWorkspace?.id || ''} 
                API_URL={API_URL} 
              />
            ))
          )}
        </div>
        
        {/* Input Area */}
        <div className="p-4 bg-gray-900 border-t border-gray-800">
          <form className="max-w-4xl mx-auto flex shadow-sm" onSubmit={handleSubmit}>
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={!activeWorkspace}
              placeholder={activeWorkspace ? "Ask anything..." : "Select a workspace to chat"} 
              className="flex-1 bg-gray-800 border border-gray-700 rounded-l-lg px-5 py-3.5 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            />
            <button 
              type="submit"
              disabled={!activeWorkspace || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 px-6 py-3.5 rounded-r-lg font-medium transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      {showSettings && activeWorkspace && (
        <SettingsModal 
          activeWorkspace={activeWorkspace}
          onClose={() => setShowSettings(false)}
          onUpdate={handleUpdateWorkspaceName}
          onDelete={handleDeleteWorkspace}
          onAddFolder={() => setBrowserMode('folder')}
          onRemoveFolder={(path: string) => handleModifyWorkspaceList('remove-folder', { workspace_id: activeWorkspace.id, folder_path: path })}
          onAddFile={() => setBrowserMode('file')}
          onRemoveFile={(path: string) => handleModifyWorkspaceList('remove-file', { workspace_id: activeWorkspace.id, file_path: path })}
        />
      )}
      
      {browserMode && activeWorkspace && (
        <FileBrowserModal 
          API_URL={API_URL}
          mode={browserMode}
          onClose={() => setBrowserMode(null)}
          onSelect={(path: string) => {
            handleModifyWorkspaceList(browserMode === 'folder' ? 'add-folder' : 'add-file', {
               workspace_id: activeWorkspace.id,
               [browserMode === 'folder' ? 'folder_path' : 'file_path']: path
            });
            setBrowserMode(null);
          }}
        />
      )}
    </div>
  )
}

export default App
