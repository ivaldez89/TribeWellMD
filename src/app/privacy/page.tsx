'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Privacy Policy</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Last updated: December 2024</p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 space-y-8">

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">1. Introduction</h2>
              <p className="text-slate-600 dark:text-slate-300">
                TribeWellMD ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy
                explains how we collect, use, disclose, and safeguard your information when you use our Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">2. Information We Collect</h2>

              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-2">Information You Provide</h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li>• Account information (name, email, medical school, year)</li>
                <li>• Profile information (avatar, bio, specialty interests)</li>
                <li>• Study data (flashcards created, progress, preferences)</li>
                <li>• Communications (messages to other users, support requests)</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-2">Automatically Collected Information</h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li>• Usage data (pages visited, features used, study sessions)</li>
                <li>• Device information (browser type, operating system)</li>
                <li>• Log data (IP address, access times)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">3. How We Use Your Information</h2>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li>• To provide and maintain the Service</li>
                <li>• To personalize your study experience</li>
                <li>• To track your learning progress and optimize spaced repetition</li>
                <li>• To connect you with other users (Tribes, study groups)</li>
                <li>• To communicate with you about updates and features</li>
                <li>• To improve and develop new features</li>
                <li>• To ensure security and prevent fraud</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">4. Data Storage</h2>
              <div className="p-4 bg-tribe-sage-50 dark:bg-tribe-sage-900/20 border border-teal-200 dark:border-teal-800 rounded-xl">
                <p className="text-teal-800 dark:text-tribe-sage-300">
                  <strong>Local Storage:</strong> Much of your data (flashcards, study progress, preferences) is stored
                  locally on your device using browser storage. This means your study data stays on your device and
                  is not automatically uploaded to our servers.
                </p>
              </div>
              <p className="mt-4 text-slate-600 dark:text-slate-300">
                For features requiring server storage (account sync, community features), data is stored securely
                using industry-standard encryption and security practices.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">5. Information Sharing</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-3">
                We do NOT sell your personal information. We may share information:
              </p>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li>• With your consent</li>
                <li>• With service providers who assist in operating the Service</li>
                <li>• To comply with legal obligations</li>
                <li>• To protect our rights and the safety of users</li>
                <li>• In connection with a merger or acquisition (with notice)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">6. Third-Party Services</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-3">
                The Service may integrate with third-party services:
              </p>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li>• <strong>Spotify:</strong> For study music features (governed by Spotify's privacy policy)</li>
                <li>• <strong>AI Services:</strong> For content generation (prompts are processed but not stored by AI providers)</li>
                <li>• <strong>Analytics:</strong> To understand usage patterns and improve the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">7. Your Rights</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-3">
                You have the right to:
              </p>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li>• Access your personal data</li>
                <li>• Correct inaccurate data</li>
                <li>• Delete your account and data</li>
                <li>• Export your study data</li>
                <li>• Opt out of marketing communications</li>
                <li>• Restrict certain processing</li>
              </ul>
              <p className="mt-4 text-slate-600 dark:text-slate-300">
                To exercise these rights, contact us at{' '}
                <a href="mailto:privacy@tribewellmd.com" className="text-tribe-sage-600 dark:text-tribe-sage-400 hover:underline">
                  privacy@tribewellmd.com
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">8. Data Security</h2>
              <p className="text-slate-600 dark:text-slate-300">
                We implement appropriate technical and organizational measures to protect your data, including:
              </p>
              <ul className="mt-3 space-y-2 text-slate-600 dark:text-slate-300">
                <li>• Encryption in transit and at rest</li>
                <li>• Regular security assessments</li>
                <li>• Access controls and authentication</li>
                <li>• Secure development practices</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">9. Children's Privacy</h2>
              <p className="text-slate-600 dark:text-slate-300">
                The Service is intended for medical students and healthcare professionals. We do not knowingly
                collect information from children under 13. If you believe we have collected information from
                a child, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">10. International Users</h2>
              <p className="text-slate-600 dark:text-slate-300">
                If you access the Service from outside the United States, your information may be transferred
                to and processed in the United States. By using the Service, you consent to this transfer.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">11. Changes to This Policy</h2>
              <p className="text-slate-600 dark:text-slate-300">
                We may update this Privacy Policy from time to time. We will notify you of significant changes
                via email or in-app notification. Your continued use of the Service after changes indicates
                acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">12. Contact Us</h2>
              <p className="text-slate-600 dark:text-slate-300">
                For questions about this Privacy Policy or our data practices, contact us at:
              </p>
              <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <p className="text-slate-700 dark:text-slate-300">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:privacy@tribewellmd.com" className="text-tribe-sage-600 dark:text-tribe-sage-400 hover:underline">
                    privacy@tribewellmd.com
                  </a>
                </p>
                <p className="text-slate-700 dark:text-slate-300 mt-2">
                  <strong>General Inquiries:</strong>{' '}
                  <a href="mailto:hello@tribewellmd.com" className="text-tribe-sage-600 dark:text-tribe-sage-400 hover:underline">
                    hello@tribewellmd.com
                  </a>
                </p>
              </div>
            </section>

          </div>
        </div>

        <div className="mt-8 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <Link href="/terms" className="hover:text-tribe-sage-600 dark:hover:text-tribe-sage-400">
            View Terms of Service →
          </Link>
          <p>© {new Date().getFullYear()} TribeWellMD</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
