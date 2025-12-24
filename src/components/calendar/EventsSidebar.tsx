'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { CalendarEvent, formatEventTime, getEventColor } from '@/types/calendar';

interface EventsSidebarProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDeleteEvent: (eventId: string) => void;
}

export function EventsSidebar({ events, onEventClick, onDeleteEvent }: EventsSidebarProps) {
  const today = new Date().toISOString().split('T')[0];

  // Get today's events and upcoming events
  const { todayEvents, upcomingEvents } = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const todayEvts = events
      .filter(e => e.startDate === todayStr)
      .sort((a, b) => {
        if (!a.startTime) return -1;
        if (!b.startTime) return 1;
        return a.startTime.localeCompare(b.startTime);
      });

    // Get upcoming events (next 7 days, excluding today)
    const upcomingEvts = events
      .filter(e => {
        const eventDate = new Date(e.startDate);
        const diffDays = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays <= 7;
      })
      .sort((a, b) => {
        if (a.startDate !== b.startDate) {
          return a.startDate.localeCompare(b.startDate);
        }
        if (!a.startTime) return -1;
        if (!b.startTime) return 1;
        return a.startTime.localeCompare(b.startTime);
      })
      .slice(0, 5); // Limit to 5 upcoming events

    return { todayEvents: todayEvts, upcomingEvents: upcomingEvts };
  }, [events]);

  const displayEvents = todayEvents.length > 0 ? todayEvents : upcomingEvents;
  const headerTitle = todayEvents.length > 0 ? 'Today' : 'Upcoming';

  return (
    <div className="flex-1 flex flex-col border-t border-slate-200 dark:border-slate-700 overflow-hidden min-h-0 max-h-[50%]">
      {/* Header - fixed, non-scrolling */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Events
        </h2>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
          {headerTitle}
        </span>
      </div>

      {/* Events List - scrollable area */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {displayEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="w-10 h-10 mb-3 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No upcoming events
            </p>
          </div>
        ) : (
          <div className="py-2">
            {displayEvents.map((event) => (
              <EventItem
                key={event.id}
                event={event}
                showDate={todayEvents.length === 0}
                onClick={() => onEventClick(event)}
                onDelete={() => onDeleteEvent(event.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Individual Event Item
function EventItem({
  event,
  showDate,
  onClick,
  onDelete,
}: {
  event: CalendarEvent;
  showDate: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  const color = getEventColor(event);
  const isGroupSession = event.type === 'study-room' || event.linkedRoomId;
  const isTask = event.type === 'task';
  const canDelete = !isTask && !isGroupSession; // Can't delete tasks or study rooms from here

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm('Delete this event?')) {
      onDelete();
    }
  };

  const content = (
    <div
      className={`
        group px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer
      `}
      onClick={isGroupSession ? undefined : onClick}
    >
      <div className="flex items-start gap-3">
        {/* Color indicator */}
        <div
          className="w-1 h-full min-h-[2.5rem] rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
              {event.title}
            </p>
            {isGroupSession && (
              <span className="flex-shrink-0 text-xs px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded">
                Group
              </span>
            )}
            {isTask && (
              <span className="flex-shrink-0 text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                Task
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {formatEventTime(event)}
            </span>
            {showDate && (
              <span className="text-xs text-slate-400 dark:text-slate-500">
                • {formatDate(event.startDate)}
              </span>
            )}
          </div>
        </div>

        {/* Delete button for regular events */}
        {canDelete && (
          <button
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded transition-all flex-shrink-0"
            title="Delete event"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Arrow for group sessions */}
        {isGroupSession && (
          <svg className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
    </div>
  );

  // If it's a group session, wrap in a Link to the study room
  if (isGroupSession && event.linkedRoomId) {
    return (
      <Link href={`/progress/rooms/${event.linkedRoomId}`}>
        {content}
      </Link>
    );
  }

  return content;
}
