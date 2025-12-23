'use client';

import { useState } from 'react';
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer' }),
      });

      if (response.ok) {
        setSubscribed(true);
        setEmail('');
      }
    } catch {
      // Silent fail for footer
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Brand Section - Always full width on top for mobile */}
        <div className="mb-6 md:hidden">
          <Link href="/" className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <img src="/logo.jpeg" alt="TribeWellMD" className="w-full h-full object-cover" />
            </div>
            <span className="text-lg font-bold text-white">TribeWellMD</span>
          </Link>
          <p className="text-slate-400 text-xs mb-3">
            Empowering medical students with smart study tools, wellness resources, and a supportive community.
          </p>
          {/* Social Media Links - Compact for mobile */}
          <div className="flex items-center gap-2">
            <a href="https://twitter.com/tribewellmd" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors" aria-label="Twitter">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
            <a href="https://instagram.com/tribewellmd" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors" aria-label="Instagram">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
            </a>
            <a href="https://linkedin.com/company/tribewellmd" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors" aria-label="LinkedIn">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
            </a>
            <a href="https://youtube.com/@tribewellmd" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors" aria-label="YouTube">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
            </a>
            <button
              onClick={() => {
                if ('standalone' in window.navigator && (window.navigator as Navigator & { standalone?: boolean }).standalone) return;
                alert('To install TribeWellMD:\n\n• iOS: Tap Share → Add to Home Screen\n• Android: Tap Menu → Install App\n• Desktop: Click the install icon in your browser\'s address bar');
              }}
              className="ml-2 flex items-center gap-1 text-slate-400 hover:text-tribe-sage-400 transition-colors text-xs"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Install
            </button>
          </div>
        </div>

        {/* Desktop Grid Layout */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section - Desktop only */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <img src="/logo.jpeg" alt="TribeWellMD" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-bold text-white">TribeWellMD</span>
            </Link>
            <p className="text-slate-400 text-sm mb-4 max-w-xs">
              Empowering medical students with smart study tools, wellness resources, and a supportive community.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://twitter.com/tribewellmd" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors" aria-label="Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="https://instagram.com/tribewellmd" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
              </a>
              <a href="https://linkedin.com/company/tribewellmd" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors" aria-label="LinkedIn">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
              <a href="https://youtube.com/@tribewellmd" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors" aria-label="YouTube">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
              </a>
            </div>
            <button
              onClick={() => {
                if ('standalone' in window.navigator && (window.navigator as Navigator & { standalone?: boolean }).standalone) return;
                alert('To install TribeWellMD:\n\n• iOS: Tap Share → Add to Home Screen\n• Android: Tap Menu → Install App\n• Desktop: Click the install icon in your browser\'s address bar');
              }}
              className="mt-4 flex items-center gap-2 text-slate-400 hover:text-tribe-sage-400 transition-colors text-sm group"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              <span className="group-hover:underline">Install App</span>
            </button>
          </div>

          {/* Study Tools - Desktop */}
          <div>
            <h3 className="text-white font-semibold mb-4">Study Tools</h3>
            <ul className="space-y-3">
              <li><Link href="/study" className="text-slate-400 hover:text-tribe-sage-400 transition-colors text-sm">Flashcards</Link></li>
              <li><Link href="/cases" className="text-slate-400 hover:text-tribe-sage-400 transition-colors text-sm">Interactive Cases</Link></li>
              <li><Link href="/study/rapid-review" className="text-slate-400 hover:text-tribe-sage-400 transition-colors text-sm">Rapid Review</Link></li>
              <li><Link href="/generate" className="text-slate-400 hover:text-tribe-sage-400 transition-colors text-sm">AI Card Generator</Link></li>
              <li><Link href="/library" className="text-slate-400 hover:text-tribe-sage-400 transition-colors text-sm">Question Library</Link></li>
            </ul>
          </div>

          {/* Resources & Community */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><Link href="/wellness/progress" className="text-slate-400 hover:text-tribe-sage-400 transition-colors text-sm">Wellness Center</Link></li>
              <li><Link href="/community" className="text-slate-400 hover:text-tribe-sage-400 transition-colors text-sm">Community Hub</Link></li>
              <li><Link href="/tribes" className="text-slate-400 hover:text-tribe-sage-400 transition-colors text-sm">Study Tribes</Link></li>
              <li><Link href="/impact" className="text-slate-400 hover:text-tribe-sage-400 transition-colors text-sm">How Impact Works</Link></li>
              <li><Link href="/impact/local" className="text-slate-400 hover:text-tribe-sage-400 transition-colors text-sm">Find Local Charities</Link></li>
              <li><Link href="/premed" className="text-slate-400 hover:text-tribe-sage-400 transition-colors text-sm">PreMed Resources</Link></li>
              <li><Link href="/about" className="text-slate-400 hover:text-tribe-sage-400 transition-colors text-sm">About TribeWellMD</Link></li>
            </ul>
          </div>

          {/* Contact & Support - Desktop */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-tribe-sage-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <a href="mailto:hello@tribewellmd.com" className="text-slate-400 hover:text-tribe-sage-400 transition-colors">hello@tribewellmd.com</a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-tribe-sage-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <a href="mailto:support@tribewellmd.com?subject=Help%20Request" className="text-slate-400 hover:text-tribe-sage-400 transition-colors">Help & Support</a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-tribe-sage-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <a href="mailto:feedback@tribewellmd.com?subject=Feedback" className="text-slate-400 hover:text-tribe-sage-400 transition-colors">Send Feedback</a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-tribe-sage-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <Link href="/investors" className="text-slate-400 hover:text-tribe-sage-400 transition-colors">For Investors</Link>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-tribe-sage-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                <Link href="/partners" className="text-slate-400 hover:text-tribe-sage-400 transition-colors">For Partners</Link>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="text-white text-sm font-medium mb-2">Stay Updated</h4>
              {subscribed ? (
                <p className="text-tribe-sage-400 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  You're subscribed!
                </p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required disabled={loading} className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-tribe-sage-500 disabled:opacity-50" />
                  <button type="submit" disabled={loading} className="px-4 py-2 bg-tribe-sage-500 hover:bg-tribe-sage-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">{loading ? '...' : 'Subscribe'}</button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Mobile 2-Column Grid for Study Tools & Resources */}
        <div className="grid grid-cols-2 gap-4 md:hidden">
          {/* Study Tools - Mobile */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-2">Study Tools</h3>
            <ul className="space-y-1.5">
              <li><Link href="/study" className="text-slate-400 hover:text-tribe-sage-400 transition-colors text-xs">Flashcards</Link></li>
              <li><Link href="/cases" className="text-slate-400 hover:text-tribe-sage-400 transition-colors text-xs">Interactive Cases</Link></li>
              <li><Link href="/study/rapid-review" className="text-slate-400 hover:text-tribe-sage-400 transition-colors text-xs">Rapid Review</Link></li>
              <li><Link href="/generate" className="text-slate-400 hover:text-tribe-sage-400 transition-colors text-xs">AI Card Generator</Link></li>
              <li><Link href="/library" className="text-slate-400 hover:text-tribe-sage-400 transition-colors text-xs">Question Library</Link></li>
            </ul>
          </div>

          {/* Resources - Mobile */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-2">Resources</h3>
            <ul className="space-y-1.5">
              <li><Link href="/wellness" className="text-slate-400 hover:text-tribe-sage-400 transition-colors text-xs">Wellness Center</Link></li>
              <li><Link href="/impact" className="text-slate-400 hover:text-tribe-sage-400 transition-colors text-xs">How Impact Works</Link></li>
              <li><Link href="/tribes" className="text-slate-400 hover:text-tribe-sage-400 transition-colors text-xs">Tribes & Community</Link></li>
              <li><Link href="/premed" className="text-slate-400 hover:text-tribe-sage-400 transition-colors text-xs">PreMed Resources</Link></li>
            </ul>
          </div>
        </div>

        {/* Contact Section - Mobile (below the 2-column grid) */}
        <div className="mt-4 pt-4 border-t border-slate-800 md:hidden">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-white font-semibold text-sm mb-2">Contact Us</h3>
              <ul className="space-y-1.5">
                <li><a href="mailto:hello@tribewellmd.com" className="text-slate-400 hover:text-tribe-sage-400 transition-colors text-xs">hello@tribewellmd.com</a></li>
                <li><Link href="/support" className="text-slate-400 hover:text-tribe-sage-400 transition-colors text-xs">Help & Support</Link></li>
                <li><Link href="/feedback" className="text-slate-400 hover:text-tribe-sage-400 transition-colors text-xs">Send Feedback</Link></li>
                <li><Link href="/faq" className="text-slate-400 hover:text-tribe-sage-400 transition-colors text-xs">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-2">Stay Updated</h4>
              {subscribed ? (
                <p className="text-tribe-sage-400 text-xs flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Subscribed!
                </p>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" required disabled={loading} className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-tribe-sage-500 disabled:opacity-50" />
                  <button type="submit" disabled={loading} className="w-full px-3 py-1.5 bg-tribe-sage-500 hover:bg-tribe-sage-600 text-white text-xs font-medium rounded transition-colors disabled:opacity-50">{loading ? '...' : 'Subscribe'}</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conversion Transparency Section */}
      <div className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border-t border-emerald-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-tribe-sage-500/20 flex items-center justify-center">
                <span className="text-xl">💚</span>
              </div>
              <div>
                <h4 className="text-tribe-sage-400 font-medium text-sm">Village Points to Charity</h4>
                <p className="text-slate-400 text-xs">
                  1,000 Village Points = $1.00 to verified 501(c)(3) charities. 100% transparent.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center px-4 py-2 bg-slate-800/50 rounded-lg">
                <p className="text-tribe-sage-400 font-bold text-lg">10 XP</p>
                <p className="text-slate-500 text-xs">= 1 Village Point</p>
              </div>
              <Link
                href="/impact"
                className="px-4 py-2 bg-tribe-sage-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                Learn How It Works
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              &copy; {currentYear} TribeWellMD. All rights reserved. Made with love for medical students.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
              <Link href="/accessibility" className="hover:text-slate-300 transition-colors">Accessibility</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
