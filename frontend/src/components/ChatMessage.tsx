import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface Message {
  role: string;
  content: string;
  status?: 'thinking' | 'streaming' | 'done';
}

export default function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-3xl rounded-2xl px-5 py-3.5 leading-relaxed shadow-sm ${
        isUser 
          ? 'bg-blue-600 text-white rounded-br-none' 
          : 'bg-gray-800 border border-gray-700 text-gray-200 rounded-bl-none'
      }`}>
        {!isUser && message.status === 'thinking' ? (
          <div className="flex items-center space-x-1.5 h-6 px-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        ) : (
          <div className={`prose ${isUser ? 'prose-invert text-white' : 'prose-invert'} max-w-none prose-p:my-1 prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
            {!isUser && message.status === 'streaming' && (
              <span className="inline-block w-2 h-4 ml-1 bg-blue-400 animate-pulse align-middle"></span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
