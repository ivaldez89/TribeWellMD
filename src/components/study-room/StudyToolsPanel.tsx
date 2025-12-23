'use client';

import Link from 'next/link';

export function StudyToolsPanel() {
  const tools = [
    {
      name: 'Flashcards',
      description: 'Review your flashcard decks',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      href: '/study',
      color: 'from-tribe-sage-500 to-cyan-600',
      available: true,
    },
    {
      name: 'Rapid Review',
      description: 'Quick-fire card review',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      href: '/study/rapid-review',
      color: 'from-amber-500 to-orange-600',
      available: true,
    },
    {
      name: 'Clinical Cases',
      description: 'Interactive patient cases',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      href: '/cases',
      color: 'from-purple-500 to-indigo-600',
      available: true,
    },
    {
      name: 'Synced Flashcards',
      description: 'Study together in real-time',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      href: '#',
      color: 'from-slate-400 to-slate-500',
      available: false,
      comingSoon: true,
    },
    {
      name: 'Whiteboard',
      description: 'Draw and annotate together',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
      ),
      href: '#',
      color: 'from-slate-400 to-slate-500',
      available: false,
      comingSoon: true,
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-tribe-sage-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        Study Tools
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {tools.map((tool) => (
          <div key={tool.name} className="relative">
            {tool.available ? (
              <Link
                href={tool.href}
                target="_blank"
                className={`block p-4 rounded-xl bg-gradient-to-br ${tool.color} text-white hover:shadow-lg transition-all hover:scale-[1.02] group`}
              >
                <div className="mb-2 opacity-90 group-hover:opacity-100">{tool.icon}</div>
                <h4 className="font-medium text-sm mb-0.5">{tool.name}</h4>
                <p className="text-xs opacity-80">{tool.description}</p>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </div>
              </Link>
            ) : (
              <div
                className={`block p-4 rounded-xl bg-gradient-to-br ${tool.color} text-white opacity-60 cursor-not-allowed`}
              >
                <div className="mb-2 opacity-90">{tool.icon}</div>
                <h4 className="font-medium text-sm mb-0.5">{tool.name}</h4>
                <p className="text-xs opacity-80">{tool.description}</p>
                {tool.comingSoon && (
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-white/20 rounded text-[10px] font-medium">
                    Soon
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-500 mt-4 text-center">
        Tools open in a new tab so you can study alongside your group
      </p>
    </div>
  );
}
