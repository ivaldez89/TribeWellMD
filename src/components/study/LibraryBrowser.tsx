'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CardCategory,
  CardSubcategory,
  shelfCategories,
  topicCategories,
  getConceptsForSubcategory
} from '@/data/tribewellmd-library';
import { understandingCards } from '@/data/understanding-cards';
import { ClinicalConcept } from '@/data/concept-taxonomy';

type LibraryView = 'shelves' | 'topics';

interface LibraryBrowserProps {
  defaultView?: LibraryView;
  onStudySubcategory?: (subcategoryId: string, concepts: ClinicalConcept[]) => void;
}

export function LibraryBrowser({ defaultView = 'shelves', onStudySubcategory }: LibraryBrowserProps) {
  const [view, setView] = useState<LibraryView>(defaultView);
  const [selectedCategory, setSelectedCategory] = useState<CardCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<CardSubcategory | null>(null);
  const router = useRouter();

  const categories = view === 'shelves' ? shelfCategories : topicCategories;

  // Get card count for a subcategory
  const getCardCount = (subcategory: CardSubcategory): number => {
    const concepts = getConceptsForSubcategory(subcategory.id);
    const conceptCodes = concepts.map(c => c.code);
    return understandingCards.filter(card =>
      card.metadata.conceptCode && conceptCodes.includes(card.metadata.conceptCode)
    ).length;
  };

  // Get total card count for a category
  const getCategoryCardCount = (category: CardCategory): number => {
    if (!category.subcategories) return 0;
    return category.subcategories.reduce((total, sub) => total + getCardCount(sub), 0);
  };

  // Get total concept count for a category
  const getCategoryConceptCount = (category: CardCategory): number => {
    if (!category.subcategories) return 0;
    return category.subcategories.reduce((total, sub) =>
      total + getConceptsForSubcategory(sub.id).length, 0
    );
  };

  // Handle back navigation
  const handleBack = () => {
    if (selectedSubcategory) {
      setSelectedSubcategory(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    }
  };

  // Handle study button click - navigate to library study session
  const handleStudy = (subcategory: CardSubcategory, category: CardCategory) => {
    // Navigate to the immersive study session
    const params = new URLSearchParams({
      subcategory: subcategory.id,
      category: category.id,
      view: view
    });
    router.push(`/library/study?${params.toString()}`);
  };

  // Render subcategory detail view (showing concepts)
  if (selectedSubcategory && selectedCategory) {
    const concepts = getConceptsForSubcategory(selectedSubcategory.id);
    const relatedCards = understandingCards.filter(card =>
      card.metadata.conceptCode &&
      concepts.map(c => c.code).includes(card.metadata.conceptCode)
    );

    return (
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => { setSelectedCategory(null); setSelectedSubcategory(null); }}
            className="text-slate-500 hover:text-teal-600 transition-colors"
          >
            {view === 'shelves' ? 'Shelf Exams' : 'Topics'}
          </button>
          <span className="text-slate-400">/</span>
          <button
            onClick={() => setSelectedSubcategory(null)}
            className="text-slate-500 hover:text-teal-600 transition-colors"
          >
            {selectedCategory.name}
          </button>
          <span className="text-slate-400">/</span>
          <span className="text-slate-900 dark:text-white font-medium">{selectedSubcategory.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <span>{selectedCategory.icon}</span>
              <span>{selectedSubcategory.name}</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">{selectedSubcategory.description}</p>
          </div>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{concepts.length}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Clinical Concepts</p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <p className="text-2xl font-bold text-teal-600">{relatedCards.length}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Understanding Cards</p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <p className="text-2xl font-bold text-amber-600">
              {concepts.filter(c => c.highYield).length}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">High-Yield</p>
          </div>
        </div>

        {/* Study Button */}
        {relatedCards.length > 0 && (
          <button
            onClick={() => handleStudy(selectedSubcategory, selectedCategory)}
            className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all"
          >
            Study {relatedCards.length} Cards
          </button>
        )}

        {/* Concepts List */}
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900 dark:text-white">Clinical Decision Points</h3>
          {concepts.length > 0 ? (
            <div className="space-y-2">
              {concepts.map(concept => (
                <div
                  key={concept.code}
                  className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-slate-900 dark:text-white">{concept.name}</h4>
                        {concept.highYield && (
                          <span className="px-2 py-0.5 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full">
                            High-Yield
                          </span>
                        )}
                      </div>
                      <p className="text-teal-600 dark:text-teal-400 text-sm mt-1">
                        {concept.clinicalDecision}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {concept.testableAngles.slice(0, 3).map((angle, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded"
                          >
                            {angle}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">{concept.code}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400 text-center py-8">
              No concepts added yet. More coming soon!
            </p>
          )}
        </div>
      </div>
    );
  }

  // Render subcategories for selected category
  if (selectedCategory) {
    return (
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => setSelectedCategory(null)}
            className="text-slate-500 hover:text-teal-600 transition-colors"
          >
            {view === 'shelves' ? 'Shelf Exams' : 'Topics'}
          </button>
          <span className="text-slate-400">/</span>
          <span className="text-slate-900 dark:text-white font-medium">{selectedCategory.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <span className="text-3xl">{selectedCategory.icon}</span>
              <span>{selectedCategory.name}</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">{selectedCategory.description}</p>
          </div>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800 rounded-xl">
          <div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {selectedCategory.subcategories?.length || 0}
            </span>
            <span className="text-sm text-slate-500 ml-2">Subcategories</span>
          </div>
          <div className="w-px h-8 bg-slate-300 dark:bg-slate-600" />
          <div>
            <span className="text-2xl font-bold text-teal-600">
              {getCategoryConceptCount(selectedCategory)}
            </span>
            <span className="text-sm text-slate-500 ml-2">Concepts</span>
          </div>
          <div className="w-px h-8 bg-slate-300 dark:bg-slate-600" />
          <div>
            <span className="text-2xl font-bold text-cyan-600">
              {getCategoryCardCount(selectedCategory)}
            </span>
            <span className="text-sm text-slate-500 ml-2">Cards</span>
          </div>
        </div>

        {/* Subcategories Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {selectedCategory.subcategories?.map(subcategory => {
            const conceptCount = getConceptsForSubcategory(subcategory.id).length;
            const cardCount = getCardCount(subcategory);

            return (
              <button
                key={subcategory.id}
                onClick={() => setSelectedSubcategory(subcategory)}
                className="group p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-lg transition-all text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {subcategory.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {subcategory.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded">
                        {conceptCount} concepts
                      </span>
                      <span className="text-xs px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded">
                        {cardCount} cards
                      </span>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Render main category grid
  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setView('shelves')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              view === 'shelves'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Shelf Exams
          </button>
          <button
            onClick={() => setView('topics')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              view === 'topics'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Topics
          </button>
        </div>

        {/* Stats summary */}
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {categories.length} {view === 'shelves' ? 'shelf exams' : 'topics'} •{' '}
          {categories.reduce((t, c) => t + getCategoryConceptCount(c), 0)} concepts
        </div>
      </div>

      {/* Description */}
      <p className="text-slate-600 dark:text-slate-400">
        {view === 'shelves'
          ? 'Browse pre-built TribeWellMD cards organized by rotation shelf exam. Master clinical decision points for each specialty.'
          : 'Explore cards by medical system or topic. Deep dive into specific areas for targeted review.'
        }
      </p>

      {/* Category Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(category => {
          const conceptCount = getCategoryConceptCount(category);
          const cardCount = getCategoryCardCount(category);

          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category)}
              className="group relative p-6 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-transparent transition-all duration-300 text-left overflow-hidden"
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

              <div className="relative">
                {/* Icon and name */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{category.icon}</span>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-teal-600 group-hover:to-cyan-600 transition-all">
                    {category.name}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                  {category.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full">
                    {category.subcategories?.length || 0} topics
                  </span>
                  <span className="text-xs px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full">
                    {conceptCount} concepts
                  </span>
                  {cardCount > 0 && (
                    <span className="text-xs px-2 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-full">
                      {cardCount} cards
                    </span>
                  )}
                </div>

                {/* Arrow indicator */}
                <div className="absolute top-6 right-4">
                  <svg className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Compact version for the study page
export function LibraryQuickNav() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Link
        href="/library?view=shelves"
        className="group p-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 text-white"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold group-hover:translate-x-1 transition-transform">Shelf Exams</h3>
            <p className="text-white/70 text-sm">{shelfCategories.length} rotations</p>
          </div>
        </div>
      </Link>

      <Link
        href="/library?view=topics"
        className="group p-5 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all duration-300 text-white"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold group-hover:translate-x-1 transition-transform">Topics</h3>
            <p className="text-white/70 text-sm">{topicCategories.length} systems</p>
          </div>
        </div>
      </Link>
    </div>
  );
}
