'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

const PREMED_FEATURES = [
  {
    title: 'MCAT Preparation',
    description: 'Study resources, practice questions, and strategies to conquer the MCAT',
    icon: '🎯',
    status: 'Coming Soon',
    features: ['Content review guides', 'Practice passages', 'Score tracking', 'Study schedules']
  },
  {
    title: 'Application Guidance',
    description: 'Navigate the medical school application process with confidence',
    icon: '📝',
    status: 'Coming Soon',
    features: ['Personal statement tips', 'Activity descriptions', 'School selection', 'Timeline planning']
  },
  {
    title: 'Med Student Mentors',
    description: 'Connect with current medical students who were in your shoes',
    icon: '🤝',
    status: 'Coming Soon',
    features: ['1-on-1 mentorship', 'Q&A sessions', 'Application review', 'Interview prep']
  },
  {
    title: 'Clinical Experience',
    description: 'Find shadowing opportunities and build meaningful clinical exposure',
    icon: '🏥',
    status: 'Coming Soon',
    features: ['Shadowing guides', 'Volunteer opportunities', 'Research connections', 'Experience logging']
  },
  {
    title: 'School Research',
    description: 'Explore medical schools and find the right fit for you',
    icon: '🔍',
    status: 'Coming Soon',
    features: ['School profiles', 'Acceptance stats', 'Mission matching', 'Cost comparison']
  },
  {
    title: 'Pre-Med Community',
    description: 'Join a supportive community of aspiring physicians',
    icon: '💬',
    status: 'Coming Soon',
    features: ['Discussion forums', 'Study groups', 'Success stories', 'Peer support']
  },
];

const JOURNEY_STEPS = [
  { year: 'Freshman', focus: 'Build foundation', tasks: ['Explore interests', 'Start volunteering', 'Build relationships with professors'] },
  { year: 'Sophomore', focus: 'Gain experience', tasks: ['Clinical shadowing', 'Research opportunities', 'Leadership roles'] },
  { year: 'Junior', focus: 'MCAT & Apply', tasks: ['MCAT preparation', 'Committee letter', 'Primary applications'] },
  { year: 'Senior', focus: 'Interview & Match', tasks: ['Secondary applications', 'Interviews', 'Decision time'] },
];

const TESTIMONIALS = [
  {
    quote: "Having a med student mentor made all the difference. They helped me understand what admissions committees actually look for.",
    author: "Pre-Med Senior, UCLA",
    avatar: "👩‍🎓"
  },
  {
    quote: "I wish I had access to this kind of guidance when I was applying. It would have saved me so much stress and uncertainty.",
    author: "MS1, Johns Hopkins",
    avatar: "👨‍⚕️"
  },
  {
    quote: "The pre-med journey can feel isolating. Having a community of people going through the same thing is invaluable.",
    author: "Pre-Med Junior, UC Berkeley",
    avatar: "🧑‍🎓"
  },
];

export default function PreMedPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-8 md:p-10 shadow-2xl">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-emerald-300/20 rounded-full blur-2xl" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur rounded-full text-white/90 text-sm font-medium mb-4">
                  <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
                  <span>TribeWellPreMed - Coming Soon</span>
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                  Your Journey to <span className="text-emerald-200">Medicine</span> Starts Here
                </h1>

                <p className="text-white/80 text-lg max-w-xl mb-6">
                  From pre-med to MD. Get guidance, mentorship, and resources from people who've walked the path before you.
                </p>

                {/* Stats row */}
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="text-center px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
                    <p className="text-2xl md:text-3xl font-bold text-white">{PREMED_FEATURES.length}</p>
                    <p className="text-white/60 text-xs">Features</p>
                  </div>
                  <div className="text-center px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
                    <p className="text-2xl md:text-3xl font-bold text-white">{JOURNEY_STEPS.length}</p>
                    <p className="text-white/60 text-xs">Year Journey</p>
                  </div>
                  <div className="text-center px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
                    <p className="text-2xl md:text-3xl font-bold text-white">1:1</p>
                    <p className="text-white/60 text-xs">Mentorship</p>
                  </div>
                </div>
              </div>

              {/* Email Signup Card */}
              <div className="p-5 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 w-full max-w-sm">
                <h3 className="text-white font-semibold mb-3 text-center">Get Early Access</h3>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <button className="w-full px-6 py-3 bg-white hover:bg-emerald-50 text-emerald-600 font-bold rounded-xl shadow-lg transition-all hover:scale-105">
                    Notify Me
                  </button>
                </div>
                <p className="text-white/60 text-xs text-center mt-3">Be the first to know when PreMed launches.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            What's Coming for Pre-Meds
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PREMED_FEATURES.map((feature, index) => (
              <div
                key={index}
                className="relative p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700"
              >
                <div className="absolute top-4 right-4 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium rounded-full">
                  {feature.status}
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center mb-4 text-2xl">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* The Pre-Med Journey */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            The Pre-Med Journey
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            {JOURNEY_STEPS.map((step, index) => (
              <div
                key={index}
                className="relative p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700"
              >
                {index < JOURNEY_STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-emerald-300 dark:bg-emerald-700" />
                )}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold mb-3">
                  {index + 1}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">{step.year}</h3>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-3">{step.focus}</p>
                <ul className="space-y-1">
                  {step.tasks.map((task, idx) => (
                    <li key={idx} className="text-sm text-slate-500 dark:text-slate-400 flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">•</span>
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Why Start Early */}
        <section className="mb-16 p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Why TribeWellPreMed?</h2>
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="text-4xl font-bold text-emerald-400 mb-2">53,000+</div>
                <p className="text-slate-300">AMCAS applications per year</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-emerald-400 mb-2">~40%</div>
                <p className="text-slate-300">of applicants matriculate</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-emerald-400 mb-2">4+ years</div>
                <p className="text-slate-300">of preparation needed</p>
              </div>
            </div>
            <p className="text-slate-300 text-lg">
              The path to medicine is competitive, but you don't have to navigate it alone.
              TribeWellPreMed connects you with the guidance and community you need to succeed.
            </p>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            What Pre-Meds & Med Students Say
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700"
              >
                <div className="text-4xl mb-4">{testimonial.avatar}</div>
                <p className="text-slate-600 dark:text-slate-300 italic mb-4">"{testimonial.quote}"</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">- {testimonial.author}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Connection to TribeWellMD */}
        <section className="mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-8">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <span className="text-3xl">🏥</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Part of the TribeWellMD Family</h2>
              <p className="text-emerald-100 mb-6">
                TribeWellPreMed is your starting point. When you get into medical school,
                you'll have seamless access to TribeWellMD's full suite of study tools,
                wellness resources, and community features.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/"
                  className="px-6 py-3 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-all hover:scale-105"
                >
                  Explore TribeWellMD
                </Link>
                <Link
                  href="/community"
                  className="px-6 py-3 bg-white/20 backdrop-blur text-white font-semibold rounded-xl hover:bg-white/30 transition-all border border-white/30"
                >
                  Join the Community
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mb-8">
          <div className="p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center">
              <span className="text-3xl">🌱</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Ready to Start Your Journey?</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
              Sign up for early access and be the first to know when TribeWellPreMed launches.
              Your future in medicine starts with a single step.
            </p>
            <button className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-105">
              Get Early Access
            </button>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
