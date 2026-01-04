'use client';

import { useState } from 'react';
import { CalendarEvent, CreateEventData, EventType, dateToString } from '@/types/calendar';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateEventData) => Promise<void>;
  onDelete?: (eventId: string) => Promise<void>;
  initialDate?: Date;
  initialTime?: string;
  existingEvent?: CalendarEvent;
}

export function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialDate,
  initialTime,
  existingEvent,
}: EventModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [title, setTitle] = useState(existingEvent?.title || '');
  const [description, setDescription] = useState(existingEvent?.description || '');
  const [startDate, setStartDate] = useState(
    existingEvent?.startDate || (initialDate ? dateToString(initialDate) : dateToString(new Date()))
  );
  const [startTime, setStartTime] = useState(existingEvent?.startTime || initialTime || '09:00');
  const [endTime, setEndTime] = useState(existingEvent?.endTime || '10:00');
  const [isAllDay, setIsAllDay] = useState(existingEvent?.isAllDay || false);
  const [isGroupSession, setIsGroupSession] = useState(
    existingEvent?.type === 'study-room' || existingEvent?.linkedRoomId !== undefined
  );

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      // Default to study-session type, but create study room if group session is enabled
      const eventType: EventType = isGroupSession ? 'study-room' : 'study-session';

      await onSave({
        type: eventType,
        title: title.trim(),
        description: description.trim() || undefined,
        startDate,
        startTime: isAllDay ? undefined : startTime,
        endTime: isAllDay ? undefined : endTime,
        isAllDay,
        createStudyRoom: isGroupSession,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {existingEvent ? 'Edit Event' : 'Add Event'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's on your schedule?"
              className="w-full px-4 py-3 text-lg border-0 border-b-2 border-slate-200 dark:border-slate-600 bg-transparent focus:border-[#5B7B6D] focus:ring-0 text-slate-900 dark:text-white placeholder-slate-400"
              required
              autoFocus
            />
          </div>

          {/* Group Study Session Toggle */}
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Group Pocket Time
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Start a session others can join
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsGroupSession(!isGroupSession)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  isGroupSession ? 'bg-[#5B7B6D]' : 'bg-slate-200 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    isGroupSession ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#5B7B6D] focus:border-transparent"
              required
            />
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">All day</span>
            <button
              type="button"
              onClick={() => setIsAllDay(!isAllDay)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                isAllDay ? 'bg-[#5B7B6D]' : 'bg-slate-200 dark:bg-slate-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  isAllDay ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>

          {/* Time Selection */}
          {!isAllDay && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Start
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#5B7B6D] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  End
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#5B7B6D] focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Notes
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any details..."
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#5B7B6D] focus:border-transparent resize-none placeholder-slate-400"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {existingEvent && onDelete && (
              <button
                type="button"
                onClick={async () => {
                  if (confirm('Are you sure you want to delete this event?')) {
                    setIsDeleting(true);
                    try {
                      await onDelete(existingEvent.id);
                      onClose();
                    } finally {
                      setIsDeleting(false);
                    }
                  }
                }}
                disabled={isDeleting}
                className="px-4 py-2.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className={`${existingEvent && onDelete ? '' : 'flex-1'} px-4 py-2.5 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="flex-1 px-4 py-2.5 bg-[#5B7B6D] text-white rounded-xl hover:bg-[#4A6A5C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting ? 'Saving...' : existingEvent ? 'Save' : 'Add Event'}
            </button>
          </div>
        </form>

        {/* Calendar Connect Section */}
        <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-700">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">
            Connect your calendar
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google Calendar
            </button>
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            >
              <svg className="w-4 h-4 text-[#0078D4]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.17 3H2.83A1.83 1.83 0 0 0 1 4.83v14.34A1.83 1.83 0 0 0 2.83 21h18.34A1.83 1.83 0 0 0 23 19.17V4.83A1.83 1.83 0 0 0 21.17 3zM12 17.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z"/>
              </svg>
              Outlook
            </button>
            <button
              type="button"
              disabled
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              School Portal
              <span className="text-[10px] text-slate-400">Coming soon</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
