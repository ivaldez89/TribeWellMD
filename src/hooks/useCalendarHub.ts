'use client';

import { useState, useEffect, useCallback } from 'react';
import { CalendarEvent, CalendarView, dateToString } from '@/types/calendar';
import { Task } from '@/types/tasks';
import { getAllCalendarItems, createCalendarEvent, deleteCalendarEvent, deleteLocalEvent } from '@/lib/storage/calendarStorage';
import { getTasks, createTask, updateTask, completeTask, uncompleteTask, deleteTask, getTaskStats } from '@/lib/storage/taskStorage';
import { createClient } from '@/lib/supabase/client';

export interface CalendarHubState {
  // Calendar state
  view: CalendarView;
  currentDate: Date;
  events: CalendarEvent[];
  isLoadingEvents: boolean;

  // Tasks state
  tasks: Task[];
  isLoadingTasks: boolean;
  taskStats: ReturnType<typeof getTaskStats>;

  // User state
  userId: string | null;

  // Modal states
  showEventModal: boolean;
  showTaskModal: boolean;
  selectedDate: Date | undefined;
  selectedTime: string | undefined;
  selectedEvent: CalendarEvent | undefined;
  editingTask: Task | null;
}

export function useCalendarHub() {
  // Calendar state
  const [view, setView] = useState<CalendarView>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [taskStats, setTaskStats] = useState(getTaskStats());

  // User state
  const [userId, setUserId] = useState<string | null>(null);

  // Modal states
  const [showEventModal, setShowEventModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>();
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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

    setIsLoadingEvents(true);
    try {
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
        end.setDate(end.getDate() + 30);
      }

      const items = await getAllCalendarItems(
        userId,
        dateToString(start),
        dateToString(end)
      );
      setEvents(items);
    } finally {
      setIsLoadingEvents(false);
    }
  }, [userId, currentDate, view]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Load tasks
  const loadTasks = useCallback(() => {
    setIsLoadingTasks(true);
    try {
      const allTasks = getTasks();
      setTasks(allTasks);
      setTaskStats(getTaskStats());
    } finally {
      setIsLoadingTasks(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Filter tasks by category
  const getTasksByCategory = useCallback((filter: 'today' | 'upcoming' | 'overdue' | 'completed' | 'all') => {
    const today = new Date().toISOString().split('T')[0];

    return tasks.filter(task => {
      switch (filter) {
        case 'today':
          return task.dueDate === today && task.status !== 'completed';
        case 'upcoming':
          return task.dueDate && task.dueDate > today && task.status !== 'completed';
        case 'overdue':
          return task.dueDate && task.dueDate < today && task.status !== 'completed';
        case 'completed':
          return task.status === 'completed';
        default:
          return task.status !== 'completed';
      }
    });
  }, [tasks]);

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
    setSelectedDate(date);
    setSelectedTime(undefined);
    setSelectedEvent(undefined);
    setShowEventModal(true);
  };

  const handleTimeSlotClick = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setSelectedEvent(undefined);
    setShowEventModal(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    if (event.type === 'task' && event.linkedTaskId) {
      const task = tasks.find(t => t.id === event.linkedTaskId);
      if (task) {
        setEditingTask(task);
        setShowTaskModal(true);
      }
      return;
    }

    if (event.type === 'study-room' && event.linkedRoomId) {
      window.location.href = `/study/room/${event.linkedRoomId}`;
      return;
    }

    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleCreateEvent = async (data: Parameters<typeof createCalendarEvent>[0]) => {
    if (!userId) return;
    const { event } = await createCalendarEvent(data, userId);
    if (event) {
      await loadEvents();
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    // Handle local events (prefixed with 'local-')
    if (eventId.startsWith('local-')) {
      deleteLocalEvent(eventId);
    } else {
      // Handle Supabase events
      await deleteCalendarEvent(eventId);
    }
    await loadEvents();
  };

  // Task handlers
  const handleToggleTask = (task: Task) => {
    if (task.status === 'completed') {
      uncompleteTask(task.id);
    } else {
      completeTask(task.id);
    }
    loadTasks();
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    loadTasks();
  };

  const handleQuickAddTask = (title: string, dueDate?: string) => {
    createTask({
      title,
      category: 'study',
      priority: 'medium',
      dueDate,
    });
    loadTasks();
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    updateTask(taskId, updates);
    loadTasks();
  };

  // Close modals
  const closeEventModal = () => {
    setShowEventModal(false);
    setSelectedEvent(undefined);
    setSelectedDate(undefined);
    setSelectedTime(undefined);
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setEditingTask(null);
  };

  const openNewTaskModal = (presetDate?: Date) => {
    setEditingTask(null);
    setSelectedDate(presetDate);
    setShowTaskModal(true);
  };

  const openEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  return {
    // State
    view,
    currentDate,
    events,
    isLoadingEvents,
    tasks,
    isLoadingTasks,
    taskStats,
    userId,
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
    handleDeleteEvent,

    // Task handlers
    getTasksByCategory,
    handleToggleTask,
    handleDeleteTask,
    handleQuickAddTask,
    handleUpdateTask,

    // Modal controls
    closeEventModal,
    closeTaskModal,
    openNewTaskModal,
    openEditTaskModal,

    // Refresh functions
    loadEvents,
    loadTasks,
  };
}
