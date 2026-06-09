import React, { useState } from 'react';

interface SettingsModalProps {
  activeWorkspace: any;
  onClose: () => void;
  onUpdate: (name: string) => void;
  onDelete: () => void;
  onAddFolder: () => void;
  onRemoveFolder: (path: string) => void;
  onAddFile: () => void;
  onRemoveFile: (path: string) => void;
}

export default function SettingsModal({ 
  activeWorkspace, onClose, onUpdate, onDelete, 
  onAddFolder, onRemoveFolder, onAddFile, onRemoveFile 
}: SettingsModalProps) {
  
  const [name, setName] = useState(activeWorkspace?.name || '');
  const folders = activeWorkspace?.folders || [];
  const files = activeWorkspace?.files || [];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] border border-gray-700 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-700 flex justify-between items-center bg-gray-800/80">
          <h2 className="text-xl font-bold text-gray-100">Workspace Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-8">
          
          {/* General Settings */}
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">General</h3>
            <div className="flex gap-3">
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)}
                placeholder="Workspace Name"
                className="flex-1 bg-gray-900 border border-gray-700 text-gray-100 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <button 
                onClick={() => onUpdate(name)} 
                disabled={!name.trim() || name === activeWorkspace.name}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-lg font-medium shadow-sm transition-colors"
              >
                Save Name
              </button>
            </div>
          </section>

          {/* Folders Management */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Indexed Folders</h3>
              <button 
                onClick={onAddFolder} 
                className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <span>+</span> Add Folder
              </button>
            </div>
            <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden divide-y divide-gray-800">
              {folders.length === 0 ? (
                <p className="p-5 text-sm text-gray-500 text-center italic">No folders added yet.</p>
              ) : (
                folders.map((f: string, i: number) => (
                  <div key={i} className="flex justify-between items-center p-3 hover:bg-gray-800/50 transition-colors group">
                    <span className="text-sm font-mono text-gray-300 truncate mr-4" title={f}>{f}</span>
                    <button 
                      onClick={() => onRemoveFolder(f)} 
                      className="text-red-400 hover:text-red-300 text-sm font-medium px-2 py-1 rounded hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Files Management */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Individual Files</h3>
              <button 
                onClick={onAddFile} 
                className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <span>+</span> Add File
              </button>
            </div>
            <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden divide-y divide-gray-800">
              {files.length === 0 ? (
                <p className="p-5 text-sm text-gray-500 text-center italic">No individual files added.</p>
              ) : (
                files.map((f: string, i: number) => (
                  <div key={i} className="flex justify-between items-center p-3 hover:bg-gray-800/50 transition-colors group">
                    <span className="text-sm font-mono text-gray-300 truncate mr-4" title={f}>{f}</span>
                    <button 
                      onClick={() => onRemoveFile(f)} 
                      className="text-red-400 hover:text-red-300 text-sm font-medium px-2 py-1 rounded hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Danger Zone */}
          <section className="pt-6 border-t border-gray-700">
            <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-4">Danger Zone</h3>
            <div className="bg-red-900/10 border border-red-900/30 rounded-lg p-5 flex items-center justify-between">
              <div>
                <h4 className="text-red-400 font-medium mb-1">Delete Workspace</h4>
                <p className="text-xs text-red-400/70">Permanently delete this workspace and erase all vectorized knowledge from ChromaDB. This cannot be undone.</p>
              </div>
              <button 
                onClick={() => {
                  if (confirm("Are you absolutely sure you want to permanently delete this workspace and all its indexed vector data?")) {
                    onDelete();
                  }
                }} 
                className="ml-4 px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium shadow-sm transition-colors whitespace-nowrap flex-shrink-0"
              >
                Delete Workspace
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
