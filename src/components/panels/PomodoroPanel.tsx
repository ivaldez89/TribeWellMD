'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { TargetIcon, ClockIcon } from '@/components/icons/MedicalIcons';

interface PomodoroPanelProps {
  isOpen: boolean;
  onClose: () => void;
  // Shared timer state - lifted up to Header for persistence
  timerState: {
    mode: TimerMode;
    timeLeft: number;
    isRunning: boolean;
    sessionsCompleted: number;
  };
  onTimerStateChange: (state: Partial<PomodoroPanelProps['timerState']>) => void;
}

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const TIMER_SETTINGS = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export function PomodoroPanel({ isOpen, onClose, timerState, onTimerStateChange }: PomodoroPanelProps) {
  const { mode, timeLeft, isRunning, sessionsCompleted } = timerState;
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');

  // Store remaining time for each mode so switching back preserves progress
  const savedTimesRef = useRef<Record<TimerMode, number>>({
    focus: TIMER_SETTINGS.focus,
    shortBreak: TIMER_SETTINGS.shortBreak,
    longBreak: TIMER_SETTINGS.longBreak,
  });

  // Handle Escape key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((TIMER_SETTINGS[mode] - timeLeft) / TIMER_SETTINGS[mode]) * 100;

  // Theme-consistent colors (green/sage for focus, variations for breaks)
  const modeColors = {
    focus: 'from-[#5B7B6D] to-tribe-sage-500',
    shortBreak: 'from-[#C4A77D] to-amber-500',
    longBreak: 'from-blue-500 to-cyan-500',
  };

  const modeLabels = {
    focus: 'Focus',
    shortBreak: 'Break',
    longBreak: 'Long Break',
  };

  const toggleTimer = () => {
    onTimerStateChange({ isRunning: !isRunning });
  };

  const resetTimer = () => {
    onTimerStateChange({
      isRunning: false,
      timeLeft: TIMER_SETTINGS[mode]
    });
    savedTimesRef.current[mode] = TIMER_SETTINGS[mode];
  };

  const switchMode = (newMode: TimerMode) => {
    savedTimesRef.current[mode] = timeLeft;
    onTimerStateChange({
      isRunning: false,
      mode: newMode,
      timeLeft: savedTimesRef.current[newMode]
    });
    setShowCustomTime(false);
  };

  const setCustomTime = () => {
    const minutes = parseInt(customMinutes, 10);
    if (minutes > 0 && minutes <= 180) {
      const seconds = minutes * 60;
      onTimerStateChange({ timeLeft: seconds });
      savedTimesRef.current[mode] = seconds;
      setShowCustomTime(false);
      setCustomMinutes('');
    }
  };

  return (
    <aside
      className={`fixed top-12 right-0 bottom-12 w-full sm:w-[380px] bg-surface border-l border-border shadow-2xl z-40 flex flex-col transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r ${modeColors[mode]}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <ClockIcon className="w-5 h-5 text-white" />
          </div>
          <div className="text-white">
            <h2 className="text-sm font-bold">Pomodoro Timer</h2>
            <p className="text-[10px] opacity-90">Today: {sessionsCompleted} sessions</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
          title="Close (Esc)"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Mode tabs */}
      <div className="px-4 py-3 border-b border-border bg-surface-muted/30">
        <div className="flex gap-1.5">
          {(['focus', 'shortBreak', 'longBreak'] as TimerMode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === m
                  ? `bg-gradient-to-r ${modeColors[m]} text-white shadow-md`
                  : 'bg-surface-muted text-content-muted hover:bg-border'
              }`}
            >
              {m === 'focus' ? <TargetIcon className="w-3.5 h-3.5" /> : <ClockIcon className="w-3.5 h-3.5" />}
              <span>{modeLabels[m]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content - Timer display */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6">
        {/* Timer circle */}
        <div className="relative w-48 h-48 mb-6">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="8"
              className="dark:stroke-slate-700"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke="url(#pomo-panel-gradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={553}
              strokeDashoffset={553 - (553 * progress) / 100}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="pomo-panel-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={mode === 'focus' ? '#5B7B6D' : mode === 'shortBreak' ? '#C4A77D' : '#3b82f6'} />
                <stop offset="100%" stopColor={mode === 'focus' ? '#6B8E7D' : mode === 'shortBreak' ? '#d4b78d' : '#06b6d4'} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-secondary font-mono">
              {formatTime(timeLeft)}
            </span>
            <span className="text-sm text-content-muted mt-1">{modeLabels[mode]}</span>
            {isRunning && (
              <span className="mt-2 flex items-center gap-1 text-xs text-content-muted">
                <span className="w-2 h-2 rounded-full bg-[#5B7B6D] animate-pulse" />
                Running
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <button
            onClick={resetTimer}
            className="p-3 text-content-muted hover:text-secondary hover:bg-surface-muted rounded-xl transition-colors"
            aria-label="Reset timer"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <button
            onClick={toggleTimer}
            className={`px-8 py-3 rounded-xl font-semibold text-white shadow-lg transition-all transform hover:scale-105 active:scale-95 bg-gradient-to-r ${modeColors[mode]}`}
          >
            {isRunning ? 'Pause' : 'Start'}
          </button>

          <button
            onClick={() => {
              onTimerStateChange({ isRunning: false });
              if (mode === 'focus') {
                switchMode('shortBreak');
              } else {
                switchMode('focus');
              }
            }}
            className="p-3 text-content-muted hover:text-secondary hover:bg-surface-muted rounded-xl transition-colors"
            aria-label="Skip to next"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Custom time input */}
        {showCustomTime ? (
          <div className="flex items-center gap-2 w-full max-w-xs">
            <input
              type="number"
              min="1"
              max="180"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              placeholder="Minutes"
              className="flex-1 px-4 py-2 text-sm border border-border rounded-lg bg-surface text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
              onKeyDown={(e) => e.key === 'Enter' && setCustomTime()}
              autoFocus
            />
            <button
              onClick={setCustomTime}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-r ${modeColors[mode]}`}
            >
              Set
            </button>
            <button
              onClick={() => { setShowCustomTime(false); setCustomMinutes(''); }}
              className="p-2 text-content-muted hover:text-secondary"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowCustomTime(true)}
            className="text-sm text-content-muted hover:text-secondary transition-colors"
          >
            Set custom time
          </button>
        )}

        {/* Progress info */}
        <p className="mt-6 text-sm text-content-muted text-center">
          {4 - (sessionsCompleted % 4)} more focus sessions until long break
        </p>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-border bg-surface-muted/30 flex items-center justify-between">
        <p className="text-[10px] text-content-muted">
          {isRunning ? 'Timer running - persists when panel is closed' : 'Start a focus session'}
        </p>
        <p className="text-[10px] text-content-muted">
          <kbd className="px-1 py-0.5 bg-surface border border-border rounded font-mono text-[9px]">P</kbd> toggle
        </p>
      </div>
    </aside>
  );
}

export default PomodoroPanel;
