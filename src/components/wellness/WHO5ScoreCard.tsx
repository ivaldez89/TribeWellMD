'use client';

import {
  WHO5_THRESHOLDS,
  type WHO5Assessment,
  type WHO5Category,
  calculateWHO5Trend,
  getAverageWHO5Score,
  shouldPromptWHO5CheckIn
} from '@/types/who5';

interface WHO5ScoreCardProps {
  latestAssessment: WHO5Assessment | null;
  assessmentHistory: WHO5Assessment[];
  onStartCheckIn: () => void;
  streak: number;
}

export function WHO5ScoreCard({
  latestAssessment,
  assessmentHistory,
  onStartCheckIn,
  streak
}: WHO5ScoreCardProps) {
  const shouldCheckIn = shouldPromptWHO5CheckIn(latestAssessment);
  const trend = calculateWHO5Trend(assessmentHistory);
  const averageScore = getAverageWHO5Score(assessmentHistory, 30);

  const getCategoryColors = (category: WHO5Category | null) => {
    if (!category) return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
    switch (category) {
      case 'high': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'moderate': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'low': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
      case 'poor': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'improving':
        return (
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-xs font-medium">Improving</span>
          </div>
        );
      case 'declining':
        return (
          <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
            <span className="text-xs font-medium">Declining</span>
          </div>
        );
      case 'stable':
        return (
          <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
            </svg>
            <span className="text-xs font-medium">Stable</span>
          </div>
        );
      default:
        return null;
    }
  };

  const formatLastCheckIn = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Wellbeing Score
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            WHO-5 Well-Being Index
          </p>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#C4A77D]/10 text-[#8B7355] dark:text-[#C4A77D] rounded-full">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold">{streak} day streak</span>
          </div>
        )}
      </div>

      {/* Score display */}
      {latestAssessment ? (
        <div className="space-y-4">
          {/* Main score */}
          <div className="flex items-center gap-4">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${getCategoryColors(latestAssessment.category)}`}>
              <span className="text-3xl font-bold">{latestAssessment.percentScore}</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900 dark:text-white">
                {WHO5_THRESHOLDS[latestAssessment.category].label}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Last check-in: {formatLastCheckIn(latestAssessment.timestamp)}
              </p>
              {getTrendIcon()}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">30-Day Average</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {averageScore !== null ? averageScore : '--'}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Check-ins</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {assessmentHistory.length}
              </p>
            </div>
          </div>

          {/* Check-in button */}
          {shouldCheckIn ? (
            <button
              onClick={onStartCheckIn}
              className="w-full py-3 bg-gradient-to-r from-[#C4A77D] to-[#A89070] text-white font-semibold rounded-xl hover:from-[#B89B78] hover:to-[#9A8565] transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Daily Check-in
            </button>
          ) : (
            <div className="text-center py-3 text-slate-500 dark:text-slate-400 text-sm">
              <span className="inline-flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Today's check-in complete
              </span>
            </div>
          )}
        </div>
      ) : (
        /* No assessments yet */
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#C4A77D]/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-[#C4A77D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          </div>
          <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
            Start Tracking Your Wellbeing
          </h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Take a quick 2-minute check-in to measure your mental wellbeing using the validated WHO-5 scale.
          </p>
          <button
            onClick={onStartCheckIn}
            className="px-6 py-3 bg-gradient-to-r from-[#C4A77D] to-[#A89070] text-white font-semibold rounded-xl hover:from-[#B89B78] hover:to-[#9A8565] transition-all"
          >
            Take Your First Check-in
          </button>
        </div>
      )}
    </div>
  );
}
