'use client';

import { useState } from 'react';
import { useHealthData } from '@/hooks/useHealthData';

interface HealthConnectProps {
  variant?: 'full' | 'compact';
  onPointsEarned?: (points: number) => void;
}

const HEALTH_PROVIDERS = [
  {
    id: 'apple_health' as const,
    name: 'Apple Health',
    icon: '❤️',
    color: 'from-red-500 to-pink-500',
    description: 'Sync steps, workouts, and sleep from your iPhone',
    available: true
  },
  {
    id: 'google_fit' as const,
    name: 'Google Fit',
    icon: '💚',
    color: 'from-green-500 to-tribe-sage-500',
    description: 'Connect your Android fitness data',
    available: true
  },
  {
    id: 'fitbit' as const,
    name: 'Fitbit',
    icon: '💙',
    color: 'from-blue-500 to-cyan-500',
    description: 'Sync from your Fitbit device',
    available: false // Coming soon
  },
  {
    id: 'garmin' as const,
    name: 'Garmin',
    icon: '🖤',
    color: 'from-slate-600 to-slate-800',
    description: 'Connect your Garmin watch',
    available: false // Coming soon
  }
];

export function HealthConnect({ variant = 'full', onPointsEarned }: HealthConnectProps) {
  const {
    syncStatus,
    isLoading,
    connectProvider,
    disconnectProvider,
    addHealthData,
    getTodaySummary,
    getWeekSummaries,
    getWeeklyHealthVillagePoints,
    getAppleHealthShortcutUrl
  } = useHealthData();

  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualData, setManualData] = useState({
    type: 'steps' as 'steps' | 'workout' | 'sleep' | 'mindful_minutes',
    value: ''
  });
  const [connecting, setConnecting] = useState<string | null>(null);

  const todaySummary = getTodaySummary();
  const weekSummaries = getWeekSummaries();
  const weeklyPoints = getWeeklyHealthVillagePoints();

  const handleConnect = async (providerId: 'apple_health' | 'google_fit' | 'fitbit' | 'garmin') => {
    setConnecting(providerId);

    // For Apple Health, we'll show the iOS Shortcut instructions
    if (providerId === 'apple_health') {
      // In a real implementation, this would open the Shortcuts app
      // For now, we'll simulate a connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      await connectProvider(providerId);
    } else {
      // For other providers, simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1500));
      await connectProvider(providerId);
    }

    setConnecting(null);
  };

  const handleManualSubmit = () => {
    const value = parseFloat(manualData.value);
    if (isNaN(value) || value <= 0) return;

    addHealthData(manualData.type, value, 'manual');
    setManualData({ type: 'steps', value: '' });
    setShowManualEntry(false);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl h-48" />
    );
  }

  // Compact variant for header/sidebar
  if (variant === 'compact') {
    return (
      <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tribe-sage-500 to-teal-500 flex items-center justify-center">
              <span className="text-xl">⌚</span>
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-white text-sm">
                {syncStatus?.isConnected ? 'Health Connected' : 'Connect Health'}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {syncStatus?.isConnected
                  ? `${weeklyPoints} pts this week`
                  : '3x verified points'}
              </p>
            </div>
          </div>
          {syncStatus?.isConnected ? (
            <span className="px-2 py-1 bg-tribe-sage-100 dark:bg-tribe-sage-900/50 text-tribe-sage-700 dark:text-tribe-sage-300 text-xs font-medium rounded-full">
              ✓ Synced
            </span>
          ) : (
            <button
              onClick={() => handleConnect('apple_health')}
              className="px-3 py-1.5 bg-tribe-sage-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors"
            >
              Connect
            </button>
          )}
        </div>
      </div>
    );
  }

  // Full variant for settings/wellness page
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-2xl">⌚</span>
            Health App Integration
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Connect your health app for verified wellness tracking and 3x village points
          </p>
        </div>
        {syncStatus?.isConnected && (
          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-tribe-sage-100 dark:bg-tribe-sage-900/50 text-tribe-sage-700 dark:text-tribe-sage-300 text-sm font-medium rounded-full">
              <span className="w-2 h-2 bg-tribe-sage-500 rounded-full animate-pulse" />
              Connected to {HEALTH_PROVIDERS.find(p => p.id === syncStatus.provider)?.name}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              Last synced: {syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleString() : 'Never'}
            </p>
          </div>
        )}
      </div>

      {/* Provider Cards */}
      {!syncStatus?.isConnected && (
        <div className="grid md:grid-cols-2 gap-4">
          {HEALTH_PROVIDERS.map((provider) => (
            <div
              key={provider.id}
              className={`relative p-5 rounded-2xl border transition-all ${
                provider.available
                  ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-emerald-300'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-60'
              }`}
            >
              {!provider.available && (
                <span className="absolute top-3 right-3 px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium rounded-full">
                  Coming Soon
                </span>
              )}
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${provider.color} flex items-center justify-center text-2xl shadow-lg`}>
                  {provider.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{provider.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{provider.description}</p>
                  {provider.available && (
                    <button
                      onClick={() => handleConnect(provider.id)}
                      disabled={connecting !== null}
                      className={`w-full py-2.5 rounded-xl font-medium transition-all ${
                        connecting === provider.id
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                          : `bg-gradient-to-r ${provider.color} text-white hover:shadow-lg`
                      }`}
                    >
                      {connecting === provider.id ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Connecting...
                        </span>
                      ) : (
                        'Connect'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Connected State - Stats */}
      {syncStatus?.isConnected && (
        <>
          {/* Today's Summary */}
          <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Today's Health Data</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl mb-1">👟</div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {todaySummary?.steps.toLocaleString() || 0}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">steps</p>
                {todaySummary?.stepsVerified && (
                  <span className="inline-flex items-center gap-1 text-xs text-tribe-sage-600 dark:text-tribe-sage-400 mt-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    verified
                  </span>
                )}
              </div>
              <div className="text-center">
                <div className="text-3xl mb-1">🏃</div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {todaySummary?.workoutMinutes || 0}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">workout mins</p>
                {todaySummary?.workoutVerified && (
                  <span className="inline-flex items-center gap-1 text-xs text-tribe-sage-600 dark:text-tribe-sage-400 mt-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    verified
                  </span>
                )}
              </div>
              <div className="text-center">
                <div className="text-3xl mb-1">😴</div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {todaySummary?.sleepHours.toFixed(1) || 0}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">hours sleep</p>
                {todaySummary?.sleepVerified && (
                  <span className="inline-flex items-center gap-1 text-xs text-tribe-sage-600 dark:text-tribe-sage-400 mt-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    verified
                  </span>
                )}
              </div>
              <div className="text-center">
                <div className="text-3xl mb-1">🧘</div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {todaySummary?.mindfulMinutes || 0}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">mindful mins</p>
                {todaySummary?.mindfulVerified && (
                  <span className="inline-flex items-center gap-1 text-xs text-tribe-sage-600 dark:text-tribe-sage-400 mt-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    verified
                  </span>
                )}
              </div>
            </div>

            {/* Points earned today */}
            <div className="mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Village Points from health today</span>
                <span className="font-bold text-tribe-sage-600 dark:text-tribe-sage-400">
                  +{todaySummary?.villagePointsEarned || 0} pts
                </span>
              </div>
            </div>
          </div>

          {/* Weekly Chart */}
          <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">This Week</h3>
              <span className="text-sm text-tribe-sage-600 dark:text-tribe-sage-400 font-medium">
                {weeklyPoints} pts earned
              </span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {weekSummaries.map((day, i) => {
                const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
                const stepsPercent = Math.min((day.steps / day.stepsGoal) * 100, 100);
                const hasActivity = day.steps > 0 || day.workoutMinutes > 0;

                return (
                  <div key={day.date} className="text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{dayName}</p>
                    <div className={`h-16 rounded-lg relative overflow-hidden ${
                      hasActivity
                        ? 'bg-tribe-sage-100 dark:bg-tribe-sage-900/30'
                        : 'bg-slate-100 dark:bg-slate-700'
                    }`}>
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-tribe-sage-500 to-teal-400 transition-all"
                        style={{ height: `${stepsPercent}%` }}
                      />
                      {day.stepsVerified && (
                        <div className="absolute top-1 right-1">
                          <svg className="w-3 h-3 text-tribe-sage-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {day.villagePointsEarned > 0 ? `+${day.villagePointsEarned}` : '-'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Disconnect Button */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Connected to {HEALTH_PROVIDERS.find(p => p.id === syncStatus.provider)?.name}
              </p>
              <p className="text-xs text-slate-500">Your data syncs automatically</p>
            </div>
            <button
              onClick={disconnectProvider}
              className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              Disconnect
            </button>
          </div>
        </>
      )}

      {/* Manual Entry Section */}
      <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Manual Entry</h3>
            <p className="text-xs text-slate-500">Self-reported activities (1x points, unverified)</p>
          </div>
          <button
            onClick={() => setShowManualEntry(!showManualEntry)}
            className="text-sm text-tribe-sage-600 dark:text-tribe-sage-400 hover:underline"
          >
            {showManualEntry ? 'Cancel' : 'Add Entry'}
          </button>
        </div>

        {showManualEntry && (
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Activity Type
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'steps', label: 'Steps', icon: '👟' },
                  { id: 'workout', label: 'Workout', icon: '🏃' },
                  { id: 'sleep', label: 'Sleep', icon: '😴' },
                  { id: 'mindful_minutes', label: 'Mindful', icon: '🧘' }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setManualData(prev => ({ ...prev, type: type.id as typeof prev.type }))}
                    className={`p-3 rounded-xl text-center transition-all ${
                      manualData.type === type.id
                        ? 'bg-tribe-sage-100 dark:bg-tribe-sage-900/30 border-2 border-tribe-sage-500'
                        : 'bg-slate-100 dark:bg-slate-700 border-2 border-transparent'
                    }`}
                  >
                    <span className="text-xl block mb-1">{type.icon}</span>
                    <span className="text-xs text-slate-600 dark:text-slate-400">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Value ({manualData.type === 'steps' ? 'count' : manualData.type === 'sleep' ? 'hours' : 'minutes'})
              </label>
              <input
                type="number"
                value={manualData.value}
                onChange={(e) => setManualData(prev => ({ ...prev, value: e.target.value }))}
                placeholder={manualData.type === 'steps' ? '10000' : manualData.type === 'sleep' ? '7.5' : '30'}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl border-0 text-slate-900 dark:text-white placeholder-slate-400"
              />
            </div>

            <button
              onClick={handleManualSubmit}
              disabled={!manualData.value || parseFloat(manualData.value) <= 0}
              className="w-full py-3 bg-gradient-to-r from-tribe-sage-500 to-tribe-sage-500 hover:from-teal-600 hover:to-tribe-sage-600 disabled:from-slate-400 disabled:to-slate-500 text-white font-medium rounded-xl transition-all"
            >
              Add Entry (Self-Reported)
            </button>

            <p className="text-xs text-slate-500 text-center">
              Self-reported entries earn standard points. Connect a health app for 3x verified points!
            </p>
          </div>
        )}
      </div>

      {/* Benefits Info */}
      <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-4">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">Why Connect?</h4>
            <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
              <li>• <strong>3x Village Points</strong> for health-app verified activities</li>
              <li>• <strong>Automatic tracking</strong> - no manual logging needed</li>
              <li>• <strong>Charity partners love it</strong> - verified data strengthens impact</li>
              <li>• <strong>Your data stays private</strong> - only summaries are synced</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HealthConnect;
