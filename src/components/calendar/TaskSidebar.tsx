'use client';

import { useState, useRef } from 'react';
import { Task, TASK_CATEGORIES, TASK_PRIORITIES } from '@/types/tasks';

interface TaskSidebarProps {
  tasks: Task[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onToggleTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onQuickAddTask: (title: string, dueDate?: string) => void;
  getTasksByCategory: (filter: 'today' | 'upcoming' | 'overdue' | 'completed' | 'all') => Task[];
}

type TaskFilter = 'today' | 'upcoming' | 'overdue' | 'completed';

export function TaskSidebar({
  tasks,
  isCollapsed,
  onToggleCollapse,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  onQuickAddTask,
  getTasksByCategory,
}: TaskSidebarProps) {
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('today');

  const todayTasks = getTasksByCategory('today');
  const upcomingTasks = getTasksByCategory('upcoming');
  const overdueTasks = getTasksByCategory('overdue');
  const completedTasks = getTasksByCategory('completed');

  const filteredTasks = getTasksByCategory(activeFilter);

  const filters: { key: TaskFilter; label: string; count: number; color: string }[] = [
    { key: 'today', label: 'Today', count: todayTasks.length, color: 'text-blue-600 dark:text-blue-400' },
    { key: 'upcoming', label: 'Upcoming', count: upcomingTasks.length, color: 'text-purple-600 dark:text-purple-400' },
    { key: 'overdue', label: 'Overdue', count: overdueTasks.length, color: 'text-red-600 dark:text-red-400' },
    { key: 'completed', label: 'Done', count: completedTasks.length, color: 'text-emerald-600 dark:text-emerald-400' },
  ];

  if (isCollapsed) {
    return (
      <div className="flex-1 flex flex-col items-center py-4 gap-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          title="Expand sidebar"
        >
          <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>

        {/* Mini stats */}
        <div className="flex flex-col gap-2 items-center">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
            {todayTasks.length}
          </div>
          {overdueTasks.length > 0 && (
            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-xs font-bold text-red-600 dark:text-red-400">
              {overdueTasks.length}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[60%] flex-shrink-0 flex flex-col overflow-hidden">
      {/* Header - fixed, non-scrolling */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          Tasks
        </h2>
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          title="Collapse sidebar"
        >
          <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Filter Pills - fixed, non-scrolling */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                ${activeFilter === filter.key
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                }
              `}
            >
              {filter.label}
              {filter.count > 0 && (
                <span className={`
                  text-xs px-1.5 py-0.5 rounded-full
                  ${activeFilter === filter.key
                    ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900'
                    : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-400'
                  }
                `}>
                  {filter.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Task List - scrollable area */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {filteredTasks.length === 0 && (activeFilter === 'completed' || activeFilter === 'overdue') ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 mb-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              {activeFilter === 'completed' ? (
                <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {activeFilter === 'overdue' && 'No overdue tasks'}
              {activeFilter === 'completed' && 'No completed tasks yet'}
            </p>
          </div>
        ) : (
          <div className="py-2">
            {/* Task items */}
            {filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={() => onToggleTask(task)}
                onDelete={() => onDeleteTask(task.id)}
                onEdit={() => onEditTask(task)}
              />
            ))}

            {/* Inline Add Task - always visible at bottom of list */}
            {activeFilter !== 'completed' && activeFilter !== 'overdue' && (
              <InlineTaskInput
                onSubmit={(title) => {
                  const today = new Date().toISOString().split('T')[0];
                  onQuickAddTask(title, today);
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Footer Stats - fixed, non-scrolling */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 dark:text-slate-400">Total Tasks</span>
          <span className="font-medium text-slate-900 dark:text-white">{tasks.filter(t => t.status !== 'completed').length}</span>
        </div>
      </div>
    </div>
  );
}

// Individual Task Item
function TaskItem({
  task,
  onToggle,
  onDelete,
  onEdit,
}: {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const category = TASK_CATEGORIES[task.category];
  const priority = TASK_PRIORITIES[task.priority];
  const isCompleted = task.status === 'completed';
  const today = new Date().toISOString().split('T')[0];
  const isOverdue = task.dueDate && task.dueDate < today && !isCompleted;

  return (
    <div
      className={`
        group px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer
        ${isCompleted ? 'opacity-60' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={`
            flex-shrink-0 w-5 h-5 mt-0.5 rounded-full border-2 transition-colors flex items-center justify-center
            ${isCompleted
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : isOverdue
                ? 'border-red-400 hover:border-red-500'
                : 'border-slate-300 dark:border-slate-600 hover:border-violet-500'
            }
          `}
        >
          {isCompleted && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0" onClick={onEdit}>
          <p className={`
            text-sm font-medium leading-tight
            ${isCompleted
              ? 'text-slate-400 dark:text-slate-500 line-through'
              : 'text-slate-900 dark:text-white'
            }
          `}>
            {task.title}
          </p>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs">{category.icon}</span>

            {task.dueDate && (
              <span className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
                {task.dueDate === today ? 'Today' : new Date(task.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {task.dueTime && ` ${task.dueTime}`}
              </span>
            )}

            {task.priority === 'high' || task.priority === 'urgent' ? (
              <span className={`text-xs ${priority.color}`}>
                {task.priority === 'urgent' ? '!!!' : '!'}
              </span>
            ) : null}
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('Delete this task?')) {
              onDelete();
            }
          }}
          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Inline Task Input - always visible, type directly into it
function InlineTaskInput({ onSubmit }: { onSubmit: (title: string) => void }) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
      setValue('');
      // Keep focus on input for adding more tasks
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="px-4 py-2">
      <div className="flex items-center gap-3">
        {/* Circle with plus */}
        <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a task..."
          className="flex-1 bg-transparent border-0 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-0 py-1"
        />
      </div>
    </div>
  );
}
