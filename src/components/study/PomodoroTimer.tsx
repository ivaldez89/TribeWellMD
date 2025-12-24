'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

interface PomodoroTimerProps {
  onSessionComplete?: () => void;
}

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const TIMER_SETTINGS = {
  focus: 25 * 60, // 25 minutes
  shortBreak: 5 * 60, // 5 minutes
  longBreak: 15 * 60, // 15 minutes
};

export function PomodoroTimer({ onSessionComplete }: PomodoroTimerProps) {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(TIMER_SETTINGS.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // For portal - need to wait for client-side mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate dropdown position when opening
  const handleTogglePanel = () => {
    if (!showPanel && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8, // 8px gap below button
        left: Math.max(8, rect.left) // Keep at least 8px from left edge
      });
    }
    setShowPanel(!showPanel);
  };

  // Store remaining time for each mode so switching back preserves progress
  const savedTimesRef = useRef<Record<TimerMode, number>>({
    focus: TIMER_SETTINGS.focus,
    shortBreak: TIMER_SETTINGS.shortBreak,
    longBreak: TIMER_SETTINGS.longBreak,
  });

  // Load sessions from localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('step2_pomodoro_sessions');
    if (stored) {
      const data = JSON.parse(stored);
      if (data.date === today) {
        setSessionsCompleted(data.count);
      }
    }
  }, []);

  // Save sessions to localStorage
  const saveSession = useCallback(() => {
    const today = new Date().toDateString();
    const newCount = sessionsCompleted + 1;
    setSessionsCompleted(newCount);
    localStorage.setItem('step2_pomodoro_sessions', JSON.stringify({
      date: today,
      count: newCount
    }));
  }, [sessionsCompleted]);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer completed
      setIsRunning(false);
      playNotificationSound();

      // Reset the completed mode's saved time to full duration
      savedTimesRef.current[mode] = TIMER_SETTINGS[mode];

      if (mode === 'focus') {
        saveSession();
        onSessionComplete?.();
        // Auto-switch to break
        const newSessions = sessionsCompleted + 1;
        if (newSessions % 4 === 0) {
          setMode('longBreak');
          setTimeLeft(savedTimesRef.current.longBreak);
        } else {
          setMode('shortBreak');
          setTimeLeft(savedTimesRef.current.shortBreak);
        }
      } else {
        // Break completed, back to focus
        setMode('focus');
        setTimeLeft(savedTimesRef.current.focus);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, mode, saveSession, onSessionComplete, sessionsCompleted]);

  const playNotificationSound = () => {
    // Create a simple beep using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      
      // Beep pattern
      setTimeout(() => { gainNode.gain.value = 0; }, 200);
      setTimeout(() => { gainNode.gain.value = 0.3; }, 400);
      setTimeout(() => { gainNode.gain.value = 0; }, 600);
      setTimeout(() => { gainNode.gain.value = 0.3; }, 800);
      setTimeout(() => { 
        oscillator.stop();
        audioContext.close();
      }, 1000);
    } catch (e) {
      console.log('Audio notification failed');
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(TIMER_SETTINGS[mode]);
    // Also reset the saved time for this mode
    savedTimesRef.current[mode] = TIMER_SETTINGS[mode];
  };

  const switchMode = (newMode: TimerMode) => {
    // Save current mode's remaining time before switching
    savedTimesRef.current[mode] = timeLeft;
    setIsRunning(false);
    setMode(newMode);
    // Restore the target mode's saved time
    setTimeLeft(savedTimesRef.current[newMode]);
    setShowCustomTime(false);
  };

  const setCustomTime = () => {
    const minutes = parseInt(customMinutes, 10);
    if (minutes > 0 && minutes <= 180) {
      const seconds = minutes * 60;
      setTimeLeft(seconds);
      savedTimesRef.current[mode] = seconds;
      setShowCustomTime(false);
      setCustomMinutes('');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((TIMER_SETTINGS[mode] - timeLeft) / TIMER_SETTINGS[mode]) * 100;

  const modeColors = {
    focus: 'from-red-500 to-orange-500',
    shortBreak: 'from-green-500 to-tribe-sage-500',
    longBreak: 'from-blue-500 to-cyan-500',
  };

  const modeLabels = {
    focus: '🎯 Focus',
    shortBreak: '☕ Break',
    longBreak: '🌴 Long',
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        ref={buttonRef}
        onClick={handleTogglePanel}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
          showPanel || isRunning
            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
        }`}
      >
        <span className="text-base">🍅</span>
        {isRunning ? (
          <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
        ) : (
          <span>Pomodoro</span>
        )}
      </button>

      {/* Dropdown Panel - rendered via portal to escape stacking contexts */}
      {showPanel && mounted && createPortal(
        <>
          {/* Backdrop to close panel */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setShowPanel(false)}
          />

          {/* Panel - positioned directly below the button */}
          <div
            className="fixed w-72 rounded-xl shadow-2xl border z-[9999] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
            }}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🍅</span>
                  <span>Pomodoro</span>
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Today: {sessionsCompleted} 🍅
                </span>
              </div>

              {/* Mode tabs */}
              <div className="flex gap-1 mb-4 p-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
                {(['focus', 'shortBreak', 'longBreak'] as TimerMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => switchMode(m)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      mode === m
                        ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    {modeLabels[m]}
                  </button>
                ))}
              </div>

              {/* Timer display - compact */}
              <div className="relative mb-4">
                <div className="w-32 h-32 mx-auto relative">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="6"
                      className="dark:stroke-slate-700"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="url(#pomo-gradient)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={352}
                      strokeDashoffset={352 - (352 * progress) / 100}
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="pomo-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={mode === 'focus' ? '#ef4444' : mode === 'shortBreak' ? '#22c55e' : '#3b82f6'} />
                        <stop offset="100%" stopColor={mode === 'focus' ? '#f97316' : mode === 'shortBreak' ? '#10b981' : '#06b6d4'} />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                      {formatTime(timeLeft)}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{modeLabels[mode]}</span>
                  </div>
                </div>
              </div>

              {/* Custom time input */}
              {showCustomTime ? (
                <div className="mb-4 flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(e.target.value)}
                    placeholder="Minutes"
                    className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    onKeyDown={(e) => e.key === 'Enter' && setCustomTime()}
                    autoFocus
                  />
                  <button
                    onClick={setCustomTime}
                    className="px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Set
                  </button>
                  <button
                    onClick={() => { setShowCustomTime(false); setCustomMinutes(''); }}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowCustomTime(true)}
                  className="mb-4 w-full py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Set custom time
                </button>
              )}

              {/* Controls */}
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={resetTimer}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  title="Reset"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>

                <button
                  onClick={toggleTimer}
                  className={`px-6 py-2 rounded-lg font-semibold text-white shadow-md transition-all transform hover:scale-105 active:scale-95 bg-gradient-to-r ${modeColors[mode]}`}
                >
                  {isRunning ? 'Pause' : 'Start'}
                </button>

                <button
                  onClick={() => {
                    setIsRunning(false);
                    if (mode === 'focus') {
                      switchMode('shortBreak');
                    } else {
                      switchMode('focus');
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  title="Skip"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <p className="mt-3 text-[10px] text-slate-400 dark:text-slate-500 text-center">
                {4 - (sessionsCompleted % 4)} more until long break
              </p>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
