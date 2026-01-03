'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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

// ============================================================================
// CHAT UI STYLE CONSTANTS
// Premium, calming messenger with strong readability in light/dark modes
// ============================================================================

const CHAT_STYLES = {
  // Message bubbles
  bubble: {
    // Outgoing (user) - dark bubble with white text for clear contrast
    outgoing: 'bg-[#5B7B6D] text-white',
    outgoingTimestamp: 'text-white/70',
    // Incoming - light surface with border for definition in light mode
    incoming: 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700',
    incomingTimestamp: 'text-slate-500 dark:text-slate-400',
    // Layout
    padding: 'px-4 py-3',
    maxWidth: 'max-w-[75%]',
    rounded: 'rounded-2xl',
    roundedOutgoing: 'rounded-br-md',
    roundedIncoming: 'rounded-bl-md',
  },
  // Typography - readable sizes with proper contrast
  text: {
    messageBody: 'text-base leading-relaxed', // 16px
    conversationPreview: 'text-sm leading-snug', // 14px
    conversationName: 'text-sm font-semibold', // 14px semibold
    timestamp: 'text-xs', // 12px
    smallMeta: 'text-xs text-slate-500 dark:text-slate-400', // 12px muted
  },
  // Conversation list
  conversation: {
    row: 'w-full px-4 py-3.5 flex items-start gap-3 transition-colors text-left',
    rowHover: 'hover:bg-slate-50 dark:hover:bg-slate-800/50',
    rowSelected: 'bg-slate-100 dark:bg-slate-800',
    avatar: 'w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold',
    avatarGradient: 'bg-gradient-to-br from-[#E8E0D5] to-[#D4C4B0] dark:from-slate-700 dark:to-slate-600 text-[#5B7B6D] dark:text-slate-200',
    unreadBadge: 'w-5 h-5 bg-[#5B7B6D] text-white text-[10px] font-bold rounded-full flex items-center justify-center',
    onlineIndicator: 'absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full',
  },
  // Composer/input
  input: {
    container: 'p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900',
    field: 'flex-1 min-h-[44px] px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5B7B6D]/50 focus:border-[#5B7B6D] transition-all',
    sendButton: 'w-11 h-11 rounded-xl bg-[#5B7B6D] flex items-center justify-center text-white hover:bg-[#4A6B5D] transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
  },
  // Search box
  search: {
    container: 'px-4 py-3 border-b border-slate-200 dark:border-slate-700',
    field: 'w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5B7B6D]/50 focus:border-[#5B7B6D] transition-all',
    icon: 'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400',
  },
  // Panel chrome - matches ToolPanel canonical style (Lab Reference as source of truth)
  panel: {
    container: 'fixed top-12 right-0 bottom-12 w-full sm:w-[380px] bg-surface border-l border-border shadow-2xl z-40 flex flex-col',
    header: 'flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-sand-50 to-blue-50 dark:from-sand-950/30 dark:to-blue-950/30',
    headerIconContainer: 'w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-sand-100 to-blue-100 dark:from-sand-900/50 dark:to-blue-900/50',
    headerTitle: 'text-sm font-bold text-secondary',
    headerSubtitle: 'text-[10px] text-content-muted',
  },
} as const;

// Focus mode options
const FOCUS_MODES = [
  { id: 'off', name: 'All notifications', description: 'Receive all messages' },
  { id: '30min', name: '30 minutes', description: 'Silent for 30 min' },
  { id: '1hr', name: '1 hour', description: 'Silent for 1 hour' },
  { id: '2hr', name: '2 hours', description: 'Silent for 2 hours' },
  { id: 'until-tomorrow', name: 'Until tomorrow', description: 'Silent until 8 AM' },
  { id: 'focus', name: 'Focus mode', description: 'Only urgent messages' },
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
  { id: 'anatomy', name: 'Anatomy' },
  { id: 'physiology', name: 'Physiology' },
  { id: 'pathology', name: 'Pathology' },
  { id: 'pharmacology', name: 'Pharmacology' },
  { id: 'biochemistry', name: 'Biochemistry' },
  { id: 'microbiology', name: 'Microbiology' },
];

// Simulated AI responses for Study Buddy
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

  for (const topic of STUDY_TOPICS) {
    if (lowerMessage.includes(topic.id) || lowerMessage.includes(topic.name.toLowerCase())) {
      const responses = STUDY_BUDDY_RESPONSES[topic.id];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }

  const defaultResponses = STUDY_BUDDY_RESPONSES.default;
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

type ChatTab = 'messages' | 'studybuddy';

interface MessengerPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MessengerPanel({ isOpen, onClose }: MessengerPanelProps) {
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const studyMessagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const studyInputRef = useRef<HTMLInputElement>(null);
  const focusMenuRef = useRef<HTMLDivElement>(null);

  // Handle Escape key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Load conversations, focus mode, and study buddy messages on mount
  useEffect(() => {
    setConversations(getConversations());
    setUnreadCount(getTotalUnreadCount());

    const savedFocusMode = localStorage.getItem('tribewellmd_focus_mode');
    const savedFocusEndTime = localStorage.getItem('tribewellmd_focus_end_time');

    if (savedFocusMode && savedFocusEndTime) {
      const endTime = new Date(savedFocusEndTime);
      if (endTime > new Date()) {
        setFocusMode(savedFocusMode);
        setFocusEndTime(endTime);
      } else {
        localStorage.removeItem('tribewellmd_focus_mode');
        localStorage.removeItem('tribewellmd_focus_end_time');
      }
    }

    const savedStudyMessages = localStorage.getItem('tribewellmd_study_buddy_messages');
    if (savedStudyMessages) {
      try {
        setStudyMessages(JSON.parse(savedStudyMessages));
      } catch {
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

  useEffect(() => {
    studyMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [studyMessages]);

  // Focus input when conversation opens
  useEffect(() => {
    if (selectedConversation && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (activeTab === 'studybuddy' && studyInputRef.current && isOpen) {
      studyInputRef.current.focus();
    }
  }, [activeTab, isOpen]);

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
        endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
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

    setConversations(prev =>
      prev.map(c =>
        c.id === selectedConversation.id
          ? { ...c, lastMessage: message, updatedAt: message.timestamp }
          : c
      ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    );

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  }, [newMessage, selectedConversation]);

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

      localStorage.setItem('tribewellmd_study_buddy_messages', JSON.stringify(finalMessages));
    }, 1000 + Math.random() * 1000);
  }, [studyInput, studyMessages]);

  const handleTopicSelect = (topic: typeof STUDY_TOPICS[0]) => {
    const message = `I'd like to study ${topic.name}. Can you help me understand the key concepts?`;
    setStudyInput(message);
    studyInputRef.current?.focus();
  };

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
    <aside
      className={`${CHAT_STYLES.panel.container} transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header - Canonical ToolPanel style (Lab Reference as source of truth) */}
      <div className={CHAT_STYLES.panel.header}>
        <div className="flex items-center gap-3">
          <div className={CHAT_STYLES.panel.headerIconContainer}>
            <svg className="w-5 h-5 text-sand-600 dark:text-sand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h2 className={CHAT_STYLES.panel.headerTitle}>TribeWell Messages</h2>
            <p className={CHAT_STYLES.panel.headerSubtitle}>Connect with your tribe</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg transition-colors text-content-muted hover:text-secondary hover:bg-surface-muted"
          title="Close (Esc)"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tab Switcher - Clean, premium styling */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex gap-2">
          <button
            onClick={() => { setActiveTab('messages'); setSelectedConversation(null); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'messages'
                ? 'bg-[#5B7B6D] text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Messages
            {unreadCount > 0 && (
              <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('studybuddy')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'studybuddy'
                ? 'bg-[#5B7B6D] text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Study Buddy
          </button>

          {/* Focus Mode Button */}
          <div className="relative ml-auto" ref={focusMenuRef}>
            <button
              onClick={() => setShowFocusMenu(!showFocusMenu)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                isInFocusMode
                  ? 'bg-slate-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
              title={isInFocusMode ? `Focus mode: ${getRemainingTime()} remaining` : 'Set focus mode'}
            >
              {isInFocusMode ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              )}
              {isInFocusMode ? getRemainingTime() : 'Focus'}
            </button>

            {/* Focus Mode Dropdown */}
            {showFocusMenu && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                  <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Focus Mode</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Silence notifications</p>
                </div>
                <div className="p-2">
                  {FOCUS_MODES.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => handleSetFocusMode(mode.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors text-left ${
                        focusMode === mode.id
                          ? 'bg-[#5B7B6D]/10 text-[#5B7B6D] dark:text-[#7FA08F]'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{mode.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{mode.description}</p>
                      </div>
                      {focusMode === mode.id && (
                        <svg className="w-4 h-4 text-[#5B7B6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Tab Content */}
      {activeTab === 'messages' && (
        <>
          {selectedConversation ? (
            // Conversation View
            <>
              {/* Conversation Header */}
              <div className="sticky top-0 px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="flex items-center gap-3 flex-1">
                  <div className="relative">
                    <div className={`w-10 h-10 ${CHAT_STYLES.conversation.avatarGradient} rounded-full flex items-center justify-center`}>
                      {(() => {
                        const info = getParticipantInfo(selectedConversation);
                        if (info) {
                          return getInitials(info.firstName, info.lastName);
                        }
                        return '?';
                      })()}
                    </div>
                    {getParticipantInfo(selectedConversation)?.isOnline && (
                      <span className={CHAT_STYLES.conversation.onlineIndicator} />
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                      {getParticipantName(selectedConversation)}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {getParticipantInfo(selectedConversation)?.currentYear} • {getParticipantInfo(selectedConversation)?.school}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages - Independent scroll */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
                {messages.map((msg) => {
                  const isMe = msg.senderId === 'current-user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`${CHAT_STYLES.bubble.maxWidth} ${CHAT_STYLES.bubble.padding} ${CHAT_STYLES.bubble.rounded} ${
                          isMe
                            ? `${CHAT_STYLES.bubble.outgoing} ${CHAT_STYLES.bubble.roundedOutgoing}`
                            : `${CHAT_STYLES.bubble.incoming} ${CHAT_STYLES.bubble.roundedIncoming}`
                        }`}
                      >
                        <p className={CHAT_STYLES.text.messageBody}>{msg.content}</p>
                        <p className={`${CHAT_STYLES.text.timestamp} mt-1.5 ${isMe ? CHAT_STYLES.bubble.outgoingTimestamp : CHAT_STYLES.bubble.incomingTimestamp}`}>
                          {formatMessageTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className={`${CHAT_STYLES.bubble.incoming} ${CHAT_STYLES.bubble.padding} ${CHAT_STYLES.bubble.rounded} ${CHAT_STYLES.bubble.roundedIncoming}`}>
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Input - Enhanced composer */}
              <div className={CHAT_STYLES.input.container}>
                <div className="flex items-center gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className={CHAT_STYLES.input.field}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className={CHAT_STYLES.input.sendButton}
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
              {/* Search */}
              <div className={CHAT_STYLES.search.container}>
                <div className="relative">
                  <svg className={CHAT_STYLES.search.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    className={CHAT_STYLES.search.field}
                  />
                </div>
              </div>

              {/* Conversation List - Independent scroll */}
              <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900">
                {conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-1">No messages yet</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Start a conversation with a fellow student!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {conversations.map((convo) => {
                      const participantInfo = getParticipantInfo(convo);
                      return (
                        <button
                          key={convo.id}
                          onClick={() => openConversation(convo)}
                          className={`${CHAT_STYLES.conversation.row} ${CHAT_STYLES.conversation.rowHover}`}
                        >
                          <div className="relative flex-shrink-0">
                            <div className={`${CHAT_STYLES.conversation.avatar} ${CHAT_STYLES.conversation.avatarGradient}`}>
                              {participantInfo ? getInitials(participantInfo.firstName, participantInfo.lastName) : '?'}
                            </div>
                            {participantInfo?.isOnline && (
                              <span className={CHAT_STYLES.conversation.onlineIndicator} />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <h3 className={`${CHAT_STYLES.text.conversationName} text-slate-800 dark:text-white truncate`}>
                                {getParticipantName(convo)}
                              </h3>
                              <span className={`${CHAT_STYLES.text.timestamp} text-slate-400 flex-shrink-0`}>
                                {convo.lastMessage ? formatMessageTime(convo.lastMessage.timestamp) : ''}
                              </span>
                            </div>

                            {participantInfo && (
                              <p className="text-xs text-[#5B7B6D] dark:text-[#7FA08F] mb-1">
                                {participantInfo.currentYear} • {participantInfo.specialty}
                              </p>
                            )}

                            <div className="flex items-center justify-between gap-2">
                              <p className={`${CHAT_STYLES.text.conversationPreview} truncate ${convo.unreadCount > 0 && !isInFocusMode ? 'text-slate-800 dark:text-white font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                                {convo.lastMessage?.senderId === 'current-user' && (
                                  <span className="text-[#5B7B6D] mr-1">You:</span>
                                )}
                                {convo.lastMessage?.content || 'No messages yet'}
                              </p>

                              {convo.unreadCount > 0 && !isInFocusMode && (
                                <span className={CHAT_STYLES.conversation.unreadBadge}>
                                  {convo.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* Study Buddy Tab Content */}
      {activeTab === 'studybuddy' && (
        <>
          {/* Quick Topic Buttons */}
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap gap-2">
              {STUDY_TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => handleTopicSelect(topic)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-xs text-slate-600 dark:text-slate-300 font-medium transition-colors"
                >
                  {topic.name}
                </button>
              ))}
              <button
                onClick={handleClearStudyChat}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-xs text-slate-500 hover:text-red-600 font-medium transition-colors ml-auto"
                title="Clear chat"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Study Buddy Messages - Independent scroll */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
            {studyMessages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-[#5B7B6D] flex items-center justify-center mr-2 flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                  )}
                  <div
                    className={`${CHAT_STYLES.bubble.maxWidth} ${CHAT_STYLES.bubble.padding} ${CHAT_STYLES.bubble.rounded} ${
                      isUser
                        ? `${CHAT_STYLES.bubble.outgoing} ${CHAT_STYLES.bubble.roundedOutgoing}`
                        : `${CHAT_STYLES.bubble.incoming} ${CHAT_STYLES.bubble.roundedIncoming}`
                    }`}
                  >
                    <p className={`${CHAT_STYLES.text.messageBody} whitespace-pre-wrap`}>{msg.content}</p>
                    <p className={`${CHAT_STYLES.text.timestamp} mt-1.5 ${isUser ? CHAT_STYLES.bubble.outgoingTimestamp : CHAT_STYLES.bubble.incomingTimestamp}`}>
                      {formatMessageTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}

            {isStudyBuddyTyping && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-full bg-[#5B7B6D] flex items-center justify-center mr-2 flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className={`${CHAT_STYLES.bubble.incoming} ${CHAT_STYLES.bubble.padding} ${CHAT_STYLES.bubble.rounded} ${CHAT_STYLES.bubble.roundedIncoming}`}>
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={studyMessagesEndRef} />
          </div>

          {/* Study Buddy Input */}
          <div className={CHAT_STYLES.input.container}>
            <div className="flex items-center gap-3">
              <input
                ref={studyInputRef}
                type="text"
                value={studyInput}
                onChange={(e) => setStudyInput(e.target.value)}
                onKeyPress={handleStudyKeyPress}
                placeholder="Ask Study Buddy anything..."
                className={CHAT_STYLES.input.field}
              />
              <button
                onClick={handleSendStudyMessage}
                disabled={!studyInput.trim() || isStudyBuddyTyping}
                className={CHAT_STYLES.input.sendButton}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {activeTab === 'messages' ? `${conversations.length} conversation${conversations.length !== 1 ? 's' : ''}` : 'Study Buddy AI'}
        </p>
        <p className="text-xs text-slate-400">
          <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded font-mono text-[10px] text-slate-600 dark:text-slate-300">M</kbd> toggle
        </p>
      </div>
    </aside>
  );
}

// Keep ChatBubble as an alias for backwards compatibility, but it's now deprecated
export function ChatBubble() {
  console.warn('ChatBubble is deprecated. Use MessengerPanel with isOpen and onClose props instead.');
  return null;
}

export default MessengerPanel;
