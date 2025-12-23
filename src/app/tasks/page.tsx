'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import type { Task, TaskCategory, TaskPriority } from '@/types/tasks';
import { TASK_CATEGORIES, TASK_PRIORITIES, DEFAULT_WELLNESS_POINTS } from '@/types/tasks';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
  uncompleteTask,
  getTaskStats,
  sortTasks,
  getSuggestedWellnessTask,
} from '@/lib/storage/taskStorage';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState(getTaskStats());
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [wellnessSuggestion, setWellnessSuggestion] = useState<string | null>(null);

  // Load tasks on mount
  useEffect(() => {
    refreshTasks();
  }, []);

  const refreshTasks = () => {
    setTasks(sortTasks(getTasks()));
    setStats(getTaskStats());
    setWellnessSuggestion(getSuggestedWellnessTask());
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const today = new Date().toISOString().split('T')[0];

    // Category filter
    if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;

    // Status filter
    switch (filter) {
      case 'today':
        return task.dueDate === today && task.status !== 'completed';
      case 'upcoming':
        return task.dueDate && task.dueDate > today && task.status !== 'completed';
      case 'completed':
        return task.status === 'completed';
      default:
        return task.status !== 'completed';
    }
  });

  const handleToggleComplete = (task: Task) => {
    if (task.status === 'completed') {
      uncompleteTask(task.id);
    } else {
      completeTask(task.id);
    }
    refreshTasks();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this task?')) {
      deleteTask(id);
      refreshTasks();
    }
  };

  const handleAddWellnessTask = () => {
    if (wellnessSuggestion) {
      createTask({
        title: wellnessSuggestion,
        category: 'wellness',
        priority: 'medium',
        dueDate: new Date().toISOString().split('T')[0],
      });
      refreshTasks();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              My Tasks
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Stay organized and earn wellness points
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-tribe-sage-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium rounded-xl shadow-lg shadow-tribe-sage-500/25 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="text-2xl font-bold text-tribe-sage-600 dark:text-tribe-sage-400">{stats.pendingToday}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Due Today</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="text-2xl font-bold text-tribe-sage-600 dark:text-tribe-sage-400">{stats.completedToday}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Completed</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">+{stats.pointsEarnedToday}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Points Today</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.studyWellnessBalance}%</div>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Wellness Balance</div>
          </div>
        </div>

        {/* Wellness Suggestion */}
        {wellnessSuggestion && filter !== 'completed' && (
          <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-tribe-sage-100 dark:bg-tribe-sage-900/50 flex items-center justify-center">
                  <span className="text-lg">💚</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                    Balance Suggestion
                  </p>
                  <p className="text-sm text-tribe-sage-600 dark:text-tribe-sage-400">
                    {wellnessSuggestion}
                  </p>
                </div>
              </div>
              <button
                onClick={handleAddWellnessTask}
                className="px-3 py-1.5 text-sm font-medium text-tribe-sage-700 dark:text-tribe-sage-300 bg-tribe-sage-100 dark:bg-tribe-sage-900/50 hover:bg-emerald-200 dark:hover:bg-emerald-900 rounded-lg transition-colors"
              >
                Add Task
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {/* Status Filters */}
          <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {(['all', 'today', 'upcoming', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  filter === f
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Category Filters */}
          <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All
            </button>
            {(Object.keys(TASK_CATEGORIES) as TaskCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  categoryFilter === cat
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {TASK_CATEGORIES[cat].icon}
              </button>
            ))}
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                {filter === 'completed' ? 'No completed tasks yet' : 'No tasks found'}
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 text-tribe-sage-600 dark:text-tribe-sage-400 hover:underline"
              >
                Add your first task
              </button>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={() => handleToggleComplete(task)}
                onEdit={() => setEditingTask(task)}
                onDelete={() => handleDelete(task.id)}
              />
            ))
          )}
        </div>
      </main>

      <Footer />

      {/* Add/Edit Modal */}
      {(showAddModal || editingTask) && (
        <TaskModal
          task={editingTask}
          onClose={() => {
            setShowAddModal(false);
            setEditingTask(null);
          }}
          onSave={() => {
            setShowAddModal(false);
            setEditingTask(null);
            refreshTasks();
          }}
        />
      )}
    </div>
  );
}

// Task Card Component
function TaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
}: {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const category = TASK_CATEGORIES[task.category];
  const priority = TASK_PRIORITIES[task.priority];
  const isCompleted = task.status === 'completed';
  const today = new Date().toISOString().split('T')[0];
  const isOverdue = task.dueDate && task.dueDate < today && !isCompleted;

  return (
    <div
      className={`group bg-white dark:bg-slate-800 rounded-xl border transition-all ${
        isCompleted
          ? 'border-slate-200 dark:border-slate-700 opacity-60'
          : isOverdue
          ? 'border-red-300 dark:border-red-800'
          : 'border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700'
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          className={`flex-shrink-0 w-6 h-6 mt-0.5 rounded-full border-2 transition-colors flex items-center justify-center ${
            isCompleted
              ? 'bg-tribe-sage-500 border-tribe-sage-500 text-white'
              : 'border-slate-300 dark:border-slate-600 hover:border-tribe-sage-500'
          }`}
        >
          {isCompleted && (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`font-medium ${
                isCompleted
                  ? 'text-slate-500 dark:text-slate-500 line-through'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {task.title}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${category.bgColor} ${category.color}`}>
                {category.icon} {category.label}
              </span>
            </div>
          </div>

          {task.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2 text-xs">
            {/* Priority */}
            <span className={`${priority.color}`}>
              {priority.label}
            </span>

            {/* Due Date */}
            {task.dueDate && (
              <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {task.dueDate === today ? 'Today' : new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {task.dueTime && ` at ${task.dueTime}`}
              </span>
            )}

            {/* Points */}
            <span className="text-amber-600 dark:text-amber-400">
              +{task.wellnessPoints} pts
            </span>

            {/* Linked Exam */}
            {task.linkedExam && (
              <span className="text-indigo-600 dark:text-indigo-400">
                {task.linkedExam}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Add/Edit Modal Component
function TaskModal({
  task,
  onClose,
  onSave,
}: {
  task: Task | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [category, setCategory] = useState<TaskCategory>(task?.category || 'study');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'medium');
  const [dueDate, setDueDate] = useState(task?.dueDate || '');
  const [dueTime, setDueTime] = useState(task?.dueTime || '');
  const [linkedExam, setLinkedExam] = useState(task?.linkedExam || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (task) {
      updateTask(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        priority,
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
        linkedExam: linkedExam.trim() || undefined,
        wellnessPoints: DEFAULT_WELLNESS_POINTS[category],
      });
    } else {
      createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        priority,
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
        linkedExam: linkedExam.trim() || undefined,
      });
    }

    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {task ? 'Edit Task' : 'Add New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you need to do?"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-tribe-sage-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-tribe-sage-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(TASK_CATEGORIES) as TaskCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                    category === cat
                      ? 'border-tribe-sage-500 bg-tribe-sage-50 dark:bg-tribe-sage-900/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <span className="text-xl">{TASK_CATEGORIES[cat].icon}</span>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {TASK_CATEGORIES[cat].label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Priority
            </label>
            <div className="flex gap-2">
              {(Object.keys(TASK_PRIORITIES) as TaskPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all ${
                    priority === p
                      ? 'border-tribe-sage-500 bg-tribe-sage-50 dark:bg-tribe-sage-900/30 text-tribe-sage-700 dark:text-tribe-sage-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {TASK_PRIORITIES[p].label}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-tribe-sage-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Due Time
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-tribe-sage-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Linked Exam */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Linked Exam (optional)
            </label>
            <input
              type="text"
              value={linkedExam}
              onChange={(e) => setLinkedExam(e.target.value)}
              placeholder="e.g., Step 2 CK, IM Shelf"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-tribe-sage-500 focus:border-transparent"
            />
          </div>

          {/* Points Preview */}
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-amber-700 dark:text-amber-300">Wellness Points on Completion</span>
              <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                +{DEFAULT_WELLNESS_POINTS[category]} pts
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 px-4 py-2 text-white bg-gradient-to-r from-tribe-sage-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium shadow-lg shadow-tribe-sage-500/25 transition-all"
            >
              {task ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
