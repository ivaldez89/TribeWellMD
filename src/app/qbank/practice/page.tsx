'use client';

import { useState, useEffect, useMemo, useCallback, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { StudyLayout, useStudyLayout, type PanelType } from '@/components/layout/StudyLayout';
import {
  ExplanationSummary,
  useStructuredExplanation,
  InlineExplanation,
  type StructuredExplanationData
} from '@/components/study/StructuredExplanation';
import { QuestionNavigationGrid } from '@/components/study/QuestionNavigationGrid';
import { createClient } from '@/lib/supabase/client';
import {
  type AttemptState,
  type QuestionAnswer,
  createAttempt,
  saveAttempt,
  loadAttempt,
  findActiveAttempts,
  selectAnswer,
  lockAnswer,
  switchMode,
  updateTimer,
  navigateToQuestion,
  toggleMarked,
  completeAttempt,
  getAttemptStats,
  formatTime,
  getMaxQuestionCount,
} from '@/lib/qbank/attempt';

// Question type matching Supabase schema
interface Question {
  id: string;
  question_id: string;
  concept_id: string;
  batch: string;
  system: string;
  stem: string;
  options: { label: string; text: string }[];
  correct_answer: string;
  explanation: string;
  cognitive_error: string | null;
}

// Format question stem with proper styling for lab values
function formatStem(stem: string): React.ReactNode {
  const lines = stem.split('\n');
  const elements: React.ReactNode[] = [];
  let inLabSection = false;
  let labValues: string[] = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (trimmed.toLowerCase().includes('laboratory') || trimmed.toLowerCase().includes('lab studies') || trimmed.toLowerCase().includes('studies show')) {
      inLabSection = true;
      elements.push(
        <p key={`line-${idx}`} className="mt-4 mb-2 text-xs font-semibold text-content-muted uppercase tracking-wide">
          {trimmed}
        </p>
      );
      return;
    }

    const isLabValue = inLabSection && (
      trimmed.includes(':') ||
      /\d+\s*(mg|mEq|mm|g|%|\/dL|\/L|pH)/i.test(trimmed) ||
      trimmed.startsWith('•') ||
      trimmed.startsWith('-') ||
      trimmed.startsWith('*')
    );

    if (isLabValue && trimmed.length > 0) {
      const cleanValue = trimmed.replace(/^[•\-\*]\s*/, '');
      if (cleanValue.length > 0) labValues.push(cleanValue);
    } else {
      if (labValues.length > 0) {
        elements.push(
          <div key={`lab-${idx}`} className="my-4">
            <table className="w-full text-sm border-collapse">
              <tbody>
                {labValues.map((val, i) => {
                  const parts = val.split(':');
                  if (parts.length === 2) {
                    return (
                      <tr key={i} className="border-b border-border/50 last:border-0">
                        <td className="py-1.5 pr-4 text-content-muted">{parts[0].trim()}</td>
                        <td className="py-1.5 text-right font-medium text-secondary tabular-nums">{parts[1].trim()}</td>
                      </tr>
                    );
                  }
                  return (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td colSpan={2} className="py-1.5 text-content-muted">{val}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        labValues = [];
        inLabSection = false;
      }

      if (trimmed.length > 0) {
        const isQuestion = /^(which|what|how|why|the most|the next|the best|the primary|the initial)/i.test(trimmed);
        if (isQuestion) {
          elements.push(
            <p key={`line-${idx}`} className="mt-6 pt-4 border-t border-border text-base font-medium text-secondary">
              {trimmed}
            </p>
          );
        } else {
          elements.push(
            <p key={`line-${idx}`} className="mb-3 text-base text-secondary leading-relaxed">
              {trimmed}
            </p>
          );
        }
      }
    }
  });

  if (labValues.length > 0) {
    elements.push(
      <div key="lab-final" className="my-4">
        <table className="w-full text-sm border-collapse">
          <tbody>
            {labValues.map((val, i) => {
              const parts = val.split(':');
              if (parts.length === 2) {
                return (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-1.5 pr-4 text-content-muted">{parts[0].trim()}</td>
                    <td className="py-1.5 text-right font-medium text-secondary tabular-nums">{parts[1].trim()}</td>
                  </tr>
                );
              }
              return (
                <tr key={i} className="border-b border-border/50 last:border-0">
                  <td colSpan={2} className="py-1.5 text-content-muted">{val}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return <div className="space-y-0">{elements}</div>;
}

// Answer Options Component with Inline Explanations
interface AnswerOptionsProps {
  question: Question;
  answerState: QuestionAnswer | undefined;
  currentMode: 'tutor' | 'test';
  isCompleted: boolean;
  onSelectAnswer: (label: string) => void;
  onSubmit: () => void;
  onCreateFlashcard?: (pearl: string) => void;
  isPearlSaved?: boolean;
}

function AnswerOptionsWithExplanations({
  question,
  answerState,
  currentMode,
  isCompleted,
  onSelectAnswer,
  onSubmit,
  onCreateFlashcard,
  isPearlSaved
}: AnswerOptionsProps) {
  const structured = useStructuredExplanation(
    question.explanation,
    question.options,
    question.correct_answer
  );

  const isLocked = answerState?.isLocked || false;
  const selectedAnswer = answerState?.selectedAnswer || null;

  // Show explanations in tutor mode after locking, or after completing the exam
  const showExplanations = (currentMode === 'tutor' && isLocked) || isCompleted;

  const getOptionExplanation = (label: string) => {
    return structured.distractorAnalysis.find(d => d.label === label);
  };

  return (
    <div className="bg-surface rounded-2xl shadow-xl shadow-border/50 border border-border p-6 md:p-8 mb-6">
      <div className="space-y-4">
        {question.options.map((option) => {
          const isSelected = selectedAnswer === option.label;
          const isCorrect = option.label === question.correct_answer;
          const optionExplanation = getOptionExplanation(option.label);

          let containerClass = 'bg-surface border-border hover:border-primary/50';
          let bubbleClass = 'border-border-strong text-content-muted';

          if (isLocked || isCompleted) {
            if (isCorrect) {
              containerClass = 'bg-success/5 border-success';
              bubbleClass = 'bg-success border-success text-white';
            } else if (isSelected) {
              containerClass = 'bg-error/5 border-error';
              bubbleClass = 'bg-error border-error text-white';
            } else {
              containerClass = 'bg-surface-muted/50 border-border opacity-70';
            }
          } else if (isSelected) {
            containerClass = 'bg-primary/5 border-primary';
            bubbleClass = 'bg-primary border-primary text-white';
          }

          return (
            <div key={option.label} className="space-y-0">
              <button
                onClick={() => onSelectAnswer(option.label)}
                disabled={isLocked || isCompleted}
                className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${containerClass} ${isLocked || isCompleted ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 font-medium transition-all ${bubbleClass}`}>
                  {(isLocked || isCompleted) && isCorrect ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (isLocked || isCompleted) && isSelected && !isCorrect ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    option.label
                  )}
                </div>
                <p className={`flex-1 pt-2 text-base leading-relaxed ${(isLocked || isCompleted) && !isCorrect && !isSelected ? 'text-content-muted' : 'text-secondary'}`}>
                  {option.text}
                </p>
              </button>

              {showExplanations && optionExplanation && (
                <InlineExplanation
                  label={option.label}
                  reason={optionExplanation.reason}
                  isCorrect={isCorrect}
                  isSelected={isSelected}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Button - Only shown if not locked and answer selected */}
      {!isLocked && !isCompleted && selectedAnswer && (
        <div className="sticky bottom-4 mt-6 z-30">
          <button
            onClick={onSubmit}
            className="w-full py-4 rounded-xl font-semibold text-lg transition-all transform opacity-100 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] ring-2 ring-primary/30"
          >
            Submit Answer
          </button>
        </div>
      )}

      {/* Summary Section - Shows after locking in tutor mode or after completing */}
      {showExplanations && (
        <div className="mt-8 pt-6 border-t border-border">
          <ExplanationSummary
            explanation={question.explanation}
            options={question.options}
            correctAnswer={question.correct_answer}
            isCorrect={answerState?.isCorrect || false}
            cognitiveError={question.cognitive_error}
            onCreateFlashcard={onCreateFlashcard}
            isPearlSaved={isPearlSaved}
          />
        </div>
      )}
    </div>
  );
}

// Import Flashcard type and storage utilities
import type { Flashcard, MedicalSystem } from '@/types';
import { getFlashcards, saveFlashcards } from '@/lib/storage/localStorage';

function QBankPracticeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState<AttemptState | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showPassExamConfirm, setShowPassExamConfirm] = useState(false);

  // Panel state from StudyLayout hook
  const { activePanel, setActivePanel } = useStudyLayout();

  // Flashcard toast notification state
  const [flashcardToast, setFlashcardToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  // Track saved pearls for visual feedback
  const [savedPearlIds, setSavedPearlIds] = useState<Set<string>>(new Set());

  // Get params from URL
  const urlBatches = searchParams.get('batches')?.split(',').filter(Boolean) || [];
  const urlSystems = searchParams.get('systems')?.split(',').filter(Boolean) || [];
  const urlCount = parseInt(searchParams.get('count') || '20', 10);
  const urlMode = (searchParams.get('mode') || 'tutor') as 'tutor' | 'test' | 'timed';
  const attemptId = searchParams.get('attemptId');

  // Normalize mode: 'timed' is now 'test'
  const initialMode: 'tutor' | 'test' = urlMode === 'timed' ? 'test' : (urlMode === 'test' ? 'test' : 'tutor');

  // Timer ref for cleanup
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved pearl IDs for visual feedback
  useEffect(() => {
    try {
      const existingCards = getFlashcards();
      const pearlQuestionIds = new Set(
        existingCards
          .filter(c => c.metadata.tags.includes('qbank-pearl') && c.metadata.conceptCode)
          .map(c => c.metadata.conceptCode as string)
      );
      setSavedPearlIds(pearlQuestionIds);
    } catch (e) {
      console.warn('Failed to load saved pearl IDs:', e);
    }
  }, []);

  // Fetch questions and initialize/restore attempt
  useEffect(() => {
    async function initializeAttempt() {
      try {
        // If attemptId is provided, try to load existing attempt
        if (attemptId) {
          const existingAttempt = loadAttempt(attemptId);
          if (existingAttempt) {
            // Load questions for this attempt
            const supabase = createClient();
            const { data, error } = await supabase
              .from('questions')
              .select('*')
              .in('id', existingAttempt.questionIds);

            if (error) {
              setError(error.message);
              return;
            }

            // Order questions according to attempt order
            const questionMap = new Map((data || []).map(q => [q.id, q]));
            const orderedQuestions = existingAttempt.questionIds
              .map(id => questionMap.get(id))
              .filter((q): q is Question => q !== undefined);

            setQuestions(orderedQuestions);
            setAttempt(existingAttempt);
            setIsLoading(false);
            return;
          }
        }

        // Create new attempt
        const supabase = createClient();
        let query = supabase.from('questions').select('*').eq('status', 'active');
        if (urlBatches.length > 0) query = query.in('batch', urlBatches);
        if (urlSystems.length > 0) query = query.in('system', urlSystems);
        query = query.order('batch').order('question_id');

        const { data, error } = await query;
        if (error) {
          setError(error.message);
          return;
        }

        let filteredData = data || [];

        // Enforce question count limits based on mode
        const maxCount = getMaxQuestionCount(initialMode);
        const targetCount = Math.min(urlCount, maxCount, filteredData.length);

        // Randomize and limit questions
        if (filteredData.length > targetCount) {
          filteredData = filteredData.sort(() => Math.random() - 0.5).slice(0, targetCount);
        }

        // Create new attempt
        const newAttempt = createAttempt(
          filteredData.map(q => q.id),
          initialMode,
          urlBatches,
          urlSystems
        );

        setQuestions(filteredData);
        setAttempt(newAttempt);
        saveAttempt(newAttempt);

        // Update URL with attemptId for persistence
        const params = new URLSearchParams(searchParams.toString());
        params.set('attemptId', newAttempt.id);
        router.replace(`/qbank/practice?${params.toString()}`, { scroll: false });
      } catch (err) {
        console.error('Failed to initialize attempt:', err);
        setError('Failed to load questions');
      } finally {
        setIsLoading(false);
      }
    }

    initializeAttempt();
  }, []);

  // Save attempt whenever it changes
  useEffect(() => {
    if (attempt) {
      saveAttempt(attempt);
    }
  }, [attempt]);

  // Timer effect - single countdown for entire exam
  useEffect(() => {
    if (!attempt || attempt.isCompleted || isPaused || attempt.timeRemainingSeconds <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setAttempt(prev => {
        if (!prev || prev.isCompleted) return prev;
        const newTime = prev.timeRemainingSeconds - 1;
        if (newTime <= 0) {
          // Time's up - complete the exam
          return completeAttempt(prev);
        }
        return updateTimer(prev, newTime);
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [attempt?.isCompleted, isPaused, attempt?.timeRemainingSeconds]);

  // Derived state
  const currentQuestion = attempt ? questions.find(q => q.id === attempt.questionIds[attempt.currentIndex]) : null;
  const currentAnswerState = attempt && currentQuestion ? attempt.answers[currentQuestion.id] : undefined;
  const stats = attempt ? getAttemptStats(attempt) : null;

  // Convert attempt answers to legacy format for QuestionNavigationGrid
  const questionStatesLegacy = useMemo(() => {
    if (!attempt) return {};
    const states: Record<string, { selectedAnswer: string | null; isSubmitted: boolean; isCorrect: boolean | null }> = {};
    for (const [qid, answer] of Object.entries(attempt.answers)) {
      states[qid] = {
        selectedAnswer: answer.selectedAnswer,
        isSubmitted: answer.isLocked,
        isCorrect: answer.isCorrect,
      };
    }
    return states;
  }, [attempt?.answers]);

  // Handle answer selection
  const handleSelectAnswer = useCallback((label: string) => {
    if (!attempt || !currentQuestion || attempt.isCompleted) return;

    const existingAnswer = attempt.answers[currentQuestion.id];
    if (existingAnswer?.isLocked) return; // Cannot change locked answers

    let newAttempt = selectAnswer(attempt, currentQuestion.id, label);

    // In test mode, lock immediately on selection
    if (attempt.currentMode === 'test') {
      newAttempt = lockAnswer(newAttempt, currentQuestion.id, currentQuestion.correct_answer);
    }

    setAttempt(newAttempt);
  }, [attempt, currentQuestion]);

  // Handle submit (for tutor mode)
  const handleSubmit = useCallback(() => {
    if (!attempt || !currentQuestion || attempt.isCompleted) return;

    const existingAnswer = attempt.answers[currentQuestion.id];
    if (!existingAnswer?.selectedAnswer || existingAnswer.isLocked) return;

    const newAttempt = lockAnswer(attempt, currentQuestion.id, currentQuestion.correct_answer);
    setAttempt(newAttempt);
  }, [attempt, currentQuestion]);

  // Toggle mark for review
  const handleToggleMark = useCallback(() => {
    if (!attempt || !currentQuestion) return;
    setAttempt(toggleMarked(attempt, currentQuestion.id));
  }, [attempt, currentQuestion]);

  // Handle flashcard creation from Clinical Pearl
  const handleCreateFlashcard = useCallback((pearl: string) => {
    if (!currentQuestion) return;

    try {
      const now = new Date().toISOString();
      const existingCards = getFlashcards();

      const isDuplicate = existingCards.some(c =>
        c.content.front.toLowerCase().trim() === pearl.toLowerCase().trim() ||
        c.metadata.tags.includes('qbank-pearl') && c.content.back.toLowerCase().includes(pearl.toLowerCase().substring(0, 50))
      );

      if (isDuplicate) {
        setFlashcardToast({ show: true, message: 'This pearl is already saved!' });
        setTimeout(() => setFlashcardToast({ show: false, message: '' }), 2500);
        return;
      }

      const newCard: Flashcard = {
        id: crypto.randomUUID(),
        schemaVersion: '1.0',
        createdAt: now,
        updatedAt: now,
        userId: 'local',
        content: {
          front: `Clinical Pearl: ${currentQuestion.system}`,
          back: pearl,
          explanation: `From QBank question ${currentQuestion.question_id}`
        },
        metadata: {
          tags: ['qbank-pearl', 'clinical-pearl', currentQuestion.system.toLowerCase().replace(/\s+/g, '-')],
          system: currentQuestion.system as MedicalSystem,
          topic: currentQuestion.system,
          difficulty: 'medium',
          clinicalVignette: false,
          source: 'qbank',
          conceptCode: currentQuestion.concept_id
        },
        spacedRepetition: {
          state: 'new',
          interval: 0,
          ease: 2.5,
          reps: 0,
          lapses: 0,
          nextReview: now
        }
      };

      const updatedCards = [...existingCards, newCard];
      saveFlashcards(updatedCards);

      setSavedPearlIds(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.add(currentQuestion.concept_id);
        return newSet;
      });

      setFlashcardToast({ show: true, message: 'Clinical Pearl saved to Library!' });
      setTimeout(() => setFlashcardToast({ show: false, message: '' }), 2500);
    } catch (e) {
      console.error('Failed to save pearl:', e);
      setFlashcardToast({ show: true, message: 'Failed to save pearl' });
      setTimeout(() => setFlashcardToast({ show: false, message: '' }), 2500);
    }
  }, [currentQuestion]);

  // Navigation
  const goToNext = useCallback(() => {
    if (!attempt || attempt.currentIndex >= attempt.questionIds.length - 1) return;
    setAttempt(navigateToQuestion(attempt, attempt.currentIndex + 1));
  }, [attempt]);

  const goToPrevious = useCallback(() => {
    if (!attempt || attempt.currentIndex <= 0) return;
    setAttempt(navigateToQuestion(attempt, attempt.currentIndex - 1));
  }, [attempt]);

  const goToQuestion = useCallback((index: number) => {
    if (!attempt) return;
    setAttempt(navigateToQuestion(attempt, index));
  }, [attempt]);

  // Switch mode
  const handleSwitchMode = useCallback(() => {
    if (!attempt || attempt.isCompleted) return;
    const newMode = attempt.currentMode === 'tutor' ? 'test' : 'tutor';
    setAttempt(switchMode(attempt, newMode));
  }, [attempt]);

  // Pass Exam (complete attempt)
  const handlePassExam = useCallback(() => {
    if (!attempt || attempt.isCompleted) return;
    const completedAttempt = completeAttempt(attempt);
    setAttempt(completedAttempt);
    setShowPassExamConfirm(false);
  }, [attempt]);

  // End session (go back to QBank)
  const handleEndSession = useCallback(() => {
    if (!attempt) {
      router.push('/qbank');
      return;
    }

    // Save test result for history
    const testResult = {
      id: attempt.id,
      date: new Date().toISOString(),
      shelves: attempt.batches,
      systems: attempt.systems,
      questionCount: attempt.questionIds.length,
      answeredCount: stats?.lockedCount || 0,
      correctCount: stats?.correctCount || 0,
      mode: attempt.currentMode,
    };

    try {
      const stored = localStorage.getItem('qbank-previous-tests');
      const previousTests = stored ? JSON.parse(stored) : [];
      const updatedTests = [testResult, ...previousTests].slice(0, 20);
      localStorage.setItem('qbank-previous-tests', JSON.stringify(updatedTests));
    } catch (e) {
      console.error('Failed to save test result:', e);
    }

    router.push('/qbank');
  }, [attempt, stats, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-secondary font-medium">Loading questions...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center p-4" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="bg-surface rounded-2xl shadow-xl p-8 max-w-md text-center">
            <div className="w-16 h-16 bg-error-light rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-secondary mb-2">Error Loading Questions</h2>
            <p className="text-content-muted mb-6">{error}</p>
            <button onClick={() => router.push('/qbank')} className="px-6 py-3 bg-gradient-to-r from-sand-500 to-sand-600 hover:from-sand-600 hover:to-sand-700 text-white font-medium rounded-xl transition-colors">
              Back to QBank
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No questions or no attempt
  if (!attempt || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center p-4" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="bg-surface rounded-2xl shadow-xl p-8 max-w-md text-center">
            <div className="w-16 h-16 bg-surface-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-content-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-secondary mb-2">No Questions Found</h3>
            <p className="text-content-muted text-sm mb-4">Adjust your filters to see questions.</p>
            <Link href="/qbank" className="text-primary hover:underline text-sm">Back to QBank</Link>
          </div>
        </div>
      </div>
    );
  }

  // Paused overlay
  if (isPaused && !attempt.isCompleted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center p-4" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="bg-surface rounded-2xl shadow-xl p-8 max-w-md text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-secondary mb-2">Session Paused</h3>
            <p className="text-content-muted text-sm mb-2">Time remaining: {formatTime(attempt.timeRemainingSeconds)}</p>
            <p className="text-content-muted text-sm mb-6">Your progress is saved. Click resume to continue.</p>
            <button onClick={() => setIsPaused(false)} className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-xl transition-all">
              Resume Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Header center content
  const headerCenter = (
    <>
      {/* Question Number */}
      <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-lg">
        <span className="text-[10px] text-white/70 hidden sm:inline">Q</span>
        <span className="font-bold text-sm text-white tabular-nums">
          {attempt.currentIndex + 1}<span className="text-white/60 font-normal">/{attempt.questionIds.length}</span>
        </span>
      </div>

      {/* Mode indicator */}
      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${attempt.currentMode === 'test' ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
        <span className={`text-xs font-medium ${attempt.currentMode === 'test' ? 'text-red-300' : 'text-green-300'}`}>
          {attempt.currentMode === 'test' ? 'Test' : 'Tutor'}
        </span>
      </div>

      {/* Timer */}
      <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-lg">
        <svg className="w-3.5 h-3.5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className={`font-mono text-sm font-bold tabular-nums ${attempt.timeRemainingSeconds <= 300 ? 'text-red-300' : 'text-white'}`}>
          {formatTime(attempt.timeRemainingSeconds)}
        </span>
        {!attempt.isCompleted && (
          <button onClick={() => setIsPaused(true)} className="text-white/70 hover:text-white">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        )}
      </div>

      {/* Pass Exam button - Test mode only, not completed */}
      {attempt.currentMode === 'test' && !attempt.isCompleted && (
        <button
          onClick={() => setShowPassExamConfirm(true)}
          className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg transition-colors"
        >
          <svg className="w-3.5 h-3.5 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-xs font-medium text-amber-300">Pass Exam</span>
        </button>
      )}
    </>
  );

  // Header right content
  const headerRight = (
    <div className="lg:hidden">
      <QuestionNavigationGrid
        totalQuestions={attempt.questionIds.length}
        currentIndex={attempt.currentIndex}
        questionStates={questionStatesLegacy}
        isMarked={attempt.isMarked}
        questionIds={attempt.questionIds}
        onNavigate={goToQuestion}
      />
    </div>
  );

  // Footer content
  const footerContent = (
    <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-full">
        {/* Left: Mode switch and shortcuts */}
        <div className="flex items-center gap-4 text-xs">
          {!attempt.isCompleted && (
            <button
              onClick={handleSwitchMode}
              className="flex items-center gap-1.5 px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span className="hidden sm:inline">Switch to {attempt.currentMode === 'tutor' ? 'Test' : 'Tutor'}</span>
            </button>
          )}
          <span className="hidden sm:inline-flex items-center gap-1.5 text-white/80">
            <kbd className="px-1.5 py-0.5 bg-white/20 rounded font-mono text-white">L</kbd>
            <span>labs</span>
          </span>
        </div>

        {/* Center: Progress */}
        <div className="flex items-center gap-3 text-sm">
          <span className="text-white/80">Progress:</span>
          <span className="font-semibold">{stats?.lockedCount || 0}/{attempt.questionIds.length}</span>
          {(stats?.lockedCount || 0) > 0 && (
            <span className="flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span>{stats?.correctCount || 0}</span>
              <span className="w-2 h-2 rounded-full bg-red-400 ml-1" />
              <span>{stats?.incorrectCount || 0}</span>
            </span>
          )}
        </div>

        {/* Right: End button */}
        <button
          onClick={() => setShowEndConfirm(true)}
          className="px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          {attempt.isCompleted ? 'Exit Review' : 'End Session'}
        </button>
      </div>
    </div>
  );

  return (
    <StudyLayout
      backHref="/qbank"
      backLabel="Back to QBank"
      headerCenter={headerCenter}
      headerRight={headerRight}
      footer={footerContent}
      activePanel={activePanel}
      onPanelChange={setActivePanel}
    >
      {/* Left Sidebar - Question Navigation */}
      <aside className="fixed left-0 top-12 bottom-12 w-14 bg-surface border-r border-border z-20 overflow-y-auto hidden lg:block">
        <div className="p-2">
          <div className="text-[10px] font-semibold text-content-muted text-center mb-2 uppercase tracking-wide">Q's</div>
          <div className="flex flex-col gap-1">
            {attempt.questionIds.map((qid, idx) => {
              const answer = attempt.answers[qid];
              const marked = attempt.isMarked[qid];
              const isCurrent = idx === attempt.currentIndex;

              let buttonClass = 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600';

              if (answer?.isLocked) {
                if (answer.isCorrect) {
                  buttonClass = 'bg-green-500 text-white hover:bg-green-600';
                } else {
                  buttonClass = 'bg-red-500 text-white hover:bg-red-600';
                }
              } else if (marked) {
                buttonClass = 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/60';
              }

              return (
                <button
                  key={idx}
                  onClick={() => goToQuestion(idx)}
                  className={`w-10 h-8 mx-auto rounded-lg font-medium text-xs transition-all flex items-center justify-center ${buttonClass} ${
                    isCurrent ? 'ring-2 ring-blue-500 ring-offset-1 ring-offset-surface' : ''
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-3 pt-2 border-t border-border space-y-1">
            <div className="flex items-center justify-center gap-1 text-[9px] text-content-muted">
              <span className="w-2 h-2 rounded bg-green-500" />
              <span className="w-2 h-2 rounded bg-red-500" />
              <span className="w-2 h-2 rounded bg-yellow-400" />
            </div>
          </div>
        </div>
      </aside>

      {/* End session confirmation modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-secondary mb-2">
              {attempt.isCompleted ? 'Exit Review?' : 'End Session?'}
            </h3>
            <p className="text-sm text-content-muted mb-4">
              {attempt.isCompleted
                ? `Final Score: ${stats?.percentCorrect || 0}% (${stats?.correctCount || 0}/${stats?.lockedCount || 0})`
                : `You've answered ${stats?.lockedCount || 0} of ${attempt.questionIds.length} questions. ${(stats?.lockedCount || 0) > 0 ? `Score: ${stats?.percentCorrect || 0}%` : ''}`
              }
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowEndConfirm(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-surface-muted text-content-secondary hover:bg-border transition-all">
                Continue
              </button>
              <button onClick={handleEndSession} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-error/10 text-error hover:bg-error/20 transition-all">
                {attempt.isCompleted ? 'Exit' : 'End Session'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pass Exam confirmation modal */}
      {showPassExamConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-secondary mb-2">Pass Exam?</h3>
            <p className="text-sm text-content-muted mb-2">
              Are you sure you want to end this exam?
            </p>
            <p className="text-sm text-content-muted mb-4">
              • {stats?.lockedCount || 0} questions answered<br />
              • {(attempt.questionIds.length - (stats?.lockedCount || 0))} questions will be marked unanswered<br />
              • This action cannot be undone
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowPassExamConfirm(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-surface-muted text-content-secondary hover:bg-border transition-all">
                Cancel
              </button>
              <button onClick={handlePassExam} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 transition-all">
                Pass Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="relative py-6 pb-16 lg:ml-[56px]">
        <div className="mx-auto px-4 max-w-4xl">
          {/* Completed banner */}
          {attempt.isCompleted && (
            <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-secondary">Exam Complete</h3>
                  <p className="text-sm text-content-muted">
                    Score: {stats?.percentCorrect || 0}% ({stats?.correctCount || 0}/{stats?.lockedCount || 0} correct)
                    {' '}• Review your answers below
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Question Presentation Card */}
          {currentQuestion && (
            <>
              <div className="bg-surface rounded-2xl shadow-xl shadow-border/50 border border-border overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-border bg-surface-muted/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="font-semibold text-secondary">Question</h2>
                      <p className="text-xs text-content-muted">{currentQuestion.system}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleToggleMark}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                      attempt.isMarked[currentQuestion.id]
                        ? 'bg-warning/10 text-warning'
                        : 'text-content-muted hover:bg-surface-muted'
                    }`}
                  >
                    <svg className="w-4 h-4" fill={attempt.isMarked[currentQuestion.id] ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                    </svg>
                    <span className="hidden sm:inline">{attempt.isMarked[currentQuestion.id] ? 'Flagged' : 'Flag'}</span>
                  </button>
                </div>

                <div className="p-6 md:p-8">
                  {formatStem(currentQuestion.stem)}
                </div>
              </div>

              {/* Answer Options */}
              <AnswerOptionsWithExplanations
                question={currentQuestion}
                answerState={currentAnswerState}
                currentMode={attempt.currentMode}
                isCompleted={attempt.isCompleted}
                onSelectAnswer={handleSelectAnswer}
                onSubmit={handleSubmit}
                onCreateFlashcard={handleCreateFlashcard}
                isPearlSaved={savedPearlIds.has(currentQuestion.concept_id)}
              />

              {/* Navigation */}
              <div className="bg-surface rounded-2xl shadow-xl shadow-border/50 border border-border p-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={goToPrevious}
                    disabled={attempt.currentIndex === 0}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      attempt.currentIndex === 0 ? 'text-content-muted cursor-not-allowed' : 'text-secondary hover:bg-surface-muted'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>

                  <div className="hidden sm:flex items-center gap-3 text-sm text-content-muted">
                    <span className="tabular-nums font-medium text-secondary">
                      {attempt.currentIndex + 1} / {attempt.questionIds.length}
                    </span>
                    {(stats?.lockedCount || 0) > 0 && (
                      <span className="flex items-center gap-1.5 text-xs">
                        <span className="w-2 h-2 rounded-full bg-success" />
                        {stats?.correctCount || 0}
                        <span className="w-2 h-2 rounded-full bg-error ml-1" />
                        {stats?.incorrectCount || 0}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={attempt.currentIndex === attempt.questionIds.length - 1 ? () => setShowEndConfirm(true) : goToNext}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      attempt.currentIndex === attempt.questionIds.length - 1
                        ? 'bg-gradient-to-r from-sand-500 to-sand-600 hover:from-sand-600 hover:to-sand-700 text-white'
                        : 'bg-primary hover:bg-primary-hover text-white'
                    }`}
                  >
                    {attempt.currentIndex === attempt.questionIds.length - 1 ? 'Finish' : 'Next'}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Flashcard Toast Notification */}
      {flashcardToast.show && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="flex items-center gap-2 px-4 py-3 bg-surface rounded-xl shadow-xl border border-border">
            <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-medium text-secondary">{flashcardToast.message}</span>
          </div>
        </div>
      )}
    </StudyLayout>
  );
}

export default function QBankPracticePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-secondary font-medium">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <QBankPracticeContent />
    </Suspense>
  );
}
