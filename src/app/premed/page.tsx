'use client';

import { Header } from '@/components/layout/Header';
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50 dark:from-slate-900 dark:to-emerald-900/20">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="text-center py-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-6">
            <span>🌱</span>
            <span>TribeWell<span className="font-bold">PreMed</span> - Coming Soon</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Your Journey to <span className="text-emerald-600 dark:text-emerald-400">Medicine</span> Starts Here
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
            From pre-med to MD. Get guidance, mentorship, and resources from people who've walked the path before you.
          </p>

          {/* Email Signup */}
          <div className="max-w-md mx-auto">
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your email for early access"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25">
                Notify Me
              </button>
            </div>
            <p className="text-sm text-slate-500 mt-3">
              Be the first to know when PreMed features launch.
            </p>
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
        <section className="mb-16 p-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Part of the TribeWellMD Family</h2>
            <p className="text-emerald-100 mb-6">
              TribeWellPreMed is your starting point. When you get into medical school,
              you'll have seamless access to TribeWellMD's full suite of study tools,
              wellness resources, and community features.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/"
                className="px-6 py-3 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-colors"
              >
                Explore TribeWellMD
              </Link>
              <Link
                href="/community"
                className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors border border-emerald-400"
              >
                Join the Community
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center p-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="text-5xl mb-4">🌱</div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Ready to Start Your Journey?</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            Sign up for early access and be the first to know when TribeWellPreMed launches.
            Your future in medicine starts with a single step.
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25">
            Get Early Access
          </button>
        </section>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to TribeWellMD
          </Link>
        </div>
      </main>
    </div>
  );
}
