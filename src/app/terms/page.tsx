'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/footer/Footer';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F0E8] dark:bg-[#2D5A4A]">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-[#8B7355] dark:text-[#C4A77D] hover:text-[#5B7B6D] dark:hover:text-[#E8E0D5] mb-4">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-[#2D5A4A] dark:text-[#F5F0E8]">Terms of Service</h1>
          <p className="text-[#8B7355] dark:text-[#C4A77D] mt-2">Last updated: December 2024</p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <div className="bg-white dark:bg-[#5B7B6D] rounded-2xl border border-[#E8E0D5] dark:border-[#8B7355] p-8 space-y-8">

            <section>
              <h2 className="text-xl font-bold text-[#2D5A4A] dark:text-[#F5F0E8] mb-4">1. Acceptance of Terms</h2>
              <p className="text-[#8B7355] dark:text-[#E8E0D5]">
                By accessing or using TribeWellMD ("the Service"), you agree to be bound by these Terms of Service.
                If you do not agree to these terms, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2D5A4A] dark:text-[#F5F0E8] mb-4">2. Description of Service</h2>
              <p className="text-[#8B7355] dark:text-[#E8E0D5]">
                TribeWellMD is an educational platform designed to help medical students study for board examinations
                and connect with peers. The Service includes flashcards, case studies, wellness resources, and community features.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2D5A4A] dark:text-[#F5F0E8] mb-4">3. Educational Disclaimer</h2>
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <p className="text-amber-800 dark:text-amber-300 font-medium">
                  Important: TribeWellMD is an educational tool and is NOT a substitute for professional medical advice,
                  diagnosis, or treatment. The content provided is for educational purposes only.
                </p>
              </div>
              <ul className="mt-4 space-y-2 text-[#8B7355] dark:text-[#E8E0D5]">
                <li>• Content accuracy is not guaranteed and should be verified with authoritative medical sources</li>
                <li>• AI-generated content may contain errors and should always be reviewed before use</li>
                <li>• Users are responsible for verifying the accuracy of study materials</li>
                <li>• The Service does not replace formal medical education or clinical training</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2D5A4A] dark:text-[#F5F0E8] mb-4">4. User Accounts</h2>
              <p className="text-[#8B7355] dark:text-[#E8E0D5] mb-3">
                You are responsible for:
              </p>
              <ul className="space-y-2 text-[#8B7355] dark:text-[#E8E0D5]">
                <li>• Maintaining the confidentiality of your account</li>
                <li>• All activities that occur under your account</li>
                <li>• Notifying us immediately of any unauthorized use</li>
                <li>• Providing accurate and complete registration information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2D5A4A] dark:text-[#F5F0E8] mb-4">5. Acceptable Use</h2>
              <p className="text-[#8B7355] dark:text-[#E8E0D5] mb-3">
                You agree NOT to:
              </p>
              <ul className="space-y-2 text-[#8B7355] dark:text-[#E8E0D5]">
                <li>• Share or distribute copyrighted study materials without authorization</li>
                <li>• Use the Service for any unlawful purpose</li>
                <li>• Harass, abuse, or harm other users</li>
                <li>• Attempt to gain unauthorized access to any part of the Service</li>
                <li>• Use automated systems to access the Service without permission</li>
                <li>• Share actual exam questions that are protected by copyright</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2D5A4A] dark:text-[#F5F0E8] mb-4">6. User Content</h2>
              <p className="text-[#8B7355] dark:text-[#E8E0D5]">
                You retain ownership of content you create. By posting content, you grant TribeWellMD a non-exclusive,
                royalty-free license to use, display, and distribute your content within the Service. You are solely
                responsible for the accuracy and legality of content you create or share.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2D5A4A] dark:text-[#F5F0E8] mb-4">7. AI-Generated Content</h2>
              <p className="text-[#8B7355] dark:text-[#E8E0D5]">
                The Service includes AI-powered features for generating flashcards and study materials.
                AI-generated content is provided "as is" and may contain inaccuracies. Users are responsible
                for reviewing and verifying all AI-generated content before use in their studies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2D5A4A] dark:text-[#F5F0E8] mb-4">8. Intellectual Property</h2>
              <p className="text-[#8B7355] dark:text-[#E8E0D5]">
                The Service, including its design, features, and original content, is owned by TribeWellMD and
                protected by intellectual property laws. You may not copy, modify, or distribute any part of
                the Service without permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2D5A4A] dark:text-[#F5F0E8] mb-4">9. Limitation of Liability</h2>
              <p className="text-[#8B7355] dark:text-[#E8E0D5]">
                TribeWellMD is provided "as is" without warranties of any kind. We are not liable for any damages
                arising from your use of the Service, including but not limited to academic performance, exam results,
                or decisions made based on content accessed through the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2D5A4A] dark:text-[#F5F0E8] mb-4">10. Changes to Terms</h2>
              <p className="text-[#8B7355] dark:text-[#E8E0D5]">
                We may update these Terms at any time. Continued use of the Service after changes constitutes
                acceptance of the new Terms. We will notify users of significant changes via email or in-app notification.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2D5A4A] dark:text-[#F5F0E8] mb-4">11. Termination</h2>
              <p className="text-[#8B7355] dark:text-[#E8E0D5]">
                We reserve the right to suspend or terminate your account at any time for violations of these Terms
                or for any other reason at our discretion.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2D5A4A] dark:text-[#F5F0E8] mb-4">12. Contact</h2>
              <p className="text-[#8B7355] dark:text-[#E8E0D5]">
                For questions about these Terms, please contact us at{' '}
                <a href="mailto:legal@tribewellmd.com" className="text-[#5B7B6D] dark:text-[#C4A77D] hover:underline">
                  legal@tribewellmd.com
                </a>
              </p>
            </section>

          </div>
        </div>

        <div className="mt-8 flex items-center justify-between text-sm text-[#A89070] dark:text-[#C4A77D]">
          <Link href="/privacy" className="hover:text-[#5B7B6D] dark:hover:text-[#E8E0D5]">
            View Privacy Policy →
          </Link>
          <p>© {new Date().getFullYear()} TribeWellMD</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
