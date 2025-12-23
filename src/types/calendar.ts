// Calendar Hub Types

export type EventType = 'task' | 'study-session' | 'study-room' | 'wellness' | 'external';
export type EventCategory = 'study' | 'clinical' | 'personal' | 'wellness';
export type EventSource = 'local' | 'google' | 'outlook' | 'study-room';
export type ParticipantStatus = 'pending' | 'accepted' | 'declined' | 'tentative';
export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

export interface EventParticipant {
  userId: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  status: ParticipantStatus;
  role: 'organizer' | 'participant';
}

export interface CalendarEvent {
  id: string;
  type: EventType;
  title: string;
  description?: string;

  // Time
  startDate: string;      // YYYY-MM-DD
  startTime?: string;     // HH:mm (optional for all-day)
  endDate?: string;       // For multi-day events
  endTime?: string;
  isAllDay: boolean;

  // Recurrence
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'weekdays' | 'monthly';
  recurringUntil?: string;

  // Metadata
  category?: EventCategory;
  color?: string;
  source: EventSource;
  sourceId?: string;      // External calendar event ID

  // Collaboration
  participants?: EventParticipant[];
  isShared: boolean;
  visibility: 'private' | 'tribe' | 'public';

  // Links
  linkedTaskId?: string;
  linkedRoomId?: string;
  linkedDeckId?: string;
  meetingUrl?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventData {
  type: EventType;
  title: string;
  description?: string;
  startDate: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  isAllDay?: boolean;
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'weekdays' | 'monthly';
  recurringUntil?: string;
  category?: EventCategory;
  participants?: string[]; // User IDs to invite
  createStudyRoom?: boolean;
  visibility?: 'private' | 'tribe' | 'public';
}

// Database row types (snake_case)
export interface CalendarEventRow {
  id: string;
  user_id: string;
  type: EventType;
  title: string;
  description: string | null;
  start_date: string;
  start_time: string | null;
  end_date: string | null;
  end_time: string | null;
  is_all_day: boolean;
  is_recurring: boolean;
  recurring_pattern: string | null;
  recurring_until: string | null;
  category: EventCategory | null;
  color: string | null;
  source: EventSource;
  source_id: string | null;
  visibility: 'private' | 'tribe' | 'public';
  linked_task_id: string | null;
  linked_room_id: string | null;
  linked_deck_id: string | null;
  meeting_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventParticipantRow {
  id: string;
  event_id: string;
  user_id: string | null;
  email: string | null;
  display_name: string;
  avatar_url: string | null;
  status: ParticipantStatus;
  role: 'organizer' | 'participant';
  notified_at: string | null;
  responded_at: string | null;
  created_at: string;
}

// Transform functions
export function transformEventRow(row: CalendarEventRow): CalendarEvent {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description || undefined,
    startDate: row.start_date,
    startTime: row.start_time || undefined,
    endDate: row.end_date || undefined,
    endTime: row.end_time || undefined,
    isAllDay: row.is_all_day,
    isRecurring: row.is_recurring,
    recurringPattern: row.recurring_pattern as CalendarEvent['recurringPattern'],
    recurringUntil: row.recurring_until || undefined,
    category: row.category || undefined,
    color: row.color || undefined,
    source: row.source,
    sourceId: row.source_id || undefined,
    visibility: row.visibility,
    linkedTaskId: row.linked_task_id || undefined,
    linkedRoomId: row.linked_room_id || undefined,
    linkedDeckId: row.linked_deck_id || undefined,
    meetingUrl: row.meeting_url || undefined,
    isShared: false, // Computed from participants
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function transformParticipantRow(row: EventParticipantRow): EventParticipant {
  return {
    userId: row.user_id || '',
    displayName: row.display_name,
    email: row.email || undefined,
    avatarUrl: row.avatar_url || undefined,
    status: row.status,
    role: row.role,
  };
}

// Color mapping for event types
export const EVENT_COLORS: Record<EventType, string> = {
  'task': '#3B82F6',        // Blue
  'study-session': '#10B981', // Green
  'study-room': '#8B5CF6',   // Purple
  'wellness': '#F59E0B',     // Amber
  'external': '#6B7280',     // Gray
};

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  'study': '#3B82F6',      // Blue
  'clinical': '#EF4444',   // Red
  'personal': '#10B981',   // Green
  'wellness': '#F59E0B',   // Amber
};

// Helper functions
export function getEventColor(event: CalendarEvent): string {
  if (event.color) return event.color;
  if (event.category) return CATEGORY_COLORS[event.category];
  return EVENT_COLORS[event.type];
}

export function formatEventTime(event: CalendarEvent): string {
  if (event.isAllDay) return 'All day';
  if (!event.startTime) return '';

  const [hours, minutes] = event.startTime.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;

  let timeStr = `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;

  if (event.endTime) {
    const [endHours, endMinutes] = event.endTime.split(':').map(Number);
    const endPeriod = endHours >= 12 ? 'PM' : 'AM';
    const endDisplayHours = endHours % 12 || 12;
    timeStr += ` - ${endDisplayHours}:${endMinutes.toString().padStart(2, '0')} ${endPeriod}`;
  }

  return timeStr;
}

export function isEventOnDate(event: CalendarEvent, date: string): boolean {
  // Check if event falls on this date
  if (event.startDate === date) return true;

  // Check multi-day events
  if (event.endDate) {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    const check = new Date(date);
    return check >= start && check <= end;
  }

  return false;
}

export function getEventsForDate(events: CalendarEvent[], date: string): CalendarEvent[] {
  return events.filter(event => isEventOnDate(event, date));
}

// Generate time slots for day/week view
export function generateTimeSlots(startHour = 6, endHour = 22): string[] {
  const slots: string[] = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
  }
  return slots;
}

// Get days in month for calendar grid
export function getMonthDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const days: Date[] = [];

  // Add days from previous month to fill first week
  const firstDayOfWeek = firstDay.getDay();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }

  // Add all days of current month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push(new Date(year, month, day));
  }

  // Add days from next month to complete last week
  const remainingDays = 7 - (days.length % 7);
  if (remainingDays < 7) {
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }
  }

  return days;
}

// Get week days starting from a date
export function getWeekDays(startDate: Date): Date[] {
  const days: Date[] = [];
  const start = new Date(startDate);
  start.setDate(start.getDate() - start.getDay()); // Go to Sunday

  for (let i = 0; i < 7; i++) {
    days.push(new Date(start));
    start.setDate(start.getDate() + 1);
  }

  return days;
}

// Format date for display
export function formatDateHeader(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function dateToString(date: Date): string {
  return date.toISOString().split('T')[0];
}
