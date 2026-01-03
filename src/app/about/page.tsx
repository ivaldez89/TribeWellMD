'use client';

import Link from 'next/link';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { LandingFooter, FOOTER_HEIGHT } from '@/components/layout/LandingFooter';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <LandingHeader />

      <main className="flex-1 pt-12">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-6 sm:px-8">
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-content mb-8 leading-tight">
              Why we built this
            </h1>

            <div className="prose prose-lg max-w-none text-content-secondary space-y-6">
              <p className="text-xl leading-relaxed">
                Medical training is one of the most demanding journeys a person can undertake.
                You already know this. You're living it.
              </p>

              <p>
                What you might not know is that the way we've been taught to handle it—push through,
                compartmentalize, treat self-care as something you'll "get to later"—doesn't work.
                The data is clear: burnout rates among medical trainees are staggering. Isolation is endemic.
                And the tools we're given to cope are scattered across a dozen apps that don't talk to each other.
              </p>

              <p>
                <strong className="text-content">Study here. Wellness there. Community somewhere else.</strong>
                {" "}As if your brain can neatly separate "study mode" from "taking care of yourself" mode.
                As if rest is something to feel guilty about.
              </p>
            </div>
          </div>
        </section>

        {/* The Problem Section */}
        <section className="py-16 bg-white dark:bg-surface-elevated border-y border-border-light">
          <div className="max-w-3xl mx-auto px-6 sm:px-8">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-content mb-8">
              The problem we saw
            </h2>

            <div className="prose prose-lg max-w-none text-content-secondary space-y-6">
              <p>
                We watched ourselves and our colleagues juggle Anki, UWorld, Headspace, Discord,
                fitness apps, journaling apps—each one promising to help, but together creating
                a fragmented experience that made us feel <em>more</em> overwhelmed, not less.
              </p>

              <p>
                Worse, the underlying message was always the same: <strong className="text-content">wellness is optional.
                It's what you do after the "real" work.</strong> So we pushed it aside.
                We told ourselves we'd sleep more after Step 1. We'd exercise again during fourth year.
                We'd reconnect with friends after residency.
              </p>

              <p>
                That approach is breaking people.
              </p>
            </div>
          </div>
        </section>

        {/* The Insight Section */}
        <section className="py-16 md:py-20">
          <div className="max-w-3xl mx-auto px-6 sm:px-8">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-content mb-8">
              What we believe
            </h2>

            <div className="prose prose-lg max-w-none text-content-secondary space-y-6">
              <p>
                Sustainable excellence requires wellness. Not as a nice-to-have. Not as self-indulgence.
                As a prerequisite.
              </p>

              <p>
                The science backs this up. Spaced repetition works better when you're rested.
                Retention improves when you're not anxious. Connection with others isn't a distraction
                from learning—it's a predictor of long-term success and satisfaction in medicine.
              </p>

              <p>
                <strong className="text-content">So why do we treat these things as competing priorities?</strong>
              </p>

              <p>
                TribeWellMD exists because we believe they shouldn't be. Studying and wellness
                aren't opposites. They're reinforcing. Community isn't a break from the work—it's
                what makes the work sustainable.
              </p>
            </div>
          </div>
        </section>

        {/* The Mission Section */}
        <section className="py-16 bg-white dark:bg-surface-elevated border-y border-border-light">
          <div className="max-w-3xl mx-auto px-6 sm:px-8">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-content mb-8">
              What we're building
            </h2>

            <div className="prose prose-lg max-w-none text-content-secondary space-y-6">
              <p>
                One place. Not another app to add to the pile—a single ecosystem where your learning,
                your well-being, and your connection to others all live together and reinforce each other.
              </p>

              <p>
                A place where taking a break isn't "time off from studying"—it's part of the system.
                Where rest counts toward progress. Where community support isn't something you have to
                seek out separately—it's woven into everything.
              </p>

              <p>
                <strong className="text-content">Prevention, not reaction.</strong> We're not here to help
                you recover from burnout. We're here to help you build the habits, connections, and
                resilience that prevent it in the first place.
              </p>
            </div>
          </div>
        </section>

        {/* Who This Is For Section */}
        <section className="py-16 md:py-20">
          <div className="max-w-3xl mx-auto px-6 sm:px-8">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-content mb-8">
              Who this is for
            </h2>

            <div className="prose prose-lg max-w-none text-content-secondary space-y-6">
              <p>
                <strong className="text-content">For medical students</strong> who are tired of feeling like
                they have to choose between performing well and staying well. Who know, somewhere deep down,
                that the current approach isn't sustainable—and are looking for something better.
              </p>

              <p>
                <strong className="text-content">For residents and attendings</strong> who wish someone had
                told them earlier that it didn't have to be this hard. Who want to model a different way
                for the trainees coming behind them.
              </p>

              <p>
                <strong className="text-content">For institutions</strong> that recognize that physician
                wellness isn't just a moral imperative—it's directly tied to retention, performance,
                and the quality of patient care.
              </p>
            </div>
          </div>
        </section>

        {/* Closing Section */}
        <section className="py-16 md:py-24 bg-primary text-white">
          <div className="max-w-3xl mx-auto px-6 sm:px-8 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
              This isn't about doing more
            </h2>

            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              It's about doing things differently. About building a medical career that doesn't
              require sacrificing the person you were when you started.
            </p>

            <p className="text-white/80 mb-10">
              We're just getting started. And we'd be honored if you joined us.
            </p>

            <Link
              href="/register"
              className="inline-block px-8 py-4 bg-white text-primary font-semibold rounded-xl hover:bg-white/95 transition-all duration-200 hover:scale-[1.02] shadow-lg"
            >
              Begin Your Journey
            </Link>
          </div>
        </section>

        {/* Bottom padding for fixed footer */}
        <div style={{ height: FOOTER_HEIGHT }} className="bg-primary" />
      </main>

      <LandingFooter />
    </div>
  );
}
