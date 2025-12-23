'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { useFlashcards } from '@/hooks/useFlashcards';
import type { Rotation, MedicalSystem } from '@/types';

interface ShelfExam {
  id: Rotation;
  name: string;
  description: string;
  icon: string;
  color: string;
  systems: MedicalSystem[];
  tags: string[];
}

const shelfExams: ShelfExam[] = [
  {
    id: 'Ambulatory',
    name: 'Ambulatory Medicine',
    description: 'Outpatient care, preventive medicine, chronic disease management',
    icon: '🏥',
    color: 'from-blue-500 to-cyan-500',
    systems: ['Preventive Medicine', 'Cardiology', 'Endocrinology', 'Pulmonology', 'Gastroenterology', 'General'],
    tags: ['preventive medicine', 'outpatient', 'screening', 'chronic disease']
  },
  {
    id: 'Internal Medicine',
    name: 'Internal Medicine',
    description: 'Adult medicine, hospital medicine, subspecialty medicine',
    icon: '🩺',
    color: 'from-tribe-sage-500 to-teal-500',
    systems: ['Cardiology', 'Pulmonology', 'Gastroenterology', 'Nephrology', 'Endocrinology', 'Hematology/Oncology', 'Infectious Disease', 'Rheumatology'],
    tags: ['internal medicine', 'inpatient', 'hospital']
  },
  {
    id: 'Surgery',
    name: 'Surgery',
    description: 'General surgery, trauma, surgical subspecialties',
    icon: '🔪',
    color: 'from-red-500 to-orange-500',
    systems: ['Surgery', 'Emergency Medicine', 'Gastroenterology'],
    tags: ['surgery', 'trauma', 'acute abdomen', 'surgical']
  },
  {
    id: 'OB/GYN',
    name: 'OB/GYN',
    description: 'Obstetrics, gynecology, reproductive health',
    icon: '🤰',
    color: 'from-pink-500 to-rose-500',
    systems: ['OB/GYN'],
    tags: ['obstetrics', 'gynecology', 'pregnancy', 'reproductive']
  },
  {
    id: 'Pediatrics',
    name: 'Pediatrics',
    description: 'Child health, development, pediatric diseases',
    icon: '👶',
    color: 'from-amber-500 to-yellow-500',
    systems: ['Pediatrics'],
    tags: ['pediatrics', 'child', 'infant', 'developmental']
  },
  {
    id: 'Psychiatry',
    name: 'Psychiatry',
    description: 'Mental health, behavioral disorders, psychopharmacology',
    icon: '🧠',
    color: 'from-purple-500 to-violet-500',
    systems: ['Psychiatry'],
    tags: ['psychiatry', 'mental health', 'depression', 'anxiety', 'psychosis']
  },
  {
    id: 'Neurology',
    name: 'Neurology',
    description: 'Neurological disorders, stroke, seizures',
    icon: '⚡',
    color: 'from-indigo-500 to-blue-500',
    systems: ['Neurology'],
    tags: ['neurology', 'stroke', 'seizure', 'headache']
  },
  {
    id: 'Family Medicine',
    name: 'Family Medicine',
    description: 'Comprehensive primary care across all ages',
    icon: '👨‍👩‍👧‍👦',
    color: 'from-green-500 to-tribe-sage-500',
    systems: ['Preventive Medicine', 'Cardiology', 'Endocrinology', 'Psychiatry', 'Pediatrics', 'General'],
    tags: ['family medicine', 'primary care', 'preventive']
  },
  {
    id: 'Emergency Medicine',
    name: 'Emergency Medicine',
    description: 'Acute care, trauma, emergency procedures',
    icon: '🚨',
    color: 'from-orange-500 to-red-500',
    systems: ['Emergency Medicine', 'Surgery', 'Cardiology', 'Neurology'],
    tags: ['emergency', 'trauma', 'acute', 'critical care']
  }
];

export default function ShelfSelectorPage() {
  const { cards, setFilters, stats } = useFlashcards();
  const [selectedExam, setSelectedExam] = useState<ShelfExam | null>(null);

  // Count cards for each exam
  const getCardCount = (exam: ShelfExam) => {
    return cards.filter(card => 
      exam.systems.includes(card.metadata.system) ||
      card.metadata.tags.some(tag => exam.tags.includes(tag.toLowerCase())) ||
      card.metadata.rotation === exam.id
    ).length;
  };

  // Handle exam selection and set filters
  const handleSelectExam = (exam: ShelfExam) => {
    setFilters({
      tags: [],
      systems: exam.systems,
      rotations: [exam.id],
      states: [],
      difficulties: []
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Choose Your Shelf Exam
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Select a rotation to focus your study session. Cards will be filtered to show only relevant content.
          </p>
        </div>

        {/* Exam Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shelfExams.map((exam) => {
            const cardCount = getCardCount(exam);
            const hasCards = cardCount > 0;
            
            return (
              <div
                key={exam.id}
                className={`
                  relative group rounded-2xl border-2 overflow-hidden transition-all duration-300
                  ${hasCards 
                    ? 'border-slate-200 hover:border-slate-300 hover:shadow-xl cursor-pointer' 
                    : 'border-slate-100 opacity-60'
                  }
                `}
              >
                {/* Gradient Header */}
                <div className={`bg-gradient-to-r ${exam.color} p-6 text-white`}>
                  <div className="flex items-center justify-between">
                    <span className="text-4xl">{exam.icon}</span>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{cardCount}</p>
                      <p className="text-sm opacity-80">cards</p>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold mt-4">{exam.name}</h2>
                </div>
                
                {/* Content */}
                <div className="bg-white p-5">
                  <p className="text-sm text-slate-600 mb-4">{exam.description}</p>
                  
                  {/* Systems covered */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {exam.systems.slice(0, 4).map(system => (
                      <span 
                        key={system}
                        className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full"
                      >
                        {system}
                      </span>
                    ))}
                    {exam.systems.length > 4 && (
                      <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-500 rounded-full">
                        +{exam.systems.length - 4} more
                      </span>
                    )}
                  </div>
                  
                  {/* Action buttons */}
                  {hasCards ? (
                    <div className="flex gap-2">
                      <Link
                        href="/flashcards"
                        onClick={() => handleSelectExam(exam)}
                        className={`flex-1 py-2.5 px-4 bg-gradient-to-r ${exam.color} text-white text-sm font-semibold rounded-xl text-center hover:opacity-90 transition-opacity`}
                      >
                        Study Now
                      </Link>
                      <Link
                        href="/rapid-review"
                        onClick={() => handleSelectExam(exam)}
                        className="py-2.5 px-4 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Rapid
                      </Link>
                    </div>
                  ) : (
                    <div className="py-2.5 px-4 bg-slate-100 text-slate-400 text-sm font-medium rounded-xl text-center">
                      No cards yet
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick actions */}
        <div className="mt-12 text-center">
          <p className="text-slate-500 mb-4">Or study all cards together:</p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/flashcards"
              className="px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
            >
              Study All Cards
            </Link>
            <Link
              href="/rapid-review"
              className="px-6 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Rapid Review All
            </Link>
          </div>
        </div>

        {/* Import hint */}
        {stats.totalCards < 50 && (
          <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-2xl text-center">
            <p className="text-blue-800 mb-3">
              <strong>Tip:</strong> Import more cards to unlock additional shelf exams!
            </p>
            <Link
              href="/import"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Import Cards
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
