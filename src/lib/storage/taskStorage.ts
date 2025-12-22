// Task storage utilities for localStorage persistence

import type { Task, TaskCategory, TaskPriority, TaskStats } from '@/types/tasks';
import { DEFAULT_WELLNESS_POINTS } from '@/types/tasks';

const TASKS_KEY = 'tribewellmd_tasks';

// Generate unique ID
function generateId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get all tasks
export function getTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(TASKS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save all tasks
export function saveTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

// Create a new task
export function createTask(data: {
  title: string;
  description?: string;
  category: TaskCategory;
  priority?: TaskPriority;
  dueDate?: string;
  dueTime?: string;
  linkedExam?: string;
  linkedDeckId?: string;
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'weekdays';
}): Task {
  const task: Task = {
    id: generateId(),
    title: data.title,
    description: data.description,
    category: data.category,
    priority: data.priority || 'medium',
    status: 'pending',
    dueDate: data.dueDate,
    dueTime: data.dueTime,
    wellnessPoints: DEFAULT_WELLNESS_POINTS[data.category],
    createdAt: new Date().toISOString(),
    linkedExam: data.linkedExam,
    linkedDeckId: data.linkedDeckId,
    isRecurring: data.isRecurring,
    recurringPattern: data.recurringPattern,
  };

  const tasks = getTasks();
  tasks.push(task);
  saveTasks(tasks);
  return task;
}

// Update a task
export function updateTask(id: string, updates: Partial<Task>): Task | null {
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return null;

  tasks[index] = { ...tasks[index], ...updates };
  saveTasks(tasks);
  return tasks[index];
}

// Delete a task
export function deleteTask(id: string): boolean {
  const tasks = getTasks();
  const filtered = tasks.filter(t => t.id !== id);
  if (filtered.length === tasks.length) return false;
  saveTasks(filtered);
  return true;
}

// Complete a task
export function completeTask(id: string): Task | null {
  return updateTask(id, {
    status: 'completed',
    completedAt: new Date().toISOString(),
  });
}

// Uncomplete a task (mark as pending again)
export function uncompleteTask(id: string): Task | null {
  return updateTask(id, {
    status: 'pending',
    completedAt: undefined,
  });
}

// Get tasks due today
export function getTasksDueToday(): Task[] {
  const today = new Date().toISOString().split('T')[0];
  return getTasks().filter(t => t.dueDate === today && t.status !== 'completed');
}

// Get overdue tasks
export function getOverdueTasks(): Task[] {
  const today = new Date().toISOString().split('T')[0];
  return getTasks().filter(t =>
    t.dueDate &&
    t.dueDate < today &&
    t.status !== 'completed'
  );
}

// Get tasks completed today
export function getTasksCompletedToday(): Task[] {
  const today = new Date().toISOString().split('T')[0];
  return getTasks().filter(t =>
    t.completedAt &&
    t.completedAt.startsWith(today)
  );
}

// Get task statistics
export function getTaskStats(): TaskStats {
  const tasks = getTasks();
  const today = new Date().toISOString().split('T')[0];

  const completedToday = tasks.filter(t =>
    t.completedAt && t.completedAt.startsWith(today)
  );

  const pendingToday = tasks.filter(t =>
    t.dueDate === today && t.status !== 'completed'
  );

  const studyTasks = tasks.filter(t =>
    t.category === 'study' && t.status !== 'completed'
  );

  const wellnessTasks = tasks.filter(t =>
    t.category === 'wellness' && t.status !== 'completed'
  );

  const pointsEarnedToday = completedToday.reduce((sum, t) => sum + t.wellnessPoints, 0);

  // Calculate study/wellness balance (percentage of wellness tasks completed today)
  const studyCompletedToday = completedToday.filter(t => t.category === 'study').length;
  const wellnessCompletedToday = completedToday.filter(t => t.category === 'wellness').length;
  const totalCompletedToday = studyCompletedToday + wellnessCompletedToday;
  const studyWellnessBalance = totalCompletedToday > 0
    ? Math.round((wellnessCompletedToday / totalCompletedToday) * 100)
    : 0;

  return {
    totalTasks: tasks.length,
    completedToday: completedToday.length,
    pendingToday: pendingToday.length,
    studyTasks: studyTasks.length,
    wellnessTasks: wellnessTasks.length,
    pointsEarnedToday,
    studyWellnessBalance,
  };
}

// Get tasks grouped by category
export function getTasksByCategory(): Record<TaskCategory, Task[]> {
  const tasks = getTasks();
  return {
    study: tasks.filter(t => t.category === 'study'),
    clinical: tasks.filter(t => t.category === 'clinical'),
    personal: tasks.filter(t => t.category === 'personal'),
    wellness: tasks.filter(t => t.category === 'wellness'),
  };
}

// Sort tasks by priority and due date
export function sortTasks(tasks: Task[]): Task[] {
  const priorityOrder: Record<TaskPriority, number> = {
    urgent: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  return [...tasks].sort((a, b) => {
    // Completed tasks go to bottom
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;

    // Sort by priority
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Sort by due date (earlier first, no date last)
    if (a.dueDate && b.dueDate) {
      return a.dueDate.localeCompare(b.dueDate);
    }
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;

    // Sort by creation date
    return a.createdAt.localeCompare(b.createdAt);
  });
}

// Get suggested wellness task if study/wellness balance is off
export function getSuggestedWellnessTask(): string | null {
  const stats = getTaskStats();

  // If less than 20% wellness tasks completed, suggest one
  if (stats.completedToday >= 3 && stats.studyWellnessBalance < 20) {
    const suggestions = [
      '10 minute meditation break',
      'Take a short walk outside',
      'Drink water and stretch',
      'Call a friend or family member',
      'Practice deep breathing exercises',
      'Write in your gratitude journal',
    ];
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  }

  return null;
}
