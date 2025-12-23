'use client';

import { useState } from 'react';
import type { DeckFilter, MedicalSystem, CardState, Difficulty, Rotation } from '@/types';

interface DeckFilterPanelProps {
  filters: DeckFilter;
  availableTags: string[];
  availableSystems: MedicalSystem[];
  filteredCount: number;
  totalDueCount: number;
  onFiltersChange: (filters: DeckFilter) => void;
  onClearFilters: () => void;
}

export function DeckFilterPanel({
  filters,
  availableTags,
  availableSystems,
  filteredCount,
  totalDueCount,
  onFiltersChange,
  onClearFilters
}: DeckFilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'systems' | 'tags' | 'other'>('systems');

  const hasActiveFilters = 
    filters.tags.length > 0 || 
    filters.systems.length > 0 || 
    filters.rotations.length > 0 ||
    filters.states.length > 0 ||
    filters.difficulties.length > 0;

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    onFiltersChange({ ...filters, tags: newTags });
  };

  const toggleSystem = (system: MedicalSystem) => {
    const newSystems = filters.systems.includes(system)
      ? filters.systems.filter(s => s !== system)
      : [...filters.systems, system];
    onFiltersChange({ ...filters, systems: newSystems });
  };

  const toggleState = (state: CardState) => {
    const newStates = filters.states.includes(state)
      ? filters.states.filter(s => s !== state)
      : [...filters.states, state];
    onFiltersChange({ ...filters, states: newStates });
  };

  const toggleDifficulty = (difficulty: Difficulty) => {
    const newDiffs = filters.difficulties.includes(difficulty)
      ? filters.difficulties.filter(d => d !== difficulty)
      : [...filters.difficulties, difficulty];
    onFiltersChange({ ...filters, difficulties: newDiffs });
  };

  const allStates: CardState[] = ['new', 'learning', 'review', 'relearning'];
  const allDifficulties: Difficulty[] = ['easy', 'medium', 'hard'];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>
          <div className="text-left">
            <span className="font-medium text-slate-900">Filter Deck</span>
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                {filteredCount} of {totalDueCount} cards
              </span>
            )}
          </div>
        </div>
        <svg 
          className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Active filters preview */}
      {hasActiveFilters && !isExpanded && (
        <div className="px-4 pb-3 flex flex-wrap gap-1">
          {filters.systems.map(system => (
            <span key={system} className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
              {system}
            </span>
          ))}
          {filters.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-0.5 text-xs bg-tribe-sage-100 text-tribe-sage-700 rounded-full">
              #{tag}
            </span>
          ))}
          {filters.tags.length > 3 && (
            <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full">
              +{filters.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Expanded filter panel */}
      {isExpanded && (
        <div className="border-t border-slate-200">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('systems')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'systems' 
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Systems
              {filters.systems.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-indigo-600 text-white rounded-full">
                  {filters.systems.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('tags')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'tags' 
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tags
              {filters.tags.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-indigo-600 text-white rounded-full">
                  {filters.tags.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('other')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'other' 
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              More
              {(filters.states.length > 0 || filters.difficulties.length > 0) && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-indigo-600 text-white rounded-full">
                  {filters.states.length + filters.difficulties.length}
                </span>
              )}
            </button>
          </div>

          {/* Tab content */}
          <div className="p-4 max-h-64 overflow-y-auto">
            {activeTab === 'systems' && (
              <div className="flex flex-wrap gap-2">
                {availableSystems.map(system => (
                  <button
                    key={system}
                    onClick={() => toggleSystem(system)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                      filters.systems.includes(system)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    {system}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'tags' && (
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                      filters.tags.includes(tag)
                        ? 'bg-tribe-sage-600 text-white border-tribe-sage-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-tribe-sage-50'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'other' && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Card State</p>
                  <div className="flex flex-wrap gap-2">
                    {allStates.map(state => (
                      <button
                        key={state}
                        onClick={() => toggleState(state)}
                        className={`px-3 py-1.5 text-sm rounded-lg border capitalize transition-all ${
                          filters.states.includes(state)
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300 hover:bg-purple-50'
                        }`}
                      >
                        {state}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Difficulty</p>
                  <div className="flex flex-wrap gap-2">
                    {allDifficulties.map(diff => (
                      <button
                        key={diff}
                        onClick={() => toggleDifficulty(diff)}
                        className={`px-3 py-1.5 text-sm rounded-lg border capitalize transition-all ${
                          filters.difficulties.includes(diff)
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-amber-50'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Clear filters button */}
          {hasActiveFilters && (
            <div className="px-4 pb-4">
              <button
                onClick={onClearFilters}
                className="w-full py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
