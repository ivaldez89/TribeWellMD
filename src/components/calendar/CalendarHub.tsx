'use client';

import { useState, useEffect, useCallback } from 'react';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { AgendaView } from './AgendaView';
import { EventModal } from './EventModal';
import {
  CalendarEvent,
  CalendarView,
  CreateEventData,
  formatMonthYear,
  dateToString,
} from '@/types/calendar';
import { getAllCalendarItems, createCalendarEvent } from '@/lib/storage/calendarStorage';
import { createClient } from '@/lib/supabase/client';

export function CalendarHub() {
  const [view, setView] = useState<CalendarView>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Modal state
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>();

  // Get user ID
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    fetchUser();
  }, []);

  // Load events
  const loadEvents = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      // Get date range based on current view
      const start = new Date(currentDate);
      const end = new Date(currentDate);

      if (view === 'month') {
        start.setDate(1);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
      } else if (view === 'week') {
        start.setDate(start.getDate() - start.getDay());
        end.setDate(start.getDate() + 6);
      } else if (view === 'agenda') {
        end.setDate(end.getDate() + 30); // Show next 30 days
      }

      const items = await getAllCalendarItems(
        userId,
        dateToString(start),
        dateToString(end)
      );
      setEvents(items);
    } finally {
      setIsLoading(false);
    }
  }, [userId, currentDate, view]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Navigation
  const goToToday = () => setCurrentDate(new Date());

  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  // Event handlers
  const handleDateClick = (date: Date) => {
    if (view === 'month') {
      setSelectedDate(date);
      setSelectedTime(undefined);
      setSelectedEvent(undefined);
      setShowEventModal(true);
    }
  };

  const handleTimeSlotClick = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setSelectedEvent(undefined);
    setShowEventModal(true);
  };

  const handleDayTimeSlotClick = (time: string) => {
    setSelectedDate(currentDate);
    setSelectedTime(time);
    setSelectedEvent(undefined);
    setShowEventModal(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    // If it's a task, navigate to tasks page
    if (event.type === 'task' && event.linkedTaskId) {
      window.location.href = '/tasks';
      return;
    }

    // Study rooms are first-class destinations - always route to the room
    // linkedRoomId takes priority over generic event behavior
    if (event.linkedRoomId) {
      window.location.href = `/progress/room/${event.linkedRoomId}`;
      return;
    }

    // Otherwise, open the event modal for generic events
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleCreateEvent = async (data: CreateEventData) => {
    if (!userId) return;

    const { event, error } = await createCalendarEvent(data, userId);
    if (event) {
      await loadEvents();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {/* Left: Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Today
          </button>
          <div className="flex items-center">
            <button
              onClick={goToPrevious}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 ml-2">
            {formatMonthYear(currentDate)}
          </h2>
        </div>

        {/* Center: View Switcher */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(['month', 'week', 'day', 'agenda'] as CalendarView[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`
                px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize
                ${view === v
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }
              `}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Right: Create Button */}
        <button
          onClick={() => {
            setSelectedDate(new Date());
            setSelectedTime(undefined);
            setSelectedEvent(undefined);
            setShowEventModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="font-medium">Create</span>
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}

      {/* Calendar Views */}
      {!isLoading && (
        <div className="flex-1 overflow-hidden">
          {view === 'month' && (
            <MonthView
              currentDate={currentDate}
              events={events}
              onDateClick={handleDateClick}
              onEventClick={handleEventClick}
            />
          )}
          {view === 'week' && (
            <WeekView
              currentDate={currentDate}
              events={events}
              onTimeSlotClick={handleTimeSlotClick}
              onEventClick={handleEventClick}
            />
          )}
          {view === 'day' && (
            <DayView
              currentDate={currentDate}
              events={events}
              onTimeSlotClick={handleDayTimeSlotClick}
              onEventClick={handleEventClick}
            />
          )}
          {view === 'agenda' && (
            <AgendaView
              events={events}
              onEventClick={handleEventClick}
            />
          )}
        </div>
      )}

      {/* Event Modal */}
      <EventModal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setSelectedEvent(undefined);
        }}
        onSave={handleCreateEvent}
        initialDate={selectedDate}
        initialTime={selectedTime}
        existingEvent={selectedEvent}
      />
    </div>
  );
}
