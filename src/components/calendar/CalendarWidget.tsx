'use client';

import { useState, useEffect, useRef } from 'react';

// Types
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
  source: 'google' | 'outlook' | 'manual';
  description?: string;
  location?: string;
}

interface CalendarConnection {
  provider: 'google' | 'outlook';
  email: string;
  connected: boolean;
  connectedAt: string;
}

interface CalendarWidgetProps {
  variant?: 'compact' | 'full';
  onEventClick?: (event: CalendarEvent) => void;
}

// Demo events for visualization
const DEMO_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Anatomy Lab',
    start: new Date(new Date().setHours(9, 0, 0, 0)),
    end: new Date(new Date().setHours(11, 0, 0, 0)),
    color: 'bg-blue-500',
    source: 'google',
    location: 'Medical Building Room 301'
  },
  {
    id: '2',
    title: 'Pathology Lecture',
    start: new Date(new Date().setHours(13, 0, 0, 0)),
    end: new Date(new Date().setHours(14, 30, 0, 0)),
    color: 'bg-purple-500',
    source: 'outlook',
    location: 'Lecture Hall A'
  },
  {
    id: '3',
    title: 'Study Group - Cardiology',
    start: new Date(new Date().setHours(16, 0, 0, 0)),
    end: new Date(new Date().setHours(18, 0, 0, 0)),
    color: 'bg-tribe-sage-500',
    source: 'manual'
  },
  {
    id: '4',
    title: 'Clinical Skills Practice',
    start: new Date(new Date().setDate(new Date().getDate() + 1)),
    end: new Date(new Date().setDate(new Date().getDate() + 1)),
    color: 'bg-amber-500',
    source: 'google',
    location: 'Simulation Center'
  },
  {
    id: '5',
    title: 'Shelf Exam - Internal Medicine',
    start: new Date(new Date().setDate(new Date().getDate() + 3)),
    end: new Date(new Date().setDate(new Date().getDate() + 3)),
    color: 'bg-red-500',
    source: 'outlook',
    location: 'Testing Center'
  }
];

// Get connected calendars from localStorage
function getConnectedCalendars(): CalendarConnection[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('tribewellmd_calendar_connections');
  return stored ? JSON.parse(stored) : [];
}

// Save connected calendars
function saveConnectedCalendars(connections: CalendarConnection[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('tribewellmd_calendar_connections', JSON.stringify(connections));
  }
}

// Get calendar events from localStorage
function getCalendarEvents(): CalendarEvent[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('tribewellmd_calendar_events');
  if (stored) {
    const events = JSON.parse(stored);
    return events.map((e: CalendarEvent) => ({
      ...e,
      start: new Date(e.start),
      end: new Date(e.end)
    }));
  }
  return DEMO_EVENTS;
}

// Save calendar events
function saveCalendarEvents(events: CalendarEvent[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('tribewellmd_calendar_events', JSON.stringify(events));
  }
}

export function CalendarWidget({ variant = 'compact', onEventClick }: CalendarWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [connections, setConnections] = useState<CalendarConnection[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectingProvider, setConnectingProvider] = useState<'google' | 'outlook' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Load data on mount
  useEffect(() => {
    setConnections(getConnectedCalendars());
    setEvents(getCalendarEvents());
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Get today's events
  const todaysEvents = events.filter(event => {
    const eventDate = new Date(event.start);
    const today = new Date();
    return (
      eventDate.getDate() === today.getDate() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear()
    );
  }).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  // Get upcoming events (next 7 days)
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.start);
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return eventDate > today && eventDate <= nextWeek;
  }).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  // Simulate connecting a calendar
  const handleConnect = (provider: 'google' | 'outlook') => {
    setConnectingProvider(provider);

    // Simulate OAuth flow
    setTimeout(() => {
      const newConnection: CalendarConnection = {
        provider,
        email: provider === 'google' ? 'student@gmail.com' : 'student@outlook.com',
        connected: true,
        connectedAt: new Date().toISOString()
      };

      const updatedConnections = [...connections.filter(c => c.provider !== provider), newConnection];
      setConnections(updatedConnections);
      saveConnectedCalendars(updatedConnections);

      // Add demo events for this provider
      const newEvents = [...events, ...DEMO_EVENTS.filter(e => e.source === provider)];
      setEvents(newEvents);
      saveCalendarEvents(newEvents);

      setConnectingProvider(null);
      setShowConnectModal(false);
    }, 1500);
  };

  // Disconnect a calendar
  const handleDisconnect = (provider: 'google' | 'outlook') => {
    const updatedConnections = connections.filter(c => c.provider !== provider);
    setConnections(updatedConnections);
    saveConnectedCalendars(updatedConnections);

    // Remove events from this provider
    const updatedEvents = events.filter(e => e.source !== provider);
    setEvents(updatedEvents);
    saveCalendarEvents(updatedEvents);
  };

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const hasConnections = connections.length > 0;

  if (variant === 'compact') {
    return (
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
            isOpen || hasConnections
              ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          {hasConnections && todaysEvents.length > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            </span>
          )}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Calendar
          {todaysEvents.length > 0 && (
            <span className="px-1.5 py-0.5 text-xs font-medium bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 rounded-full">
              {todaysEvents.length}
            </span>
          )}
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
            <div
              ref={dropdownRef}
              className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl shadow-xl border z-[110] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-500 to-purple-500">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  My Calendar
                </h3>
                <p className="text-xs text-white/80 mt-0.5">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {/* Connected Calendars */}
              <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Connected Calendars</span>
                  <button
                    onClick={() => setShowConnectModal(true)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    + Add
                  </button>
                </div>

                {connections.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-2">
                    No calendars connected
                  </p>
                ) : (
                  <div className="flex gap-2">
                    {connections.map(conn => (
                      <div
                        key={conn.provider}
                        className="flex items-center gap-2 px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs"
                      >
                        {conn.provider === 'google' ? (
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#0078D4" d="M21.53 4.306v15.363q0 .807-.472 1.433-.472.627-1.253.85l-6.888 1.974q-.136.037-.29.055-.156.019-.293.019-.396 0-.72-.105-.321-.106-.656-.292l-4.505-2.544q-.248-.137-.391-.137-.248 0-.248.248v-1.805l6.697 3.764q.068.068.136.068.068 0 .136-.068l7.424-4.175V4.306q0-.068-.068-.136-.068-.068-.136-.068-.136 0-.272.068L12.97 7.934q-.068.068-.136.068-.068 0-.136-.068L6.8 4.17q-.136-.068-.272-.068-.068 0-.136.068-.068.068-.068.136v11.571l-1.805-1.016V4.306q0-.807.473-1.433.472-.627 1.252-.85L13.132.049q.136-.037.29-.055.155-.019.293-.019.396 0 .72.105.322.106.656.292l4.505 2.544q.248.137.391.137.248 0 .248-.248v1.805l-6.697-3.764q-.068-.068-.136-.068-.068 0-.136.068L5.842 5.04q-.068.068-.068.136 0 .068.068.136l5.898 3.764q.068.068.136.068.068 0 .136-.068l7.424-4.175v-.595z"/>
                          </svg>
                        )}
                        <span className="text-slate-700 dark:text-slate-300">{conn.provider === 'google' ? 'Google' : 'Outlook'}</span>
                        <button
                          onClick={() => handleDisconnect(conn.provider)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Today's Events */}
              <div className="p-3">
                <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Today&apos;s Schedule</h4>
                {todaysEvents.length === 0 ? (
                  <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-3">
                    No events scheduled for today
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {todaysEvents.map(event => (
                      <button
                        key={event.id}
                        onClick={() => onEventClick?.(event)}
                        className="w-full flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                      >
                        <div className={`w-1 h-full rounded-full ${event.color}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {event.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {formatTime(event.start)} - {formatTime(event.end)}
                          </p>
                          {event.location && (
                            <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                              📍 {event.location}
                            </p>
                          )}
                        </div>
                        <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${
                          event.source === 'google'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                            : event.source === 'outlook'
                            ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {event.source === 'google' ? 'G' : event.source === 'outlook' ? 'O' : 'M'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming Events */}
              {upcomingEvents.length > 0 && (
                <div className="p-3 border-t border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Coming Up</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {upcomingEvents.slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50"
                      >
                        <div className={`w-2 h-2 rounded-full ${event.color}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                            {event.title}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            {formatDate(event.start)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* View Full Calendar Link */}
              <div className="p-3 border-t border-slate-200 dark:border-slate-700">
                <a
                  href="/study/progress"
                  className="block w-full text-center text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View Full Calendar →
                </a>
              </div>
            </div>
          </>
        )}

        {/* Connect Modal */}
        {showConnectModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Connect Calendar</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Import your events from Google or Outlook
                </p>
              </div>

              <div className="p-6 space-y-4">
                {/* Google Calendar */}
                <button
                  onClick={() => handleConnect('google')}
                  disabled={connectingProvider !== null || connections.some(c => c.provider === 'google')}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    connections.some(c => c.provider === 'google')
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center">
                    {connectingProvider === 'google' ? (
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-slate-900 dark:text-white">Google Calendar</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {connections.some(c => c.provider === 'google') ? 'Connected' : 'Connect your Google account'}
                    </p>
                  </div>
                  {connections.some(c => c.provider === 'google') && (
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                {/* Outlook Calendar */}
                <button
                  onClick={() => handleConnect('outlook')}
                  disabled={connectingProvider !== null || connections.some(c => c.provider === 'outlook')}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    connections.some(c => c.provider === 'outlook')
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center">
                    {connectingProvider === 'outlook' ? (
                      <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path fill="#0078D4" d="M21.53 4.306v15.363q0 .807-.472 1.433-.472.627-1.253.85l-6.888 1.974q-.136.037-.29.055-.156.019-.293.019-.396 0-.72-.105-.321-.106-.656-.292l-4.505-2.544q-.248-.137-.391-.137-.248 0-.248.248v-1.805l6.697 3.764q.068.068.136.068.068 0 .136-.068l7.424-4.175V4.306q0-.068-.068-.136-.068-.068-.136-.068-.136 0-.272.068L12.97 7.934q-.068.068-.136.068-.068 0-.136-.068L6.8 4.17q-.136-.068-.272-.068-.068 0-.136.068-.068.068-.068.136v11.571l-1.805-1.016V4.306q0-.807.473-1.433.472-.627 1.252-.85L13.132.049q.136-.037.29-.055.155-.019.293-.019.396 0 .72.105.322.106.656.292l4.505 2.544q.248.137.391.137.248 0 .248-.248v1.805l-6.697-3.764q-.068-.068-.136-.068-.068 0-.136.068L5.842 5.04q-.068.068-.068.136 0 .068.068.136l5.898 3.764q.068.068.136.068.068 0 .136-.068l7.424-4.175v-.595z"/>
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-slate-900 dark:text-white">Outlook Calendar</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {connections.some(c => c.provider === 'outlook') ? 'Connected' : 'Connect your Microsoft account'}
                    </p>
                  </div>
                  {connections.some(c => c.provider === 'outlook') && (
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="w-full py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full variant - for dedicated calendar pages
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-500 to-purple-500">
        <h3 className="font-semibold text-white text-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          My Calendar
        </h3>
        <p className="text-sm text-white/80 mt-0.5">
          View and manage your medical school schedule
        </p>
      </div>

      <div className="p-6">
        {/* Connected Calendars */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-slate-900 dark:text-white">Connected Calendars</h4>
            <button
              onClick={() => setShowConnectModal(true)}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Calendar
            </button>
          </div>

          {connections.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
              <svg className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-slate-500 dark:text-slate-400 mb-2">No calendars connected</p>
              <button
                onClick={() => setShowConnectModal(true)}
                className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
              >
                Connect your first calendar
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {connections.map(conn => (
                <div
                  key={conn.provider}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg"
                >
                  {conn.provider === 'google' ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#0078D4" d="M21.53 4.306v15.363q0 .807-.472 1.433-.472.627-1.253.85l-6.888 1.974q-.136.037-.29.055-.156.019-.293.019-.396 0-.72-.105-.321-.106-.656-.292l-4.505-2.544q-.248-.137-.391-.137-.248 0-.248.248v-1.805l6.697 3.764q.068.068.136.068.068 0 .136-.068l7.424-4.175V4.306q0-.068-.068-.136-.068-.068-.136-.068-.136 0-.272.068L12.97 7.934q-.068.068-.136.068-.068 0-.136-.068L6.8 4.17q-.136-.068-.272-.068-.068 0-.136.068-.068.068-.068.136v11.571l-1.805-1.016V4.306q0-.807.473-1.433.472-.627 1.252-.85L13.132.049q.136-.037.29-.055.155-.019.293-.019.396 0 .72.105.322.106.656.292l4.505 2.544q.248.137.391.137.248 0 .248-.248v1.805l-6.697-3.764q-.068-.068-.136-.068-.068 0-.136.068L5.842 5.04q-.068.068-.068.136 0 .068.068.136l5.898 3.764q.068.068.136.068.068 0 .136-.068l7.424-4.175v-.595z"/>
                    </svg>
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {conn.provider === 'google' ? 'Google Calendar' : 'Outlook Calendar'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{conn.email}</p>
                  </div>
                  <button
                    onClick={() => handleDisconnect(conn.provider)}
                    className="ml-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's Events */}
        <div className="mb-6">
          <h4 className="font-medium text-slate-900 dark:text-white mb-3">Today&apos;s Schedule</h4>
          {todaysEvents.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-center py-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
              No events scheduled for today
            </p>
          ) : (
            <div className="space-y-2">
              {todaysEvents.map(event => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                  onClick={() => onEventClick?.(event)}
                >
                  <div className={`w-1.5 h-full min-h-[40px] rounded-full ${event.color}`} />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white">{event.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {formatTime(event.start)} - {formatTime(event.end)}
                    </p>
                    {event.location && (
                      <p className="text-sm text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div>
            <h4 className="font-medium text-slate-900 dark:text-white mb-3">Upcoming This Week</h4>
            <div className="space-y-2">
              {upcomingEvents.map(event => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50"
                >
                  <div className={`w-3 h-3 rounded-full ${event.color}`} />
                  <div className="flex-1">
                    <p className="font-medium text-slate-700 dark:text-slate-300">{event.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{formatDate(event.start)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
