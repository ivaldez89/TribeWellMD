'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ALL_SCHOOLS,
  searchSchools,
  validateSchoolEmail,
  getSchoolTypeLabel,
  type School,
  type SchoolType,
} from '@/lib/data/schools';

interface SchoolSelectorProps {
  value: string;
  schoolId?: string;
  schoolType?: SchoolType;
  email?: string;
  disabled?: boolean;
  onChange: (school: { name: string; id?: string; type?: SchoolType }) => void;
}

export function SchoolSelector({
  value,
  schoolId,
  schoolType,
  email,
  disabled,
  onChange,
}: SchoolSelectorProps) {
  const [query, setQuery] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [emailValidation, setEmailValidation] = useState<{
    isValid: boolean;
    isEdu: boolean;
    school: School | null;
    message: string;
  } | null>(null);
  const [activeFilter, setActiveFilter] = useState<SchoolType | 'all'>('all');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Load selected school on mount
  useEffect(() => {
    if (schoolId) {
      const school = ALL_SCHOOLS.find(s => s.id === schoolId);
      if (school) {
        setSelectedSchool(school);
        setQuery(school.name);
      }
    } else if (value) {
      setQuery(value);
    }
  }, [schoolId, value]);

  // Validate email when it changes
  useEffect(() => {
    if (email) {
      const validation = validateSchoolEmail(email);
      setEmailValidation(validation);

      // Auto-select school if detected from email
      if (validation.school && !selectedSchool) {
        setSelectedSchool(validation.school);
        setQuery(validation.school.name);
        onChange({
          name: validation.school.name,
          id: validation.school.id,
          type: validation.school.type,
        });
      }
    } else {
      setEmailValidation(null);
    }
  }, [email]);

  // Search schools when query changes
  useEffect(() => {
    if (query.length > 1) {
      let filtered = searchSchools(query);
      if (activeFilter !== 'all') {
        filtered = filtered.filter(s => s.type === activeFilter);
      }
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query, activeFilter]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (school: School) => {
    setSelectedSchool(school);
    setQuery(school.name);
    setIsOpen(false);
    onChange({
      name: school.name,
      id: school.id,
      type: school.type,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setIsOpen(true);

    // If user clears or changes input, clear selected school
    if (selectedSchool && newQuery !== selectedSchool.name) {
      setSelectedSchool(null);
      onChange({ name: newQuery });
    }
  };

  const handleManualEntry = () => {
    setIsOpen(false);
    onChange({ name: query });
  };

  const getTypeColor = (type: SchoolType) => {
    switch (type) {
      case 'md': return 'bg-tribe-sage-100 text-tribe-sage-700 dark:bg-tribe-sage-900/30 dark:text-tribe-sage-400';
      case 'do': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'undergrad': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'caribbean': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      {/* Email Validation Indicator */}
      {emailValidation && email && (
        <div className={`mb-2 px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
          emailValidation.isValid
            ? 'bg-tribe-sage-50 dark:bg-tribe-sage-900/20 text-tribe-sage-700 dark:text-tribe-sage-400 border border-emerald-200 dark:border-emerald-800'
            : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
        }`}>
          {emailValidation.isValid ? (
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          <span>{emailValidation.message}</span>
        </div>
      )}

      {/* Selected School Badge */}
      {selectedSchool && !isOpen && (
        <div className="mb-2 inline-flex items-center gap-2 px-3 py-1.5 bg-tribe-sage-50 dark:bg-tribe-sage-900/20 border border-teal-200 dark:border-teal-800 rounded-lg">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(selectedSchool.type)}`}>
            {getSchoolTypeLabel(selectedSchool.type)}
          </span>
          <span className="text-sm text-tribe-sage-700 dark:text-tribe-sage-400 font-medium">
            {selectedSchool.shortName || selectedSchool.name}
          </span>
          {selectedSchool.state && (
            <span className="text-xs text-slate-500">({selectedSchool.state})</span>
          )}
          {!disabled && (
            <button
              onClick={() => {
                setSelectedSchool(null);
                setQuery('');
                onChange({ name: '' });
              }}
              className="ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Search Input */}
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
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          disabled={disabled}
          placeholder="Search for your school..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-tribe-sage-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        />
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
            {(['all', 'md', 'do', 'undergrad', 'caribbean'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  activeFilter === filter
                    ? 'bg-tribe-sage-100 dark:bg-tribe-sage-900/30 text-tribe-sage-700 dark:text-tribe-sage-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {filter === 'all' ? 'All Schools' : getSchoolTypeLabel(filter)}
              </button>
            ))}
          </div>

          {/* Results */}
          <div className="max-h-64 overflow-y-auto">
            {results.length > 0 ? (
              results.map((school) => (
                <button
                  key={school.id}
                  onClick={() => handleSelect(school)}
                  className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {school.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {school.state ? `${school.state}, ` : ''}{school.country}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(school.type)}`}>
                      {getSchoolTypeLabel(school.type)}
                    </span>
                  </div>
                </button>
              ))
            ) : query.length > 1 ? (
              <div className="p-4 text-center">
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">
                  No schools found matching "{query}"
                </p>
                <button
                  onClick={handleManualEntry}
                  className="text-sm text-tribe-sage-600 dark:text-tribe-sage-400 hover:underline font-medium"
                >
                  Use "{query}" anyway
                </button>
              </div>
            ) : (
              <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
                Type to search for your school
              </div>
            )}
          </div>

          {/* Manual Entry Option */}
          {results.length > 0 && query.length > 0 && (
            <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <button
                onClick={handleManualEntry}
                className="w-full text-center text-sm text-slate-600 dark:text-slate-400 hover:text-tribe-sage-600 dark:hover:text-tribe-sage-400 transition-colors"
              >
                School not listed? <span className="font-medium">Enter manually</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
