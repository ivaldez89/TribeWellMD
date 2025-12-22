'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getTasks, getTaskStats } from '@/lib/storage/taskStorage';
import type { Task } from '@/types/tasks';
import { TASK_CATEGORIES } from '@/types/tasks';
import Link from 'next/link';

// Helper to get days in month
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// Helper to get first day of month (0 = Sunday)
function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

// Format date as YYYY-MM-DD
function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Parse ISO date to parts
function parseDate(dateStr: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateStr.split('-').map(Number);
  return { year, month: month - 1, day };
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string>(
    formatDate(today.getFullYear(), today.getMonth(), today.getDate())
  );
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState(getTaskStats());

  useEffect(() => {
    setTasks(getTasks());
    setStats(getTaskStats());
  }, []);

  // Get tasks for a specific date
  const getTasksForDate = (dateStr: string): Task[] => {
    return tasks.filter(t => t.dueDate === dateStr);
  };

  // Get completed tasks for a specific date
  const getCompletedForDate = (dateStr: string): Task[] => {
    return tasks.filter(t => t.completedAt?.startsWith(dateStr));
  };

  // Calculate points earned on a date
  const getPointsForDate = (dateStr: string): number => {
    return getCompletedForDate(dateStr).reduce((sum, t) => sum + t.wellnessPoints, 0);
  };

  // Navigate months
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(formatDate(today.getFullYear(), today.getMonth(), today.getDate()));
  };

  // Generate calendar grid
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  // Selected date info
  const selectedTasks = getTasksForDate(selectedDate);
  const selectedCompleted = getCompletedForDate(selectedDate);
  const selectedPoints = getPointsForDate(selectedDate);
  const selectedDateObj = parseDate(selectedDate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              My Calendar
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Track your schedule and achievements
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/tasks"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              My Tasks
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">{stats.pendingToday}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Due Today</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.completedToday}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Done Today</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">+{stats.pointsEarnedToday}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Points Today</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.totalTasks}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Total Tasks</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <button
                onClick={prevMonth}
                className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="text-center">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </h2>
                <button
                  onClick={goToToday}
                  className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
                >
                  Go to today
                </button>
              </div>
              <button
                onClick={nextMonth}
                className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700">
              {DAY_NAMES.map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="h-20 sm:h-24 bg-slate-50 dark:bg-slate-900/50" />;
                }

                const dateStr = formatDate(currentYear, currentMonth, day);
                const dayTasks = getTasksForDate(dateStr);
                const dayPoints = getPointsForDate(dateStr);
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;
                const hasTasks = dayTasks.length > 0;
                const hasCompleted = getCompletedForDate(dateStr).length > 0;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`h-20 sm:h-24 p-1 sm:p-2 border-t border-r border-slate-100 dark:border-slate-700 text-left transition-colors ${
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-900/30'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 text-xs sm:text-sm font-medium rounded-full ${
                          isToday
                            ? 'bg-teal-600 text-white'
                            : isSelected
                            ? 'bg-teal-100 dark:bg-teal-800 text-teal-700 dark:text-teal-300'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {day}
                      </span>
                      {dayPoints > 0 && (
                        <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                          +{dayPoints}
                        </span>
                      )}
                    </div>

                    {/* Task indicators */}
                    <div className="mt-1 space-y-0.5">
                      {dayTasks.slice(0, 2).map((task) => (
                        <div
                          key={task.id}
                          className={`text-[10px] truncate px-1 py-0.5 rounded ${
                            task.status === 'completed'
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 line-through'
                              : `${TASK_CATEGORIES[task.category].bgColor} ${TASK_CATEGORIES[task.category].color}`
                          }`}
                        >
                          {task.title}
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 px-1">
                          +{dayTasks.length - 2} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Panel */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {MONTH_NAMES[selectedDateObj.month]} {selectedDateObj.day}, {selectedDateObj.year}
              </h3>
              {selectedDate === todayStr && (
                <span className="text-sm text-teal-600 dark:text-teal-400">Today</span>
              )}
            </div>

            {/* Points Earned */}
            {selectedPoints > 0 && (
              <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏆</span>
                  <div>
                    <div className="text-lg font-bold text-amber-600 dark:text-amber-400">+{selectedPoints} pts</div>
                    <div className="text-xs text-amber-700 dark:text-amber-300">Earned this day</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tasks for Selected Date */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Tasks ({selectedTasks.length})
              </h4>

              {selectedTasks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">No tasks scheduled</p>
                  <Link
                    href="/tasks"
                    className="inline-block mt-2 text-sm text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    Add a task
                  </Link>
                </div>
              ) : (
                selectedTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg border ${
                      task.status === 'completed'
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className={`mt-0.5 ${task.status === 'completed' ? 'text-emerald-500' : ''}`}>
                        {task.status === 'completed' ? '✓' : TASK_CATEGORIES[task.category].icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                          task.status === 'completed'
                            ? 'text-emerald-700 dark:text-emerald-300 line-through'
                            : 'text-slate-900 dark:text-white'
                        }`}>
                          {task.title}
                        </p>
                        {task.dueTime && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {task.dueTime}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-amber-600 dark:text-amber-400">
                        +{task.wellnessPoints}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Completed Tasks (if different from scheduled) */}
            {selectedCompleted.length > 0 && selectedCompleted.some(t => t.dueDate !== selectedDate) && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Also completed this day
                </h4>
                {selectedCompleted
                  .filter(t => t.dueDate !== selectedDate)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="p-2 text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg"
                    >
                      ✓ {task.title}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
