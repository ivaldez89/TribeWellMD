'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useFlashcards } from '@/hooks/useFlashcards';
import type { Flashcard } from '@/types';

export default function ImportPage() {
  const { stats, addCards } = useFlashcards();
  const [jsonInput, setJsonInput] = useState('');
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    count?: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = () => {
    setIsProcessing(true);
    setImportResult(null);

    try {
      const parsed = JSON.parse(jsonInput);
      
      // Handle array of cards or object with cards property
      const cards: Flashcard[] = Array.isArray(parsed) ? parsed : parsed.cards || parsed.flashcards;
      
      if (!Array.isArray(cards) || cards.length === 0) {
        throw new Error('No valid cards found in JSON');
      }

      // Validate cards have required fields
      const validCards = cards.filter(card => 
        card.content?.front && 
        card.content?.back
      );

      if (validCards.length === 0) {
        throw new Error('No cards with valid content (front/back) found');
      }

      // Add timestamps and IDs to cards that don't have them
      const now = new Date().toISOString();
      const processedCards = validCards.map(card => ({
        ...card,
        id: card.id || crypto.randomUUID(),
        schemaVersion: card.schemaVersion || '1.0',
        createdAt: card.createdAt || now,
        updatedAt: card.updatedAt || now,
        userId: card.userId || 'demo',
        metadata: {
          tags: card.metadata?.tags || [],
          system: card.metadata?.system || 'General',
          topic: card.metadata?.topic || 'Imported',
          difficulty: card.metadata?.difficulty || 'medium',
          clinicalVignette: card.metadata?.clinicalVignette ?? true,
          rotation: card.metadata?.rotation
        },
        spacedRepetition: card.spacedRepetition || {
          state: 'new',
          interval: 0,
          ease: 2.5,
          reps: 0,
          lapses: 0,
          nextReview: now
        }
      }));

      addCards(processedCards);
      
      setImportResult({
        success: true,
        message: `Successfully imported ${processedCards.length} cards!`,
        count: processedCards.length
      });
      setJsonInput('');
    } catch (error) {
      setImportResult({
        success: false,
        message: error instanceof Error ? error.message : 'Invalid JSON format'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setJsonInput(content);
    };
    reader.readAsText(file);
  };

  const sampleFormat = `[
  {
    "content": {
      "front": "A 45-year-old man presents with...",
      "back": "Diagnosis: Example condition",
      "explanation": "Teaching point here"
    },
    "metadata": {
      "tags": ["tag1", "tag2"],
      "system": "Cardiology",
      "topic": "Heart Failure",
      "difficulty": "medium"
    }
  }
]`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <Header stats={stats} />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-[#A89070] mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Import Flashcards</h1>
          <p className="text-slate-600 mb-6">
            Add new cards to your deck without losing your study progress. Paste JSON or upload a file.
          </p>

          {/* Import Result */}
          {importResult && (
            <div className={`mb-6 p-4 rounded-xl ${
              importResult.success
                ? 'bg-[#F5F0E8] border border-[#D4C4B0]'
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-3">
                {importResult.success ? (
                  <svg className="w-6 h-6 text-[#5B7B6D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <span className={importResult.success ? 'text-[#2D5A4A]' : 'text-red-700'}>
                  {importResult.message}
                </span>
              </div>
              {importResult.success && (
                <Link
                  href="/flashcards"
                  className="inline-flex items-center gap-2 mt-3 text-[#5B7B6D] hover:text-[#2D5A4A] font-medium"
                >
                  Start studying new cards →
                </Link>
              )}
            </div>
          )}

          {/* File Upload */}
          <div className="mb-6">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload JSON File
            </button>
          </div>

          {/* JSON Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Or paste JSON directly:
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={sampleFormat}
              className="w-full h-64 p-4 font-mono text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#C4A77D] focus:border-[#C4A77D] transition-all resize-none"
            />
          </div>

          {/* Import Button */}
          <button
            onClick={handleImport}
            disabled={!jsonInput.trim() || isProcessing}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#C4A77D] to-[#A89070] hover:from-[#A89070] hover:to-[#8B7355] disabled:from-slate-300 disabled:to-slate-400 text-white font-semibold rounded-xl shadow-lg shadow-[#C4A77D]/25 disabled:shadow-none transition-all disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Importing...' : 'Import Cards'}
          </button>

          {/* Format Help */}
          <details className="mt-8">
            <summary className="cursor-pointer text-slate-600 hover:text-slate-900 font-medium">
              📋 JSON Format Reference
            </summary>
            <div className="mt-4 p-4 bg-slate-50 rounded-xl">
              <pre className="text-sm text-slate-700 overflow-x-auto">{sampleFormat}</pre>
              <div className="mt-4 text-sm text-slate-600">
                <p className="font-medium mb-2">Valid systems:</p>
                <p className="text-xs">
                  Cardiology, Pulmonology, Gastroenterology, Nephrology, Neurology, 
                  Endocrinology, Hematology/Oncology, Infectious Disease, Rheumatology, 
                  Dermatology, Psychiatry, OB/GYN, Pediatrics, Surgery, Emergency Medicine, 
                  Preventive Medicine, General
                </p>
              </div>
            </div>
          </details>
        </div>
      </main>

      <Footer />
    </div>
  );
}
