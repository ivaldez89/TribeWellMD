'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/footer/Footer';
import Link from 'next/link';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // Getting Started
  {
    category: 'Getting Started',
    question: 'What is TribeWellMD?',
    answer: 'TribeWellMD is a comprehensive study platform designed specifically for medical students. We combine AI-powered flashcards, spaced repetition, interactive case studies, and wellness resources to help you succeed in your medical education journey while maintaining your well-being.',
  },
  {
    category: 'Getting Started',
    question: 'Is TribeWellMD free to use?',
    answer: 'Yes! TribeWellMD offers a free tier with access to core study tools, flashcard creation, and basic features. We also offer premium features for enhanced study experiences. Our mission is to make medical education accessible to all students.',
  },
  {
    category: 'Getting Started',
    question: 'How do I create an account?',
    answer: 'You can start using TribeWellMD immediately without creating an account - your study progress is saved locally in your browser. For features like syncing across devices, joining Tribes, and tracking long-term progress, you can create an account using your email.',
  },
  {
    category: 'Getting Started',
    question: 'Can I use TribeWellMD on my phone or tablet?',
    answer: 'Absolutely! TribeWellMD is a Progressive Web App (PWA), meaning it works on any device with a web browser. You can even install it to your home screen for an app-like experience. Just visit our site on your mobile browser and follow the "Add to Home Screen" prompt.',
  },

  // Study Tools
  {
    category: 'Study Tools',
    question: 'How does the spaced repetition system work?',
    answer: 'Our spaced repetition algorithm (similar to Anki) schedules card reviews based on how well you know each card. Cards you struggle with appear more frequently, while mastered cards are shown less often. This scientifically-proven method optimizes long-term retention and reduces study time.',
  },
  {
    category: 'Study Tools',
    question: 'Can I create my own flashcards?',
    answer: 'Yes! You can create custom flashcards manually or use our AI-powered generator to create cards from your notes, textbook content, or specific topics. The AI generator supports multiple question formats including multiple choice, true/false, and open-ended questions.',
  },
  {
    category: 'Study Tools',
    question: 'What are Interactive Cases?',
    answer: 'Interactive Cases are clinical scenario-based learning experiences that simulate real patient encounters. You\'ll work through patient presentations, order tests, make diagnoses, and develop treatment plans. They\'re designed to help you apply classroom knowledge to clinical reasoning.',
  },
  {
    category: 'Study Tools',
    question: 'How accurate is the AI-generated content?',
    answer: 'Our AI generates high-quality study content, but we always recommend verifying important medical information with authoritative sources like UpToDate, textbooks, or your course materials. AI-generated content should be used as a study aid, not as a primary medical reference.',
  },
  {
    category: 'Study Tools',
    question: 'Can I study offline?',
    answer: 'Yes! Once you\'ve loaded your flashcards and study materials, they\'re cached locally on your device. You can study your existing cards offline. New card generation and syncing features require an internet connection.',
  },

  // Account & Data
  {
    category: 'Account & Data',
    question: 'Is my study data private?',
    answer: 'Yes, your privacy is important to us. Your flashcards, study progress, and personal data are stored securely. We do not sell your information to third parties. Please review our Privacy Policy for complete details on how we handle your data.',
  },
  {
    category: 'Account & Data',
    question: 'Can I export my flashcards?',
    answer: 'Yes! You can export your flashcard decks for backup or to use with other study tools. Go to your deck settings to find export options. We support common formats to ensure your hard work is never locked in.',
  },
  {
    category: 'Account & Data',
    question: 'How do I delete my account?',
    answer: 'You can delete your account and all associated data from your account settings. If you need assistance, contact us at support@tribewellmd.com. Please note that account deletion is permanent and cannot be undone.',
  },
  {
    category: 'Account & Data',
    question: 'What happens to my progress if I clear my browser data?',
    answer: 'If you\'re using TribeWellMD without an account, clearing browser data will erase your local progress. We recommend creating an account to sync and backup your data. With an account, your progress is stored securely and accessible from any device.',
  },

  // Tribes & Community
  {
    category: 'Tribes & Community',
    question: 'What are Tribes?',
    answer: 'Tribes are study groups within TribeWellMD where you can connect with fellow medical students. You can share flashcard decks, collaborate on study materials, participate in group challenges, and support each other through the medical school journey.',
  },
  {
    category: 'Tribes & Community',
    question: 'How do I join or create a Tribe?',
    answer: 'You can browse public Tribes in the Community section or create your own private Tribe for your study group. Invite classmates via email or shareable link. Tribes can be organized by medical school, year, specialty interest, or any other criteria.',
  },

  // Village Points & Impact
  {
    category: 'Village Points & Impact',
    question: 'What are Village Points?',
    answer: 'Village Points are earned through your study activities and engagement on TribeWellMD. They can be converted to real charitable donations - 1,000 Village Points equals $1.00 donated to verified 501(c)(3) charities. Your studying directly creates positive impact!',
  },
  {
    category: 'Village Points & Impact',
    question: 'How do I earn Village Points?',
    answer: 'You earn Village Points (and XP) by completing flashcard reviews, finishing study sessions, maintaining streaks, creating quality content, and participating in the community. Every 10 XP you earn equals 1 Village Point. The more you study, the more impact you create.',
  },
  {
    category: 'Village Points & Impact',
    question: 'Which charities can I support?',
    answer: 'We partner with verified 501(c)(3) charitable organizations focused on healthcare, medical education, and wellness. You can choose which causes your Village Points support, from global health initiatives to local community health programs.',
  },

  // Wellness
  {
    category: 'Wellness',
    question: 'What wellness features does TribeWellMD offer?',
    answer: 'We believe wellness is essential to medical education. Our Wellness Center includes study break reminders, mindfulness exercises, stress management resources, sleep tracking integration, and community support features. Because you can\'t pour from an empty cup.',
  },
  {
    category: 'Wellness',
    question: 'How does Spotify integration work?',
    answer: 'You can connect your Spotify account to access curated study playlists and focus music directly within TribeWellMD. Choose from ambient, lo-fi, classical, and focus-enhancing playlists to create your ideal study environment.',
  },

  // Technical
  {
    category: 'Technical',
    question: 'Which browsers are supported?',
    answer: 'TribeWellMD works best on modern browsers including Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated for the best experience. Some features may have limited functionality on older browser versions.',
  },
  {
    category: 'Technical',
    question: 'The app is loading slowly. What can I do?',
    answer: 'Try refreshing the page, clearing your browser cache, or using a different browser. If you\'re on a slow connection, the initial load may take longer but subsequent visits should be faster thanks to caching. Contact support if issues persist.',
  },
  {
    category: 'Technical',
    question: 'How do I report a bug or issue?',
    answer: 'We appreciate bug reports! Use our Feedback form or email support@tribewellmd.com with details about the issue, including your device, browser, and steps to reproduce the problem. Screenshots are always helpful.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(faqData.map((faq) => faq.category)))];

  const filteredFAQs = faqData.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Find answers to common questions about TribeWellMD</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#C4A77D] focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-[#C4A77D] text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-[#C4A77D] dark:hover:border-[#C4A77D]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <svg className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No matching questions</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">Try adjusting your search or filter</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="text-[#8B7355] dark:text-[#C4A77D] hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            filteredFAQs.map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <button
                  onClick={() => toggleQuestion(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex-1 pr-4">
                    <span className="text-xs font-medium text-[#8B7355] dark:text-[#C4A77D] uppercase tracking-wide block mb-1">
                      {faq.category}
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">{faq.question}</span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-4 border-t border-slate-100 dark:border-slate-700">
                    <p className="text-slate-600 dark:text-slate-300 pt-4 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Still Need Help */}
        <div className="mt-12 bg-gradient-to-br from-[#5B7B6D] to-[#2D5A4A] rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">Still have questions?</h2>
          <p className="text-[#D4C4B0] mb-6 max-w-lg mx-auto">
            Can't find what you're looking for? Our support team is here to help you succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/support"
              className="px-6 py-3 bg-white text-[#5B7B6D] font-semibold rounded-xl hover:bg-[#F5F0E8] transition-colors"
            >
              Contact Support
            </Link>
            <Link
              href="/feedback"
              className="px-6 py-3 bg-[#C4A77D]/20 text-white font-semibold rounded-xl hover:bg-[#C4A77D]/30 transition-colors border border-white/20"
            >
              Send Feedback
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} TribeWellMD</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
