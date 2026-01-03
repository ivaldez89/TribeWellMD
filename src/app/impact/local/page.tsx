'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ContentPageLayout } from '@/components/layout/PageLayout';

interface LocalCharity {
  name: string;
  description: string;
  website: string;
  focus: string;
}

interface CityCharities {
  city: string;
  state: string;
  charities: LocalCharity[];
}

const LOCAL_CHARITIES: CityCharities[] = [
  {
    city: 'Dallas',
    state: 'Texas',
    charities: [
      {
        name: 'North Texas Food Bank',
        description: 'Provides access to nutritious food for hungry children, seniors, and families across 13 North Texas counties.',
        website: 'https://ntfb.org',
        focus: 'Food Security',
      },
      {
        name: 'The Bridge Homeless Recovery Center',
        description: 'Dallas\' largest homeless assistance center, providing shelter, meals, and services to help people rebuild their lives.',
        website: 'https://www.bridgehrc.org',
        focus: 'Homeless Services',
      },
      {
        name: 'Parkland Foundation',
        description: 'Supports Parkland Health, one of the nation\'s largest public hospital systems, serving the underserved community.',
        website: 'https://parklandhealthfoundation.org',
        focus: 'Healthcare Access',
      },
      {
        name: 'Dallas Area Habitat for Humanity',
        description: 'Builds affordable homes and provides homeownership opportunities to families in need across the Dallas area.',
        website: 'https://dallasareahabitat.org',
        focus: 'Housing',
      },
      {
        name: 'Promise House',
        description: 'Provides shelter and services to homeless and at-risk youth, helping them build brighter futures.',
        website: 'https://www.promisehouse.org',
        focus: 'Youth Services',
      },
    ],
  },
  {
    city: 'San Diego',
    state: 'California',
    charities: [
      {
        name: 'San Diego Food Bank',
        description: 'Provides food assistance to over 350,000 people monthly across San Diego County through various programs.',
        website: 'https://sandiegofoodbank.org',
        focus: 'Food Security',
      },
      {
        name: 'Father Joe\'s Villages',
        description: 'Comprehensive homeless services including shelter, healthcare, job training, and permanent housing solutions.',
        website: 'https://my.neighbor.org',
        focus: 'Homeless Services',
      },
      {
        name: 'San Diego Humane Society',
        description: 'Provides shelter, medical care, and adoption services for animals while promoting humane education.',
        website: 'https://sdhumane.org',
        focus: 'Animal Welfare',
      },
      {
        name: 'Scripps Health Foundation',
        description: 'Supports Scripps Health\'s mission to provide exceptional healthcare and community wellness programs.',
        website: 'https://www.scripps.org/giving',
        focus: 'Healthcare',
      },
      {
        name: 'Reality Changers',
        description: 'Helps youth from disadvantaged backgrounds become first-generation college students through tutoring and mentorship.',
        website: 'https://realitychangers.org',
        focus: 'Education',
      },
    ],
  },
  {
    city: 'Ann Arbor',
    state: 'Michigan',
    charities: [
      {
        name: 'Food Gatherers',
        description: 'Washtenaw County\'s food rescue program, collecting surplus food and distributing it to those in need.',
        website: 'https://foodgatherers.org',
        focus: 'Food Security',
      },
      {
        name: 'Shelter Association of Washtenaw County',
        description: 'Provides emergency shelter, supportive housing, and services to help people experiencing homelessness.',
        website: 'https://www.annarborshelter.org',
        focus: 'Homeless Services',
      },
      {
        name: 'University of Michigan C.S. Mott Children\'s Hospital',
        description: 'Nationally ranked children\'s hospital providing specialized pediatric care and family support services.',
        website: 'https://www.mottchildren.org/giving',
        focus: 'Pediatric Healthcare',
      },
      {
        name: 'Ann Arbor Community Foundation',
        description: 'Connects donors with causes they care about to strengthen Washtenaw County communities.',
        website: 'https://www.aaacf.org',
        focus: 'Community Development',
      },
      {
        name: 'SafeHouse Center',
        description: 'Provides shelter and support services to survivors of domestic violence and sexual assault.',
        website: 'https://safehousecenter.org',
        focus: 'Domestic Violence Support',
      },
    ],
  },
  {
    city: 'Brownsville',
    state: 'Texas',
    charities: [
      {
        name: 'Food Bank of the Rio Grande Valley',
        description: 'Serves the four-county region providing millions of pounds of food annually to families in need.',
        website: 'https://foodbankrgv.com',
        focus: 'Food Security',
      },
      {
        name: 'Good Neighbor Settlement House',
        description: 'Multi-service community center providing food, clothing, social services, and emergency assistance.',
        website: 'https://www.goodneighborsettlement.org',
        focus: 'Community Services',
      },
      {
        name: 'Su Clinica',
        description: 'Federally qualified health center providing affordable healthcare to underserved communities in South Texas.',
        website: 'https://www.suclinica.org',
        focus: 'Healthcare Access',
      },
      {
        name: 'Proyecto Juan Diego',
        description: 'Empowers families in Brownsville colonias through education, housing improvements, and community organizing.',
        website: 'https://www.proyecto-jd.org',
        focus: 'Community Development',
      },
      {
        name: 'Boys & Girls Club of the Rio Grande Valley',
        description: 'Provides after-school programs, mentorship, and development opportunities for youth in the region.',
        website: 'https://www.bgca.org',
        focus: 'Youth Development',
      },
    ],
  },
];

export default function LocalCharitiesPage() {
  const [searchZip, setSearchZip] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const handleZipSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just show a message - future: actual ZIP lookup
    alert('ZIP code search coming soon! For now, please select from the cities below.');
  };

  return (
    <ContentPageLayout maxWidth="full">
      {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#5B7B6D] via-[#2D5A4A] to-[#8B7355] py-16">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Link
              href="/impact"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to How Impact Works
            </Link>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Find Local Charities
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
              Support causes in your community. Your Village Points can make a direct impact where you live and study.
            </p>

            {/* ZIP Code Search */}
            <form onSubmit={handleZipSearch} className="max-w-md mx-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchZip}
                  onChange={(e) => setSearchZip(e.target.value)}
                  placeholder="Enter ZIP code..."
                  className="flex-1 px-4 py-3 rounded-xl bg-white/20 backdrop-blur border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-white text-[#8B7355] font-semibold rounded-xl hover:bg-[#F5F0E8] transition-colors"
                >
                  Search
                </button>
              </div>
              <p className="text-white/60 text-sm mt-2">More cities coming soon!</p>
            </form>
          </div>
        </section>

        {/* City Selection */}
        <section className="py-12 bg-white dark:bg-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
              Select a City
            </h2>

            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {LOCAL_CHARITIES.map((cityData) => (
                <button
                  key={cityData.city}
                  onClick={() => setSelectedCity(selectedCity === cityData.city ? null : cityData.city)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    selectedCity === cityData.city
                      ? 'bg-gradient-to-r from-[#C4A77D] to-[#A89070] text-white shadow-lg shadow-[#C4A77D]/25'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {cityData.city}, {cityData.state}
                </button>
              ))}
            </div>

            {/* Show all cities if none selected, or just the selected city */}
            <div className="space-y-12">
              {(selectedCity ? LOCAL_CHARITIES.filter(c => c.city === selectedCity) : LOCAL_CHARITIES).map((cityData) => (
                <div key={cityData.city}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-[#F5F0E8] dark:bg-[#8B7355]/30 flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#A89070] dark:text-[#C4A77D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {cityData.city}, {cityData.state}
                    </h3>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cityData.charities.map((charity, index) => (
                      <div
                        key={index}
                        className="bg-slate-50 dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:border-[#C4A77D] dark:hover:border-[#C4A77D] transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-slate-900 dark:text-white">{charity.name}</h4>
                        </div>
                        <span className="inline-block px-2 py-1 bg-[#F5F0E8] dark:bg-[#8B7355]/30 text-[#8B7355] dark:text-[#D4C4B0] text-xs font-medium rounded-full mb-3">
                          {charity.focus}
                        </span>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                          {charity.description}
                        </p>
                        <a
                          href={charity.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#A89070] dark:text-[#C4A77D] hover:underline inline-flex items-center gap-1"
                        >
                          Visit website
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Coming Soon Notice */}
        <section className="py-12 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                More Cities Coming Soon
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                We're expanding our local charity directory. Want to see your city included?
                Let us know which communities matter to you.
              </p>
              <Link
                href="/feedback"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Suggest a City
              </Link>
            </div>
          </div>
        </section>

        {/* Back to Partner Charities */}
        <section className="py-12 bg-white dark:bg-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Looking for our national partner charities?
            </h3>
            <Link
              href="/impact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C4A77D] to-[#A89070] hover:from-[#A89070] hover:to-[#8B7355] text-white font-medium rounded-xl transition-colors"
            >
              View Partner Organizations
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
    </ContentPageLayout>
  );
}
