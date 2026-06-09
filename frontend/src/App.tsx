import { useState, useEffect } from 'react'

function App() {
  const [workspaces, setWorkspaces] = useState([])
  const [activeWorkspace, setActiveWorkspace] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')

  useEffect(() => {
    // Fetch initial status and workspaces here
  }, [])

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
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${activeWorkspace?.id === ws.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`}
                >
                  {ws.name}
                </button>
              ))
            )}
          </div>
        </div>
        
        <button className="mt-auto px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors flex items-center justify-center">
          <span className="mr-2">+</span> New Workspace
        </button>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Select a workspace and ask a question to get started.</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-3xl rounded-lg px-4 py-3 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-800 border border-gray-700'}`}>
                  {msg.content}
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-4 border-t border-gray-800">
          <form className="max-w-4xl mx-auto flex" onSubmit={(e) => { e.preventDefault(); }}>
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask a question about your codebase..." 
              className="flex-1 bg-gray-800 border border-gray-700 rounded-l-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-r-lg font-medium transition-colors"
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
