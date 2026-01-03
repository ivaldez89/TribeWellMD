'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/footer/Footer';
import { Icons } from '@/components/ui/Icons';
import Link from 'next/link';

const PREMED_FEATURES = [
  {
    title: 'MCAT Preparation',
    description: 'Study resources, practice questions, and strategies to conquer the MCAT',
    icon: 'target',
    status: 'Coming Soon',
    features: ['Content review guides', 'Practice passages', 'Score tracking', 'Study schedules']
  },
  {
    title: 'Application Guidance',
    description: 'Navigate the medical school application process with confidence',
    icon: 'document',
    status: 'Coming Soon',
    features: ['Personal statement tips', 'Activity descriptions', 'School selection', 'Timeline planning']
  },
  {
    title: 'Med Student Mentors',
    description: 'Connect with current medical students who were in your shoes',
    icon: 'handshake',
    status: 'Coming Soon',
    features: ['1-on-1 mentorship', 'Q&A sessions', 'Application review', 'Interview prep']
  },
  {
    title: 'Clinical Experience',
    description: 'Find shadowing opportunities and build meaningful clinical exposure',
    icon: 'hospital',
    status: 'Coming Soon',
    features: ['Shadowing guides', 'Volunteer opportunities', 'Research connections', 'Experience logging']
  },
  {
    title: 'School Research',
    description: 'Explore medical schools and find the right fit for you',
    icon: 'search',
    status: 'Coming Soon',
    features: ['School profiles', 'Acceptance stats', 'Mission matching', 'Cost comparison']
  },
  {
    title: 'Pre-Med Community',
    description: 'Join a supportive community of aspiring physicians',
    icon: 'chat',
    status: 'Coming Soon',
    features: ['Discussion forums', 'Study groups', 'Success stories', 'Peer support']
  },
];

// Helper function to render icon
const renderFeatureIcon = (iconName: string) => {
  switch (iconName) {
    case 'target': return <Icons.Target />;
    case 'document': return <Icons.Document />;
    case 'handshake': return <Icons.Handshake />;
    case 'hospital': return <Icons.Hospital />;
    case 'search': return <Icons.Search />;
    case 'chat': return <Icons.Chat />;
    default: return <Icons.Target />;
  }
};

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
    icon: 'student'
  },
  {
    quote: "I wish I had access to this kind of guidance when I was applying. It would have saved me so much stress and uncertainty.",
    author: "MS1, Johns Hopkins",
    icon: 'doctor'
  },
  {
    quote: "The pre-med journey can feel isolating. Having a community of people going through the same thing is invaluable.",
    author: "Pre-Med Junior, UC Berkeley",
    icon: 'graduation'
  },
];

// Helper for testimonial icons
const renderTestimonialIcon = (iconName: string) => {
  switch (iconName) {
    case 'student': return <Icons.Student />;
    case 'doctor': return <Icons.Doctor />;
    case 'graduation': return <Icons.GraduationCap />;
    default: return <Icons.Student />;
  }
};

export default function PreMedPage() {
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
        body: JSON.stringify({ email, source: 'premed-page' }),
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
    <div className="min-h-screen flex flex-col bg-[#F5F0E8] dark:bg-slate-900">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Hero Section */}
        <section className="mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5B7B6D] via-[#8B7355] to-[#A89070] p-8 md:p-10 shadow-2xl">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-[#D4C4B0]/20 rounded-full blur-2xl" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur rounded-full text-white/90 text-sm font-medium mb-4">
                  <span className="w-2 h-2 bg-[#D4C4B0] rounded-full animate-pulse" />
                  <span>TribeWellPreMed - Coming Soon</span>
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                  Your Journey to <span className="text-[#F5F0E8]">Medicine</span> Starts Here
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
                {subscribed ? (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-white font-medium">You're on the list!</p>
                    <p className="text-white/60 text-sm mt-1">We'll notify you when PreMed launches.</p>
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
                      className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#C4A77D] disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-6 py-3 bg-white hover:bg-[#F5F0E8] text-[#8B7355] font-bold rounded-xl shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {loading ? 'Saving...' : 'Notify Me'}
                    </button>
                    {error && <p className="text-red-300 text-sm text-center">{error}</p>}
                  </form>
                )}
                <p className="text-white/60 text-xs text-center mt-3">Be the first to know when PreMed launches.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-[#8B7355] dark:text-white mb-8 text-center">
            What's Coming for Pre-Meds
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PREMED_FEATURES.map((feature, index) => (
              <div
                key={index}
                className="relative p-6 bg-white dark:bg-slate-800 rounded-2xl border border-[#D4C4B0] dark:border-[#5B7B6D]"
              >
                <div className="absolute top-4 right-4 px-3 py-1 bg-[#F5F0E8] dark:bg-[#8B7355]/30 text-[#8B7355] dark:text-[#D4C4B0] text-xs font-medium rounded-full">
                  {feature.status}
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#F5F0E8] to-[#E8E0D5] dark:from-[#8B7355]/30 dark:to-[#5B7B6D]/30 flex items-center justify-center mb-4 text-[#8B7355] dark:text-[#D4C4B0]">
                  {renderFeatureIcon(feature.icon)}
                </div>
                <h3 className="text-xl font-semibold text-[#8B7355] dark:text-white mb-2">{feature.title}</h3>
                <p className="text-[#A89070] dark:text-[#D4C4B0] mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-[#A89070] dark:text-[#D4C4B0]">
                      <svg className="w-4 h-4 text-[#5B7B6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          <h2 className="text-2xl font-bold text-[#8B7355] dark:text-white mb-8 text-center">
            The Pre-Med Journey
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            {JOURNEY_STEPS.map((step, index) => (
              <div
                key={index}
                className="relative p-6 bg-white dark:bg-slate-800 rounded-2xl border border-[#D4C4B0] dark:border-[#5B7B6D]"
              >
                {index < JOURNEY_STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-[#D4C4B0] dark:bg-[#5B7B6D]" />
                )}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C4A77D] to-[#A89070] flex items-center justify-center text-white font-bold mb-3">
                  {index + 1}
                </div>
                <h3 className="font-bold text-[#8B7355] dark:text-white mb-1">{step.year}</h3>
                <p className="text-sm text-[#8B7355] dark:text-[#D4C4B0] font-medium mb-3">{step.focus}</p>
                <ul className="space-y-1">
                  {step.tasks.map((task, idx) => (
                    <li key={idx} className="text-sm text-[#A89070] dark:text-[#D4C4B0] flex items-start gap-2">
                      <span className="text-[#5B7B6D] mt-1">•</span>
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
                <div className="text-4xl font-bold text-[#D4C4B0] mb-2">53,000+</div>
                <p className="text-[#F5F0E8]/80">AMCAS applications per year</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#D4C4B0] mb-2">~40%</div>
                <p className="text-[#F5F0E8]/80">of applicants matriculate</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#D4C4B0] mb-2">4+ years</div>
                <p className="text-[#F5F0E8]/80">of preparation needed</p>
              </div>
            </div>
            <p className="text-[#F5F0E8]/80 text-lg">
              The path to medicine is competitive, but you don't have to navigate it alone.
              TribeWellPreMed connects you with the guidance and community you need to succeed.
            </p>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-[#8B7355] dark:text-white mb-8 text-center">
            What Pre-Meds & Med Students Say
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-[#D4C4B0] dark:border-[#5B7B6D]"
              >
                <div className="w-12 h-12 rounded-xl bg-[#F5F0E8] dark:bg-[#8B7355]/30 flex items-center justify-center mb-4 text-[#8B7355] dark:text-[#D4C4B0]">
                  {renderTestimonialIcon(testimonial.icon)}
                </div>
                <p className="text-[#A89070] dark:text-[#D4C4B0] italic mb-4">"{testimonial.quote}"</p>
                <p className="text-sm text-[#A89070] dark:text-[#D4C4B0]">- {testimonial.author}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Connection to TribeWellMD */}
        <section className="mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#5B7B6D] via-[#8B7355] to-[#A89070] p-8">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white">
                <Icons.Hospital />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Part of the TribeWellMD Family</h2>
              <p className="text-[#F5F0E8] mb-6">
                TribeWellPreMed is your starting point. When you get into medical school,
                you'll have seamless access to TribeWellMD's full suite of study tools,
                wellness resources, and community features.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/"
                  className="px-6 py-3 bg-white text-[#8B7355] font-semibold rounded-xl hover:bg-[#F5F0E8] transition-all hover:scale-105"
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
          <div className="p-8 bg-white dark:bg-slate-800 rounded-3xl border border-[#D4C4B0] dark:border-[#5B7B6D] text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#F5F0E8] to-[#E8E0D5] dark:from-[#8B7355]/30 dark:to-[#5B7B6D]/30 flex items-center justify-center text-[#8B7355] dark:text-[#D4C4B0]">
              <Icons.Sparkles />
            </div>
            <h2 className="text-2xl font-bold text-[#8B7355] dark:text-white mb-2">Ready to Start Your Journey?</h2>
            <p className="text-[#A89070] dark:text-[#D4C4B0] mb-6 max-w-2xl mx-auto">
              Sign up for early access and be the first to know when TribeWellPreMed launches.
              Your future in medicine starts with a single step.
            </p>
            <button className="px-8 py-4 bg-gradient-to-r from-[#C4A77D] to-[#A89070] hover:from-[#A89070] hover:to-[#C4A77D] text-white font-bold rounded-xl shadow-lg shadow-[#C4A77D]/25 transition-all hover:scale-105">
              Get Early Access
            </button>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
