// Task types for the TribeWellMD Task Manager

export type TaskCategory = 'study' | 'clinical' | 'personal' | 'wellness';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string; // ISO date string
  dueTime?: string; // HH:mm format
  wellnessPoints: number; // Points earned on completion
  createdAt: string;
  completedAt?: string;
  // Optional links to other features
  linkedExam?: string; // e.g., "Step 2 CK", "IM Shelf"
  linkedDeckId?: string; // Link to a flashcard deck
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'weekdays';
}

export interface TaskStats {
  totalTasks: number;
  completedToday: number;
  pendingToday: number;
  studyTasks: number;
  wellnessTasks: number;
  pointsEarnedToday: number;
  studyWellnessBalance: number; // Percentage of wellness tasks
}

// Category configuration
export const TASK_CATEGORIES: Record<TaskCategory, { label: string; icon: string; color: string; bgColor: string }> = {
  study: {
    label: 'Study',
    icon: '📚',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  clinical: {
    label: 'Clinical',
    icon: '🏥',
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-100 dark:bg-rose-900/30',
  },
  personal: {
    label: 'Personal',
    icon: '👤',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  wellness: {
    label: 'Wellness',
    icon: '💚',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
};

// Priority configuration
export const TASK_PRIORITIES: Record<TaskPriority, { label: string; color: string; bgColor: string }> = {
  low: {
    label: 'Low',
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-700',
  },
  medium: {
    label: 'Medium',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
  },
  high: {
    label: 'High',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  urgent: {
    label: 'Urgent',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
};

// Default wellness points by category
export const DEFAULT_WELLNESS_POINTS: Record<TaskCategory, number> = {
  study: 10,
  clinical: 15,
  personal: 5,
  wellness: 20,
};
