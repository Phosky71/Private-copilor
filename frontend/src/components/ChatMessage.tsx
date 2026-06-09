import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DiffViewerComponent from './DiffViewerComponent';

export interface Message {
  role: string;
  content: string;
  status?: 'thinking' | 'streaming' | 'done';
}

interface ChatMessageProps {
  message: Message;
  workspaceId: string;
  API_URL: string;
}

const parseContent = (content: string) => {
  const parts = [];
  let lastIndex = 0;
  // Regex to match <edit file="..."> ... </edit>
  const regex = /<edit\s+file="([^"]+)">\s*<original>([\s\S]*?)<\/original>\s*<replacement>([\s\S]*?)<\/replacement>\s*<\/edit>/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: content.slice(lastIndex, match.index) });
    }
    parts.push({
      type: 'edit',
      file: match[1],
      original: match[2].replace(/^\n/, ''),
      replacement: match[3].replace(/^\n/, '')
    });
    lastIndex = regex.lastIndex;
  }
  
  if (lastIndex < content.length) {
    parts.push({ type: 'text', content: content.slice(lastIndex) });
  }
  
  return parts;
};

export default function ChatMessage({ message, workspaceId, API_URL }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const parts = parseContent(message.content);
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`w-full rounded-2xl px-5 py-3.5 leading-relaxed shadow-sm ${
        isUser 
          ? 'bg-blue-600 text-white rounded-br-none ml-auto w-auto max-w-3xl' 
          : 'bg-gray-800 border border-gray-700 text-gray-200 rounded-bl-none max-w-5xl'
      }`}>
        {!isUser && message.status === 'thinking' ? (
          <div className="flex items-center space-x-1.5 h-6 px-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        ) : (
          <div className={`prose ${isUser ? 'prose-invert text-white' : 'prose-invert'} max-w-none prose-p:my-1 prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700`}>
            {parts.map((part, i) => {
              if (part.type === 'text') {
                return (
                  <ReactMarkdown key={i} remarkPlugins={[remarkGfm]}>
                    {part.content}
                  </ReactMarkdown>
                );
              } else if (part.type === 'edit') {
                return (
                  <DiffViewerComponent 
                    key={i}
                    workspaceId={workspaceId}
                    file={part.file!}
                    original={part.original!}
                    replacement={part.replacement!}
                    API_URL={API_URL}
                  />
                );
              }
              return null;
            })}
            
            {!isUser && message.status === 'streaming' && (
              <span className="inline-block w-2 h-4 ml-1 bg-blue-400 animate-pulse align-middle"></span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
