'use client';

import { useMemo } from 'react';
import {
  CalendarEvent,
  getMonthDays,
  getEventsForDate,
  isToday,
  dateToString,
  getEventColor,
  formatEventTime,
} from '@/types/calendar';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function MonthView({ currentDate, events, onDateClick, onEventClick }: MonthViewProps) {
  const days = useMemo(() => {
    return getMonthDays(currentDate.getFullYear(), currentDate.getMonth());
  }, [currentDate]);

  const currentMonth = currentDate.getMonth();

  // Calculate number of rows needed (weeks displayed)
  const numRows = Math.ceil(days.length / 7);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Weekday headers - fixed */}
      <div className="flex-shrink-0 grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
        {WEEKDAYS.map(day => (
          <div
            key={day}
            className="py-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid - scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div
          className="grid grid-cols-7 h-full"
          style={{ gridTemplateRows: `repeat(${numRows}, minmax(80px, 1fr))` }}
        >
          {days.map((date, index) => {
            const dateStr = dateToString(date);
            const dayEvents = getEventsForDate(events, dateStr);
            const isCurrentMonth = date.getMonth() === currentMonth;
            const isTodayDate = isToday(date);

            return (
              <div
                key={index}
                onClick={() => onDateClick(date)}
                className={`
                  p-1 border-b border-r border-gray-100 dark:border-gray-800 overflow-hidden
                  cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors
                  ${!isCurrentMonth ? 'bg-gray-50/50 dark:bg-gray-900/50' : ''}
                `}
              >
                {/* Date number */}
                <div className="flex justify-between items-start mb-1">
                  <span
                    className={`
                      inline-flex items-center justify-center w-7 h-7 text-sm rounded-full flex-shrink-0
                      ${isTodayDate
                        ? 'bg-blue-600 text-white font-semibold'
                        : isCurrentMonth
                          ? 'text-gray-900 dark:text-gray-100'
                          : 'text-gray-400 dark:text-gray-600'
                      }
                    `}
                  >
                    {date.getDate()}
                  </span>
                  {dayEvents.length > 2 && (
                    <span className="text-xs text-gray-500 flex-shrink-0">+{dayEvents.length - 2}</span>
                  )}
                </div>

                {/* Events (show max 2) */}
                <div className="space-y-1 overflow-hidden">
                  {dayEvents.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      className="group px-1.5 py-0.5 rounded text-xs truncate cursor-pointer hover:opacity-80"
                      style={{ backgroundColor: `${getEventColor(event)}20`, color: getEventColor(event) }}
                    >
                      {!event.isAllDay && event.startTime && (
                        <span className="font-medium mr-1">
                          {event.startTime.split(':').slice(0, 2).join(':')}
                        </span>
                      )}
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
