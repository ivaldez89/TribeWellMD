'use client';

import { useState, useEffect, useRef } from 'react';
import { getUserProfile } from '@/lib/storage/profileStorage';
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
} from '@/lib/storage/communityStorage';
import type { Conversation, DirectMessage, VillageMemberProfile } from '@/types/community';

interface DirectMessagesProps {
  isOpen: boolean;
  onClose: () => void;
  initialRecipient?: VillageMemberProfile;
  /** Panel mode - docked side panel instead of modal */
  panelMode?: boolean;
}

export function DirectMessages({ isOpen, onClose, initialRecipient, panelMode = false }: DirectMessagesProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [view, setView] = useState<'list' | 'chat'>('list');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const profile = getUserProfile();

  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialRecipient && isOpen) {
      startConversation(initialRecipient);
    }
  }, [initialRecipient, isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function loadConversations() {
    const convos = getConversations();
    setConversations(convos);
  }

  function startConversation(recipient: VillageMemberProfile) {
    const conversation = getOrCreateConversation(recipient.id, recipient.name);
    if (conversation) {
      setActiveConversation(conversation);
      loadMessages(conversation.id);
      setView('chat');
    }
  }

  function loadMessages(conversationId: string) {
    const msgs = getMessages(conversationId);
    setMessages(msgs);
  }

  function handleSendMessage() {
    if (!newMessage.trim() || !activeConversation || !profile) return;

    const otherParticipantId = activeConversation.participantIds.find(id => id !== profile.id);
    if (!otherParticipantId) return;

    const message = sendMessage(activeConversation.id, otherParticipantId, newMessage.trim());
    if (message) {
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      loadConversations(); // Refresh conversation list
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString();
  }

  function getOtherParticipantName(conversation: Conversation): string {
    if (!profile) return 'Unknown';
    const index = conversation.participantIds.findIndex(id => id !== profile.id);
    return conversation.participantNames[index] || 'Unknown';
  }

  if (!isOpen) return null;

  // Panel mode - docked side panel like Labs Reference
  if (panelMode) {
    return (
      <aside className="fixed top-12 right-0 bottom-12 w-[380px] bg-surface dark:bg-surface-dark border-l border-border-light dark:border-slate-700 shadow-xl z-40 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-light dark:border-slate-700 bg-[#5B7B6D] dark:bg-[#3d5a4d]">
          {view === 'chat' && activeConversation ? (
            <>
              <button
                onClick={() => {
                  setView('list');
                  setActiveConversation(null);
                }}
                className="p-1.5 -ml-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="font-semibold text-white text-sm">
                {getOtherParticipantName(activeConversation)}
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 -mr-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <h2 className="font-semibold text-white text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Messages
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 -mr-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Content */}
        {view === 'list' ? (
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-3 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-content-secondary dark:text-slate-400 text-sm mb-1">No messages yet</p>
                <p className="text-xs text-content-muted">Start a conversation with a Village member!</p>
              </div>
            ) : (
              <div className="divide-y divide-border-light dark:divide-slate-700">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => {
                      setActiveConversation(conversation);
                      loadMessages(conversation.id);
                      setView('chat');
                    }}
                    className="w-full p-3 flex items-center gap-3 hover:bg-surface-muted dark:hover:bg-slate-700/50 text-left transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#C4A77D] flex items-center justify-center text-white font-medium text-sm">
                      {getOtherParticipantName(conversation)[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="font-medium text-content dark:text-white text-sm truncate">
                          {getOtherParticipantName(conversation)}
                        </p>
                        <span className="text-[10px] text-content-muted">
                          {formatDate(conversation.lastMessageAt)}
                        </span>
                      </div>
                      {conversation.lastMessage && (
                        <p className="text-xs text-content-secondary dark:text-slate-400 truncate">
                          {conversation.lastMessage.senderId === profile?.id ? 'You: ' : ''}
                          {conversation.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-content-muted text-xs">
                    Start the conversation! Say hello to your fellow Village member.
                  </p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwnMessage = message.senderId === profile?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                          isOwnMessage
                            ? 'bg-[#5B7B6D] text-white rounded-br-sm'
                            : 'bg-surface-muted dark:bg-slate-700 text-content dark:text-white rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-[10px] mt-0.5 ${
                            isOwnMessage ? 'text-white/70' : 'text-content-muted'
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
            <div className="p-3 border-t border-border-light dark:border-slate-700 bg-surface dark:bg-surface-dark">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-surface-muted dark:bg-slate-700 border-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#5B7B6D] text-content dark:text-white placeholder:text-content-muted"
                  autoFocus
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-[#5B7B6D] text-white rounded-full hover:bg-[#4A6A5C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    );
  }

  // Modal mode (default)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          {view === 'chat' && activeConversation ? (
            <>
              <button
                onClick={() => {
                  setView('list');
                  setActiveConversation(null);
                }}
                className="p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                {getOtherParticipantName(activeConversation)}
              </h2>
              <div className="w-9" />
            </>
          ) : (
            <>
              <h2 className="font-semibold text-slate-900 dark:text-white">Messages</h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Content */}
        {view === 'list' ? (
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-2">No messages yet</p>
                <p className="text-sm text-slate-500">Start a conversation with a Village member!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => {
                      setActiveConversation(conversation);
                      loadMessages(conversation.id);
                      setView('chat');
                    }}
                    className="w-full p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-left transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#C4A77D] flex items-center justify-center text-white font-medium">
                      {getOtherParticipantName(conversation)[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-slate-900 dark:text-white truncate">
                          {getOtherParticipantName(conversation)}
                        </p>
                        <span className="text-xs text-slate-500">
                          {formatDate(conversation.lastMessageAt)}
                        </span>
                      </div>
                      {conversation.lastMessage && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                          {conversation.lastMessage.senderId === profile?.id ? 'You: ' : ''}
                          {conversation.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500 text-sm">
                    Start the conversation! Say hello to your fellow Village member.
                  </p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwnMessage = message.senderId === profile?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                          isOwnMessage
                            ? 'bg-[#5B7B6D] text-white rounded-br-sm'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isOwnMessage ? 'text-white/70' : 'text-slate-500'
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
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 border-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#5B7B6D] text-slate-900 dark:text-white placeholder:text-slate-400"
                  autoFocus
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-[#5B7B6D] text-white rounded-full hover:bg-[#4A6A5C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
