'use client';

import { useState, useRef } from 'react';
import { TargetIcon, ClockIcon } from '@/components/icons/MedicalIcons';
import { ToolPanel } from '@/components/panels/ToolPanel';

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

// Header icon (matches ToolPanel canonical style - sand-600/sand-400)
const PomodoroIcon = () => (
  <svg className="w-5 h-5 text-sand-600 dark:text-sand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((TIMER_SETTINGS[mode] - timeLeft) / TIMER_SETTINGS[mode]) * 100;

  // Solid colors for each mode (no gradients - calm, professional aesthetic)
  const modeSolidColors = {
    focus: 'bg-[#5B7B6D]',
    shortBreak: 'bg-sand-500',
    longBreak: 'bg-slate-600',
  };

  // Stroke colors for timer ring (solid, not gradient)
  const modeStrokeColors = {
    focus: '#5B7B6D',
    shortBreak: '#C4A77D',
    longBreak: '#475569',
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

  const footerText = isRunning ? 'Timer running - persists when panel is closed' : 'Start a focus session';

  return (
    <ToolPanel
      isOpen={isOpen}
      onClose={onClose}
      title="Pomodoro Timer"
      subtitle={`Today: ${sessionsCompleted} sessions`}
      icon={<PomodoroIcon />}
      shortcutKey="P"
      footerText={footerText}
    >
      {/* Mode tabs */}
      <div className="px-4 py-3 border-b border-border bg-surface-muted/30">
        <div className="flex gap-1.5">
          {(['focus', 'shortBreak', 'longBreak'] as TimerMode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === m
                  ? `${modeSolidColors[m]} text-white shadow-sm`
                  : 'bg-surface-muted text-content-muted hover:bg-border'
              }`}
            >
              {m === 'focus' ? <TargetIcon className="w-3.5 h-3.5" /> : <ClockIcon className="w-3.5 h-3.5" />}
              <span>{modeLabels[m]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content - Timer display with elevated surface */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Timer circle - elevated card with subtle shadow */}
        <div className="relative w-48 h-48 mb-6 rounded-full bg-surface shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)]">
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
              stroke={modeStrokeColors[mode]}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={553}
              strokeDashoffset={553 - (553 * progress) / 100}
              className="transition-all duration-1000"
            />
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

        {/* Controls - elevated with subtle shadow */}
        <div className="flex items-center justify-center gap-3 mb-6 p-3 rounded-2xl bg-surface-muted/50 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_-3px_rgba(0,0,0,0.2)]">
          <button
            onClick={resetTimer}
            className="p-3 text-content-muted hover:text-secondary hover:bg-surface rounded-xl transition-colors"
            aria-label="Reset timer"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <button
            onClick={toggleTimer}
            className={`px-8 py-3 rounded-xl font-semibold text-white shadow-sm transition-all transform hover:scale-[1.02] active:scale-[0.98] ${modeSolidColors[mode]}`}
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
            className="p-3 text-content-muted hover:text-secondary hover:bg-surface rounded-xl transition-colors"
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
              className="flex-1 px-4 py-2 text-sm border border-border rounded-lg bg-surface text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              onKeyDown={(e) => e.key === 'Enter' && setCustomTime()}
              autoFocus
            />
            <button
              onClick={setCustomTime}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${modeSolidColors[mode]}`}
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
    </ToolPanel>
  );
}

export default PomodoroPanel;
