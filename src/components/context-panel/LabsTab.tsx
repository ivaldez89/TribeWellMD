'use client';

import React, { useMemo, useState } from 'react';
import {
  CLINICAL_LABS,
  LAB_CATEGORIES,
  getCategoryInfo,
  isAbnormal,
  type LabReference,
  type LabCategory,
} from '@/data/clinical-labs';
import { useContextPanelContext } from './useContextPanel';

interface LabsTabProps {
  className?: string;
}

export function LabsTab({ className = '' }: LabsTabProps) {
  const {
    pinnedLabs,
    labSearchQuery,
    setLabSearchQuery,
    selectedCategory,
    setSelectedCategory,
    showAbnormalOnly,
    setShowAbnormalOnly,
    questionLabValues,
    togglePinLab,
    isLabPinned,
    resetPinnedLabs,
  } = useContextPanelContext();

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['electrolytes', 'renal', 'cbc']));

  // Get question lab value if available
  const getQuestionValue = (labId: string): number | undefined => {
    const found = questionLabValues.find(v => v.labId === labId);
    return found?.value;
  };

  // Filter labs based on search, category, and abnormal filter
  const filteredLabs = useMemo(() => {
    let labs = [...CLINICAL_LABS];

    // Filter by search query
    if (labSearchQuery.trim()) {
      const query = labSearchQuery.toLowerCase();
      labs = labs.filter(
        lab =>
          lab.name.toLowerCase().includes(query) ||
          lab.abbreviation.toLowerCase().includes(query) ||
          lab.category.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory) {
      labs = labs.filter(lab => lab.category === selectedCategory);
    }

    // Filter by abnormal only
    if (showAbnormalOnly && questionLabValues.length > 0) {
      labs = labs.filter(lab => {
        const value = getQuestionValue(lab.id);
        if (value === undefined) return false;
        return isAbnormal(lab, value) !== 'normal';
      });
    }

    return labs;
  }, [labSearchQuery, selectedCategory, showAbnormalOnly, questionLabValues]);

  // Group labs by category
  const labsByCategory = useMemo(() => {
    const grouped: Record<string, LabReference[]> = {};
    for (const lab of filteredLabs) {
      if (!grouped[lab.category]) {
        grouped[lab.category] = [];
      }
      grouped[lab.category].push(lab);
    }
    return grouped;
  }, [filteredLabs]);

  // Get pinned labs
  const pinnedLabItems = useMemo(() => {
    return CLINICAL_LABS.filter(lab => pinnedLabs.includes(lab.id));
  }, [pinnedLabs]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Search Bar */}
      <div className="px-4 pt-4 pb-3 border-b border-border space-y-3">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search labs..."
            value={labSearchQuery}
            onChange={(e) => setLabSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-surface-muted rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            aria-label="Search laboratory values"
          />
          {labSearchQuery && (
            <button
              onClick={() => setLabSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-secondary"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filters Row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category filter */}
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="text-xs px-2 py-1.5 bg-surface-muted rounded-lg border border-border focus:border-primary outline-none"
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {LAB_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Show abnormal only toggle */}
          {questionLabValues.length > 0 && (
            <label className="flex items-center gap-1.5 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={showAbnormalOnly}
                onChange={(e) => setShowAbnormalOnly(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-border accent-primary"
              />
              <span className="text-content-muted">Abnormal only</span>
            </label>
          )}
        </div>
      </div>

      {/* Labs Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Pinned Labs Section */}
        {pinnedLabItems.length > 0 && !labSearchQuery && !selectedCategory && (
          <div className="border-b border-border">
            <div className="px-4 py-2 flex items-center justify-between bg-surface-muted/50">
              <span className="text-xs font-semibold text-content-muted uppercase tracking-wide flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Quick Access
              </span>
              <button
                onClick={resetPinnedLabs}
                className="text-xs text-content-muted hover:text-secondary"
                aria-label="Reset pinned labs"
              >
                Reset
              </button>
            </div>
            <div className="px-4 py-2 space-y-1">
              {pinnedLabItems.map(lab => (
                <LabRow
                  key={lab.id}
                  lab={lab}
                  value={getQuestionValue(lab.id)}
                  isPinned={true}
                  onTogglePin={() => togglePinLab(lab.id)}
                  compact
                />
              ))}
            </div>
          </div>
        )}

        {/* Categorized Labs */}
        <div className="pb-4">
          {Object.entries(labsByCategory).map(([category, labs]) => {
            const categoryInfo = getCategoryInfo(category as LabCategory);
            const isExpanded = expandedCategories.has(category);

            return (
              <div key={category} className="border-b border-border last:border-0">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-muted/50 transition-colors"
                  aria-expanded={isExpanded}
                  aria-controls={`labs-${category}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{categoryInfo?.icon || '🔬'}</span>
                    <span className="text-sm font-medium text-secondary">{categoryInfo?.name || category}</span>
                    <span className="text-xs text-content-muted">({labs.length})</span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-content-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isExpanded && (
                  <div id={`labs-${category}`} className="px-4 pb-3 space-y-1">
                    {labs.map(lab => (
                      <LabRow
                        key={lab.id}
                        lab={lab}
                        value={getQuestionValue(lab.id)}
                        isPinned={isLabPinned(lab.id)}
                        onTogglePin={() => togglePinLab(lab.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredLabs.length === 0 && (
          <div className="px-4 py-8 text-center">
            <svg className="w-12 h-12 mx-auto text-content-muted mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-content-muted">No labs found</p>
            {labSearchQuery && (
              <button
                onClick={() => setLabSearchQuery('')}
                className="mt-2 text-xs text-primary hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer with keyboard hint */}
      <div className="px-4 py-2 border-t border-border bg-surface-muted/30">
        <p className="text-xs text-content-muted text-center">
          Press <kbd className="px-1 py-0.5 bg-surface rounded text-xs font-mono">L</kbd> to toggle Labs panel
        </p>
      </div>
    </div>
  );
}

// Individual lab row component
interface LabRowProps {
  lab: LabReference;
  value?: number;
  isPinned: boolean;
  onTogglePin: () => void;
  compact?: boolean;
}

function LabRow({ lab, value, isPinned, onTogglePin, compact = false }: LabRowProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Determine if value is abnormal
  const abnormalStatus = value !== undefined ? isAbnormal(lab, value) : null;

  // Status colors
  const statusColors = {
    'normal': 'text-secondary',
    'low': 'text-blue-600 bg-blue-50',
    'high': 'text-amber-600 bg-amber-50',
    'critical-low': 'text-error bg-error/10 font-semibold',
    'critical-high': 'text-error bg-error/10 font-semibold',
  };

  return (
    <div
      className={`group rounded-lg transition-colors ${
        showDetails ? 'bg-surface-muted' : 'hover:bg-surface-muted/50'
      } ${compact ? 'py-1.5 px-2' : 'py-2 px-3'}`}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Left: Name and abbreviation */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex-1 text-left flex items-center gap-2 min-w-0"
          aria-expanded={showDetails}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`font-medium truncate ${compact ? 'text-xs' : 'text-sm'} text-secondary`}>
                {lab.abbreviation}
              </span>
              {!compact && (
                <span className="text-xs text-content-muted truncate hidden sm:inline">
                  {lab.name}
                </span>
              )}
            </div>
          </div>
        </button>

        {/* Center: Value (if provided) or Range */}
        <div className="flex items-center gap-2">
          {value !== undefined ? (
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                abnormalStatus ? statusColors[abnormalStatus] : ''
              }`}
            >
              {value} {lab.unit}
            </span>
          ) : (
            <span className="text-xs text-content-muted">
              {lab.normalLow}-{lab.normalHigh} {lab.unit}
            </span>
          )}
        </div>

        {/* Right: Pin button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          className={`p-1 rounded transition-colors ${
            isPinned
              ? 'text-primary'
              : 'text-content-muted opacity-0 group-hover:opacity-100 hover:text-primary'
          }`}
          aria-label={isPinned ? 'Unpin lab' : 'Pin lab'}
          title={isPinned ? 'Unpin from quick access' : 'Pin to quick access'}
        >
          <svg className="w-3.5 h-3.5" fill={isPinned ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      </div>

      {/* Expanded details */}
      {showDetails && (
        <div className="mt-2 pt-2 border-t border-border/50 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-content-muted">Normal Range:</span>
            <span className="text-secondary font-medium">
              {lab.normalLow} - {lab.normalHigh} {lab.unit}
            </span>
          </div>
          {(lab.criticalLow !== undefined || lab.criticalHigh !== undefined) && (
            <div className="flex justify-between text-xs">
              <span className="text-content-muted">Critical Values:</span>
              <span className="text-error font-medium">
                {lab.criticalLow !== undefined && `<${lab.criticalLow}`}
                {lab.criticalLow !== undefined && lab.criticalHigh !== undefined && ' or '}
                {lab.criticalHigh !== undefined && `>${lab.criticalHigh}`}
              </span>
            </div>
          )}
          {lab.notes && (
            <p className="text-xs text-content-muted leading-relaxed">
              {lab.notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
