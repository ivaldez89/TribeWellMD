'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ThreeColumnLayout, CARD_STYLES, ThreeColumnLayoutSkeleton } from '@/components/layout/ThreeColumnLayout';
import { UnifiedCalendarHub } from '@/components/calendar/UnifiedCalendarHub';
import { useIsAuthenticated } from '@/hooks/useAuth';
import { useCalendarHub } from '@/hooks/useCalendarHub';
import { CalendarIcon, SparklesIcon } from '@/components/icons/MedicalIcons';
import { getEventColor, formatEventTime, type CalendarEvent } from '@/types/calendar';

export default function DashboardPage() {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const { events } = useCalendarHub();

  // Redirect if not authenticated
  useEffect(() => {
    if (isAuthenticated === false) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Get today's and upcoming events/tasks
  const { todayEvents, upcomingTasks, upcomingEvents, displayEvents, eventsHeaderTitle } = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // All events for today (not just non-tasks)
    const todayEvts = events
      .filter(e => e.startDate === todayStr)
      .sort((a, b) => {
        if (!a.startTime) return -1;
        if (!b.startTime) return 1;
        return a.startTime.localeCompare(b.startTime);
      })
      .slice(0, 5);

    // Tasks for next 7 days
    const tasks = events
      .filter(e => e.type === 'task')
      .filter(e => {
        const eventDate = new Date(e.startDate);
        const diffDays = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
      })
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .slice(0, 5);

    // Upcoming events (non-task) for next 7 days
    const upcoming = events
      .filter(e => e.type !== 'task')
      .filter(e => {
        const eventDate = new Date(e.startDate);
        const diffDays = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays <= 7;
      })
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .slice(0, 5);

    // For Events sidebar box: today's non-task events OR upcoming non-task events
    const todayNonTaskEvents = events
      .filter(e => e.startDate === todayStr && e.type !== 'task')
      .sort((a, b) => {
        if (!a.startTime) return -1;
        if (!b.startTime) return 1;
        return a.startTime.localeCompare(b.startTime);
      });

    const displayEvts = todayNonTaskEvents.length > 0 ? todayNonTaskEvents : upcoming;
    const headerTitle = todayNonTaskEvents.length > 0 ? 'Today' : 'Upcoming';

    return {
      todayEvents: todayEvts,
      upcomingTasks: tasks,
      upcomingEvents: upcoming,
      displayEvents: displayEvts,
      eventsHeaderTitle: headerTitle
    };
  }, [events]);

  // Format date for display
  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateStr === today.toISOString().split('T')[0]) {
      return 'Today';
    }
    if (dateStr === tomorrow.toISOString().split('T')[0]) {
      return 'Tomorrow';
    }
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (isAuthenticated === null) {
    return (
      <ThreeColumnLayout
        isLoading={true}
        loadingContent={<ThreeColumnLayoutSkeleton />}
      >
        <div />
      </ThreeColumnLayout>
    );
  }

  // Mobile Header
  const mobileHeader = (
    <div className={CARD_STYLES.containerWithPadding}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5B7B6D] to-[#7FA08F] flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Calendar & Tasks</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{todayEvents.length} events today</p>
        </div>
      </div>
    </div>
  );

  // Left Sidebar
  const leftSidebar = (
    <>
      {/* Header Card */}
      <div className={CARD_STYLES.container + ' overflow-hidden'}>
        <div className="h-16 bg-gradient-to-br from-[#5B7B6D] via-[#6B8B7D] to-[#8B7355] flex items-center px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white">Calendar</h2>
          </div>
        </div>

        <div className="px-4 py-4">
          <div className="grid grid-cols-2 gap-2 text-center mb-4">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700">
              <p className="text-xl font-bold text-[#5B7B6D]">{todayEvents.length}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Today</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700">
              <p className="text-xl font-bold text-[#C4A77D]">{upcomingTasks.length}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Tasks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className={CARD_STYLES.containerWithPadding.replace('p-4', 'p-3')}>
        <h3 className="font-semibold text-slate-900 dark:text-white px-3 py-2 text-sm">Quick Links</h3>
        <nav className="space-y-1">
          <Link href="/flashcards" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C4A77D] to-[#D4B78D] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-[#C4A77D]">Flashcards</span>
          </Link>

          <Link href="/wellness" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5B7B6D] to-[#7FA08F] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-[#5B7B6D]">Wellness</span>
          </Link>

          <Link href="/progress/rapid-review" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-orange-500">Rapid Review</span>
          </Link>
        </nav>
      </div>

      {/* Upcoming Tasks */}
      {upcomingTasks.length > 0 && (
        <div className={CARD_STYLES.containerWithPadding}>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#C4A77D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Tasks
          </h3>
          <div className="space-y-2">
            {upcomingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-2 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="w-5 h-5 rounded-full border-2 border-[#C4A77D] flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{task.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{formatEventDate(task.startDate)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  // Right Sidebar
  const rightSidebar = (
    <>
      {/* Today's Schedule */}
      <div className={CARD_STYLES.containerWithPadding}>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-[#5B7B6D]" />
          Today&apos;s Schedule
        </h3>
        {todayEvents.length > 0 ? (
          <div className="space-y-2">
            {todayEvents.map((event) => (
              <div
                key={event.id}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700"
              >
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{event.title}</p>
                {event.startTime && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{event.startTime}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
            No events scheduled for today
          </p>
        )}
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className={CARD_STYLES.containerWithPadding}>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Upcoming</h3>
          <div className="space-y-2">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700"
              >
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{event.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{formatEventDate(event.startDate)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className={CARD_STYLES.containerWithPadding}>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-amber-500" />
          Tips
        </h3>
        <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <span className="font-medium text-[#5B7B6D]">Click any date</span> to add a new event or task.
          </p>
        </div>
      </div>

      {/* Events - Moved from calendar */}
      <div className={CARD_STYLES.container + ' overflow-hidden'}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Events
          </h3>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
            {eventsHeaderTitle}
          </span>
        </div>

        {/* Events List */}
        <div className="max-h-[200px] overflow-y-auto">
          {displayEvents.length === 0 ? (
            <div className="flex items-center justify-center py-6 px-4 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No upcoming events
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {displayEvents.map((event) => (
                <EventItem
                  key={event.id}
                  event={event}
                  showDate={eventsHeaderTitle !== 'Today'}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <ThreeColumnLayout
      mobileHeader={mobileHeader}
      leftSidebar={leftSidebar}
      rightSidebar={rightSidebar}
    >
      {/* Calendar - Main Content */}
      <div className={CARD_STYLES.container + ' overflow-hidden'}>
        <div className="h-[600px] lg:h-[700px]">
          <UnifiedCalendarHub />
        </div>
      </div>
    </ThreeColumnLayout>
  );
}

// Individual Event Item for sidebar display
function EventItem({
  event,
  showDate,
}: {
  event: CalendarEvent;
  showDate: boolean;
}) {
  const color = getEventColor(event);
  const isGroupSession = event.type === 'study-room' || event.linkedRoomId;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const content = (
    <div className="group px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-3">
      {/* Color indicator */}
      <div
        className="w-1 h-10 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
            {event.title}
          </p>
          {isGroupSession && (
            <span className="flex-shrink-0 text-xs px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded">
              Group
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {formatEventTime(event)}
          </span>
          {showDate && (
            <span className="text-xs text-slate-400 dark:text-slate-500">
              • {formatDate(event.startDate)}
            </span>
          )}
        </div>
      </div>

      {/* Arrow for group sessions */}
      {isGroupSession && (
        <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </div>
  );

  if (isGroupSession && event.linkedRoomId) {
    return (
      <Link href={`/progress/room/${event.linkedRoomId}`}>
        {content}
      </Link>
    );
  }

  return content;
}
