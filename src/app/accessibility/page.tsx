'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Accessibility Statement</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Last updated: December 2024</p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 space-y-8">

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Our Commitment</h2>
              <p className="text-slate-600 dark:text-slate-300">
                TribeWellMD is committed to ensuring digital accessibility for all users, including those with disabilities.
                We are continually improving the user experience for everyone and applying the relevant accessibility standards
                to ensure we provide equal access to all users.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Accessibility Standards</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA. These guidelines
                explain how to make web content more accessible for people with disabilities and more user-friendly for everyone.
              </p>
              <div className="p-4 bg-[#F5F0E8] dark:bg-[#C4A77D]/10 border border-[#D4C4B0] dark:border-[#8B7355] rounded-xl">
                <p className="text-[#5B7B6D] dark:text-[#C4A77D]">
                  <strong>Our Goal:</strong> To provide a website that is perceivable, operable, understandable,
                  and robust for all users, regardless of ability or technology used.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Accessibility Features</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-3">
                TribeWellMD includes the following accessibility features:
              </p>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-[#5B7B6D] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>Keyboard Navigation:</strong> All interactive elements are accessible via keyboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-[#5B7B6D] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>Dark Mode:</strong> Reduced eye strain option with full dark theme support</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-[#5B7B6D] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>Color Contrast:</strong> Text and interactive elements meet WCAG contrast requirements</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-[#5B7B6D] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>Semantic HTML:</strong> Proper heading hierarchy and landmark regions</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-[#5B7B6D] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>ARIA Labels:</strong> Screen reader support with descriptive labels</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-[#5B7B6D] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>Responsive Design:</strong> Works across all device sizes and zoom levels</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-[#5B7B6D] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>Focus Indicators:</strong> Visible focus states for keyboard navigation</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-[#5B7B6D] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>Alt Text:</strong> Descriptive alternative text for images</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Assistive Technology Compatibility</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-3">
                TribeWellMD is designed to be compatible with the following assistive technologies:
              </p>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li>• Screen readers (NVDA, JAWS, VoiceOver, TalkBack)</li>
                <li>• Screen magnification software</li>
                <li>• Speech recognition software</li>
                <li>• Keyboard-only navigation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Known Limitations</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-3">
                While we strive for full accessibility, some areas may have limitations:
              </p>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li>• Some third-party embedded content may not fully meet accessibility standards</li>
                <li>• Interactive flashcard animations may require alternative viewing modes</li>
                <li>• User-generated content may not always meet accessibility guidelines</li>
              </ul>
              <p className="text-slate-600 dark:text-slate-300 mt-4">
                We are actively working to address these limitations and improve accessibility across all features.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Feedback & Contact</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                We welcome your feedback on the accessibility of TribeWellMD. If you encounter any accessibility barriers
                or have suggestions for improvement, please contact us:
              </p>
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl space-y-3">
                <p className="text-slate-700 dark:text-slate-300">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:support@tribewellmd.com" className="text-[#5B7B6D] dark:text-[#C4A77D] hover:underline">
                    support@tribewellmd.com
                  </a>
                </p>
                <p className="text-slate-700 dark:text-slate-300">
                  <strong>Subject Line:</strong> Accessibility Feedback
                </p>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mt-4">
                We try to respond to accessibility feedback within 2 business days.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Continuous Improvement</h2>
              <p className="text-slate-600 dark:text-slate-300">
                We are committed to continuously improving accessibility. Our approach includes:
              </p>
              <ul className="mt-3 space-y-2 text-slate-600 dark:text-slate-300">
                <li>• Regular accessibility audits</li>
                <li>• User testing with people who have disabilities</li>
                <li>• Staff training on accessibility best practices</li>
                <li>• Integration of accessibility into our development process</li>
              </ul>
            </section>

          </div>
        </div>

        <div className="mt-8 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <Link href="/support" className="hover:text-[#5B7B6D] dark:hover:text-[#C4A77D]">
            Need Help? Visit Support →
          </Link>
          <p>© {new Date().getFullYear()} TribeWellMD</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
