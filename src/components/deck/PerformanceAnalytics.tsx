'use client';

import type { TopicPerformance } from '@/types';

interface PerformanceAnalyticsProps {
  topicPerformance: TopicPerformance[];
}

export function PerformanceAnalytics({ topicPerformance }: PerformanceAnalyticsProps) {
  const weakTopics = topicPerformance.filter(t => t.strength === 'weak');
  const moderateTopics = topicPerformance.filter(t => t.strength === 'moderate');
  const strongTopics = topicPerformance.filter(t => t.strength === 'strong');
  const newTopics = topicPerformance.filter(t => t.strength === 'new');

  const strengthColors = {
    weak: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    moderate: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
    strong: { bg: 'bg-tribe-sage-100', text: 'text-tribe-sage-700', border: 'border-emerald-200' },
    new: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' }
  };

  if (topicPerformance.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
        <p className="text-slate-500">No cards to analyze yet. Start studying to see your performance!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-slate-900">Performance by Topic</h3>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-px bg-slate-200">
        <div className="bg-red-50 px-3 py-2 text-center">
          <p className="text-lg font-bold text-red-600">{weakTopics.length}</p>
          <p className="text-xs text-red-600/80">Needs Work</p>
        </div>
        <div className="bg-amber-50 px-3 py-2 text-center">
          <p className="text-lg font-bold text-amber-600">{moderateTopics.length}</p>
          <p className="text-xs text-amber-600/80">Moderate</p>
        </div>
        <div className="bg-tribe-sage-50 px-3 py-2 text-center">
          <p className="text-lg font-bold text-tribe-sage-600">{strongTopics.length}</p>
          <p className="text-xs text-tribe-sage-600/80">Strong</p>
        </div>
        <div className="bg-blue-50 px-3 py-2 text-center">
          <p className="text-lg font-bold text-blue-600">{newTopics.length}</p>
          <p className="text-xs text-blue-600/80">New</p>
        </div>
      </div>

      {/* Topic breakdown */}
      <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
        {/* Weak topics first */}
        {weakTopics.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Focus on These
            </p>
            <div className="space-y-2">
              {weakTopics.map(topic => (
                <TopicRow key={topic.topic} topic={topic} colors={strengthColors.weak} />
              ))}
            </div>
          </div>
        )}

        {/* Moderate topics */}
        {moderateTopics.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">
              Making Progress
            </p>
            <div className="space-y-2">
              {moderateTopics.map(topic => (
                <TopicRow key={topic.topic} topic={topic} colors={strengthColors.moderate} />
              ))}
            </div>
          </div>
        )}

        {/* Strong topics */}
        {strongTopics.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-tribe-sage-600 uppercase tracking-wide mb-2 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Mastered
            </p>
            <div className="space-y-2">
              {strongTopics.map(topic => (
                <TopicRow key={topic.topic} topic={topic} colors={strengthColors.strong} />
              ))}
            </div>
          </div>
        )}

        {/* New topics */}
        {newTopics.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
              Not Yet Reviewed
            </p>
            <div className="space-y-2">
              {newTopics.map(topic => (
                <TopicRow key={topic.topic} topic={topic} colors={strengthColors.new} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface TopicRowProps {
  topic: TopicPerformance;
  colors: { bg: string; text: string; border: string };
}

function TopicRow({ topic, colors }: TopicRowProps) {
  const retentionPercent = Math.round(topic.retentionRate * 100);
  
  return (
    <div className={`p-2.5 rounded-lg border ${colors.border} ${colors.bg}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${colors.text} truncate`}>{topic.topic}</p>
          <p className="text-xs text-slate-500">{topic.system} • {topic.totalCards} cards</p>
        </div>
        <div className="text-right ml-3">
          {topic.reviewedCards > 0 ? (
            <>
              <p className={`text-sm font-bold ${colors.text}`}>{retentionPercent}%</p>
              <p className="text-xs text-slate-500">
                {topic.correctCount}/{topic.correctCount + topic.incorrectCount}
              </p>
            </>
          ) : (
            <span className="text-xs text-slate-400">New</span>
          )}
        </div>
      </div>
      {topic.reviewedCards > 0 && (
        <div className="mt-2 h-1.5 bg-white/50 rounded-full overflow-hidden">
          <div 
            className={`h-full ${colors.text.replace('text', 'bg')} rounded-full transition-all`}
            style={{ width: `${retentionPercent}%` }}
          />
        </div>
      )}
    </div>
  );
}
