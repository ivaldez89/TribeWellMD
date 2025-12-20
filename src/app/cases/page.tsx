'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useVignettes } from '@/hooks/useVignettes';
import { VignetteCard } from '@/components/vignettes/VignetteCard';
import type { MedicalSystem } from '@/types';

export default function CasesPage() {
  const {
    vignettes,
    progress,
    isLoading,
    stats,
    getDueForReview,
    getProgressForVignette
  } = useVignettes();

  const [selectedSystem, setSelectedSystem] = useState<MedicalSystem | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Get available systems
  const availableSystems = useMemo(() => {
    const systems = new Set(vignettes.map(v => v.metadata.system));
    return Array.from(systems).sort();
  }, [vignettes]);

  // Filter vignettes
  const filteredVignettes = useMemo(() => {
    return vignettes.filter(v => {
      if (selectedSystem !== 'all' && v.metadata.system !== selectedSystem) {
        return false;
      }
      if (selectedDifficulty !== 'all' && v.metadata.difficulty !== selectedDifficulty) {
        return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          v.title.toLowerCase().includes(query) ||
          v.metadata.topic.toLowerCase().includes(query) ||
          v.metadata.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [vignettes, selectedSystem, selectedDifficulty, searchQuery]);

  // Get due cases
  const dueCases = useMemo(() => getDueForReview(), [getDueForReview]);

  const hasActiveFilters = selectedSystem !== 'all' || selectedDifficulty !== 'all' || searchQuery !== '';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Header />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Loading cases...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 md:p-10 shadow-2xl">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Left side - Message */}
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur rounded-full text-white/90 text-sm font-medium mb-4">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span>{vignettes.length} clinical scenarios available</span>
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                  Interactive <span className="text-yellow-300">Cases</span>
                </h1>

                <p className="text-white/80 text-lg max-w-md">
                  Master clinical reasoning with branching patient scenarios. Make decisions and see the outcomes.
                </p>

                {/* Stats row */}
                <div className="flex items-center gap-6 mt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{stats.total}</p>
                    <p className="text-white/60 text-sm">Total Cases</p>
                  </div>
                  <div className="w-px h-10 bg-white/20" />
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{stats.dueToday}</p>
                    <p className="text-white/60 text-sm">Due Today</p>
                  </div>
                  <div className="w-px h-10 bg-white/20" />
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{stats.mastered}</p>
                    <p className="text-white/60 text-sm">Mastered</p>
                  </div>
                </div>
              </div>

              {/* Right side - CTA Button */}
              <div className="flex flex-col items-center gap-4">
                {dueCases.length > 0 ? (
                  <Link
                    href={`/cases/${dueCases[0].id}`}
                    className="group relative px-10 py-5 bg-white hover:bg-yellow-50 text-slate-900 font-bold text-xl rounded-2xl shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 hover:scale-105"
                  >
                    <span className="flex items-center gap-3">
                      Start Reviewing
                      <span className="px-3 py-1 bg-indigo-500 text-white text-base rounded-full">
                        {dueCases.length}
                      </span>
                      <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  </Link>
                ) : (
                  <div className="px-10 py-5 bg-white/20 backdrop-blur text-white font-semibold text-xl rounded-2xl flex items-center gap-3">
                    <svg className="w-6 h-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    All Caught Up!
                  </div>
                )}

                <Link
                  href="/cases/create"
                  className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur hover:bg-white/30 text-white font-medium rounded-xl transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New Case
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions Bar */}
        <section className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search cases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
              />
            </div>

            {/* Filter button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
                showFilters || hasActiveFilters
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="text-sm font-medium">Filters</span>
              {hasActiveFilters && (
                <span className="px-2 py-0.5 bg-indigo-500 text-white text-xs rounded-full">
                  {(selectedSystem !== 'all' ? 1 : 0) + (selectedDifficulty !== 'all' ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            {filteredVignettes.length} case{filteredVignettes.length !== 1 ? 's' : ''} available
          </p>
        </section>

        {/* Expandable Filters */}
        {showFilters && (
          <section className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap gap-4">
              {/* System filter */}
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  System
                </label>
                <select
                  value={selectedSystem}
                  onChange={(e) => setSelectedSystem(e.target.value as MedicalSystem | 'all')}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-slate-700 text-sm"
                >
                  <option value="all">All Systems</option>
                  {availableSystems.map(system => (
                    <option key={system} value={system}>{system}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty filter */}
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  Difficulty
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value as 'all' | 'beginner' | 'intermediate' | 'advanced')}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-slate-700 text-sm"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Clear filters */}
              {hasActiveFilters && (
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedSystem('all');
                      setSelectedDifficulty('all');
                    }}
                    className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Due for Review Section */}
        {dueCases.length > 0 && !hasActiveFilters && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse" />
                Due for Review
              </h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {dueCases.length} case{dueCases.length !== 1 ? 's' : ''} waiting
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dueCases.slice(0, 3).map(vignette => (
                <VignetteCard
                  key={vignette.id}
                  vignette={vignette}
                  progress={getProgressForVignette(vignette.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* All Cases Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {hasActiveFilters ? 'Filtered Cases' : 'Browse All Cases'}
            </h2>
          </div>

          {filteredVignettes.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 border border-slate-200 dark:border-slate-700 text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No cases found</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                Try adjusting your filters or search query to find what you're looking for.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSystem('all');
                  setSelectedDifficulty('all');
                }}
                className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVignettes.map(vignette => (
                <VignetteCard
                  key={vignette.id}
                  vignette={vignette}
                  progress={getProgressForVignette(vignette.id)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
