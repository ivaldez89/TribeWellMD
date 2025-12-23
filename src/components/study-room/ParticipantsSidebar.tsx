'use client';

import { SessionParticipant } from '@/types/studyRoom';

interface ParticipantsSidebarProps {
  participants: SessionParticipant[];
  currentUserId: string;
  isConnected: boolean;
}

export function ParticipantsSidebar({
  participants,
  currentUserId,
  isConnected,
}: ParticipantsSidebarProps) {
  // Sort: host first, then online, then by name
  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.role === 'host' && b.role !== 'host') return -1;
    if (b.role === 'host' && a.role !== 'host') return 1;
    if (a.isOnline && !b.isOnline) return -1;
    if (b.isOnline && !a.isOnline) return 1;
    return a.displayName.localeCompare(b.displayName);
  });

  const onlineCount = participants.filter((p) => p.isOnline).length;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-tribe-sage-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Participants
          </h3>
          <span className="px-2 py-0.5 bg-tribe-sage-100 dark:bg-tribe-sage-900/30 text-tribe-sage-700 dark:text-tribe-sage-400 text-xs font-medium rounded-full">
            {onlineCount} online
          </span>
        </div>
      </div>

      {/* Connection status */}
      {!isConnected && (
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Connecting...
          </p>
        </div>
      )}

      {/* Participants list */}
      <div className="p-2 max-h-80 overflow-y-auto">
        {sortedParticipants.length === 0 ? (
          <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-sm">
            No participants yet
          </div>
        ) : (
          <div className="space-y-1">
            {sortedParticipants.map((participant) => (
              <div
                key={participant.id}
                className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${
                  participant.userId === currentUserId
                    ? 'bg-tribe-sage-50 dark:bg-tribe-sage-900/20'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                {/* Avatar */}
                <div className="relative">
                  {participant.avatarUrl ? (
                    <img
                      src={participant.avatarUrl}
                      alt={participant.displayName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 via-cyan-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                      {participant.displayName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                  )}
                  {/* Online indicator */}
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ${
                      participant.isOnline ? 'bg-tribe-sage-500' : 'bg-slate-400'
                    }`}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-slate-900 dark:text-white text-sm truncate">
                      {participant.displayName}
                      {participant.userId === currentUserId && (
                        <span className="text-slate-400 dark:text-slate-500"> (you)</span>
                      )}
                    </span>
                    {participant.role === 'host' && (
                      <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs rounded font-medium">
                        Host
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    {participant.pomodorosCompleted > 0 && (
                      <span className="flex items-center gap-0.5">
                        <span>🍅</span>
                        <span>{participant.pomodorosCompleted}</span>
                      </span>
                    )}
                    <span className={participant.isOnline ? 'text-tribe-sage-500' : ''}>
                      {participant.isOnline ? 'Online' : 'Away'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with invite info */}
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          {participants.length} / 10 participants
        </p>
      </div>
    </div>
  );
}
