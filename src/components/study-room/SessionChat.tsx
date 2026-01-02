'use client';

import { useState, useRef, useEffect } from 'react';
import { SessionMessage } from '@/types/studyRoom';

interface SessionChatProps {
  messages: SessionMessage[];
  currentUserId: string;
  onSendMessage: (content: string) => void;
  isConnected: boolean;
}

export function SessionChat({
  messages,
  currentUserId,
  onSendMessage,
  isConnected,
}: SessionChatProps) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isConnected) return;

    onSendMessage(newMessage.trim());
    setNewMessage('');
    inputRef.current?.focus();
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-[#D4C4B0] dark:border-[#8B7355]/50 flex-shrink-0">
        <h3 className="font-medium text-sm text-[#8B7355] dark:text-white flex items-center gap-2">
          <svg className="w-4 h-4 text-[#5B7B6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          Chat
          {!isConnected && (
            <span className="text-xs text-amber-500 font-normal">(connecting...)</span>
          )}
        </h3>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-[#A89070] dark:text-[#D4C4B0]/70 text-sm">
            <svg
              className="w-10 h-10 mx-auto mb-3 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p>No messages yet</p>
            <p className="text-xs mt-1">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.senderId === currentUserId;
            const isSystem = message.type === 'system';

            if (isSystem) {
              return (
                <div key={message.id} className="text-center">
                  <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs rounded-full">
                    {message.content}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={message.id}
                className={`flex gap-2 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar - hide for current user */}
                {!isCurrentUser && (
                  <div className="flex-shrink-0">
                    {message.senderAvatar ? (
                      <img
                        src={message.senderAvatar}
                        alt={message.senderName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 via-cyan-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                        {message.senderName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                    )}
                  </div>
                )}

                {/* Message bubble */}
                <div
                  className={`max-w-[75%] ${
                    isCurrentUser
                      ? 'bg-tribe-sage-500 text-white rounded-2xl rounded-br-sm'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-2xl rounded-bl-sm'
                  } px-3 py-2`}
                >
                  {!isCurrentUser && (
                    <p className="text-xs font-medium text-tribe-sage-600 dark:text-tribe-sage-400 mb-0.5">
                      {message.senderName}
                    </p>
                  )}
                  <p className="text-sm break-words">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isCurrentUser ? 'text-teal-200' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-[#D4C4B0] dark:border-[#8B7355]/50 flex-shrink-0 bg-[#F5F0E8] dark:bg-slate-800/50"
      >
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value.slice(0, 500))}
            placeholder={isConnected ? 'Type a message...' : 'Connecting...'}
            disabled={!isConnected}
            className="flex-1 px-3 py-2 bg-white dark:bg-slate-700 border border-[#D4C4B0] dark:border-[#8B7355]/50 rounded-xl text-sm text-[#3D5A4C] dark:text-white placeholder-[#A89070] dark:placeholder-[#D4C4B0]/50 focus:outline-none focus:ring-2 focus:ring-[#5B7B6D] focus:border-transparent disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            className="px-3 py-2 bg-[#5B7B6D] hover:bg-[#4A6B5D] disabled:bg-[#D4C4B0] disabled:dark:bg-slate-600 text-white rounded-xl transition-colors disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
        <p className="text-xs text-[#A89070] dark:text-[#D4C4B0]/70 mt-1 text-right">
          {newMessage.length}/500
        </p>
      </form>
    </div>
  );
}
