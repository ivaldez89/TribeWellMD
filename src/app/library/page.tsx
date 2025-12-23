'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { searchByMultipleCodes, getCardsByCategory, getQBankStats } from '@/data/qbank-cards';
import { shelfCategories, topicCategories } from '@/data/tribewellmd-library';

type TabType = 'browse' | 'qbank';

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<TabType>('browse');
  const [browseView, setBrowseView] = useState<'shelves' | 'topics'>('shelves');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [codeInput, setCodeInput] = useState('');
  const [searchMessage, setSearchMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });
  const router = useRouter();

  const stats = getQBankStats();

  // QBank search handler
  const handleSearch = () => {
    if (!codeInput.trim()) {
      setSearchMessage({ type: 'error', text: 'Please enter at least one code' });
      return;
    }

    const results = searchByMultipleCodes(codeInput);

    if (results.length > 0) {
      sessionStorage.setItem('qbank-cards', JSON.stringify(results.map(c => c.id)));
      sessionStorage.setItem('qbank-codes', codeInput);
      router.push('/study/flashcards?source=qbank');
    } else {
      setSearchMessage({ type: 'error', text: 'No cards found for those codes. Try different codes.' });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSampleCode = (code: string) => {
    setCodeInput(code);
    const results = searchByMultipleCodes(code);
    if (results.length > 0) {
      sessionStorage.setItem('qbank-cards', JSON.stringify(results.map(c => c.id)));
      sessionStorage.setItem('qbank-codes', code);
      router.push('/study/flashcards?source=qbank');
    } else {
      setSearchMessage({ type: 'error', text: 'No cards found for that code.' });
    }
  };

  const categories = browseView === 'shelves' ? shelfCategories : topicCategories;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="mb-8 animate-fade-in-up">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 p-8 md:p-10 shadow-2xl">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
              <Link
                href="/study"
                className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="text-sm">Back to Study</span>
              </Link>

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Flashcard <span className="text-blue-200">Library</span>
              </h1>

              <p className="text-white/80 text-lg max-w-2xl mb-6">
                Browse cards by shelf exam or topic, or look up specific concepts from your QBank questions.
              </p>

              {/* Tab Switcher */}
              <div className="flex gap-2 p-1 bg-white/10 backdrop-blur rounded-xl w-fit">
                <button
                  onClick={() => setActiveTab('browse')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    activeTab === 'browse'
                      ? 'bg-white text-indigo-600 shadow-lg'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Browse Cards
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('qbank')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    activeTab === 'qbank'
                      ? 'bg-white text-indigo-600 shadow-lg'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    QBank Lookup
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Browse Tab Content */}
        {activeTab === 'browse' && (
          <>
            {/* Shelf vs Topic Toggle */}
            <section className="mb-6 animate-fade-in-up animation-delay-100">
              <div className="flex items-center justify-between">
                <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <button
                    onClick={() => setBrowseView('shelves')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      browseView === 'shelves'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    By Shelf Exam
                  </button>
                  <button
                    onClick={() => setBrowseView('topics')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      browseView === 'topics'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    By Topic/System
                  </button>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {categories.length} categories
                </p>
              </div>
            </section>

            {/* Category Grid */}
            <section className="mb-8 animate-fade-in-up animation-delay-200">
              <div className="grid gap-4">
                {categories.map((category) => (
                  <div key={category.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {/* Category Header */}
                    <button
                      onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                      className="w-full p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-2xl`}>
                          {category.icon}
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-slate-900 dark:text-white text-lg">{category.name}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{category.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {category.subcategories?.length || 0} topics
                        </span>
                        <svg
                          className={`w-5 h-5 text-slate-400 transition-transform ${expandedCategory === category.id ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {/* Subcategories */}
                    {expandedCategory === category.id && category.subcategories && (
                      <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50">
                        <div className="grid sm:grid-cols-2 gap-3">
                          {category.subcategories.map((sub) => (
                            <Link
                              key={sub.id}
                              href={`/library/study?view=${browseView}&category=${category.id}&subcategory=${sub.id}`}
                              className="group p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {sub.name}
                                  </h4>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {sub.description}
                                  </p>
                                  <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                                    {sub.conceptCodes.length} concepts
                                  </p>
                                </div>
                                <svg className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* QBank Lookup Tab Content */}
        {activeTab === 'qbank' && (
          <>
            {/* Code Search Section */}
            <section className="mb-8">
              <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Look Up Missed Questions</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                  Enter your UWorld QID or AMBOSS code to find related flashcards
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.totalCards}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Total Cards</p>
                  </div>
                  <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.uworldLinked}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">UWorld</p>
                  </div>
                  <div className="px-4 py-2 bg-tribe-sage-50 dark:bg-tribe-sage-900/30 rounded-lg">
                    <p className="text-lg font-bold text-tribe-sage-600 dark:text-tribe-sage-400">{stats.ambossLinked}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">AMBOSS</p>
                  </div>
                </div>

                {/* Search Input */}
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={codeInput}
                    onChange={(e) => {
                      setCodeInput(e.target.value);
                      setSearchMessage({ type: null, text: '' });
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter codes (e.g., 4523, z5ar5O, 102345)"
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleSearch}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-xl shadow-lg transition-all hover:scale-105"
                  >
                    Find Cards
                  </button>
                </div>
                <p className="text-slate-400 text-xs mt-2">
                  Separate multiple codes with commas or spaces
                </p>

                {/* Search Message */}
                {searchMessage.type && (
                  <div className={`mt-4 px-4 py-3 rounded-xl ${
                    searchMessage.type === 'error'
                      ? 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                      : 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                  }`}>
                    {searchMessage.text}
                  </div>
                )}
              </div>
            </section>

            {/* How It Works */}
            <section className="mb-8">
              <div className="p-6 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">How to Use</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white text-sm">Missed a Question?</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Copy the question ID from UWorld or AMBOSS</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white text-sm">Enter the Code</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Paste it in the search box above</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white text-sm">Study the Concept</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Review flashcards to master the clinical reasoning</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Sample Codes */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Sample Codes to Try</h2>
              <div className="flex flex-wrap gap-2">
                {['4523', '5127', '1823', 'z5ar5O', 'hT67wQ', '4911'].map((code) => (
                  <button
                    key={code}
                    onClick={() => handleSampleCode(code)}
                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono text-slate-600 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </section>

            {/* Browse by Category (Quick Access) */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Or Browse by Category</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {['Internal Medicine', 'Family Medicine'].map((category) => {
                  const categoryCards = getCardsByCategory(category);
                  return (
                    <button
                      key={category}
                      onClick={() => {
                        if (categoryCards.length > 0) {
                          sessionStorage.setItem('qbank-cards', JSON.stringify(categoryCards.map(c => c.id)));
                          sessionStorage.setItem('qbank-codes', category);
                          router.push('/study/flashcards?source=qbank');
                        }
                      }}
                      className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{category}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {categoryCards.length} clinical vignette cards
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
