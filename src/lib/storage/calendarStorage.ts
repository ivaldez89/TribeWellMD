'use client';

import { createClient } from '@/lib/supabase/client';
import {
  CalendarEvent,
  EventParticipant,
  CreateEventData,
  transformEventRow,
  transformParticipantRow,
  type CalendarEventRow,
  type EventParticipantRow,
} from '@/types/calendar';
import { getTasks } from '@/lib/storage/taskStorage';
import type { Task } from '@/types/tasks';

// Storage key for localStorage fallback
const EVENTS_KEY = 'tribewellmd_calendar_events';

// ============================================
// SUPABASE OPERATIONS
// ============================================

export async function createCalendarEvent(
  data: CreateEventData,
  userId: string
): Promise<{ event: CalendarEvent | null; error: string | null }> {
  const supabase = createClient();

  const { data: eventData, error } = await supabase
    .from('calendar_events')
    .insert({
      user_id: userId,
      type: data.type,
      title: data.title,
      description: data.description || null,
      start_date: data.startDate,
      start_time: data.startTime || null,
      end_date: data.endDate || null,
      end_time: data.endTime || null,
      is_all_day: data.isAllDay || false,
      is_recurring: data.isRecurring || false,
      recurring_pattern: data.recurringPattern || null,
      recurring_until: data.recurringUntil || null,
      category: data.category || null,
      visibility: data.visibility || 'private',
      source: 'local',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating event:', error);
    // Fall back to localStorage
    return createLocalEvent(data, userId);
  }

  // Add participants if any
  if (data.participants && data.participants.length > 0) {
    await addEventParticipants(eventData.id, data.participants, userId);
  }

  return { event: transformEventRow(eventData), error: null };
}

export async function getCalendarEvents(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<CalendarEvent[]> {
  const supabase = createClient();

  let query = supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId);

  if (startDate) {
    query = query.gte('start_date', startDate);
  }
  if (endDate) {
    query = query.lte('start_date', endDate);
  }

  const { data, error } = await query.order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching events:', error);
    // Fall back to localStorage
    return getLocalEvents(userId, startDate, endDate);
  }

  return (data as CalendarEventRow[]).map(transformEventRow);
}

export async function updateCalendarEvent(
  eventId: string,
  updates: Partial<CreateEventData>
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase
    .from('calendar_events')
    .update({
      title: updates.title,
      description: updates.description,
      start_date: updates.startDate,
      start_time: updates.startTime,
      end_date: updates.endDate,
      end_time: updates.endTime,
      is_all_day: updates.isAllDay,
      is_recurring: updates.isRecurring,
      recurring_pattern: updates.recurringPattern,
      recurring_until: updates.recurringUntil,
      category: updates.category,
      visibility: updates.visibility,
      updated_at: new Date().toISOString(),
    })
    .eq('id', eventId);

  if (error) {
    console.error('Error updating event:', error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

export async function deleteCalendarEvent(eventId: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', eventId);

  if (error) {
    console.error('Error deleting event:', error);
    return false;
  }

  return true;
}

// ============================================
// PARTICIPANTS
// ============================================

export async function addEventParticipants(
  eventId: string,
  userIds: string[],
  organizerId: string
): Promise<void> {
  const supabase = createClient();

  const participants = userIds.map(userId => ({
    event_id: eventId,
    user_id: userId,
    status: userId === organizerId ? 'accepted' : 'pending',
    role: userId === organizerId ? 'organizer' : 'participant',
  }));

  await supabase.from('event_participants').insert(participants);
}

export async function getEventParticipants(eventId: string): Promise<EventParticipant[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('event_participants')
    .select('*')
    .eq('event_id', eventId);

  if (error || !data) {
    return [];
  }

  return (data as EventParticipantRow[]).map(transformParticipantRow);
}

export async function updateParticipantStatus(
  eventId: string,
  userId: string,
  status: 'accepted' | 'declined' | 'tentative'
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from('event_participants')
    .update({
      status,
      responded_at: new Date().toISOString(),
    })
    .eq('event_id', eventId)
    .eq('user_id', userId);

  return !error;
}

// ============================================
// UNIFIED EVENT FETCHING (Tasks + Events + Study Rooms)
// ============================================

export async function getAllCalendarItems(
  userId: string,
  startDate: string,
  endDate: string
): Promise<CalendarEvent[]> {
  const allEvents: CalendarEvent[] = [];

  // 1. Get calendar events from Supabase
  const events = await getCalendarEvents(userId, startDate, endDate);
  allEvents.push(...events);

  // 2. Convert tasks to calendar events
  const tasks = getTasks();
  const taskEvents = tasks
    .filter(task => task.dueDate && task.dueDate >= startDate && task.dueDate <= endDate)
    .map(taskToCalendarEvent);
  allEvents.push(...taskEvents);

  // 3. Get study rooms (scheduled sessions)
  const studyRoomEvents = await getStudyRoomEvents(userId, startDate, endDate);
  allEvents.push(...studyRoomEvents);

  // Sort by date and time
  return allEvents.sort((a, b) => {
    const dateCompare = a.startDate.localeCompare(b.startDate);
    if (dateCompare !== 0) return dateCompare;
    if (!a.startTime) return -1;
    if (!b.startTime) return 1;
    return a.startTime.localeCompare(b.startTime);
  });
}

// Convert a task to a calendar event
function taskToCalendarEvent(task: Task): CalendarEvent {
  return {
    id: `task-${task.id}`,
    type: 'task',
    title: task.title,
    description: task.description,
    startDate: task.dueDate!,
    startTime: task.dueTime,
    isAllDay: !task.dueTime,
    isRecurring: task.isRecurring || false,
    recurringPattern: task.recurringPattern,
    category: task.category as CalendarEvent['category'],
    source: 'local',
    isShared: false,
    visibility: 'private',
    linkedTaskId: task.id,
    createdAt: task.createdAt,
    updatedAt: task.createdAt,
  };
}

// Get study room sessions as calendar events
async function getStudyRoomEvents(
  userId: string,
  startDate: string,
  endDate: string
): Promise<CalendarEvent[]> {
  const supabase = createClient();

  // Get sessions where user is a participant
  const { data: participations } = await supabase
    .from('session_participants')
    .select('session_id')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (!participations || participations.length === 0) {
    return [];
  }

  const sessionIds = participations.map(p => p.session_id);

  const { data: sessions } = await supabase
    .from('study_sessions')
    .select('*')
    .in('id', sessionIds)
    .eq('status', 'active');

  if (!sessions) {
    return [];
  }

  return sessions.map(session => ({
    id: `room-${session.id}`,
    type: 'study-room' as const,
    title: session.name,
    description: session.description,
    startDate: session.created_at.split('T')[0],
    startTime: session.created_at.split('T')[1]?.substring(0, 5),
    isAllDay: false,
    isRecurring: false,
    source: 'study-room' as const,
    isShared: true,
    visibility: session.is_private ? 'private' : 'public',
    linkedRoomId: session.id,
    meetingUrl: `/study/room/${session.id}`,
    createdAt: session.created_at,
    updatedAt: session.updated_at,
  }));
}

// ============================================
// LOCAL STORAGE FALLBACK
// ============================================

function getLocalEvents(userId: string, startDate?: string, endDate?: string): CalendarEvent[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(EVENTS_KEY);
  if (!stored) return [];

  try {
    const events: CalendarEvent[] = JSON.parse(stored);
    return events.filter(event => {
      if (startDate && event.startDate < startDate) return false;
      if (endDate && event.startDate > endDate) return false;
      return true;
    });
  } catch {
    return [];
  }
}

function createLocalEvent(
  data: CreateEventData,
  userId: string
): { event: CalendarEvent; error: null } {
  const event: CalendarEvent = {
    id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: data.type,
    title: data.title,
    description: data.description,
    startDate: data.startDate,
    startTime: data.startTime,
    endDate: data.endDate,
    endTime: data.endTime,
    isAllDay: data.isAllDay || false,
    isRecurring: data.isRecurring || false,
    recurringPattern: data.recurringPattern,
    recurringUntil: data.recurringUntil,
    category: data.category,
    source: 'local',
    isShared: false,
    visibility: data.visibility || 'private',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Save to localStorage
  const existing = getLocalEvents(userId);
  existing.push(event);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(existing));

  return { event, error: null };
}

export function deleteLocalEvent(eventId: string): boolean {
  if (typeof window === 'undefined') return false;

  const stored = localStorage.getItem(EVENTS_KEY);
  if (!stored) return false;

  try {
    const events: CalendarEvent[] = JSON.parse(stored);
    const filtered = events.filter(e => e.id !== eventId);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}
