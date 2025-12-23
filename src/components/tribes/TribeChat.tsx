'use client';

import { useState, useRef, useEffect } from 'react';
import type { TribeMessage } from '@/types/tribes';
import { formatTribeTime } from '@/lib/storage/tribeStorage';

interface TribeChatProps {
  messages: TribeMessage[];
  onSendMessage: (content: string) => void;
  currentUserId?: string;
  isMember: boolean;
}

export function TribeChat({
  messages,
  onSendMessage,
  currentUserId = 'current-user',
  isMember,
}: TribeChatProps) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isMember) return;

    onSendMessage(newMessage.trim());
    setNewMessage('');
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.map((p) => p[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderMessage = (message: TribeMessage) => {
    const isCurrentUser = message.senderId === currentUserId;
    const isSystem = message.type === 'system' || message.type === 'achievement';

    if (isSystem) {
      return (
        <div key={message.id} className="flex justify-center my-3">
          <div
            className={`px-4 py-2 rounded-full text-sm ${
              message.type === 'achievement'
                ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border border-amber-200'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {message.type === 'achievement' && <span className="mr-1">🏆</span>}
            {message.content}
          </div>
        </div>
      );
    }

    return (
      <div
        key={message.id}
        className={`flex gap-3 mb-4 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
      >
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-medium ${
            isCurrentUser
              ? 'bg-gradient-to-br from-tribe-sage-500 to-cyan-500'
              : 'bg-gradient-to-br from-indigo-500 to-purple-500'
          }`}
        >
          {message.senderAvatar || getInitials(message.senderName)}
        </div>

        {/* Message content */}
        <div className={`max-w-[75%] ${isCurrentUser ? 'text-right' : ''}`}>
          {!isCurrentUser && (
            <p className="text-xs text-slate-500 mb-1">{message.senderName}</p>
          )}
          <div
            className={`inline-block px-4 py-2 rounded-2xl ${
              isCurrentUser
                ? 'bg-tribe-sage-500 text-white rounded-br-sm'
                : 'bg-slate-100 text-slate-800 rounded-bl-sm'
            }`}
          >
            <p className="text-sm">{message.content}</p>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {formatTribeTime(message.timestamp)}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col h-[500px]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
        <h3 className="font-semibold text-slate-800">Tribe Chat</h3>
        <p className="text-sm text-slate-500">{messages.length} messages</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length > 0 ? (
          <>
            {messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">
            <div className="text-center">
              <span className="text-3xl mb-2 block">💬</span>
              <p>No messages yet</p>
              <p className="text-sm">Be the first to say hello!</p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      {isMember ? (
        <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200 bg-slate-50">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-slate-200 rounded-full focus:ring-2 focus:ring-tribe-sage-500 focus:border-tribe-sage-500"
              maxLength={500}
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-tribe-sage-500 text-white rounded-full hover:bg-tribe-sage-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        </form>
      ) : (
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-center">
          <p className="text-slate-500 text-sm">
            Join this tribe to participate in the chat
          </p>
        </div>
      )}
    </div>
  );
}
