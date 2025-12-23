'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  getConversations,
  getMessages,
  sendMessage,
  markConversationRead,
  getTotalUnreadCount,
  formatMessageTime,
  getInitials,
  getDemoUser,
  type Conversation,
  type Message,
} from '@/lib/storage/chatStorage';

// Focus mode options
const FOCUS_MODES = [
  { id: 'off', name: 'All notifications', icon: '🔔', description: 'Receive all messages' },
  { id: '30min', name: '30 minutes', icon: '⏱️', description: 'Silent for 30 min' },
  { id: '1hr', name: '1 hour', icon: '🕐', description: 'Silent for 1 hour' },
  { id: '2hr', name: '2 hours', icon: '🕑', description: 'Silent for 2 hours' },
  { id: 'until-tomorrow', name: 'Until tomorrow', icon: '🌙', description: 'Silent until 8 AM' },
  { id: 'focus', name: 'Focus mode', icon: '🎯', description: 'Only urgent messages' },
];

// Study Buddy AI Message Type
interface StudyBuddyMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Study topics for quick access
const STUDY_TOPICS = [
  { id: 'anatomy', name: 'Anatomy', icon: '🦴' },
  { id: 'physiology', name: 'Physiology', icon: '🫀' },
  { id: 'pathology', name: 'Pathology', icon: '🔬' },
  { id: 'pharmacology', name: 'Pharmacology', icon: '💊' },
  { id: 'biochemistry', name: 'Biochemistry', icon: '🧬' },
  { id: 'microbiology', name: 'Microbiology', icon: '🦠' },
];

// Simulated AI responses for Study Buddy (will be replaced with actual AI later)
const STUDY_BUDDY_RESPONSES: { [key: string]: string[] } = {
  anatomy: [
    "Great question about anatomy! The human body has 206 bones in adults. Key regions include the axial skeleton (skull, vertebral column, ribs) and appendicular skeleton (limbs, pelvic and shoulder girdles). What specific area would you like to explore?",
    "Let's break down this anatomical concept. Remember: proximal means closer to the trunk, distal means farther away. Anterior is front, posterior is back. Want me to quiz you on anatomical terminology?",
  ],
  physiology: [
    "Physiology is all about function! The cardiac cycle involves systole (contraction) and diastole (relaxation). The SA node initiates the heartbeat at ~60-100 bpm. Shall I explain the action potential propagation?",
    "Let's think about homeostasis - the body's way of maintaining balance. This involves negative feedback loops. For example, blood glucose regulation involves insulin and glucagon. What mechanism interests you?",
  ],
  pathology: [
    "When studying pathology, remember the 5 cardinal signs of inflammation: rubor (redness), tumor (swelling), calor (heat), dolor (pain), and functio laesa (loss of function). Which pathological process should we review?",
    "Understanding disease processes is key! Cell injury can be reversible or irreversible. Necrosis patterns (coagulative, liquefactive, caseous, fat, fibrinoid) tell us about the cause. What condition are you studying?",
  ],
  pharmacology: [
    "Pharmacology tip: Remember ADME - Absorption, Distribution, Metabolism, Excretion. First-pass metabolism in the liver affects oral drug bioavailability. Which drug class are you focusing on?",
    "Drug mechanisms can be remembered by their suffixes! -olol (beta blockers), -pril (ACE inhibitors), -sartan (ARBs), -statin (HMG-CoA reductase inhibitors). Need help with any specific medication?",
  ],
  biochemistry: [
    "Biochemistry connects everything! The citric acid cycle (Krebs cycle) produces NADH and FADH2 for the electron transport chain. Remember: 'Can I Keep Selling Seashells For Money Officer' for the cycle intermediates!",
    "Enzyme kinetics: Km is the substrate concentration at half Vmax. A low Km means high affinity. Competitive inhibitors increase apparent Km but don't change Vmax. What enzyme topic should we cover?",
  ],
  microbiology: [
    "Microbiology made simple! Gram-positive bacteria have thick peptidoglycan walls (stain purple). Gram-negative have thin walls with outer membrane (stain pink). Which organisms are you studying?",
    "Remember the virulence factors! Exotoxins are secreted by bacteria and are often encoded by plasmids. Endotoxins (LPS) are part of gram-negative cell walls. Need help with a specific pathogen?",
  ],
  default: [
    "I'm your Study Buddy! I can help you with medical concepts, quiz you on topics, explain mechanisms, and provide study tips. What would you like to learn about today?",
    "Great question! Let me help you break that down into understandable pieces. Medical education is a journey, and I'm here to make it easier. Could you tell me more about what you're trying to understand?",
    "I love helping with medical studies! Whether it's USMLE prep, understanding pathophysiology, or memorizing pharmacology, I'm here to assist. What's on your mind?",
    "Let's tackle this together! Remember: understanding the 'why' behind concepts makes memorization easier. What specific topic should we explore?",
  ],
};

function getStudyBuddyResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();

  // Check for topic keywords
  for (const topic of STUDY_TOPICS) {
    if (lowerMessage.includes(topic.id) || lowerMessage.includes(topic.name.toLowerCase())) {
      const responses = STUDY_BUDDY_RESPONSES[topic.id];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }

  // Default response
  const defaultResponses = STUDY_BUDDY_RESPONSES.default;
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// Tab type
type ChatTab = 'messages' | 'studybuddy';

export function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ChatTab>('messages');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showFocusMenu, setShowFocusMenu] = useState(false);
  const [focusMode, setFocusMode] = useState<string>('off');
  const [focusEndTime, setFocusEndTime] = useState<Date | null>(null);

  // Study Buddy state
  const [studyMessages, setStudyMessages] = useState<StudyBuddyMessage[]>([]);
  const [studyInput, setStudyInput] = useState('');
  const [isStudyBuddyTyping, setIsStudyBuddyTyping] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const studyMessagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const studyInputRef = useRef<HTMLInputElement>(null);
  const focusMenuRef = useRef<HTMLDivElement>(null);

  // Load conversations, focus mode, and study buddy messages on mount
  useEffect(() => {
    setConversations(getConversations());
    setUnreadCount(getTotalUnreadCount());

    // Load saved focus mode
    const savedFocusMode = localStorage.getItem('tribewellmd_focus_mode');
    const savedFocusEndTime = localStorage.getItem('tribewellmd_focus_end_time');

    if (savedFocusMode && savedFocusEndTime) {
      const endTime = new Date(savedFocusEndTime);
      if (endTime > new Date()) {
        setFocusMode(savedFocusMode);
        setFocusEndTime(endTime);
      } else {
        // Focus mode expired
        localStorage.removeItem('tribewellmd_focus_mode');
        localStorage.removeItem('tribewellmd_focus_end_time');
      }
    }

    // Load saved study buddy messages
    const savedStudyMessages = localStorage.getItem('tribewellmd_study_buddy_messages');
    if (savedStudyMessages) {
      try {
        setStudyMessages(JSON.parse(savedStudyMessages));
      } catch {
        // Initialize with welcome message
        initializeStudyBuddy();
      }
    } else {
      initializeStudyBuddy();
    }
  }, []);

  const initializeStudyBuddy = () => {
    const welcomeMessage: StudyBuddyMessage = {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your Study Buddy, here to help you master medical concepts. I can explain topics, quiz you, provide mnemonics, and help you prepare for exams like USMLE Step 1. What would you like to study today?",
      timestamp: new Date().toISOString(),
    };
    setStudyMessages([welcomeMessage]);
    localStorage.setItem('tribewellmd_study_buddy_messages', JSON.stringify([welcomeMessage]));
  };

  // Check focus mode expiry
  useEffect(() => {
    if (!focusEndTime) return;

    const checkExpiry = setInterval(() => {
      if (focusEndTime && new Date() >= focusEndTime) {
        setFocusMode('off');
        setFocusEndTime(null);
        localStorage.removeItem('tribewellmd_focus_mode');
        localStorage.removeItem('tribewellmd_focus_end_time');
      }
    }, 1000);

    return () => clearInterval(checkExpiry);
  }, [focusEndTime]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Scroll to bottom when study messages change
  useEffect(() => {
    studyMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [studyMessages]);

  // Focus input when conversation opens
  useEffect(() => {
    if (selectedConversation && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedConversation]);

  // Focus study input when tab switches
  useEffect(() => {
    if (activeTab === 'studybuddy' && studyInputRef.current && isOpen) {
      studyInputRef.current.focus();
    }
  }, [activeTab, isOpen]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        panelRef.current &&
        bubbleRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !bubbleRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowFocusMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close focus menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        showFocusMenu &&
        focusMenuRef.current &&
        !focusMenuRef.current.contains(event.target as Node)
      ) {
        setShowFocusMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFocusMenu]);

  const handleSetFocusMode = (modeId: string) => {
    setFocusMode(modeId);
    setShowFocusMenu(false);

    if (modeId === 'off') {
      setFocusEndTime(null);
      localStorage.removeItem('tribewellmd_focus_mode');
      localStorage.removeItem('tribewellmd_focus_end_time');
      return;
    }

    let endTime: Date;
    const now = new Date();

    switch (modeId) {
      case '30min':
        endTime = new Date(now.getTime() + 30 * 60 * 1000);
        break;
      case '1hr':
        endTime = new Date(now.getTime() + 60 * 60 * 1000);
        break;
      case '2hr':
        endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        break;
      case 'until-tomorrow':
        endTime = new Date(now);
        endTime.setDate(endTime.getDate() + 1);
        endTime.setHours(8, 0, 0, 0);
        break;
      case 'focus':
        // Focus mode doesn't have an end time - user manually turns it off
        endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default 24 hours
        break;
      default:
        endTime = new Date(now.getTime() + 60 * 60 * 1000);
    }

    setFocusEndTime(endTime);
    localStorage.setItem('tribewellmd_focus_mode', modeId);
    localStorage.setItem('tribewellmd_focus_end_time', endTime.toISOString());
  };

  const getRemainingTime = (): string => {
    if (!focusEndTime) return '';

    const now = new Date();
    const diff = focusEndTime.getTime() - now.getTime();

    if (diff <= 0) return '';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const isInFocusMode = focusMode !== 'off';

  const openConversation = useCallback((convo: Conversation) => {
    setSelectedConversation(convo);
    setMessages(getMessages(convo.id));
    markConversationRead(convo.id);

    // Update local state
    setConversations(prev =>
      prev.map(c => c.id === convo.id ? { ...c, unreadCount: 0 } : c)
    );
    setUnreadCount(prev => Math.max(0, prev - convo.unreadCount));
  }, []);

  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message = sendMessage(selectedConversation.id, newMessage.trim());
    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Update conversation list
    setConversations(prev =>
      prev.map(c =>
        c.id === selectedConversation.id
          ? { ...c, lastMessage: message, updatedAt: message.timestamp }
          : c
      ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    );

    // Simulate typing response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      // In real app, this would be a websocket message
    }, 2000);
  }, [newMessage, selectedConversation]);

  // Handle Study Buddy message send
  const handleSendStudyMessage = useCallback(() => {
    if (!studyInput.trim()) return;

    const userMessage: StudyBuddyMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: studyInput.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...studyMessages, userMessage];
    setStudyMessages(updatedMessages);
    setStudyInput('');
    setIsStudyBuddyTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: StudyBuddyMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: getStudyBuddyResponse(userMessage.content),
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, aiResponse];
      setStudyMessages(finalMessages);
      setIsStudyBuddyTyping(false);

      // Save to localStorage
      localStorage.setItem('tribewellmd_study_buddy_messages', JSON.stringify(finalMessages));
    }, 1000 + Math.random() * 1000);
  }, [studyInput, studyMessages]);

  // Handle topic quick select
  const handleTopicSelect = (topic: typeof STUDY_TOPICS[0]) => {
    const message = `I'd like to study ${topic.name}. Can you help me understand the key concepts?`;
    setStudyInput(message);
    studyInputRef.current?.focus();
  };

  // Clear study buddy chat
  const handleClearStudyChat = () => {
    initializeStudyBuddy();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStudyKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendStudyMessage();
    }
  };

  const getParticipantName = (convo: Conversation): string => {
    const otherParticipant = convo.participants.find(p => p !== 'current-user');
    return otherParticipant ? convo.participantNames[otherParticipant] : 'Unknown';
  };

  const getParticipantInfo = (convo: Conversation) => {
    const otherParticipant = convo.participants.find(p => p !== 'current-user');
    if (otherParticipant) {
      const demoUser = getDemoUser(otherParticipant);
      if (demoUser) {
        return demoUser;
      }
    }
    return null;
  };

  return (
    <>
      {/* Chat Bubble Button */}
      <button
        ref={bubbleRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center group ${
          isInFocusMode
            ? 'bg-gradient-to-br from-slate-500 via-slate-600 to-slate-700 shadow-slate-500/30 hover:shadow-slate-500/50'
            : activeTab === 'studybuddy'
            ? 'bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 shadow-purple-500/30 hover:shadow-purple-500/50'
            : 'bg-gradient-to-br from-tribe-sage-500 via-cyan-500 to-indigo-500 shadow-tribe-sage-500/30 hover:shadow-tribe-sage-500/50'
        }`}
        aria-label="Open chat"
      >
        {/* Icon */}
        {isInFocusMode && !isOpen ? (
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        ) : activeTab === 'studybuddy' && !isOpen ? (
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        ) : (
          <svg
            className={`w-6 h-6 text-white transition-transform duration-300 ${isOpen ? 'scale-0' : 'scale-100'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}

        {/* Close icon when open */}
        <svg
          className={`w-6 h-6 text-white absolute transition-transform duration-300 ${isOpen ? 'scale-100 rotate-0' : 'scale-0 rotate-90'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>

        {/* Unread Badge - only show if not in focus mode */}
        {unreadCount > 0 && !isOpen && !isInFocusMode && activeTab === 'messages' && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}

        {/* Focus mode indicator */}
        {isInFocusMode && !isOpen && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-slate-700 border-2 border-slate-500 text-white text-xs rounded-full flex items-center justify-center">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </span>
        )}

        {/* Pulse animation - only when not in focus mode */}
        {unreadCount > 0 && !isOpen && !isInFocusMode && activeTab === 'messages' && (
          <span className="absolute inset-0 rounded-full bg-teal-400 animate-ping opacity-25" />
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="fixed bottom-24 right-4 left-4 sm:left-auto sm:right-6 z-50 sm:w-96 h-[32rem] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-300"
        >
          {/* Tab Switcher */}
          <div className="flex border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => { setActiveTab('messages'); setSelectedConversation(null); }}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors relative ${
                activeTab === 'messages'
                  ? 'text-tribe-sage-600 dark:text-tribe-sage-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Messages
                {unreadCount > 0 && (
                  <span className="w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              {activeTab === 'messages' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-tribe-sage-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('studybuddy')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors relative ${
                activeTab === 'studybuddy'
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Study Buddy
              </div>
              {activeTab === 'studybuddy' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
              )}
            </button>
          </div>

          {/* Messages Tab Content */}
          {activeTab === 'messages' && (
            <>
              {selectedConversation ? (
                // Conversation View
                <>
                  {/* Conversation Header */}
                  <div className={`flex items-center gap-3 p-4 ${isInFocusMode ? 'bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800' : 'bg-gradient-to-r from-tribe-sage-500 via-cyan-500 to-indigo-500'}`}>
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    <div className="flex items-center gap-3 flex-1">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                          {(() => {
                            const info = getParticipantInfo(selectedConversation);
                            if (info) {
                              return getInitials(info.firstName, info.lastName);
                            }
                            return '?';
                          })()}
                        </div>
                        {/* Online indicator */}
                        {getParticipantInfo(selectedConversation)?.isOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
                        )}
                      </div>

                      <div>
                        <h3 className="font-semibold text-white">
                          {getParticipantName(selectedConversation)}
                        </h3>
                        <p className="text-xs text-white/80">
                          {getParticipantInfo(selectedConversation)?.currentYear} • {getParticipantInfo(selectedConversation)?.school}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-800/50">
                    {messages.map((msg) => {
                      const isMe = msg.senderId === 'current-user';
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                              isMe
                                ? 'bg-gradient-to-r from-tribe-sage-500 to-cyan-500 text-white rounded-br-md'
                                : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm rounded-bl-md'
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            <p className={`text-xs mt-1 ${isMe ? 'text-white/70' : 'text-slate-400'}`}>
                              {formatMessageTime(msg.timestamp)}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {/* Typing indicator */}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-white dark:bg-slate-700 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-full text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-tribe-sage-500/50"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="w-10 h-10 rounded-full bg-gradient-to-r from-tribe-sage-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-tribe-sage-500/25 hover:shadow-tribe-sage-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                // Conversations List
                <>
                  {/* Header */}
                  <div className={`p-4 ${isInFocusMode ? 'bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800' : 'bg-gradient-to-r from-tribe-sage-500 via-cyan-500 to-indigo-500'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-white">Messages</h2>
                        <p className="text-sm text-white/80">Connect with your tribe</p>
                      </div>

                      {/* Focus Mode Button */}
                      <div className="relative" ref={focusMenuRef}>
                        <button
                          onClick={() => setShowFocusMenu(!showFocusMenu)}
                          className={`p-2 rounded-lg transition-colors ${
                            isInFocusMode
                              ? 'bg-white/30 text-white'
                              : 'bg-white/20 hover:bg-white/30 text-white'
                          }`}
                          title={isInFocusMode ? `Focus mode: ${getRemainingTime()} remaining` : 'Set focus mode'}
                        >
                          {isInFocusMode ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                          )}
                        </button>

                        {/* Focus Mode Dropdown */}
                        {showFocusMenu && (
                          <div className="absolute top-full right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                            <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Focus Mode</h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400">Silence notifications</p>
                            </div>
                            <div className="p-2">
                              {FOCUS_MODES.map((mode) => (
                                <button
                                  key={mode.id}
                                  onClick={() => handleSetFocusMode(mode.id)}
                                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                                    focusMode === mode.id
                                      ? 'bg-tribe-sage-50 dark:bg-tribe-sage-900/30 text-tribe-sage-700 dark:text-tribe-sage-300'
                                      : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  <span className="text-lg">{mode.icon}</span>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{mode.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{mode.description}</p>
                                  </div>
                                  {focusMode === mode.id && (
                                    <svg className="w-5 h-5 text-tribe-sage-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </button>
                              ))}
                            </div>
                            {isInFocusMode && focusEndTime && (
                              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-100 dark:border-slate-700">
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                  <span className="font-medium">Time remaining:</span> {getRemainingTime()}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Focus Mode Banner */}
                    {isInFocusMode && (
                      <div className="mt-3 px-3 py-2 bg-white/10 rounded-lg flex items-center gap-2">
                        <svg className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                        <span className="text-sm text-white/90">
                          Focus mode active {focusEndTime && `• ${getRemainingTime()} left`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Search */}
                  <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search conversations..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-tribe-sage-500/50"
                      />
                    </div>
                  </div>

                  {/* Conversation List */}
                  <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center p-6">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <h3 className="font-medium text-slate-900 dark:text-white mb-1">No messages yet</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Start a conversation with a fellow student!</p>
                      </div>
                    ) : (
                      conversations.map((convo) => {
                        const participantInfo = getParticipantInfo(convo);
                        return (
                          <button
                            key={convo.id}
                            onClick={() => openConversation(convo)}
                            className="w-full p-4 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800"
                          >
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 via-cyan-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                                {participantInfo ? getInitials(participantInfo.firstName, participantInfo.lastName) : '?'}
                              </div>
                              {participantInfo?.isOnline && (
                                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-tribe-sage-500 border-2 border-white dark:border-slate-900 rounded-full" />
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 text-left">
                              <div className="flex items-center justify-between gap-2">
                                <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                                  {getParticipantName(convo)}
                                </h3>
                                <span className="text-xs text-slate-400 flex-shrink-0">
                                  {convo.lastMessage ? formatMessageTime(convo.lastMessage.timestamp) : ''}
                                </span>
                              </div>

                              {participantInfo && (
                                <p className="text-xs text-tribe-sage-600 dark:text-tribe-sage-400 mb-1">
                                  {participantInfo.currentYear} • {participantInfo.specialty}
                                </p>
                              )}

                              <div className="flex items-center justify-between gap-2">
                                <p className={`text-sm truncate ${convo.unreadCount > 0 && !isInFocusMode ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                                  {convo.lastMessage?.senderId === 'current-user' && (
                                    <span className="text-tribe-sage-500 mr-1">You:</span>
                                  )}
                                  {convo.lastMessage?.content || 'No messages yet'}
                                </p>

                                {convo.unreadCount > 0 && !isInFocusMode && (
                                  <span className="flex-shrink-0 w-5 h-5 bg-tribe-sage-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {convo.unreadCount}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* New Message Button */}
                  <div className="p-3 border-t border-slate-200 dark:border-slate-700">
                    <button className={`w-full py-2.5 font-medium rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                      isInFocusMode
                        ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-slate-500/25 hover:shadow-slate-500/40'
                        : 'bg-gradient-to-r from-tribe-sage-500 to-cyan-500 text-white shadow-tribe-sage-500/25 hover:shadow-tribe-sage-500/40'
                    }`}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      New Message
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* Study Buddy Tab Content */}
          {activeTab === 'studybuddy' && (
            <>
              {/* Study Buddy Header */}
              <div className="bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Study Buddy</h2>
                      <p className="text-sm text-white/80">Your AI medical tutor</p>
                    </div>
                  </div>
                  <button
                    onClick={handleClearStudyChat}
                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                    title="Clear chat"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Quick Topic Buttons */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {STUDY_TOPICS.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicSelect(topic)}
                      className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-full text-xs text-white font-medium transition-colors flex items-center gap-1"
                    >
                      <span>{topic.icon}</span>
                      {topic.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Study Buddy Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-800/50">
                {studyMessages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mr-2 flex-shrink-0">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                          isUser
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-br-md'
                            : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-xs mt-1 ${isUser ? 'text-white/70' : 'text-slate-400'}`}>
                          {formatMessageTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Study Buddy Typing indicator */}
                {isStudyBuddyTyping && (
                  <div className="flex justify-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mr-2 flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="bg-white dark:bg-slate-700 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={studyMessagesEndRef} />
              </div>

              {/* Study Buddy Input */}
              <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <input
                    ref={studyInputRef}
                    type="text"
                    value={studyInput}
                    onChange={(e) => setStudyInput(e.target.value)}
                    onKeyPress={handleStudyKeyPress}
                    placeholder="Ask Study Buddy anything..."
                    className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-full text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                  <button
                    onClick={handleSendStudyMessage}
                    disabled={!studyInput.trim() || isStudyBuddyTyping}
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
