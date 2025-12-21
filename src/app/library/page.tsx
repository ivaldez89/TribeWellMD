'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { searchByMultipleCodes, getCardsByCategory, getQBankStats } from '@/data/qbank-cards';

export default function LibraryPage() {
  const [codeInput, setCodeInput] = useState('');
  const [searchMessage, setSearchMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });
  const router = useRouter();

  const stats = getQBankStats();

  const handleSearch = () => {
    if (!codeInput.trim()) {
      setSearchMessage({ type: 'error', text: 'Please enter at least one code' });
      return;
    }

    const results = searchByMultipleCodes(codeInput);

    if (results.length > 0) {
      // Store the card IDs in sessionStorage and navigate to flashcard study
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

  const handleCategoryClick = (category: string) => {
    const categoryCards = getCardsByCategory(category);
    if (categoryCards.length > 0) {
      sessionStorage.setItem('qbank-cards', JSON.stringify(categoryCards.map(c => c.id)));
      sessionStorage.setItem('qbank-codes', category);
      router.push('/study/flashcards?source=qbank');
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 p-8 md:p-10 shadow-2xl">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur rounded-full text-white/90 text-sm font-medium mb-4">
                <span className="w-2 h-2 bg-teal-300 rounded-full animate-pulse" />
                <span>QBank-Linked Cards</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                TribeWellMD <span className="text-teal-200">Card Library</span>
              </h1>

              <p className="text-white/80 text-lg max-w-2xl mb-6">
                Enter your UWorld or AMBOSS question codes to start reviewing targeted flashcards.
              </p>

              {/* Stats */}
              <div className="flex items-center gap-4 md:gap-6 mb-6">
                <div className="text-center px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
                  <p className="text-2xl font-bold text-white">{stats.totalCards}</p>
                  <p className="text-white/60 text-xs">Cards</p>
                </div>
                <div className="text-center px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
                  <p className="text-2xl font-bold text-white">{stats.uworldLinked}</p>
                  <p className="text-white/60 text-xs">UWorld</p>
                </div>
                <div className="text-center px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
                  <p className="text-2xl font-bold text-white">{stats.ambossLinked}</p>
                  <p className="text-white/60 text-xs">AMBOSS</p>
                </div>
              </div>

              {/* Code Search */}
              <div className="flex gap-3 max-w-xl">
                <input
                  type="text"
                  value={codeInput}
                  onChange={(e) => {
                    setCodeInput(e.target.value);
                    setSearchMessage({ type: null, text: '' });
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter codes (e.g., 4523, z5ar5O, 102345)"
                  className="flex-1 px-5 py-4 rounded-xl bg-white/20 backdrop-blur border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg"
                />
                <button
                  onClick={handleSearch}
                  className="px-8 py-4 bg-white hover:bg-teal-50 text-teal-600 font-bold rounded-xl shadow-lg transition-all hover:scale-105"
                >
                  Find Cards
                </button>
              </div>
              <p className="text-white/60 text-sm mt-2">
                Separate multiple codes with commas or spaces
              </p>

              {/* Search Message */}
              {searchMessage.type && (
                <div className={`mt-4 px-4 py-3 rounded-xl ${
                  searchMessage.type === 'error'
                    ? 'bg-red-500/20 border border-red-400/30 text-white'
                    : 'bg-green-500/20 border border-green-400/30 text-white'
                }`}>
                  {searchMessage.text}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Browse by Category */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Browse by Category</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {['Internal Medicine', 'Family Medicine'].map((category) => {
              const categoryCards = getCardsByCategory(category);
              return (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 transition-all cursor-pointer group text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{category}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {categoryCards.length} clinical vignette cards
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-colors">
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

        {/* How It Works */}
        <section className="mb-8">
          <div className="p-6 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">How to Use</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white text-sm">Missed a Question?</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Copy the question ID from UWorld or AMBOSS</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white text-sm">Enter the Code</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Paste it in the search box above</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white text-sm">Study the Concept</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Review flashcards to master the clinical reasoning</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sample Codes to Try */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Sample Codes to Try</h2>
          <div className="flex flex-wrap gap-2">
            {['4523', '5127', '1823', 'z5ar5O', 'hT67wQ', '4911'].map((code) => (
              <button
                key={code}
                onClick={() => handleSampleCode(code)}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono text-slate-600 dark:text-slate-300 hover:border-teal-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all"
              >
                {code}
              </button>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
