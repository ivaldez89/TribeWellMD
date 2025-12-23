'use client';

import { useMemo } from 'react';
import {
  CalendarEvent,
  getWeekDays,
  getEventsForDate,
  isToday,
  dateToString,
  getEventColor,
  generateTimeSlots,
  formatDateHeader,
} from '@/types/calendar';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onTimeSlotClick: (date: Date, time: string) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export function WeekView({ currentDate, events, onTimeSlotClick, onEventClick }: WeekViewProps) {
  const days = useMemo(() => getWeekDays(currentDate), [currentDate]);
  const timeSlots = useMemo(() => generateTimeSlots(6, 22), []);

  // Get events positioned by time
  const getEventsAtTime = (date: Date, hour: number): CalendarEvent[] => {
    const dateStr = dateToString(date);
    const dayEvents = getEventsForDate(events, dateStr);

    return dayEvents.filter(event => {
      if (event.isAllDay) return false;
      if (!event.startTime) return false;
      const eventHour = parseInt(event.startTime.split(':')[0]);
      return eventHour === hour;
    });
  };

  // Get all-day events for a date
  const getAllDayEvents = (date: Date): CalendarEvent[] => {
    const dateStr = dateToString(date);
    return getEventsForDate(events, dateStr).filter(e => e.isAllDay || !e.startTime);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header with days */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {/* Time column spacer */}
        <div className="w-16 flex-shrink-0" />

        {/* Day headers */}
        <div className="flex-1 grid grid-cols-7">
          {days.map((date, index) => {
            const isTodayDate = isToday(date);
            return (
              <div
                key={index}
                className={`
                  py-2 px-1 text-center border-l border-gray-100 dark:border-gray-800
                  ${isTodayDate ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                `}
              >
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]}
                </div>
                <div
                  className={`
                    text-lg font-semibold
                    ${isTodayDate ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}
                  `}
                >
                  {date.getDate()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* All-day events row */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 min-h-[40px]">
        <div className="w-16 flex-shrink-0 text-xs text-gray-500 dark:text-gray-400 p-1">
          All day
        </div>
        <div className="flex-1 grid grid-cols-7">
          {days.map((date, index) => {
            const allDayEvents = getAllDayEvents(date);
            return (
              <div
                key={index}
                className="border-l border-gray-100 dark:border-gray-800 p-0.5 space-y-0.5"
              >
                {allDayEvents.slice(0, 2).map(event => (
                  <div
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="px-1 py-0.5 text-xs rounded truncate cursor-pointer hover:opacity-80"
                    style={{ backgroundColor: `${getEventColor(event)}20`, color: getEventColor(event) }}
                  >
                    {event.title}
                  </div>
                ))}
                {allDayEvents.length > 2 && (
                  <div className="text-xs text-gray-500 px-1">+{allDayEvents.length - 2}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex">
          {/* Time labels */}
          <div className="w-16 flex-shrink-0">
            {timeSlots.map((time, index) => (
              <div
                key={time}
                className="h-12 text-xs text-gray-500 dark:text-gray-400 text-right pr-2 -mt-2"
              >
                {index > 0 ? time : ''}
              </div>
            ))}
          </div>

          {/* Day columns */}
          <div className="flex-1 grid grid-cols-7">
            {days.map((date, dayIndex) => {
              const isTodayDate = isToday(date);
              return (
                <div
                  key={dayIndex}
                  className={`
                    border-l border-gray-100 dark:border-gray-800
                    ${isTodayDate ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}
                  `}
                >
                  {timeSlots.map((time, timeIndex) => {
                    const hour = parseInt(time.split(':')[0]);
                    const hourEvents = getEventsAtTime(date, hour);

                    return (
                      <div
                        key={time}
                        onClick={() => onTimeSlotClick(date, time)}
                        className="h-12 border-b border-gray-50 dark:border-gray-800/50 relative cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30"
                      >
                        {hourEvents.map((event, eventIndex) => (
                          <div
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick(event);
                            }}
                            className="absolute left-0.5 right-0.5 px-1 py-0.5 text-xs rounded truncate cursor-pointer hover:opacity-80 z-10"
                            style={{
                              backgroundColor: `${getEventColor(event)}20`,
                              color: getEventColor(event),
                              top: `${eventIndex * 20}px`,
                            }}
                          >
                            <span className="font-medium">{event.startTime}</span> {event.title}
                          </div>
                        ))}
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
