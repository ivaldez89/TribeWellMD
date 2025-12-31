'use client';

import React, { useState, useMemo } from 'react';
import { CLINICAL_LABS, LAB_CATEGORIES, type LabCategory } from '@/data/clinical-labs';

interface LabReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LabReferenceModal({ isOpen, onClose }: LabReferenceModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<LabCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter labs based on category and search
  const filteredLabs = useMemo(() => {
    let labs = CLINICAL_LABS;

    // Filter by category
    if (selectedCategory !== 'all') {
      labs = labs.filter(lab => lab.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      labs = labs.filter(lab =>
        lab.name.toLowerCase().includes(query) ||
        lab.abbreviation.toLowerCase().includes(query)
      );
    }

    return labs;
  }, [selectedCategory, searchQuery]);

  // Group filtered labs by category
  const groupedLabs = useMemo(() => {
    const groups: Record<string, typeof CLINICAL_LABS> = {};
    for (const lab of filteredLabs) {
      if (!groups[lab.category]) {
        groups[lab.category] = [];
      }
      groups[lab.category].push(lab);
    }
    return groups;
  }, [filteredLabs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 pb-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[80vh] bg-surface rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100">NBME Reference Values</h2>
              <p className="text-xs text-blue-600 dark:text-blue-400">Standard laboratory reference ranges</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-content-muted hover:text-secondary hover:bg-surface-muted rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="px-6 py-3 border-b border-border bg-surface-muted/30 space-y-3">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search labs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-surface-muted text-content-muted hover:bg-border'
              }`}
            >
              All
            </button>
            {LAB_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-white'
                    : 'bg-surface-muted text-content-muted hover:bg-border'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Labs Table */}
        <div className="flex-1 overflow-y-auto">
          {Object.entries(groupedLabs).map(([category, labs]) => {
            const categoryInfo = LAB_CATEGORIES.find(c => c.id === category);
            return (
              <div key={category}>
                {/* Category Header */}
                <div className="sticky top-0 px-6 py-2 bg-surface-muted border-b border-border">
                  <h3 className="text-xs font-semibold text-content-muted uppercase tracking-wide">
                    {categoryInfo?.name || category}
                  </h3>
                </div>

                {/* Labs in Category */}
                <div className="divide-y divide-border/50">
                  {labs.map((lab) => (
                    <div key={lab.id} className="px-6 py-3 hover:bg-surface-muted/30 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-secondary text-sm">{lab.name}</span>
                            <span className="text-xs text-content-muted bg-surface-muted px-1.5 py-0.5 rounded">
                              {lab.abbreviation}
                            </span>
                          </div>
                          {lab.notes && (
                            <p className="text-xs text-content-muted mt-1 leading-relaxed">{lab.notes}</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-secondary tabular-nums text-sm">
                            {lab.normalLow}–{lab.normalHigh}
                          </div>
                          <div className="text-xs text-content-muted">{lab.unit}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {filteredLabs.length === 0 && (
            <div className="flex items-center justify-center py-12 text-center">
              <div>
                <svg className="w-12 h-12 text-content-muted mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-content-muted">No labs found matching your search</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-surface-muted/30 flex items-center justify-between">
          <p className="text-xs text-content-muted">
            {filteredLabs.length} lab{filteredLabs.length !== 1 ? 's' : ''} shown
          </p>
          <p className="text-xs text-content-muted">
            Press <kbd className="px-1.5 py-0.5 bg-surface border border-border rounded font-mono text-[10px]">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
}

export default LabReferenceModal;
