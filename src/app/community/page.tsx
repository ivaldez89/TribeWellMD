'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Icons } from '@/components/ui/Icons';
import Link from 'next/link';

export default function CommunityPage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'community-page' }),
      });

      if (response.ok) {
        setSubscribed(true);
        setEmail('');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="mb-8 animate-fade-in-up">
          <div className="relative rounded-3xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 p-8 md:p-10 shadow-2xl">
            {/* Animated background elements - contained */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-orange-300/20 rounded-full blur-2xl" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur rounded-full text-white/90 text-sm font-medium mb-4">
                  <span className="w-2 h-2 bg-orange-300 rounded-full animate-pulse" />
                  <span>Coming Soon</span>
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                  Find Your <span className="text-orange-200">Tribe</span>
                </h1>

                <p className="text-white/80 text-lg max-w-xl mb-6">
                  Medicine is hard. You don't have to do it alone. Connect with mentors, peers, and a community that understands your journey.
                </p>

                {/* Stats row */}
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="text-center px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
                    <p className="text-2xl md:text-3xl font-bold text-white">6</p>
                    <p className="text-white/60 text-xs">Features</p>
                  </div>
                  <div className="w-px h-10 bg-white/20" />
                  <div className="text-center px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
                    <p className="text-2xl md:text-3xl font-bold text-white">4</p>
                    <p className="text-white/60 text-xs">Resources</p>
                  </div>
                  <div className="w-px h-10 bg-white/20" />
                  <div className="text-center px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
                    <p className="text-2xl md:text-3xl font-bold text-white">24/7</p>
                    <p className="text-white/60 text-xs">Support</p>
                  </div>
                </div>
              </div>

              {/* Email Signup Card */}
              <div className="p-6 bg-white rounded-2xl shadow-2xl w-full max-w-sm">
                <h3 className="text-slate-900 font-bold text-lg mb-4 text-center">Get Early Access</h3>
                {subscribed ? (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-green-700 font-medium">You're on the list!</p>
                    <p className="text-slate-500 text-sm mt-1">We'll notify you when we launch.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="space-y-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      disabled={loading}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {loading ? 'Saving...' : 'Notify Me'}
                    </button>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                  </form>
                )}
                <p className="text-slate-500 text-xs text-center mt-3">No spam, ever.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Main 4-Box Navigation Grid - Matching Study page style */}
        <section className="mb-8 animate-fade-in-up animation-delay-100">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Connect & Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Box 1: Mentorship Matching */}
            <div className="group relative p-6 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:scale-[1.02] transition-all duration-300 text-white overflow-hidden cursor-pointer">
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-white">
                    <Icons.Target />
                  </div>
                  <span className="px-3 py-1 bg-white/20 text-white/90 text-xs font-medium rounded-full">
                    Coming Soon
                  </span>
                </div>
                <h3 className="font-bold text-xl mb-1">Mentorship</h3>
                <p className="text-white/70 text-sm mb-3">Find your guide</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">0</span>
                  <span className="text-white/60 text-sm">mentors</span>
                </div>
              </div>
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>

            {/* Box 2: Day-in-the-Life */}
            <div className="group relative p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all duration-300 text-white overflow-hidden cursor-pointer">
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-white">
                    <Icons.Camera />
                  </div>
                  <span className="px-3 py-1 bg-white/20 text-white/90 text-xs font-medium rounded-full">
                    Coming Soon
                  </span>
                </div>
                <h3 className="font-bold text-xl mb-1">Day-in-the-Life</h3>
                <p className="text-white/70 text-sm mb-3">Real residency stories</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">0</span>
                  <span className="text-white/60 text-sm">posts</span>
                </div>
              </div>
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>

            {/* Box 3: Study Groups - Active! */}
            <Link
              href="/tribes"
              className="group relative p-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all duration-300 text-white overflow-hidden"
            >
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-white">
                    <Icons.Book />
                  </div>
                  <span className="px-3 py-1 bg-emerald-400/40 text-white text-xs font-medium rounded-full">
                    Active
                  </span>
                </div>
                <h3 className="font-bold text-xl mb-1">Study Groups</h3>
                <p className="text-white/70 text-sm mb-3">Join your tribe</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">12</span>
                  <span className="text-white/60 text-sm">tribes</span>
                </div>
              </div>
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </Link>

            {/* Box 4: Anonymous Support */}
            <Link
              href="/wellness"
              className="group relative p-6 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.02] transition-all duration-300 text-white overflow-hidden"
            >
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-white">
                    <Icons.Chat />
                  </div>
                  <span className="px-3 py-1 bg-white/20 text-white/90 text-xs font-medium rounded-full">
                    Coming Soon
                  </span>
                </div>
                <h3 className="font-bold text-xl mb-1">Support</h3>
                <p className="text-white/70 text-sm mb-3">Anonymous help</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">0</span>
                  <span className="text-white/60 text-sm">threads</span>
                </div>
              </div>
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </Link>
          </div>
        </section>

        {/* Secondary Actions Row - Like Study page */}
        <section className="mb-8 animate-fade-in-up animation-delay-200">
          <div className="grid grid-cols-2 gap-4">
            {/* Resources Hub */}
            <Link
              href="/wellness"
              className="group flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">Wellness Hub</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Resources & self-care</p>
              </div>
              <svg className="w-5 h-5 text-slate-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>

            {/* Events Calendar */}
            <div className="group flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-lg transition-all cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 group-hover:bg-teal-500 flex items-center justify-center transition-colors">
                <svg className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors flex items-center gap-2">
                  Events
                  <span className="px-1.5 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-full">Soon</span>
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Workshops & meetups</p>
              </div>
              <svg className="w-5 h-5 text-slate-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>
        </section>

        {/* Why Community Matters - Stats Section */}
        <section className="mb-8 animate-fade-in-up animation-delay-300">
          <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl text-white">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-6">Why This Matters</h2>
              <div className="grid grid-cols-3 gap-4 md:gap-8 mb-6">
                <div className="p-4 bg-white/5 rounded-xl">
                  <div className="text-3xl md:text-4xl font-bold text-orange-400 mb-1">27%</div>
                  <p className="text-slate-400 text-xs md:text-sm">of medical students experience depression</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <div className="text-3xl md:text-4xl font-bold text-orange-400 mb-1">50%</div>
                  <p className="text-slate-400 text-xs md:text-sm">feel they lack adequate mentorship</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <div className="text-3xl md:text-4xl font-bold text-orange-400 mb-1">1 in 3</div>
                  <p className="text-slate-400 text-xs md:text-sm">residents report burnout symptoms</p>
                </div>
              </div>
              <p className="text-slate-400">
                Medical training can be isolating. TribeWellMD is building the community that should have always existed.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Stats Bar - 4 columns like Study page */}
        <section className="mb-8 animate-fade-in-up animation-delay-400">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-600 dark:text-teal-400">
                  <Icons.Target />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">0</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Mentors</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Icons.Users />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">12</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Active Tribes</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Icons.Camera />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">0</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">DITL Posts</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900/50 flex items-center justify-center text-pink-600 dark:text-pink-400">
                  <Icons.Chat />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">0</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Support Threads</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-8 animate-fade-in-up animation-delay-500">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">What Trainees Are Saying</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                quote: "I wish I had something like this when I was applying. Finding a mentor in interventional cardiology was pure luck.",
                author: "PGY-3, Internal Medicine",
                iconColor: "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"
              },
              {
                quote: "The anonymous support would have helped so much during my surgery rotation. I thought I was the only one struggling.",
                author: "MS3, Midwest Medical School",
                iconColor: "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
              },
              {
                quote: "Knowing what programs are actually like before rank day would be invaluable. The interview day experience isn't reality.",
                author: "PGY-1, Emergency Medicine",
                iconColor: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <div className={`w-10 h-10 rounded-xl ${testimonial.iconColor} flex items-center justify-center mb-3`}>
                  <Icons.Doctor />
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm italic mb-3">"{testimonial.quote}"</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">- {testimonial.author}</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
