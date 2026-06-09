import React, { useState } from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';

interface DiffViewerProps {
  workspaceId: string;
  file: string;
  original: string;
  replacement: string;
  API_URL: string;
}

export default function DiffViewerComponent({ workspaceId, file, original, replacement, API_URL }: DiffViewerProps) {
  const [status, setStatus] = useState<'pending' | 'applied' | 'rejected'>('pending');
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    try {
      const res = await fetch(`${API_URL}/git/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: workspaceId,
          file_path: file,
          original: original,
          replacement: replacement
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to apply edit");
      setStatus('applied');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="my-4 border border-gray-700 rounded-lg overflow-hidden bg-gray-900 shadow-lg font-sans">
      <div className="flex justify-between items-center px-4 py-3 bg-gray-800 border-b border-gray-700">
        <span className="font-mono text-sm text-gray-300">📝 {file}</span>
        {status === 'pending' && (
          <div className="space-x-3">
            <button 
              onClick={() => setStatus('rejected')} 
              className="px-4 py-1.5 bg-gray-700 hover:bg-red-600/80 text-gray-200 hover:text-white rounded text-xs font-semibold tracking-wide transition-all"
            >
              Reject
            </button>
            <button 
              onClick={handleApply} 
              className="px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded text-xs font-bold tracking-wide shadow-sm transition-all"
            >
              Accept & Commit ✓
            </button>
          </div>
        )}
        {status === 'applied' && <span className="px-3 py-1 bg-green-900/30 text-green-400 border border-green-800 rounded-md text-xs font-bold tracking-wider">APPLIED ✓</span>}
        {status === 'rejected' && <span className="px-3 py-1 bg-red-900/30 text-red-400 border border-red-800 rounded-md text-xs font-bold tracking-wider">REJECTED ✕</span>}
      </div>
      
      {error && <div className="p-3 bg-red-900/50 text-red-200 text-sm border-b border-red-800 font-medium">{error}</div>}

      <div className="text-left text-sm max-h-[600px] overflow-y-auto">
        <ReactDiffViewer
          oldValue={original}
          newValue={replacement}
          splitView={true}
          useDarkTheme={true}
          hideLineNumbers={false}
          styles={{
            variables: {
              dark: {
                diffViewerBackground: '#111827', // Tailwind gray-900
                diffViewerColor: '#F3F4F6',
                addedBackground: '#064e3b', // emerald-900
                addedColor: '#A7F3D0',
                removedBackground: '#7f1d1d', // red-900
                removedColor: '#FECACA',
                wordAddedBackground: '#047857',
                wordRemovedBackground: '#B91C1C',
                addedGutterBackground: '#064e3b',
                removedGutterBackground: '#7f1d1d',
                gutterBackground: '#1F2937', // gray-800
                gutterBackgroundDark: '#1F2937',
                emptyLineBackground: '#111827'
              }
            }
          }}
        />
      </div>
    </div>
  );
}
