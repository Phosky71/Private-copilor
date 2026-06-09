import React, { useState, useEffect } from 'react';

interface FileBrowserModalProps {
  onClose: () => void;
  onSelect: (path: string) => void;
  API_URL: string;
  mode: 'folder' | 'file';
}

export default function FileBrowserModal({ onClose, onSelect, API_URL, mode }: FileBrowserModalProps) {
  const [currentPath, setCurrentPath] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPath = async (path: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/fs/list?path=${encodeURIComponent(path)}`);
      const data = await res.json();
      setCurrentPath(data.path);
      setItems(data.items || []);
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPath('');
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col h-[80vh] border border-gray-700 overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/80">
          <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
            <span className="text-xl">{mode === 'folder' ? '📁' : '📄'}</span>
            Select {mode === 'folder' ? 'Folder' : 'File'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-5 py-3 border-b border-gray-700 bg-gray-900/50 flex flex-wrap gap-3 items-center">
          <button 
            onClick={() => fetchPath('')} 
            className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md text-sm font-medium transition-colors"
          >
            Drives
          </button>
          
          <div className="flex-1 min-w-[200px] flex rounded-md overflow-hidden border border-gray-700 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
            <input 
              type="text" 
              value={currentPath} 
              onChange={e => setCurrentPath(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchPath(currentPath)}
              placeholder="Enter absolute path..."
              className="flex-1 bg-gray-900 px-4 py-1.5 text-sm text-gray-200 focus:outline-none"
            />
            <button 
              onClick={() => fetchPath(currentPath)}
              className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium border-l border-gray-700 transition-colors"
            >
              Go
            </button>
          </div>

          {mode === 'folder' && currentPath && (
            <button 
              onClick={() => onSelect(currentPath)} 
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-medium shadow-sm transition-colors"
            >
              Select Current
            </button>
          )}
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {isLoading ? (
            <div className="flex justify-center items-center h-full text-gray-500">Loading...</div>
          ) : items.length === 0 ? (
            <div className="flex justify-center items-center h-full text-gray-500 flex-col gap-2">
              <svg className="w-12 h-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              <span>Empty or Access Denied</span>
            </div>
          ) : (
            items.map((item, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between px-3 py-2 hover:bg-gray-700/50 rounded-lg group transition-colors"
              >
                <div 
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  onClick={() => item.is_dir ? fetchPath(item.path) : (mode === 'file' && onSelect(item.path))}
                >
                  <span className="text-xl flex-shrink-0">{item.is_dir ? '📁' : '📄'}</span>
                  <span className="text-sm text-gray-200 truncate">{item.name}</span>
                </div>
                {!item.is_dir && mode === 'file' && (
                  <button 
                    onClick={() => onSelect(item.path)} 
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Select
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
