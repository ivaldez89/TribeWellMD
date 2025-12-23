'use client';

import type { SocialImpactGoal } from '@/types/tribes';
import { getGoalProgress, getCauseLabel } from '@/lib/storage/tribeStorage';

interface TribeGoalProgressProps {
  goal: SocialImpactGoal;
  color: string;
}

export function TribeGoalProgress({ goal, color }: TribeGoalProgressProps) {
  const progress = getGoalProgress(goal);
  const isCompleted = !!goal.completedAt;

  const causeIcons: Record<SocialImpactGoal['cause'], string> = {
    'red-cross': '❤️',
    'animal-shelter': '🐾',
    environment: '🌍',
    education: '📚',
    healthcare: '🏥',
    community: '🤝',
  };

  const formatDeadline = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `${diffDays} days left`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks left`;
    return `${Math.floor(diffDays / 30)} months left`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className={`px-6 py-4 bg-gradient-to-r ${color}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{causeIcons[goal.cause]}</span>
            <div>
              <h3 className="font-bold text-white text-lg">{goal.title}</h3>
              <p className="text-white/80 text-sm">{getCauseLabel(goal.cause)}</p>
            </div>
          </div>
          {isCompleted && (
            <span className="px-3 py-1 bg-white text-tribe-sage-600 rounded-full text-sm font-semibold flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Completed
            </span>
          )}
        </div>
      </div>

      {/* Progress section */}
      <div className="p-6">
        <p className="text-slate-600 mb-4">{goal.description}</p>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Progress</span>
            <span className="text-sm font-bold text-tribe-sage-600">{progress}%</span>
          </div>
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500 relative`}
              style={{ width: `${progress}%` }}
            >
              {progress > 10 && (
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              )}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-tribe-sage-600">
              {goal.currentPoints.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">Current Points</p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-700">
              {goal.targetPoints.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">Target Points</p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-amber-600">
              {(goal.targetPoints - goal.currentPoints).toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">Points to Go</p>
          </div>
        </div>

        {/* Deadline & Reward */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>{formatDeadline(goal.deadline)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏅</span>
            <span className="text-sm font-medium text-slate-700">{goal.reward}</span>
          </div>
        </div>
      </div>

      {/* Motivation footer */}
      {!isCompleted && progress < 100 && (
        <div className={`px-6 py-3 bg-gradient-to-r ${color} bg-opacity-10`}>
          <p className="text-sm text-center">
            {progress < 25 && "🚀 Just getting started! Every point counts."}
            {progress >= 25 && progress < 50 && "💪 Great progress! Keep the momentum going."}
            {progress >= 50 && progress < 75 && "🔥 Over halfway there! The goal is in sight."}
            {progress >= 75 && progress < 100 && "⭐ Almost there! Final push to the finish!"}
          </p>
        </div>
      )}
    </div>
  );
}
