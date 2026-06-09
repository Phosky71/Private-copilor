import React, { useState, useEffect } from 'react'

function App() {
  const [workspaces, setWorkspaces] = useState<any[]>([])
  const [activeWorkspace, setActiveWorkspace] = useState<any>(null)
  const [messages, setMessages] = useState<{role: string, content: string}[]>([])
  const [input, setInput] = useState('')
  const [isIndexing, setIsIndexing] = useState(false)

  const API_URL = 'http://localhost:8000'

  useEffect(() => {
    fetchWorkspaces()
  }, [])

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
      await fetch(`${API_URL}/workspace/switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspace_id: ws.id })
      })
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

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')

    const aiMessage = { role: 'assistant', content: '' }
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
      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone
        if (value) {
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.substring(6))
                if (data.response) {
                  setMessages(prev => {
                    const newMessages = [...prev]
                    newMessages[newMessages.length - 1].content += data.response
                    return newMessages
                  })
                }
              } catch (err) {
                console.error("Error parsing chunk", err)
              }
            }
          }
        }
      }
    } catch (e) {
      console.error(e)
      setMessages(prev => {
        const newMessages = [...prev]
        newMessages[newMessages.length - 1].content = "Error communicating with AI assistant."
        return newMessages
      })
    }
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
        
        <button 
          onClick={handleCreateWorkspace}
          className="mt-auto px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors flex items-center justify-center font-medium"
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
          {activeWorkspace && (
            <div className="flex space-x-3">
              <button 
                onClick={handleIndexWorkspace}
                disabled={isIndexing}
                className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isIndexing ? 'Indexing...' : 'Index Workspace'}
              </button>
              <button className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md text-sm font-medium transition-colors">
                Settings
              </button>
            </div>
          )}
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
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-3xl rounded-2xl px-5 py-3.5 leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-gray-800 border border-gray-700 text-gray-200 rounded-bl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
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
    </div>
  )
}

export default App
