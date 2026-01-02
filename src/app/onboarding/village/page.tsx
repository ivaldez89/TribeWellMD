'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { joinVillage, updateUserProfile } from '@/lib/storage/profileStorage';
import { PARTNER_CHARITIES, type Charity } from '@/data/charities';
import { PublicPageLayout } from '@/components/layout/PublicPageLayout';

// Icon components for charity categories
const HeartIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

const GlobeIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
  </svg>
);

const HospitalIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
  </svg>
);

const GraduationCapIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
  </svg>
);

const getCharityIcon = (iconName: string, className: string = "w-8 h-8") => {
  switch (iconName) {
    case 'Heart':
    case 'HeartHand':
      return <HeartIcon className={className} />;
    case 'Globe':
      return <GlobeIcon className={className} />;
    case 'Hospital':
      return <HospitalIcon className={className} />;
    case 'GraduationCap':
      return <GraduationCapIcon className={className} />;
    default:
      return <HeartIcon className={className} />;
  }
};

// Get category color
const getCategoryColor = (focus: string) => {
  if (focus.includes('Wellness') || focus.includes('Mental')) return 'from-[#5B7B6D] to-[#7FA08F]';
  if (focus.includes('Global') || focus.includes('Crisis')) return 'from-[#8B7355] to-[#A89070]';
  if (focus.includes('Access') || focus.includes('Aid')) return 'from-[#6B8B7D] to-[#8BA89A]';
  if (focus.includes('Education')) return 'from-[#C4A77D] to-[#D4B78D]';
  if (focus.includes('Cancer') || focus.includes('Pediatric')) return 'from-[#B89B78] to-[#C4A77D]';
  return 'from-[#5B7B6D] to-[#7FA08F]';
};

export default function VillageSelectionPage() {
  const [selectedVillage, setSelectedVillage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleVillageSelect = (villageId: string) => {
    setSelectedVillage(villageId);
    setError('');
  };

  const handleJoinVillage = () => {
    if (!selectedVillage) {
      setError('Please select a Village to join');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Join the selected village
      joinVillage(selectedVillage);

      // Mark onboarding as complete
      updateUserProfile({
        onboardingCompleted: true,
        onboardingStep: 'complete',
      });

      // Redirect to home
      router.push('/home');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  const selectedCharity = PARTNER_CHARITIES.find(c => c.id === selectedVillage);

  return (
    <PublicPageLayout>
      <div className="min-h-[calc(100vh-96px)] relative">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-[#5B7B6D]/30 to-[#7FA08F]/30 dark:from-[#5B7B6D]/20 dark:to-[#7FA08F]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-[#C4A77D]/30 to-[#D4B78D]/30 dark:from-[#C4A77D]/20 dark:to-[#D4B78D]/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#5B7B6D]/10 to-[#C4A77D]/10 dark:from-[#5B7B6D]/5 dark:to-[#C4A77D]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-xl shadow-[#5B7B6D]/25 overflow-hidden">
            <img src="/logo.jpeg" alt="TribeWellMD" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Choose Your Village
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Join a community united around a cause you care about. Your wellness activities will generate real donations to your chosen organization.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#5B7B6D]/10 dark:bg-[#5B7B6D]/20 rounded-full">
            <svg className="w-5 h-5 text-[#5B7B6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-[#5B7B6D] dark:text-[#7FA08F]">
              100% of earned points convert to real donations
            </span>
          </div>
        </div>

        {/* Village Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {PARTNER_CHARITIES.map((charity) => (
            <button
              key={charity.id}
              onClick={() => handleVillageSelect(charity.id)}
              className={`
                group relative p-6 rounded-2xl border-2 text-left transition-all duration-300
                hover:shadow-xl hover:scale-[1.02]
                ${selectedVillage === charity.id
                  ? 'border-[#5B7B6D] bg-white dark:bg-slate-800 shadow-lg shadow-[#5B7B6D]/20'
                  : 'border-transparent bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800'
                }
              `}
            >
              {/* Selection indicator */}
              {selectedVillage === charity.id && (
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#5B7B6D] flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              <div className="flex items-start gap-5">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getCategoryColor(charity.focus)} flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                  {getCharityIcon(charity.icon, "w-8 h-8")}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {charity.shortName}
                    </h3>
                    {charity.verified && (
                      <svg className="w-5 h-5 text-[#5B7B6D]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm font-medium text-[#5B7B6D] dark:text-[#7FA08F] mb-2">
                    {charity.focus}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                    {charity.mission}
                  </p>

                  {/* Impact metrics */}
                  <div className="flex flex-wrap gap-3">
                    {charity.impactMetrics.slice(0, 2).map((metric, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs">
                        <span className="font-bold text-[#8B7355] dark:text-[#C4A77D]">{metric.value}</span>
                        <span className="text-slate-500 dark:text-slate-400">{metric.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Website link hint */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <span className="text-xs text-slate-400">{charity.website.replace('https://', '')}</span>
                <span className={`text-xs font-medium transition-colors ${
                  selectedVillage === charity.id
                    ? 'text-[#5B7B6D]'
                    : 'text-slate-400 group-hover:text-[#5B7B6D]'
                }`}>
                  {selectedVillage === charity.id ? 'Selected' : 'Click to select'}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Selected Village Summary */}
        {selectedCharity && (
          <div className="mb-8 p-6 bg-[#5B7B6D]/10 dark:bg-[#5B7B6D]/20 rounded-2xl border border-[#5B7B6D]/20">
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getCategoryColor(selectedCharity.focus)} flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                {getCharityIcon(selectedCharity.icon, "w-7 h-7")}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  Joining {selectedCharity.shortName}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Your wellness journey will support their mission: {selectedCharity.description.toLowerCase()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Action Button */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleJoinVillage}
            disabled={!selectedVillage || isLoading}
            className="w-full max-w-md py-4 bg-gradient-to-r from-[#5B7B6D] to-[#7FA08F] hover:from-[#4A6A5C] hover:to-[#6E8F7E] text-white font-bold text-lg rounded-2xl shadow-lg shadow-[#5B7B6D]/25 hover:shadow-[#5B7B6D]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Joining Village...' : 'Join This Village'}
          </button>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            You can change your Village anytime in Settings
          </p>
        </div>

        {/* Skip option */}
        <div className="mt-12 text-center">
          <Link
            href="/home"
            className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            onClick={() => {
              updateUserProfile({
                onboardingCompleted: true,
                onboardingStep: 'complete',
              });
            }}
          >
            Skip for now
          </Link>
        </div>
      </div>
      </div>
    </PublicPageLayout>
  );
}
