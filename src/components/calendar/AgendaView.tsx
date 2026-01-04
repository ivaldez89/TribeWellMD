'use client';

import { useMemo } from 'react';
import {
  CalendarEvent,
  getEventColor,
  formatEventTime,
  dateToString,
} from '@/types/calendar';

interface AgendaViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
}

interface GroupedEvents {
  date: string;
  dateDisplay: string;
  isToday: boolean;
  isTomorrow: boolean;
  events: CalendarEvent[];
}

export function AgendaView({ events, onEventClick, onDeleteEvent }: AgendaViewProps) {
  const groupedEvents = useMemo(() => {
    const today = dateToString(new Date());
    const tomorrow = dateToString(new Date(Date.now() + 86400000));

    // Sort events by date
    const sorted = [...events].sort((a, b) => {
      const dateCompare = a.startDate.localeCompare(b.startDate);
      if (dateCompare !== 0) return dateCompare;
      if (!a.startTime) return -1;
      if (!b.startTime) return 1;
      return a.startTime.localeCompare(b.startTime);
    });

    // Group by date
    const groups: Record<string, CalendarEvent[]> = {};
    sorted.forEach(event => {
      if (!groups[event.startDate]) {
        groups[event.startDate] = [];
      }
      groups[event.startDate].push(event);
    });

    // Convert to array with display info
    return Object.entries(groups).map(([date, dateEvents]): GroupedEvents => {
      const dateObj = new Date(date + 'T00:00:00');
      return {
        date,
        dateDisplay: dateObj.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        }),
        isToday: date === today,
        isTomorrow: date === tomorrow,
        events: dateEvents,
      };
    });
  }, [events]);

  if (groupedEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-lg font-medium">No upcoming events</p>
        <p className="text-sm">Create an event to get started</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto p-4 space-y-6">
        {groupedEvents.map(group => (
          <div key={group.date}>
            {/* Date header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 py-2 z-10">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                {group.isToday && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    Today
                  </span>
                )}
                {group.isTomorrow && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    Tomorrow
                  </span>
                )}
                {group.dateDisplay}
              </h3>
            </div>

            {/* Events for this date */}
            <div className="space-y-2 mt-2">
              {group.events.map(event => {
                const canDelete = event.type !== 'task' && event.type !== 'study-room' && !event.linkedRoomId;
                return (
                  <div
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="group flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    {/* Time or all-day indicator */}
                    <div className="w-20 flex-shrink-0 text-right">
                      {event.isAllDay || !event.startTime ? (
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          All day
                        </span>
                      ) : (
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {formatTime12h(event.startTime)}
                          </div>
                          {event.endTime && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTime12h(event.endTime)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Color bar */}
                    <div
                      className="w-1 self-stretch rounded-full flex-shrink-0"
                      style={{ backgroundColor: getEventColor(event) }}
                    />

                    {/* Event content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {event.title}
                        </h4>
                        <EventTypeBadge type={event.type} />
                      </div>

                      {event.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      {/* Additional info */}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {event.category && (
                          <span className="flex items-center gap-1">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: getEventColor(event) }}
                            />
                            {event.category}
                          </span>
                        )}
                        {event.linkedRoomId && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Pocket Time
                          </span>
                        )}
                        {event.participants && event.participants.length > 0 && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            {event.participants.length} participants
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Delete button or Arrow */}
                    {canDelete && onDeleteEvent ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteEvent(event.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all flex-shrink-0"
                        title="Delete event"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    ) : (
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatTime12h(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

function EventTypeBadge({ type }: { type: CalendarEvent['type'] }) {
  const badges: Record<string, { label: string; className: string }> = {
    'task': {
      label: 'Task',
      className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    },
    'study-session': {
      label: 'Study',
      className: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    },
    'study-room': {
      label: 'Room',
      className: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    },
    'wellness': {
      label: 'Wellness',
      className: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    },
    'external': {
      label: 'External',
      className: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
    },
  };

  const badge = badges[type];
  if (!badge) return null;

  return (
    <span className={`px-1.5 py-0.5 text-xs rounded ${badge.className}`}>
      {badge.label}
    </span>
  );
}
