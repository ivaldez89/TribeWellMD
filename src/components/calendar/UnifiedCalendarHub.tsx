'use client';

import { useState } from 'react';
import { useCalendarHub } from '@/hooks/useCalendarHub';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { AgendaView } from './AgendaView';
import { EventModal } from './EventModal';
import { TaskSidebar } from './TaskSidebar';
import { EventsSidebar } from './EventsSidebar';
import { TaskModal } from './TaskModal';
import { formatMonthYear } from '@/types/calendar';

export function UnifiedCalendarHub() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const {
    // State
    view,
    currentDate,
    events,
    isLoadingEvents,
    tasks,
    showEventModal,
    showTaskModal,
    selectedDate,
    selectedTime,
    selectedEvent,
    editingTask,

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

    // Task handlers
    getTasksByCategory,
    handleToggleTask,
    handleDeleteTask,
    handleQuickAddTask,

    // Modal controls
    closeEventModal,
    closeTaskModal,
    openEditTaskModal,

    // Refresh
    loadTasks,
  } = useCalendarHub();

  // Day time slot click handler for DayView
  const handleDayTimeSlotClick = (time: string) => {
    handleTimeSlotClick(currentDate, time);
  };

  return (
    <div className="flex h-full bg-slate-50 dark:bg-slate-900">
      {/* Left Column: Calendar Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Navigation and View Switcher only */}
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

          {/* Right: View Switcher */}
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
        </div>

        {/* Calendar Content - Fixed height container with internal scrolling */}
        <div className="flex-1 min-h-0 overflow-hidden bg-white dark:bg-slate-800 m-4 mb-2 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
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
            </>
          )}
        </div>

        {/* Create Button - Below calendar, right-aligned */}
        <div className="flex justify-end px-4 pb-4">
          <button
            onClick={() => handleDateClick(new Date())}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-tribe-sage-500 to-cyan-600 text-white rounded-xl hover:from-teal-600 hover:to-cyan-700 shadow-md hover:shadow-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-medium">Create</span>
          </button>
        </div>
      </div>

      {/* Right Column: Tasks + Events Sidebar */}
      <div className={`flex-shrink-0 flex flex-col bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 transition-all duration-300 ${sidebarCollapsed ? 'w-12' : 'w-80'}`}>
        {/* Task Sidebar */}
        <TaskSidebar
          tasks={tasks}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
          onEditTask={openEditTaskModal}
          onQuickAddTask={handleQuickAddTask}
          getTasksByCategory={getTasksByCategory}
        />

        {/* Events Sidebar */}
        {!sidebarCollapsed && (
          <EventsSidebar
            events={events}
            onEventClick={handleEventClick}
          />
        )}
      </div>

      {/* Event Modal */}
      <EventModal
        isOpen={showEventModal}
        onClose={closeEventModal}
        onSave={handleCreateEvent}
        initialDate={selectedDate}
        initialTime={selectedTime}
        existingEvent={selectedEvent}
      />

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal
          task={editingTask}
          onClose={closeTaskModal}
          onSave={() => {
            loadTasks();
            closeTaskModal();
          }}
        />
      )}
    </div>
  );
}
