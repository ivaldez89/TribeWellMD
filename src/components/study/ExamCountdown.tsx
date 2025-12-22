'use client';

import { useState, useEffect } from 'react';

// Storage keys
const STORAGE_KEY = 'tribewellmd_exams';

// Exam types
type ExamType = 'step1' | 'step2ck' | 'step3' | 'shelf';

// Time range options for approximate dates
type TimeRange = 'exact' | '1month' | '3months' | '6months' | '1year' | '18months';

interface Exam {
  id: string;
  type: ExamType;
  name: string;
  shelfCategory?: string; // For shelf exams: "Internal Medicine", "Surgery", etc.
  dateType: 'exact' | 'approximate';
  exactDate?: string; // ISO date string
  timeRange?: TimeRange;
  createdAt: string;
  isPrimary: boolean; // The main exam to show countdown for
}

// Shelf exam categories
const SHELF_CATEGORIES = [
  'Internal Medicine',
  'Surgery',
  'Pediatrics',
  'OB/GYN',
  'Psychiatry',
  'Family Medicine',
  'Neurology',
  'Emergency Medicine',
];

// Time range labels and approximate days
const TIME_RANGES: Record<TimeRange, { label: string; days: number }> = {
  exact: { label: 'Exact Date', days: 0 },
  '1month': { label: '~1 Month', days: 30 },
  '3months': { label: '~3 Months', days: 90 },
  '6months': { label: '~6 Months', days: 180 },
  '1year': { label: '~1 Year', days: 365 },
  '18months': { label: '~1.5 Years', days: 548 },
};

// Get exams from localStorage
function getExams(): Exam[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Save exams to localStorage
function saveExams(exams: Exam[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exams));
  }
}

// Calculate days until exam
function getDaysUntil(exam: Exam): number | null {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (exam.dateType === 'exact' && exam.exactDate) {
    const examDate = new Date(exam.exactDate);
    examDate.setHours(0, 0, 0, 0);
    const diff = examDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  } else if (exam.dateType === 'approximate' && exam.timeRange) {
    // Calculate from creation date
    const createdDate = new Date(exam.createdAt);
    createdDate.setHours(0, 0, 0, 0);
    const targetDays = TIME_RANGES[exam.timeRange].days;
    const targetDate = new Date(createdDate.getTime() + targetDays * 24 * 60 * 60 * 1000);
    const diff = targetDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
  return null;
}

// Get exam display name
function getExamDisplayName(exam: Exam): string {
  switch (exam.type) {
    case 'step1':
      return 'USMLE Step 1';
    case 'step2ck':
      return 'Step 2 CK';
    case 'step3':
      return 'USMLE Step 3';
    case 'shelf':
      return exam.shelfCategory ? `${exam.shelfCategory} Shelf` : 'Shelf Exam';
    default:
      return exam.name;
  }
}

// Get urgency styling
function getUrgencyStyles(daysRemaining: number | null) {
  if (daysRemaining === null) return { bg: 'bg-slate-100', text: 'text-slate-500', gradient: 'from-slate-400 to-slate-500' };
  if (daysRemaining <= 7) return { bg: 'bg-red-50 border-red-200', text: 'text-red-600', gradient: 'from-red-500 to-rose-500' };
  if (daysRemaining <= 30) return { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-600', gradient: 'from-orange-500 to-amber-500' };
  if (daysRemaining <= 60) return { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-600', gradient: 'from-amber-500 to-yellow-500' };
  return { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-600', gradient: 'from-teal-500 to-emerald-500' };
}

interface ExamCountdownProps {
  variant?: 'compact' | 'full' | 'expanded';
}

export function ExamCountdown({ variant = 'full' }: ExamCountdownProps) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // New exam form state
  const [newExamType, setNewExamType] = useState<ExamType>('step2ck');
  const [newShelfCategory, setNewShelfCategory] = useState(SHELF_CATEGORIES[0]);
  const [newDateType, setNewDateType] = useState<'exact' | 'approximate'>('exact');
  const [newExactDate, setNewExactDate] = useState('');
  const [newTimeRange, setNewTimeRange] = useState<TimeRange>('3months');

  // Load exams on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setExams(getExams());
      setIsLoaded(true);
    }
  }, []);

  // Get primary exam (the one to show in compact view)
  const primaryExam = exams.find(e => e.isPrimary) || exams[0];
  const primaryDays = primaryExam ? getDaysUntil(primaryExam) : null;
  const styles = getUrgencyStyles(primaryDays);

  // Add new exam
  const handleAddExam = () => {
    const newExam: Exam = {
      id: `exam_${Date.now()}`,
      type: newExamType,
      name: newExamType === 'shelf' ? `${newShelfCategory} Shelf` : getExamDisplayName({ type: newExamType } as Exam),
      shelfCategory: newExamType === 'shelf' ? newShelfCategory : undefined,
      dateType: newDateType,
      exactDate: newDateType === 'exact' ? newExactDate : undefined,
      timeRange: newDateType === 'approximate' ? newTimeRange : undefined,
      createdAt: new Date().toISOString(),
      isPrimary: exams.length === 0, // First exam is primary
    };

    const updatedExams = [...exams, newExam];
    setExams(updatedExams);
    saveExams(updatedExams);
    setShowAddModal(false);
    resetForm();
  };

  // Set primary exam
  const handleSetPrimary = (examId: string) => {
    const updatedExams = exams.map(e => ({ ...e, isPrimary: e.id === examId }));
    setExams(updatedExams);
    saveExams(updatedExams);
  };

  // Delete exam
  const handleDeleteExam = (examId: string) => {
    let updatedExams = exams.filter(e => e.id !== examId);
    // If we deleted the primary, make the first one primary
    if (updatedExams.length > 0 && !updatedExams.some(e => e.isPrimary)) {
      updatedExams[0].isPrimary = true;
    }
    setExams(updatedExams);
    saveExams(updatedExams);
  };

  // Reset form
  const resetForm = () => {
    setNewExamType('step2ck');
    setNewShelfCategory(SHELF_CATEGORIES[0]);
    setNewDateType('exact');
    setNewExactDate('');
    setNewTimeRange('3months');
  };

  if (!isLoaded) {
    return null;
  }

  // Expanded variant for hero section - full width with more details
  if (variant === 'expanded') {
    return (
      <div className="relative w-full">
        {/* Toggle Button - Full width, expanded style */}
        <button
          onClick={() => setShowPanel(!showPanel)}
          className={`w-full flex items-center justify-between px-6 py-4 font-semibold rounded-xl shadow-lg transition-all hover:scale-[1.01] ${
            primaryExam
              ? `bg-gradient-to-r ${styles.gradient} text-white shadow-lg`
              : 'bg-white/95 backdrop-blur-sm text-slate-700 border border-white/50 hover:bg-white shadow-lg'
          }`}
          title={primaryExam ? `${getExamDisplayName(primaryExam)}: ${primaryDays} days` : 'Set exam date'}
        >
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>
              {!primaryExam
                ? 'Set Exam Date'
                : getExamDisplayName(primaryExam)
              }
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">
              {!primaryExam
                ? ''
                : primaryDays !== null
                  ? (primaryDays < 0
                      ? 'Passed!'
                      : primaryDays === 0
                        ? 'Today!'
                        : `${primaryDays} days`)
                  : ''
              }
            </span>
            {exams.length > 1 && (
              <span className="px-2 py-0.5 bg-white/20 text-xs rounded-full">{exams.length} exams</span>
            )}
            <svg className={`w-5 h-5 transition-transform ${showPanel ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
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
            <div className="absolute left-0 right-0 mt-2 rounded-xl shadow-xl border z-[110] bg-white border-slate-200 max-h-[70vh] overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    My Exams
                  </h3>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="text-xs px-2 py-1 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors"
                  >
                    + Add Exam
                  </button>
                </div>

                {exams.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-500 mb-3">No exams scheduled</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="text-sm text-teal-600 hover:underline"
                    >
                      Add your first exam
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {exams.map(exam => {
                      const days = getDaysUntil(exam);
                      const examStyles = getUrgencyStyles(days);
                      return (
                        <div
                          key={exam.id}
                          className={`p-3 rounded-lg border ${exam.isPrimary ? examStyles.bg : 'bg-slate-50 border-slate-200'}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-slate-900 text-sm">
                                  {getExamDisplayName(exam)}
                                </h4>
                                {exam.isPrimary && (
                                  <span className="px-1.5 py-0.5 bg-teal-500 text-white text-[10px] rounded-full">PRIMARY</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-lg font-bold ${examStyles.text}`}>
                                  {days !== null
                                    ? days < 0
                                      ? 'Passed'
                                      : days === 0
                                        ? 'Today!'
                                        : `${days} days`
                                    : 'Not set'}
                                </span>
                                {exam.dateType === 'approximate' && (
                                  <span className="text-[10px] text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded">~approx</span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                {exam.dateType === 'exact' && exam.exactDate
                                  ? new Date(exam.exactDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                                  : exam.timeRange
                                    ? TIME_RANGES[exam.timeRange].label
                                    : ''}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {!exam.isPrimary && (
                                <button
                                  onClick={() => handleSetPrimary(exam.id)}
                                  className="p-1 text-slate-400 hover:text-teal-600 transition-colors"
                                  title="Set as primary"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                  </svg>
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteExam(exam.id)}
                                className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                title="Delete exam"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Study recommendations based on exams */}
                {primaryExam && primaryDays !== null && primaryDays > 0 && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg">
                    <p className="text-xs font-medium text-slate-700 mb-1">Study Focus</p>
                    <p className="text-[11px] text-slate-600">
                      {primaryDays <= 7
                        ? 'Final review! Focus on high-yield topics and weak areas.'
                        : primaryDays <= 14
                          ? 'Review weak areas and do full practice exams.'
                          : primaryDays <= 30
                            ? 'Increase QBank volume. Target 40-60 questions/day.'
                            : primaryDays <= 60
                              ? 'Build foundation with First Pass of UWorld.'
                              : 'Focus on learning concepts. Start with your weakest systems.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Add Exam Modal */}
        {showAddModal && (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50"
            onClick={() => {
              setShowAddModal(false);
              resetForm();
            }}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-teal-500 to-emerald-500">
                <h3 className="text-lg font-semibold text-white">Add Exam</h3>
                <p className="text-sm text-white/80">
                  Plan your upcoming exams
                </p>
              </div>

              <div className="p-6 space-y-4">
                {/* Exam Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Exam Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['step1', 'step2ck', 'step3', 'shelf'] as ExamType[]).map(type => (
                      <button
                        key={type}
                        onClick={() => setNewExamType(type)}
                        className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                          newExamType === type
                            ? 'border-teal-500 bg-teal-50 text-teal-700'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        {type === 'step1' && 'Step 1'}
                        {type === 'step2ck' && 'Step 2 CK'}
                        {type === 'step3' && 'Step 3'}
                        {type === 'shelf' && 'Shelf Exam'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shelf Category (if shelf selected) */}
                {newExamType === 'shelf' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Shelf Category</label>
                    <select
                      value={newShelfCategory}
                      onChange={(e) => setNewShelfCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {SHELF_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Date Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">When is your exam?</label>
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => setNewDateType('exact')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                        newDateType === 'exact'
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Exact Date
                    </button>
                    <button
                      onClick={() => setNewDateType('approximate')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                        newDateType === 'approximate'
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Approximate
                    </button>
                  </div>

                  {newDateType === 'exact' ? (
                    <input
                      type="date"
                      value={newExactDate}
                      onChange={(e) => setNewExactDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.keys(TIME_RANGES) as TimeRange[]).filter(k => k !== 'exact').map(range => (
                        <button
                          key={range}
                          onClick={() => setNewTimeRange(range)}
                          className={`px-2 py-2 text-xs rounded-lg border-2 transition-all ${
                            newTimeRange === range
                              ? 'border-teal-500 bg-teal-50 text-teal-700'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          {TIME_RANGES[range].label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex gap-2">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="flex-1 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddExam}
                  disabled={newDateType === 'exact' && !newExactDate}
                  className="flex-1 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Exam
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Compact variant for hero section
  if (variant === 'compact') {
    return (
      <div className="relative flex-1">
        {/* Toggle Button - Matches Rapid Review button style */}
        <button
          onClick={() => setShowPanel(!showPanel)}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-xl shadow-lg transition-all hover:scale-[1.02] ${
            primaryExam
              ? `bg-gradient-to-r ${styles.gradient} text-white shadow-lg`
              : 'bg-white/95 backdrop-blur-sm text-slate-700 border border-white/50 hover:bg-white shadow-lg'
          }`}
          title={primaryExam ? `${getExamDisplayName(primaryExam)}: ${primaryDays} days` : 'Set exam date'}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="hidden sm:inline">
            {!primaryExam
              ? 'Exams'
              : primaryDays !== null
                ? (primaryDays < 0
                    ? 'Passed!'
                    : primaryDays === 0
                      ? 'Today!'
                      : `${primaryDays}d`)
                : 'Exams'
            }
          </span>
          <span className="sm:hidden">
            {primaryExam && primaryDays !== null ? `${primaryDays}d` : ''}
          </span>
          {exams.length > 1 && (
            <span className="px-1.5 py-0.5 bg-white/20 text-xs rounded-full">{exams.length}</span>
          )}
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
            <div className="absolute right-0 mt-2 w-80 rounded-xl shadow-xl border z-[110] bg-white border-slate-200 max-h-[70vh] overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    My Exams
                  </h3>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="text-xs px-2 py-1 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors"
                  >
                    + Add Exam
                  </button>
                </div>

                {exams.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-500 mb-3">No exams scheduled</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="text-sm text-teal-600 hover:underline"
                    >
                      Add your first exam
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {exams.map(exam => {
                      const days = getDaysUntil(exam);
                      const examStyles = getUrgencyStyles(days);
                      return (
                        <div
                          key={exam.id}
                          className={`p-3 rounded-lg border ${exam.isPrimary ? examStyles.bg : 'bg-slate-50 border-slate-200'}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-slate-900 text-sm">
                                  {getExamDisplayName(exam)}
                                </h4>
                                {exam.isPrimary && (
                                  <span className="px-1.5 py-0.5 bg-teal-500 text-white text-[10px] rounded-full">PRIMARY</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-lg font-bold ${examStyles.text}`}>
                                  {days !== null
                                    ? days < 0
                                      ? 'Passed'
                                      : days === 0
                                        ? 'Today!'
                                        : `${days} days`
                                    : 'Not set'}
                                </span>
                                {exam.dateType === 'approximate' && (
                                  <span className="text-[10px] text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded">~approx</span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                {exam.dateType === 'exact' && exam.exactDate
                                  ? new Date(exam.exactDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                                  : exam.timeRange
                                    ? TIME_RANGES[exam.timeRange].label
                                    : ''}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {!exam.isPrimary && (
                                <button
                                  onClick={() => handleSetPrimary(exam.id)}
                                  className="p-1 text-slate-400 hover:text-teal-600 transition-colors"
                                  title="Set as primary"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                  </svg>
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteExam(exam.id)}
                                className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                title="Delete exam"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Study recommendations based on exams */}
                {primaryExam && primaryDays !== null && primaryDays > 0 && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg">
                    <p className="text-xs font-medium text-slate-700 mb-1">Study Focus</p>
                    <p className="text-[11px] text-slate-600">
                      {primaryDays <= 7
                        ? 'Final review! Focus on high-yield topics and weak areas.'
                        : primaryDays <= 14
                          ? 'Review weak areas and do full practice exams.'
                          : primaryDays <= 30
                            ? 'Increase QBank volume. Target 40-60 questions/day.'
                            : primaryDays <= 60
                              ? 'Build foundation with First Pass of UWorld.'
                              : 'Focus on learning concepts. Start with your weakest systems.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Add Exam Modal */}
        {showAddModal && (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50"
            onClick={() => {
              setShowAddModal(false);
              resetForm();
            }}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-teal-500 to-emerald-500">
                <h3 className="text-lg font-semibold text-white">Add Exam</h3>
                <p className="text-sm text-white/80">
                  Plan your upcoming exams
                </p>
              </div>

              <div className="p-6 space-y-4">
                {/* Exam Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Exam Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['step1', 'step2ck', 'step3', 'shelf'] as ExamType[]).map(type => (
                      <button
                        key={type}
                        onClick={() => setNewExamType(type)}
                        className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                          newExamType === type
                            ? 'border-teal-500 bg-teal-50 text-teal-700'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        {type === 'step1' && 'Step 1'}
                        {type === 'step2ck' && 'Step 2 CK'}
                        {type === 'step3' && 'Step 3'}
                        {type === 'shelf' && 'Shelf Exam'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shelf Category (if shelf selected) */}
                {newExamType === 'shelf' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Shelf Category</label>
                    <select
                      value={newShelfCategory}
                      onChange={(e) => setNewShelfCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {SHELF_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Date Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">When is your exam?</label>
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => setNewDateType('exact')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                        newDateType === 'exact'
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Exact Date
                    </button>
                    <button
                      onClick={() => setNewDateType('approximate')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                        newDateType === 'approximate'
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Approximate
                    </button>
                  </div>

                  {newDateType === 'exact' ? (
                    <input
                      type="date"
                      value={newExactDate}
                      onChange={(e) => setNewExactDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.keys(TIME_RANGES) as TimeRange[]).filter(k => k !== 'exact').map(range => (
                        <button
                          key={range}
                          onClick={() => setNewTimeRange(range)}
                          className={`px-2 py-2 text-xs rounded-lg border-2 transition-all ${
                            newTimeRange === range
                              ? 'border-teal-500 bg-teal-50 text-teal-700'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          {TIME_RANGES[range].label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex gap-2">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="flex-1 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddExam}
                  disabled={newDateType === 'exact' && !newExactDate}
                  className="flex-1 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Exam
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full variant for dashboard/dedicated section
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-teal-500 to-emerald-500">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white text-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Exam Planner
            </h3>
            <p className="text-sm text-white/80">
              Track your upcoming exams
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 bg-white/20 text-white text-sm rounded-lg hover:bg-white/30 transition-colors"
          >
            + Add Exam
          </button>
        </div>
      </div>

      <div className="p-6">
        {exams.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Plan Your Exams</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Add your Step exams and Shelves to get personalized study recommendations
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
            >
              Add Your First Exam
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Primary exam highlight */}
            {primaryExam && (
              <div className={`p-4 rounded-xl border ${styles.bg}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600">Primary Exam</span>
                  <span className="px-2 py-0.5 bg-teal-500 text-white text-xs rounded-full">COUNTDOWN</span>
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-1">{getExamDisplayName(primaryExam)}</h4>
                <div className={`text-4xl font-bold ${styles.text}`}>
                  {primaryDays !== null
                    ? primaryDays < 0
                      ? 'Passed!'
                      : primaryDays === 0
                        ? 'Today!'
                        : `${primaryDays} days`
                    : 'Not set'}
                </div>
                {primaryExam.dateType === 'exact' && primaryExam.exactDate && (
                  <p className="text-sm text-slate-500 mt-2">
                    {new Date(primaryExam.exactDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                )}
              </div>
            )}

            {/* Other exams */}
            {exams.filter(e => !e.isPrimary).length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-2">Other Exams</h4>
                <div className="space-y-2">
                  {exams.filter(e => !e.isPrimary).map(exam => {
                    const days = getDaysUntil(exam);
                    const examStyles = getUrgencyStyles(days);
                    return (
                      <div
                        key={exam.id}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white text-sm">{getExamDisplayName(exam)}</p>
                          <p className={`text-lg font-bold ${examStyles.text}`}>
                            {days !== null
                              ? days < 0
                                ? 'Passed'
                                : days === 0
                                  ? 'Today!'
                                  : `${days} days`
                              : 'Not set'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSetPrimary(exam.id)}
                            className="p-2 text-slate-400 hover:text-teal-600 transition-colors"
                            title="Set as primary"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteExam(exam.id)}
                            className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                            title="Delete exam"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Exam Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50"
          onClick={() => {
            setShowAddModal(false);
            resetForm();
          }}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-teal-500 to-emerald-500">
              <h3 className="text-lg font-semibold text-white">Add Exam</h3>
              <p className="text-sm text-white/80">
                Plan your upcoming exams
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Exam Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Exam Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['step1', 'step2ck', 'step3', 'shelf'] as ExamType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => setNewExamType(type)}
                      className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                        newExamType === type
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
                          : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {type === 'step1' && 'Step 1'}
                      {type === 'step2ck' && 'Step 2 CK'}
                      {type === 'step3' && 'Step 3'}
                      {type === 'shelf' && 'Shelf Exam'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shelf Category (if shelf selected) */}
              {newExamType === 'shelf' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Shelf Category</label>
                  <select
                    value={newShelfCategory}
                    onChange={(e) => setNewShelfCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    {SHELF_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Date Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">When is your exam?</label>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setNewDateType('exact')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                      newDateType === 'exact'
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Exact Date
                  </button>
                  <button
                    onClick={() => setNewDateType('approximate')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                      newDateType === 'approximate'
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Approximate
                  </button>
                </div>

                {newDateType === 'exact' ? (
                  <input
                    type="date"
                    value={newExactDate}
                    onChange={(e) => setNewExactDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(TIME_RANGES) as TimeRange[]).filter(k => k !== 'exact').map(range => (
                      <button
                        key={range}
                        onClick={() => setNewTimeRange(range)}
                        className={`px-2 py-2 text-xs rounded-lg border-2 transition-all ${
                          newTimeRange === range
                            ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
                            : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {TIME_RANGES[range].label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex gap-2">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="flex-1 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddExam}
                disabled={newDateType === 'exact' && !newExactDate}
                className="flex-1 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExamCountdown;
