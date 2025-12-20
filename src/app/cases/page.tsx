'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
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

  // Get available systems
  const availableSystems = useMemo(() => {
    const systems = new Set(vignettes.map(v => v.metadata.system));
    return Array.from(systems).sort();
  }, [vignettes]);

  // Filter vignettes
  const filteredVignettes = useMemo(() => {
    return vignettes.filter(v => {
      // System filter
      if (selectedSystem !== 'all' && v.metadata.system !== selectedSystem) {
        return false;
      }

      // Difficulty filter
      if (selectedDifficulty !== 'all' && v.metadata.difficulty !== selectedDifficulty) {
        return false;
      }

      // Search filter
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <Header />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Loading cases...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Header />

      {/* Page header with title and actions */}
      <div className="bg-white border-b border-slate-200 sticky top-[64px] z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-800">Interactive Cases</h1>

            {/* Stats pills and Create button */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 rounded-full">
                  <span className="text-sm font-medium text-indigo-700">{stats.dueToday}</span>
                  <span className="text-sm text-indigo-600">due today</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-full">
                  <span className="text-sm font-medium text-emerald-700">{stats.mastered}</span>
                  <span className="text-sm text-emerald-600">mastered</span>
                </div>
              </div>
              <Link
                href="/cases/create"
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-sm font-medium rounded-lg shadow-md shadow-indigo-500/25 transition-all flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Create Case</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
            <div className="text-sm text-slate-500">Total Cases</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="text-2xl font-bold text-indigo-600">{stats.dueToday}</div>
            <div className="text-sm text-slate-500">Due Today</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="text-2xl font-bold text-emerald-600">{stats.mastered}</div>
            <div className="text-sm text-slate-500">Mastered</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="text-2xl font-bold text-amber-600">{stats.learning}</div>
            <div className="text-sm text-slate-500">Learning</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
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
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* System filter */}
            <select
              value={selectedSystem}
              onChange={(e) => setSelectedSystem(e.target.value as MedicalSystem | 'all')}
              className="px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
            >
              <option value="all">All Systems</option>
              {availableSystems.map(system => (
                <option key={system} value={system}>{system}</option>
              ))}
            </select>

            {/* Difficulty filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as 'all' | 'beginner' | 'intermediate' | 'advanced')}
              className="px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
            >
              <option value="all">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Due for review section */}
        {dueCases.length > 0 && selectedSystem === 'all' && selectedDifficulty === 'all' && !searchQuery && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full" />
              Due for Review
            </h2>
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

        {/* All cases */}
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            {searchQuery || selectedSystem !== 'all' || selectedDifficulty !== 'all'
              ? `Filtered Cases (${filteredVignettes.length})`
              : 'All Cases'
            }
          </h2>

          {filteredVignettes.length === 0 ? (
            <div className="bg-white rounded-xl p-8 border border-slate-200 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">No cases found</h3>
              <p className="text-slate-500 mb-4">Try adjusting your filters or search query.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSystem('all');
                  setSelectedDifficulty('all');
                }}
                className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
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
    </div>
  );
}
