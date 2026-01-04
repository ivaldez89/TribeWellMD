'use client';

import { useMemo } from 'react';
import {
  CalendarEvent,
  getEventsForDate,
  isToday,
  dateToString,
  getEventColor,
  generateTimeSlots,
  formatEventTime,
} from '@/types/calendar';

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onTimeSlotClick: (time: string) => void;
  onEventClick: (event: CalendarEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
}

export function DayView({ currentDate, events, onTimeSlotClick, onEventClick, onDeleteEvent }: DayViewProps) {
  const timeSlots = useMemo(() => generateTimeSlots(6, 22), []);
  const dateStr = dateToString(currentDate);
  const dayEvents = useMemo(() => getEventsForDate(events, dateStr), [events, dateStr]);
  const isTodayDate = isToday(currentDate);

  const allDayEvents = dayEvents.filter(e => e.isAllDay || !e.startTime);
  const timedEvents = dayEvents.filter(e => !e.isAllDay && e.startTime);

  // Get events for a specific hour
  const getEventsAtHour = (hour: number): CalendarEvent[] => {
    return timedEvents.filter(event => {
      const eventHour = parseInt(event.startTime!.split(':')[0]);
      return eventHour === hour;
    });
  };

  // Calculate event duration in hours (for height)
  const getEventDuration = (event: CalendarEvent): number => {
    if (!event.startTime || !event.endTime) return 1;
    const startHour = parseInt(event.startTime.split(':')[0]);
    const endHour = parseInt(event.endTime.split(':')[0]);
    return Math.max(1, endHour - startHour);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Day header */}
      <div
        className={`
          p-4 border-b border-gray-200 dark:border-gray-700 text-center
          ${isTodayDate ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
        `}
      >
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
        </div>
        <div
          className={`
            text-3xl font-bold
            ${isTodayDate ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}
          `}
        >
          {currentDate.getDate()}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* All-day events */}
      {allDayEvents.length > 0 && (
        <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">All day</div>
          <div className="space-y-1">
            {allDayEvents.map(event => {
              const canDelete = event.type !== 'task' && event.type !== 'study-room' && !event.linkedRoomId;
              return (
                <div
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className="group px-3 py-2 rounded-lg cursor-pointer hover:opacity-80 flex items-center gap-2"
                  style={{ backgroundColor: `${getEventColor(event)}20` }}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getEventColor(event) }}
                  />
                  <span className="font-medium flex-1" style={{ color: getEventColor(event) }}>
                    {event.title}
                  </span>
                  {event.type === 'task' && (
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      Task
                    </span>
                  )}
                  {event.type === 'study-room' && (
                    <span className="text-xs px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                      Pocket Time
                    </span>
                  )}
                  {canDelete && onDeleteEvent && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteEvent(event.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all flex-shrink-0"
                      title="Delete event"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex">
          {/* Time labels */}
          <div className="w-20 flex-shrink-0">
            {timeSlots.map((time, index) => (
              <div
                key={time}
                className="h-16 text-sm text-gray-500 dark:text-gray-400 text-right pr-3 -mt-2"
              >
                {index > 0 ? formatTimeLabel(time) : ''}
              </div>
            ))}
          </div>

          {/* Events column */}
          <div className="flex-1 border-l border-gray-200 dark:border-gray-700">
            {timeSlots.map((time) => {
              const hour = parseInt(time.split(':')[0]);
              const hourEvents = getEventsAtHour(hour);

              return (
                <div
                  key={time}
                  onClick={() => onTimeSlotClick(time)}
                  className="h-16 border-b border-gray-100 dark:border-gray-800 relative cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30 px-2"
                >
                  {hourEvents.map((event, eventIndex) => {
                    const duration = getEventDuration(event);
                    const canDelete = event.type !== 'task' && event.type !== 'study-room' && !event.linkedRoomId;
                    return (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                        className="group absolute left-2 right-2 px-3 py-2 rounded-lg cursor-pointer hover:opacity-90 z-10 overflow-hidden"
                        style={{
                          backgroundColor: `${getEventColor(event)}15`,
                          borderLeft: `3px solid ${getEventColor(event)}`,
                          top: '2px',
                          height: `${duration * 64 - 4}px`,
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm" style={{ color: getEventColor(event) }}>
                              {event.title}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {formatEventTime(event)}
                            </div>
                          </div>
                          {canDelete && onDeleteEvent && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteEvent(event.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all flex-shrink-0"
                              title="Delete event"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                        {event.description && duration > 1 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {event.description}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTimeLabel(time: string): string {
  const hour = parseInt(time.split(':')[0]);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour} ${period}`;
}
