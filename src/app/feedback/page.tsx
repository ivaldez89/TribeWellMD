'use client';

import { useState } from 'react';
import { ContentPageLayout } from '@/components/layout/PageLayout';
import Link from 'next/link';
import { LightbulbIcon, TrendingUpIcon, BookOpenIcon, ChatBubbleIcon } from '@/components/icons/MedicalIcons';

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    email: '',
    feedbackType: '',
    rating: 0,
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          subject: `${formData.feedbackType} - Rating: ${formData.rating}/5`,
          message: formData.message,
          type: 'feedback',
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({ email: '', feedbackType: '', rating: 0, message: '' });
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to submit. Please try again.');
      }
    } catch {
      setError('Failed to submit. Please try again or email us directly.');
    } finally {
      setLoading(false);
    }
  };

  const feedbackTypes = [
    { id: 'feature', label: 'Feature Request', icon: <LightbulbIcon className="w-8 h-8" />, description: 'Suggest a new feature' },
    { id: 'improvement', label: 'Improvement', icon: <TrendingUpIcon className="w-8 h-8" />, description: 'Improve existing features' },
    { id: 'bug', label: 'Bug Report', icon: <span className="text-2xl">🐛</span>, description: 'Report an issue' },
    { id: 'content', label: 'Content', icon: <BookOpenIcon className="w-8 h-8" />, description: 'Flashcards or study materials' },
    { id: 'general', label: 'General', icon: <ChatBubbleIcon className="w-8 h-8" />, description: 'General feedback' },
  ];

  return (
    <ContentPageLayout maxWidth="xl">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Send Feedback</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Help us make TribeWellMD better for everyone</p>
      </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
          {submitted ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#C4A77D] to-[#A89070] flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Thank You!</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                Your feedback helps us build a better study experience for medical students everywhere.
                We truly appreciate you taking the time to share your thoughts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-3 bg-[#C4A77D] hover:bg-[#A89070] text-white font-semibold rounded-xl transition-colors"
                >
                  Send More Feedback
                </button>
                <Link
                  href="/"
                  className="px-6 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-semibold rounded-xl transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Your Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#C4A77D] focus:border-transparent"
                  placeholder="you@example.com"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  We may reach out if we have questions about your feedback
                </p>
              </div>

              {/* Feedback Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  What type of feedback do you have?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {feedbackTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, feedbackType: type.label })}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        formData.feedbackType === type.label
                          ? 'border-[#C4A77D] bg-[#F5F0E8] dark:bg-[#C4A77D]/20'
                          : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                      }`}
                    >
                      <div className="block mb-2 text-[#5B7B6D] dark:text-[#7FA08F]">{type.icon}</div>
                      <span className="font-medium text-slate-900 dark:text-white text-sm block">{type.label}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{type.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  How would you rate your overall experience?
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <svg
                        className={`w-10 h-10 transition-colors ${
                          star <= (hoveredRating || formData.rating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    </button>
                  ))}
                  <span className="ml-3 text-slate-600 dark:text-slate-400 text-sm">
                    {formData.rating === 0 && 'Select a rating'}
                    {formData.rating === 1 && 'Needs improvement'}
                    {formData.rating === 2 && 'Below expectations'}
                    {formData.rating === 3 && 'Meets expectations'}
                    {formData.rating === 4 && 'Above expectations'}
                    {formData.rating === 5 && 'Excellent!'}
                  </span>
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Your Feedback <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#C4A77D] focus:border-transparent resize-none"
                  placeholder="Share your thoughts, suggestions, or report issues..."
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-gradient-to-r from-[#C4A77D] to-[#A89070] hover:from-[#A89070] hover:to-[#8B7355] disabled:from-[#D4C4B0] disabled:to-[#C4A77D] text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C4A77D]/25"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Submit Feedback
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Alternative Contact */}
        <div className="mt-8 text-center">
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Prefer email?{' '}
            <a href="mailto:feedback@tribewellmd.com" className="text-[#A89070] dark:text-[#C4A77D] hover:underline">
              feedback@tribewellmd.com
            </a>
          </p>
        </div>

      <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
        <p>© {new Date().getFullYear()} TribeWellMD</p>
      </div>
    </ContentPageLayout>
  );
}
