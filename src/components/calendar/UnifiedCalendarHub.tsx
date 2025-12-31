'use client';

import { useCalendarHub } from '@/hooks/useCalendarHub';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { AgendaView } from './AgendaView';
import { EventModal } from './EventModal';
import { formatMonthYear } from '@/types/calendar';

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

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      {/* Header - Navigation and View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-3 sm:py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 gap-3">
        {/* Top row on mobile: Navigation + Month */}
        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
          <button
            onClick={goToToday}
            className="px-3 sm:px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
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
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white whitespace-nowrap">
            {formatMonthYear(currentDate)}
          </h2>
        </div>

        {/* Bottom row on mobile: View Switcher + Create Button */}
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
          <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-1 overflow-x-auto">
            {(['month', 'week', 'day', 'agenda'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`
                  px-2 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors capitalize whitespace-nowrap
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
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-tribe-sage-500 to-cyan-600 text-white rounded-lg hover:from-teal-600 hover:to-cyan-700 shadow-sm hover:shadow-md transition-all flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-medium text-sm hidden sm:inline">Create</span>
          </button>
        </div>
      </div>

      {/* Calendar Content - Expands to fill available space */}
      <div className="flex-1 min-h-0 overflow-hidden bg-white dark:bg-slate-800 m-4 mb-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
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
