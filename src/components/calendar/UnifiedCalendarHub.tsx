'use client';

import { useMemo } from 'react';
import { useCalendarHub } from '@/hooks/useCalendarHub';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { AgendaView } from './AgendaView';
import { EventModal } from './EventModal';
import { formatMonthYear, CalendarEvent, getEventColor, formatEventTime } from '@/types/calendar';
import Link from 'next/link';

export function UnifiedCalendarHub() {
  const {
    // State
    view,
    currentDate,
    events,
    isLoadingEvents,
    showEventModal,
    selectedDate,
    selectedTime,
    selectedEvent,

    // Setters
    setView,

    // Navigation
    goToToday,
    goToPrevious,
    goToNext,

    // Event handlers
    handleDateClick,
    handleTimeSlotClick,
    handleEventClick,
    handleCreateEvent,
    handleDeleteEvent,

    // Modal controls
    closeEventModal,
  } = useCalendarHub();

  // Day time slot click handler for DayView
  const handleDayTimeSlotClick = (time: string) => {
    handleTimeSlotClick(currentDate, time);
  };

  // Get today's and upcoming events (excluding tasks)
  const { todayEvents, upcomingEvents } = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const nonTaskEvents = events.filter(e => e.type !== 'task');

    const todayEvts = nonTaskEvents
      .filter(e => e.startDate === todayStr)
      .sort((a, b) => {
        if (!a.startTime) return -1;
        if (!b.startTime) return 1;
        return a.startTime.localeCompare(b.startTime);
      });

    const upcomingEvts = nonTaskEvents
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
      .slice(0, 5);

    return { todayEvents: todayEvts, upcomingEvents: upcomingEvts };
  }, [events]);

  const displayEvents = todayEvents.length > 0 ? todayEvents : upcomingEvents;
  const headerTitle = todayEvents.length > 0 ? 'Today' : 'Upcoming';

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      {/* Header - Navigation and View Switcher */}
      <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        {/* Left: Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            Today
          </button>
          <div className="flex items-center">
            <button
              onClick={goToPrevious}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Previous"
            >
              <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Next"
            >
              <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {formatMonthYear(currentDate)}
          </h2>
        </div>

        {/* Right: View Switcher + Create Button */}
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            {(['month', 'week', 'day', 'agenda'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`
                  px-4 py-1.5 text-sm font-medium rounded-md transition-colors capitalize
                  ${view === v
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }
                `}
              >
                {v}
              </button>
            ))}
          </div>
          <button
            onClick={() => handleDateClick(new Date())}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-tribe-sage-500 to-cyan-600 text-white rounded-lg hover:from-teal-600 hover:to-cyan-700 shadow-sm hover:shadow-md transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-medium text-sm">Create</span>
          </button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 min-h-0 overflow-hidden bg-white dark:bg-slate-800 m-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        {isLoadingEvents ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tribe-sage-600" />
          </div>
        ) : (
          <>
            {view === 'month' && (
              <MonthView
                currentDate={currentDate}
                events={events}
                onDateClick={handleDateClick}
                onEventClick={handleEventClick}
                onDeleteEvent={handleDeleteEvent}
              />
            )}
            {view === 'week' && (
              <WeekView
                currentDate={currentDate}
                events={events}
                onTimeSlotClick={handleTimeSlotClick}
                onEventClick={handleEventClick}
                onDeleteEvent={handleDeleteEvent}
              />
            )}
            {view === 'day' && (
              <DayView
                currentDate={currentDate}
                events={events}
                onTimeSlotClick={handleDayTimeSlotClick}
                onEventClick={handleEventClick}
                onDeleteEvent={handleDeleteEvent}
              />
            )}
            {view === 'agenda' && (
              <AgendaView
                events={events}
                onEventClick={handleEventClick}
                onDeleteEvent={handleDeleteEvent}
              />
            )}
          </>
        )}
      </div>

      {/* Events List - Below Calendar */}
      <div className="flex-shrink-0 mx-4 mb-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
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

        {/* Events List */}
        <div className="max-h-[150px] overflow-y-auto">
          {displayEvents.length === 0 ? (
            <div className="flex items-center justify-center py-6 px-4 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No upcoming events
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {displayEvents.map((event) => (
                <EventItem
                  key={event.id}
                  event={event}
                  showDate={todayEvents.length === 0}
                  onClick={() => handleEventClick(event)}
                  onDelete={() => handleDeleteEvent(event.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Event Modal */}
      <EventModal
        isOpen={showEventModal}
        onClose={closeEventModal}
        onSave={handleCreateEvent}
        onDelete={async (eventId) => {
          await handleDeleteEvent(eventId);
        }}
        initialDate={selectedDate}
        initialTime={selectedTime}
        existingEvent={selectedEvent}
      />
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
  const canDelete = !isGroupSession;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete();
  };

  const content = (
    <div
      className="group px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer flex items-center gap-3"
      onClick={isGroupSession ? undefined : onClick}
    >
      {/* Color indicator */}
      <div
        className="w-1 h-10 rounded-full flex-shrink-0"
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

      {/* Delete button */}
      {canDelete && (
        <button
          onClick={handleDelete}
          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all flex-shrink-0"
          title="Delete event"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}

      {/* Arrow for group sessions */}
      {isGroupSession && (
        <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </div>
  );

  if (isGroupSession && event.linkedRoomId) {
    return (
      <Link href={`/progress/rooms/${event.linkedRoomId}`}>
        {content}
      </Link>
    );
  }

  return content;
}
