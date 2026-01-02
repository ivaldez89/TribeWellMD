'use client';

import type { VignetteSession, DecisionRecord, ClinicalVignette } from '@/types';

interface VignetteProgressProps {
  session: VignetteSession;
  vignette: ClinicalVignette;
}

export function VignetteProgress({ session, vignette }: VignetteProgressProps) {
  const { decisions } = session;

  // Calculate stats
  const totalDecisions = decisions.length;
  const optimalDecisions = decisions.filter(d => d.wasOptimal).length;
  const acceptableDecisions = decisions.filter(d => d.wasAcceptable && !d.wasOptimal).length;
  const suboptimalDecisions = decisions.filter(d => !d.wasAcceptable).length;

  const optimalPercentage = totalDecisions > 0 ? Math.round((optimalDecisions / totalDecisions) * 100) : 0;

  // Calculate total time
  const totalTimeMs = decisions.reduce((sum, d) => sum + d.timeSpentMs, 0);
  const totalTimeSeconds = Math.round(totalTimeMs / 1000);
  const minutes = Math.floor(totalTimeSeconds / 60);
  const seconds = totalTimeSeconds % 60;

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalDecisions}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Decisions</div>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800 text-center">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{optimalDecisions}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Optimal</div>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/30 rounded-xl p-4 border border-amber-200 dark:border-amber-800 text-center">
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{acceptableDecisions}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Acceptable</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Time Spent</div>
        </div>
      </div>

      {/* Score ring */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-6">
          {/* Circular progress */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-24 h-24 transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-slate-200 dark:text-slate-700"
              />
              {/* Progress circle */}
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                className={optimalPercentage >= 80 ? 'text-emerald-500' : optimalPercentage >= 50 ? 'text-amber-500' : 'text-red-500'}
                strokeDasharray={`${(optimalPercentage / 100) * 251.2} 251.2`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-slate-900 dark:text-white">{optimalPercentage}%</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className={`font-semibold mb-1 ${
              optimalPercentage >= 80
                ? 'text-emerald-600 dark:text-emerald-400'
                : optimalPercentage >= 50
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-red-600 dark:text-red-400'
            }`}>
              {session.completedOptimally
                ? 'Perfect Path!'
                : optimalPercentage >= 80
                  ? 'Excellent Work'
                  : optimalPercentage >= 50
                    ? 'Good Effort'
                    : 'Room for Improvement'
              }
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {session.completedOptimally
                ? 'You made optimal choices at every decision point.'
                : `You made ${optimalDecisions} optimal choice${optimalDecisions !== 1 ? 's' : ''} out of ${totalDecisions} decisions.`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Decision path */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Your Decision Path</h3>

        <div className="space-y-3">
          {decisions.map((decision, index) => {
            const node = vignette.nodes[decision.nodeId];
            const choice = node?.choices?.find(c => c.id === decision.choiceId);

            return (
              <DecisionStep
                key={decision.nodeId}
                index={index + 1}
                nodeName={node?.id || 'Unknown'}
                choiceText={choice?.text || 'Unknown choice'}
                wasOptimal={decision.wasOptimal}
                wasAcceptable={decision.wasAcceptable}
                timeSpentMs={decision.timeSpentMs}
                isLast={index === decisions.length - 1}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface DecisionStepProps {
  index: number;
  nodeName: string;
  choiceText: string;
  wasOptimal: boolean;
  wasAcceptable: boolean;
  timeSpentMs: number;
  isLast: boolean;
}

function DecisionStep({
  index,
  nodeName,
  choiceText,
  wasOptimal,
  wasAcceptable,
  timeSpentMs,
  isLast
}: DecisionStepProps) {
  const timeSeconds = Math.round(timeSpentMs / 1000);

  return (
    <div className="flex gap-3">
      {/* Timeline indicator */}
      <div className="flex flex-col items-center">
        <div
          className={`
            w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
            ${wasOptimal
              ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
              : wasAcceptable
                ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'
                : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'
            }
          `}
        >
          {wasOptimal ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : wasAcceptable ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        {!isLast && (
          <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-700 mt-1" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-slate-900 dark:text-white">
            Decision {index}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">{timeSeconds}s</span>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300">{choiceText}</p>
        <div className="mt-1">
          <span
            className={`
              inline-flex px-2 py-0.5 text-xs font-medium rounded
              ${wasOptimal
                ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400'
                : wasAcceptable
                  ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400'
                  : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400'
              }
            `}
          >
            {wasOptimal ? 'Optimal' : wasAcceptable ? 'Acceptable' : 'Suboptimal'}
          </span>
        </div>
      </div>
    </div>
  );
}
