'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import Link from 'next/link';

// Settings types
interface AppSettings {
  // Notifications
  emailNotifications: boolean;
  studyReminders: boolean;
  tribeActivity: boolean;
  weeklyDigest: boolean;

  // Study Preferences
  dailyGoal: number; // cards per day
  reviewTime: string; // preferred time
  soundEffects: boolean;
  autoPlayAudio: boolean;
  showTimer: boolean;

  // Appearance
  theme: 'light' | 'dark' | 'system';
  compactMode: boolean;
  animationsEnabled: boolean;

  // Privacy
  profileVisibility: 'public' | 'connections' | 'private';
  showOnlineStatus: boolean;
  showStudyActivity: boolean;
  allowConnectionRequests: boolean;

  // Focus Mode
  focusModeEnabled: boolean;
  focusBlockSocial: boolean;
  focusBlockNotifications: boolean;

  // Accessibility
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  emailNotifications: true,
  studyReminders: true,
  tribeActivity: true,
  weeklyDigest: true,
  dailyGoal: 50,
  reviewTime: '09:00',
  soundEffects: true,
  autoPlayAudio: false,
  showTimer: true,
  theme: 'system',
  compactMode: false,
  animationsEnabled: true,
  profileVisibility: 'public',
  showOnlineStatus: true,
  showStudyActivity: true,
  allowConnectionRequests: true,
  focusModeEnabled: false,
  focusBlockSocial: true,
  focusBlockNotifications: true,
  highContrast: false,
  reducedMotion: false,
  largeText: false,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('notifications');

  // Load settings on mount
  useEffect(() => {
    const saved = localStorage.getItem('tribewellmd_settings');
    if (saved) {
      setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem('tribewellmd_settings', JSON.stringify(settings));

    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage('Settings saved!');
      setTimeout(() => setSaveMessage(null), 3000);
    }, 500);
  };

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const Toggle = ({ checked, onChange, disabled = false }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) => (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`
        relative w-12 h-7 rounded-full transition-colors duration-200
        ${checked ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-600'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span
        className={`
          absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );

  const sections = [
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'study', label: 'Study Preferences', icon: '📚' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'privacy', label: 'Privacy & Security', icon: '🔒' },
    { id: 'focus', label: 'Focus Mode', icon: '🎯' },
    { id: 'accessibility', label: 'Accessibility', icon: '♿' },
    { id: 'data', label: 'Data & Storage', icon: '💾' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />

      {/* Success Toast */}
      {saveMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 px-4 py-3 bg-emerald-500 text-white rounded-xl shadow-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">{saveMessage}</span>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/profile"
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
              <p className="text-slate-500 dark:text-slate-400">Customize your TribeWellMD experience</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-teal-500/25 transition-all flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4 sticky top-24">
              <nav className="space-y-1">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all
                      ${activeSection === section.id
                        ? 'bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30 text-teal-700 dark:text-teal-300 font-medium'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }
                    `}
                  >
                    <span className="text-lg">{section.icon}</span>
                    <span className="text-sm">{section.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Notifications */}
            {activeSection === 'notifications' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="text-xl">🔔</span>
                  Notifications
                </h2>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Email Notifications</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Receive updates via email</p>
                    </div>
                    <Toggle checked={settings.emailNotifications} onChange={(v) => updateSetting('emailNotifications', v)} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Study Reminders</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Daily reminders to review your cards</p>
                    </div>
                    <Toggle checked={settings.studyReminders} onChange={(v) => updateSetting('studyReminders', v)} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Tribe Activity</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Updates from your tribes and members</p>
                    </div>
                    <Toggle checked={settings.tribeActivity} onChange={(v) => updateSetting('tribeActivity', v)} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Weekly Digest</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Summary of your progress and tribe impact</p>
                    </div>
                    <Toggle checked={settings.weeklyDigest} onChange={(v) => updateSetting('weeklyDigest', v)} />
                  </div>
                </div>
              </div>
            )}

            {/* Study Preferences */}
            {activeSection === 'study' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="text-xl">📚</span>
                  Study Preferences
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block font-medium text-slate-900 dark:text-white mb-2">Daily Card Goal</label>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">How many cards would you like to review per day?</p>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="10"
                        max="200"
                        step="10"
                        value={settings.dailyGoal}
                        onChange={(e) => updateSetting('dailyGoal', parseInt(e.target.value))}
                        className="flex-1 accent-teal-500"
                      />
                      <span className="w-16 text-center font-bold text-teal-600 dark:text-teal-400 text-lg">
                        {settings.dailyGoal}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-900 dark:text-white mb-2">Preferred Review Time</label>
                    <input
                      type="time"
                      value={settings.reviewTime}
                      onChange={(e) => updateSetting('reviewTime', e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Sound Effects</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Play sounds for correct/incorrect answers</p>
                    </div>
                    <Toggle checked={settings.soundEffects} onChange={(v) => updateSetting('soundEffects', v)} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Auto-play Audio</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Automatically read cards aloud</p>
                    </div>
                    <Toggle checked={settings.autoPlayAudio} onChange={(v) => updateSetting('autoPlayAudio', v)} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Show Timer</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Display time spent on each card</p>
                    </div>
                    <Toggle checked={settings.showTimer} onChange={(v) => updateSetting('showTimer', v)} />
                  </div>
                </div>
              </div>
            )}

            {/* Appearance */}
            {activeSection === 'appearance' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="text-xl">🎨</span>
                  Appearance
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block font-medium text-slate-900 dark:text-white mb-3">Theme</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['light', 'dark', 'system'] as const).map(theme => (
                        <button
                          key={theme}
                          onClick={() => updateSetting('theme', theme)}
                          className={`
                            p-4 rounded-xl border-2 transition-all text-center
                            ${settings.theme === theme
                              ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30'
                              : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                            }
                          `}
                        >
                          <span className="text-2xl mb-2 block">
                            {theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '💻'}
                          </span>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                            {theme}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Compact Mode</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Reduce spacing for more content</p>
                    </div>
                    <Toggle checked={settings.compactMode} onChange={(v) => updateSetting('compactMode', v)} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Animations</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Enable smooth transitions and effects</p>
                    </div>
                    <Toggle checked={settings.animationsEnabled} onChange={(v) => updateSetting('animationsEnabled', v)} />
                  </div>
                </div>
              </div>
            )}

            {/* Privacy */}
            {activeSection === 'privacy' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="text-xl">🔒</span>
                  Privacy & Security
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block font-medium text-slate-900 dark:text-white mb-2">Profile Visibility</label>
                    <select
                      value={settings.profileVisibility}
                      onChange={(e) => updateSetting('profileVisibility', e.target.value as AppSettings['profileVisibility'])}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="public">Public - Anyone can see your profile</option>
                      <option value="connections">Connections Only</option>
                      <option value="private">Private - Only you can see</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Show Online Status</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Let others see when you're active</p>
                    </div>
                    <Toggle checked={settings.showOnlineStatus} onChange={(v) => updateSetting('showOnlineStatus', v)} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Show Study Activity</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Share your study stats with tribe members</p>
                    </div>
                    <Toggle checked={settings.showStudyActivity} onChange={(v) => updateSetting('showStudyActivity', v)} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Allow Connection Requests</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Let others send you connection requests</p>
                    </div>
                    <Toggle checked={settings.allowConnectionRequests} onChange={(v) => updateSetting('allowConnectionRequests', v)} />
                  </div>
                </div>
              </div>
            )}

            {/* Focus Mode */}
            {activeSection === 'focus' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="text-xl">🎯</span>
                  Focus Mode
                </h2>

                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl mb-6">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Focus Mode helps you study without distractions. When enabled, notifications will be silenced and social features will be hidden.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Enable Focus Mode</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Activate distraction-free studying</p>
                    </div>
                    <Toggle checked={settings.focusModeEnabled} onChange={(v) => updateSetting('focusModeEnabled', v)} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Block Social Features</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Hide chat and tribe activity</p>
                    </div>
                    <Toggle
                      checked={settings.focusBlockSocial}
                      onChange={(v) => updateSetting('focusBlockSocial', v)}
                      disabled={!settings.focusModeEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Block Notifications</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Silence all notifications during focus</p>
                    </div>
                    <Toggle
                      checked={settings.focusBlockNotifications}
                      onChange={(v) => updateSetting('focusBlockNotifications', v)}
                      disabled={!settings.focusModeEnabled}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Accessibility */}
            {activeSection === 'accessibility' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="text-xl">♿</span>
                  Accessibility
                </h2>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">High Contrast</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Increase color contrast for better visibility</p>
                    </div>
                    <Toggle checked={settings.highContrast} onChange={(v) => updateSetting('highContrast', v)} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Reduced Motion</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Minimize animations and transitions</p>
                    </div>
                    <Toggle checked={settings.reducedMotion} onChange={(v) => updateSetting('reducedMotion', v)} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Large Text</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Increase text size throughout the app</p>
                    </div>
                    <Toggle checked={settings.largeText} onChange={(v) => updateSetting('largeText', v)} />
                  </div>
                </div>
              </div>
            )}

            {/* Data & Storage */}
            {activeSection === 'data' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="text-xl">💾</span>
                  Data & Storage
                </h2>

                <div className="space-y-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Local Storage Used</span>
                      <span className="text-sm text-teal-600 dark:text-teal-400 font-medium">2.3 MB</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full" style={{ width: '23%' }} />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Flashcards, progress, and preferences</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white mb-3">Export Your Data</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                      Download all your flashcards, progress, and study history
                    </p>
                    <button className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl transition-colors flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Export Data
                    </button>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h3 className="font-medium text-red-600 dark:text-red-400 mb-3">Danger Zone</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                      Clear all local data including flashcards, progress, and settings
                    </p>
                    <button className="px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl transition-colors flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Clear All Data
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
