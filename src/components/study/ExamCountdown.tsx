'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'step2_exam_date';

interface ExamCountdownProps {
  variant?: 'compact' | 'full';
}

export function ExamCountdown({ variant = 'full' }: ExamCountdownProps) {
  const [examDate, setExamDate] = useState<Date | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [inputDate, setInputDate] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load exam date from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const date = new Date(saved);
        if (!isNaN(date.getTime())) {
          setExamDate(date);
          setInputDate(saved);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Save exam date to localStorage
  const handleSave = () => {
    if (inputDate) {
      const date = new Date(inputDate);
      if (!isNaN(date.getTime())) {
        localStorage.setItem(STORAGE_KEY, inputDate);
        setExamDate(date);
      }
    }
    setShowPanel(false);
  };

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setExamDate(null);
    setInputDate('');
    setShowPanel(false);
  };

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!examDate) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const exam = new Date(examDate);
    exam.setHours(0, 0, 0, 0);
    const diff = exam.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = getDaysRemaining();

  // Get urgency color
  const getUrgencyColor = () => {
    if (daysRemaining === null) return 'text-slate-500';
    if (daysRemaining <= 7) return 'text-red-600';
    if (daysRemaining <= 30) return 'text-orange-600';
    if (daysRemaining <= 60) return 'text-amber-600';
    return 'text-emerald-600';
  };

  const getUrgencyBg = () => {
    if (daysRemaining === null) return 'bg-slate-100';
    if (daysRemaining <= 7) return 'bg-red-50 border-red-200';
    if (daysRemaining <= 30) return 'bg-orange-50 border-orange-200';
    if (daysRemaining <= 60) return 'bg-amber-50 border-amber-200';
    return 'bg-emerald-50 border-emerald-200';
  };

  const getMotivationalMessage = () => {
    if (daysRemaining === null) return '';
    if (daysRemaining < 0) return 'Your exam has passed!';
    if (daysRemaining === 0) return 'Today is the day! You got this!';
    if (daysRemaining === 1) return 'Tomorrow! Rest up and stay calm.';
    if (daysRemaining <= 7) return 'Final stretch! Focus on high-yield topics.';
    if (daysRemaining <= 14) return 'Two weeks out. Review weak areas.';
    if (daysRemaining <= 30) return 'One month to go. Stay consistent!';
    if (daysRemaining <= 60) return 'Good progress! Keep up the momentum.';
    return 'Plenty of time. Build a strong foundation!';
  };

  if (!isLoaded) {
    return null;
  }

  // Compact variant for header - floating dropdown
  if (variant === 'compact') {
    return (
      <div className="relative">
        {/* Toggle Button */}
        <button
          onClick={() => setShowPanel(!showPanel)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
            showPanel || examDate
              ? examDate ? `${getUrgencyBg()} ${getUrgencyColor()}` : 'bg-teal-100 text-teal-700'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
          }`}
          title={examDate ? `Exam: ${examDate.toLocaleDateString()}` : 'Set exam date'}
        >
          <span className="text-base">
            {!examDate ? '📅' : daysRemaining !== null && daysRemaining <= 7 ? '🔥' : daysRemaining !== null && daysRemaining <= 30 ? '📅' : '🎯'}
          </span>
          <span>
            {!examDate ? 'Exam' : daysRemaining !== null ? (daysRemaining < 0 ? 'Passed' : daysRemaining === 0 ? 'Today!' : `${daysRemaining}d`) : 'Exam'}
          </span>
        </button>

        {/* Dropdown Panel */}
        {showPanel && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[100]"
              onClick={() => setShowPanel(false)}
            />

            {/* Panel */}
            <div className="absolute right-0 mt-2 w-72 rounded-xl shadow-xl border z-[110] bg-white border-slate-200">
              <div className="p-4">
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Exam Date
                </h3>

                {/* Current exam info */}
                {examDate && daysRemaining !== null && (
                  <div className={`mb-4 p-3 rounded-lg ${getUrgencyBg()}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">
                        {daysRemaining <= 0 ? '🎓' : daysRemaining <= 7 ? '🔥' : daysRemaining <= 30 ? '📅' : '🎯'}
                      </span>
                      <div>
                        <div className={`text-2xl font-bold ${getUrgencyColor()}`}>
                          {daysRemaining < 0 ? 'Done!' : daysRemaining === 0 ? 'Today!' : `${daysRemaining} days`}
                        </div>
                        <div className="text-xs text-slate-500">
                          {examDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mt-2">{getMotivationalMessage()}</p>
                  </div>
                )}

                {/* Date input */}
                <div className="space-y-3">
                  <input
                    type="date"
                    value={inputDate}
                    onChange={(e) => setInputDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={!inputDate}
                      className="flex-1 px-3 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save
                    </button>
                    {examDate && (
                      <button
                        onClick={handleClear}
                        className="px-3 py-2 text-red-600 text-sm hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Full variant for dashboard
  return (
    <div className={`rounded-2xl border p-6 ${getUrgencyBg()}`}>
      {showPanel ? (
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Set Your Exam Date
          </h3>
          <input
            type="date"
            value={inputDate}
            onChange={(e) => setInputDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setShowPanel(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            {examDate && (
              <button
                onClick={handleClear}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      ) : examDate && daysRemaining !== null ? (
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-3xl">
              {daysRemaining <= 0 ? '🎓' : daysRemaining <= 7 ? '🔥' : daysRemaining <= 30 ? '📅' : '🎯'}
            </span>
            <h3 className="text-lg font-semibold text-slate-900">USMLE Step 2 CK</h3>
          </div>

          <div className={`text-5xl font-bold mb-2 ${getUrgencyColor()}`}>
            {daysRemaining < 0 ? 'Done!' : daysRemaining === 0 ? 'Today!' : daysRemaining}
          </div>

          {daysRemaining > 0 && (
            <p className="text-slate-600 mb-3">
              days until your exam
            </p>
          )}

          <p className="text-sm text-slate-500 mb-4">
            {getMotivationalMessage()}
          </p>

          <div className="text-xs text-slate-400 mb-4">
            {examDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>

          <button
            onClick={() => setShowPanel(true)}
            className="text-sm text-slate-500 hover:text-slate-700 underline"
          >
            Change date
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">Exam Countdown</h3>
          <p className="text-sm text-slate-500 mb-4">
            Set your exam date to stay motivated and track your progress
          </p>
          <button
            onClick={() => setShowPanel(true)}
            className="px-6 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
          >
            Set Exam Date
          </button>
        </div>
      )}
    </div>
  );
}

export default ExamCountdown;
