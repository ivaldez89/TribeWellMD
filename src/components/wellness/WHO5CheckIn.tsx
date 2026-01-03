'use client';

import { useState } from 'react';
import {
  WHO5_QUESTIONS,
  WHO5_RESPONSE_OPTIONS,
  WHO5_THRESHOLDS,
  type WHO5Response,
  type WHO5Assessment,
  createWHO5Assessment,
  getWHO5Category,
  calculateWHO5RawScore,
  calculateWHO5PercentScore,
  WHO5_POINTS_REWARD,
  WHO5_XP_REWARD
} from '@/types/who5';

interface WHO5CheckInProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (assessment: WHO5Assessment) => void;
  userId: string;
}

export function WHO5CheckIn({ isOpen, onClose, onComplete, userId }: WHO5CheckInProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<(WHO5Response | null)[]>([null, null, null, null, null]);
  const [notes, setNotes] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<WHO5Assessment | null>(null);

  if (!isOpen) return null;

  const handleResponse = (value: WHO5Response) => {
    const newResponses = [...responses];
    newResponses[currentQuestion] = value;
    setResponses(newResponses);

    // Auto-advance to next question after short delay
    if (currentQuestion < 4) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    // Ensure all questions are answered
    if (responses.some(r => r === null)) return;

    const assessment = createWHO5Assessment(
      userId,
      {
        q1: responses[0] as WHO5Response,
        q2: responses[1] as WHO5Response,
        q3: responses[2] as WHO5Response,
        q4: responses[3] as WHO5Response,
        q5: responses[4] as WHO5Response
      },
      notes || undefined
    );

    setResult(assessment);
    setShowResults(true);
  };

  const handleComplete = () => {
    if (result) {
      onComplete(result);
    }
    // Reset state
    setCurrentQuestion(0);
    setResponses([null, null, null, null, null]);
    setNotes('');
    setShowResults(false);
    setResult(null);
    onClose();
  };

  const allAnswered = responses.every(r => r !== null);
  const progress = ((currentQuestion + 1) / 5) * 100;

  // Results screen
  if (showResults && result) {
    const interpretation = WHO5_THRESHOLDS[result.category];
    const colorClasses = {
      poor: 'text-red-600 bg-red-100 dark:bg-red-900/30',
      low: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
      moderate: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
      high: 'text-green-600 bg-green-100 dark:bg-green-900/30'
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
          {/* Header */}
          <div className="text-center mb-6">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${colorClasses[result.category]} mb-4`}>
              <span className="text-3xl font-bold">{result.percentScore}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {interpretation.label}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {interpretation.description}
            </p>
          </div>

          {/* Score breakdown */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-slate-600 dark:text-slate-400">Your Score</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {result.percentScore}/100
              </span>
            </div>
            {/* Score bar */}
            <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  result.category === 'high' ? 'bg-green-500' :
                  result.category === 'moderate' ? 'bg-yellow-500' :
                  result.category === 'low' ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${result.percentScore}%` }}
              />
            </div>
            {/* Scale labels */}
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              <span>Poor</span>
              <span>Low</span>
              <span>Moderate</span>
              <span>High</span>
            </div>
          </div>

          {/* Points earned */}
          <div className="flex items-center justify-center gap-6 mb-6 py-4 border-y border-slate-200 dark:border-slate-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#C4A77D]">+{WHO5_POINTS_REWARD}</div>
              <div className="text-xs text-slate-500">Points Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#5B7B6D]">+{WHO5_XP_REWARD}</div>
              <div className="text-xs text-slate-500">XP Earned</div>
            </div>
          </div>

          {/* Resources for low scores */}
          {(result.category === 'poor' || result.category === 'low') && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Resources Available
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                If you're struggling, you're not alone. Consider reaching out to:
              </p>
              <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                <li>Your school's counseling services</li>
                <li>988 Suicide & Crisis Lifeline (call or text 988)</li>
                <li>NAMI Helpline: 1-800-950-6264</li>
              </ul>
            </div>
          )}

          {/* Complete button */}
          <button
            onClick={handleComplete}
            className="w-full py-4 bg-gradient-to-r from-[#C4A77D] to-[#A89070] text-white font-bold rounded-xl hover:from-[#B89B78] hover:to-[#9A8565] transition-all"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // Question screen
  const question = WHO5_QUESTIONS[currentQuestion];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Daily Wellness Check-in
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Over the last two weeks...
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-500 mb-2">
            <span>Question {currentQuestion + 1} of 5</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#C4A77D] to-[#A89070] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <p className="text-lg font-medium text-slate-900 dark:text-white leading-relaxed">
            "{question.text}"
          </p>
        </div>

        {/* Response options */}
        <div className="space-y-2 mb-6">
          {WHO5_RESPONSE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleResponse(option.value as WHO5Response)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                responses[currentQuestion] === option.value
                  ? 'border-[#C4A77D] bg-[#C4A77D]/10 dark:bg-[#C4A77D]/20'
                  : 'border-slate-200 dark:border-slate-600 hover:border-[#C4A77D]/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  responses[currentQuestion] === option.value
                    ? 'border-[#C4A77D] bg-[#C4A77D]'
                    : 'border-slate-300 dark:border-slate-500'
                }`}>
                  {responses[currentQuestion] === option.value && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {option.label}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {currentQuestion > 0 && (
            <button
              onClick={handleBack}
              className="flex-1 py-3 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              Back
            </button>
          )}

          {currentQuestion < 4 ? (
            <button
              onClick={() => responses[currentQuestion] !== null && setCurrentQuestion(currentQuestion + 1)}
              disabled={responses[currentQuestion] === null}
              className="flex-1 py-3 bg-gradient-to-r from-[#C4A77D] to-[#A89070] text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-[#B89B78] hover:to-[#9A8565] transition-all"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className="flex-1 py-3 bg-gradient-to-r from-[#5B7B6D] to-[#7FA08F] text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-[#4A6A5C] hover:to-[#6E8F7E] transition-all"
            >
              See Results
            </button>
          )}
        </div>

        {/* Add notes on last question */}
        {currentQuestion === 4 && allAnswered && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Add a note (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How are you feeling today?"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#C4A77D] focus:border-transparent transition-all resize-none"
              rows={2}
            />
          </div>
        )}
      </div>
    </div>
  );
}
