'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useFlashcards } from '@/hooks/useFlashcards';
import { createClient } from '@/lib/supabase/client';
import {
  parseAPKGClient,
  convertToFlashcardsClient,
  getAPKGStatsClient,
  type ParsedAPKGClient,
  type ParsedFlashcardClient,
  type APKGStats,
} from '@/lib/apkg/client-parser';
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
  const apkgInputRef = useRef<HTMLInputElement>(null);

  // APKG specific state
  const [apkgStats, setApkgStats] = useState<APKGStats | null>(null);
  const [apkgPreview, setApkgPreview] = useState<ParsedFlashcardClient[]>([]);
  const [apkgFile, setApkgFile] = useState<File | null>(null);
  const [apkgProgress, setApkgProgress] = useState<string>('');
  const [apkgPercent, setApkgPercent] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'json' | 'anking'>('anking');

  // Store parsed data for import
  const [parsedData, setParsedData] = useState<ParsedAPKGClient | null>(null);
  const [parsedCards, setParsedCards] = useState<ParsedFlashcardClient[]>([]);

  const handleImport = () => {
    setIsProcessing(true);
    setImportResult(null);

    try {
      const parsed = JSON.parse(jsonInput);
      const cards: Flashcard[] = Array.isArray(parsed) ? parsed : parsed.cards || parsed.flashcards;

      if (!Array.isArray(cards) || cards.length === 0) {
        throw new Error('No valid cards found in JSON');
      }

      const validCards = cards.filter(card =>
        card.content?.front &&
        card.content?.back
      );

      if (validCards.length === 0) {
        throw new Error('No cards with valid content (front/back) found');
      }

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

  const handleAPKGSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size and warn for very large files
    const fileSizeGB = file.size / (1024 * 1024 * 1024);
    if (fileSizeGB > 2) {
      setImportResult({
        success: false,
        message: `File is ${fileSizeGB.toFixed(1)}GB - too large for browser processing. Please export a smaller subdeck from Anki, or export without media (uncheck "Include media" when exporting).`
      });
      return;
    }

    if (fileSizeGB > 0.5) {
      // Warn but allow for files > 500MB
      setApkgProgress('Large file detected. This may take several minutes...');
    }

    setApkgFile(file);
    setApkgStats(null);
    setApkgPreview([]);
    setParsedData(null);
    setParsedCards([]);
    setImportResult(null);
    setIsProcessing(true);
    setApkgProgress('Starting...');
    setApkgPercent(0);

    try {
      // Parse client-side (no upload to server)
      const parsed = await parseAPKGClient(file, (msg, pct) => {
        setApkgProgress(msg);
        setApkgPercent(pct);
      });

      setApkgProgress('Converting to flashcards...');
      const flashcards = convertToFlashcardsClient(parsed, (msg, pct) => {
        setApkgProgress(msg);
        setApkgPercent(80 + pct * 0.15);
      });

      const stats = getAPKGStatsClient(parsed, flashcards);

      setParsedData(parsed);
      setParsedCards(flashcards);
      setApkgStats(stats);
      setApkgPreview(flashcards.slice(0, 10));
      setApkgProgress('');
      setApkgPercent(100);
    } catch (error) {
      console.error('APKG parse error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse APKG file';

      // Provide helpful error messages
      let helpfulMessage = errorMessage;
      if (errorMessage.includes('permission') || errorMessage.includes('could not be read')) {
        helpfulMessage = 'File too large for browser memory. Please export a smaller subdeck from Anki (e.g., just Step 1 or a specific subject), or export without media.';
      } else if (errorMessage.includes('memory') || errorMessage.includes('heap')) {
        helpfulMessage = 'Browser ran out of memory. Please export a smaller subdeck from Anki, or export without media (uncheck "Include media" when exporting).';
      }

      setImportResult({
        success: false,
        message: helpfulMessage
      });
      setApkgProgress('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAPKGImport = async () => {
    if (!parsedData || !parsedCards.length) return;

    setIsProcessing(true);
    setImportResult(null);
    setApkgProgress('Checking authentication...');
    setApkgPercent(0);

    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Please log in to import cards');
      }

      // System patterns for auto-classification
      const systemPatterns: Record<string, string> = {
        'cardio': 'Cardiology',
        'pulm': 'Pulmonology',
        'gi': 'Gastroenterology',
        'renal': 'Nephrology',
        'neuro': 'Neurology',
        'endo': 'Endocrinology',
        'heme': 'Hematology/Oncology',
        'onc': 'Hematology/Oncology',
        'id': 'Infectious Disease',
        'infect': 'Infectious Disease',
        'rheum': 'Rheumatology',
        'derm': 'Dermatology',
        'psych': 'Psychiatry',
        'obgyn': 'OB/GYN',
        'repro': 'OB/GYN',
        'peds': 'Pediatrics',
        'surg': 'Surgery',
        'msk': 'Rheumatology',
        'immuno': 'Rheumatology',
      };

      const now = new Date().toISOString();
      const processedCards = [];
      let uploadedImages = 0;
      const totalImages = parsedCards.reduce((sum, c) => sum + c.imageFilenames.length, 0);

      setApkgProgress(`Processing ${parsedCards.length} cards...`);

      for (let i = 0; i < parsedCards.length; i++) {
        const card = parsedCards[i];
        const imageUrls: string[] = [];

        // Upload images for this card
        for (const filename of card.imageFilenames) {
          const imageBlob = parsedData.media.get(filename);
          if (imageBlob) {
            try {
              const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
              const contentType = ext === 'png' ? 'image/png'
                : ext === 'gif' ? 'image/gif'
                : ext === 'webp' ? 'image/webp'
                : ext === 'svg' ? 'image/svg+xml'
                : 'image/jpeg';

              const timestamp = Date.now();
              const random = Math.random().toString(36).substring(2, 8);
              const storagePath = `${user.id}/anking/${timestamp}_${random}_${filename}`;

              const { data: uploadData, error: uploadError } = await supabase.storage
                .from('images')
                .upload(storagePath, imageBlob, {
                  contentType,
                  cacheControl: '31536000',
                  upsert: false,
                });

              if (!uploadError && uploadData) {
                const { data: urlData } = supabase.storage
                  .from('images')
                  .getPublicUrl(uploadData.path);
                imageUrls.push(urlData.publicUrl);
              }

              uploadedImages++;
            } catch {
              // Skip failed images
            }
          }
        }

        // Determine system from tags
        let system = 'General';
        for (const tag of card.tags) {
          const tagLower = tag.toLowerCase();
          for (const [pattern, systemName] of Object.entries(systemPatterns)) {
            if (tagLower.includes(pattern)) {
              system = systemName;
              break;
            }
          }
          if (system !== 'General') break;
        }

        // Truncate fields to fit database column limits
        // system: VARCHAR(50), topic: VARCHAR(100), source: VARCHAR(255)
        const truncate = (str: string, maxLen: number) =>
          str.length > maxLen ? str.substring(0, maxLen - 3) + '...' : str;

        processedCards.push({
          id: crypto.randomUUID(),
          schema_version: '1.0',
          created_at: now,
          updated_at: now,
          user_id: user.id,
          front: card.front,
          back: card.back,
          explanation: card.extra || null,
          images: imageUrls,
          tags: card.tags.map(t => truncate(t, 255)), // TEXT[] but keep reasonable
          system: truncate(system, 50), // VARCHAR(50)
          topic: truncate(card.deckName, 100), // VARCHAR(100)
          difficulty: 'medium',
          is_clinical_vignette: true,
          source: 'anking', // VARCHAR(255) - no truncation needed
          sr_state: 'new',
          sr_interval: 0,
          sr_ease: 2.5,
          sr_reps: 0,
          sr_lapses: 0,
          sr_next_review: now,
          sr_stability: 0,
          sr_difficulty: 0,
        });

        // Update progress
        if (i % 50 === 0 || i === parsedCards.length - 1) {
          const cardPercent = (i / parsedCards.length) * 70;
          const imagePercent = totalImages > 0 ? (uploadedImages / totalImages) * 20 : 20;
          setApkgPercent(10 + cardPercent + imagePercent);
          setApkgProgress(`Processing cards: ${i + 1}/${parsedCards.length} (${uploadedImages} images uploaded)`);
        }
      }

      // Batch insert cards with rate limiting
      setApkgProgress('Saving cards to database...');
      const batchSize = 50; // Balanced batch size
      let insertedCount = 0;
      let failedCount = 0;

      // Helper to add delay between batches to avoid rate limiting
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      for (let i = 0; i < processedCards.length; i += batchSize) {
        const batch = processedCards.slice(i, i + batchSize);

        try {
          const { error: insertError } = await supabase
            .from('flashcards')
            .insert(batch);

          if (!insertError) {
            insertedCount += batch.length;
          } else {
            console.error('Insert error for batch starting at', i, ':', insertError);
            failedCount += batch.length;
          }
        } catch (err) {
          console.error('Network error for batch starting at', i, ':', err);
          failedCount += batch.length;
        }

        const percent = 90 + (i / processedCards.length) * 10;
        setApkgPercent(percent);
        setApkgProgress(`Saving cards: ${insertedCount} saved, ${failedCount} failed...`);

        // Small delay every 10 batches to avoid rate limiting (500 cards)
        if ((i / batchSize) % 10 === 9) {
          await delay(100);
        }
      }

      setImportResult({
        success: true,
        message: `Successfully imported ${insertedCount} cards from "${parsedData.deckName}"! (${uploadedImages} images uploaded)`,
        count: insertedCount
      });

      // Clear state
      setApkgStats(null);
      setApkgPreview([]);
      setApkgFile(null);
      setParsedData(null);
      setParsedCards([]);
      setApkgProgress('');
      setApkgPercent(0);

      if (apkgInputRef.current) {
        apkgInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to import cards'
      });
      setApkgProgress('');
    } finally {
      setIsProcessing(false);
    }
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header stats={stats} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-content-muted hover:text-secondary mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>

        <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 md:p-8">
          <h1 className="text-2xl font-bold text-secondary mb-2">Import Flashcards</h1>
          <p className="text-content-muted mb-6">
            Add new cards to your deck. Import from Anki (APKG files) or paste JSON directly.
          </p>

          {/* Tab Selector */}
          <div className="flex gap-2 mb-6 p-1 bg-surface-muted rounded-xl">
            <button
              onClick={() => setActiveTab('anking')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                activeTab === 'anking'
                  ? 'bg-white dark:bg-gray-800 text-secondary shadow-sm'
                  : 'text-content-muted hover:text-content'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Anki / AnKing
              </span>
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                activeTab === 'json'
                  ? 'bg-white dark:bg-gray-800 text-secondary shadow-sm'
                  : 'text-content-muted hover:text-content'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                JSON
              </span>
            </button>
          </div>

          {/* Import Result */}
          {importResult && (
            <div className={`mb-6 p-4 rounded-xl ${
              importResult.success
                ? 'bg-success-light border border-success/30'
                : 'bg-error-light border border-error/30'
            }`}>
              <div className="flex items-center gap-3">
                {importResult.success ? (
                  <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <span className={importResult.success ? 'text-primary' : 'text-error'}>
                  {importResult.message}
                </span>
              </div>
              {importResult.success && (
                <Link
                  href="/flashcards"
                  className="inline-flex items-center gap-2 mt-3 text-primary hover:text-primary-hover font-medium"
                >
                  Start studying new cards →
                </Link>
              )}
            </div>
          )}

          {/* AnKing/APKG Tab */}
          {activeTab === 'anking' && (
            <div>
              {/* Info Box */}
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <div className="flex gap-3">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-1">Import your Anki decks</p>
                    <p className="text-blue-700 dark:text-blue-300">
                      Upload .apkg files exported from Anki. Works with AnKing, Zanki, or any Anki deck.
                    </p>
                  </div>
                </div>
              </div>

              {/* How to Export Box */}
              <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-medium mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    How to export AnKing correctly:
                  </p>
                  <ol className="list-decimal ml-5 space-y-1 text-amber-700 dark:text-amber-300">
                    <li>In Anki, go to <strong>Browse</strong>, select all cards (Cmd+A), then <strong>File → Export</strong></li>
                    <li>Select <strong>&quot;Anki Deck Package (*.apkg)&quot;</strong> as the format</li>
                    <li>Include: <strong>&quot;Selected Notes&quot;</strong></li>
                    <li><strong className="text-amber-900 dark:text-amber-100">Check &quot;Include scheduling information&quot;</strong></li>
                    <li><strong className="text-amber-900 dark:text-amber-100">Check &quot;Support older Anki versions&quot;</strong> - REQUIRED!</li>
                    <li>Uncheck &quot;Include media&quot; to reduce file size (optional)</li>
                    <li>Click Export</li>
                  </ol>
                  <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                    <strong>Important:</strong> If you see only 1 card, make sure both &quot;Include scheduling information&quot; AND &quot;Support older Anki versions&quot; are checked.
                  </p>
                </div>
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <input
                  type="file"
                  ref={apkgInputRef}
                  onChange={handleAPKGSelect}
                  accept=".apkg"
                  className="hidden"
                />
                <button
                  onClick={() => apkgInputRef.current?.click()}
                  disabled={isProcessing}
                  className="w-full py-8 px-4 border-2 border-dashed border-border hover:border-secondary rounded-xl transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-surface-muted group-hover:bg-secondary/10 flex items-center justify-center transition-colors">
                      <svg className="w-6 h-6 text-content-muted group-hover:text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-content group-hover:text-secondary">
                        {apkgFile ? apkgFile.name : 'Click to upload .apkg file'}
                      </p>
                      <p className="text-sm text-content-muted mt-1">
                        {apkgFile ? formatFileSize(apkgFile.size) : 'Any size supported - processed locally'}
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Progress Indicator */}
              {apkgProgress && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-content-muted">{apkgProgress}</span>
                    <span className="text-sm font-medium text-content">{Math.round(apkgPercent)}%</span>
                  </div>
                  <div className="w-full h-2 bg-surface-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-info rounded-full transition-all duration-300"
                      style={{ width: `${apkgPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Preview Stats */}
              {apkgStats && !isProcessing && (
                <div className="mb-6">
                  <h3 className="font-semibold text-secondary mb-3">Deck Preview: {apkgStats.deckName}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-surface-muted rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-secondary">{apkgStats.totalNotes.toLocaleString()}</p>
                      <p className="text-sm text-content-muted">Notes</p>
                    </div>
                    <div className="bg-surface-muted rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-secondary">{apkgStats.totalCards.toLocaleString()}</p>
                      <p className="text-sm text-content-muted">Cards</p>
                    </div>
                    <div className="bg-surface-muted rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-secondary">{apkgStats.totalMedia.toLocaleString()}</p>
                      <p className="text-sm text-content-muted">Images</p>
                    </div>
                    <div className="bg-surface-muted rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-secondary">{apkgStats.uniqueTags.toLocaleString()}</p>
                      <p className="text-sm text-content-muted">Tags</p>
                    </div>
                  </div>

                  {/* Card Type Breakdown */}
                  <div className="flex gap-4 mb-4 text-sm">
                    <span className="text-content-muted">
                      <span className="font-medium text-content">{apkgStats.clozeCount.toLocaleString()}</span> cloze cards
                    </span>
                    <span className="text-content-muted">
                      <span className="font-medium text-content">{apkgStats.regularCount.toLocaleString()}</span> basic cards
                    </span>
                  </div>

                  {/* Warning for large imports */}
                  {apkgStats.totalCards > 10000 && (
                    <div className="mb-4 p-3 bg-warning-light border border-warning/30 rounded-lg">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-sm text-secondary">
                          Large deck detected! Importing {apkgStats.totalCards.toLocaleString()} cards with {apkgStats.totalMedia.toLocaleString()} images may take several minutes.
                          Please keep this tab open until complete.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Sample Tags */}
                  {apkgStats.tags.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-content-muted mb-2">Sample tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {apkgStats.tags.slice(0, 15).map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-surface-muted text-xs text-content-secondary rounded-full">
                            {tag.split('::').pop()}
                          </span>
                        ))}
                        {apkgStats.tags.length > 15 && (
                          <span className="px-2 py-1 text-xs text-content-muted">
                            +{apkgStats.tags.length - 15} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Preview Cards */}
                  {apkgPreview.length > 0 && (
                    <details className="mb-4">
                      <summary className="cursor-pointer text-content-muted hover:text-content font-medium">
                        Preview cards ({apkgPreview.length} shown)
                      </summary>
                      <div className="mt-3 space-y-3">
                        {apkgPreview.map((card, idx) => (
                          <div key={idx} className="p-4 bg-surface-muted rounded-xl">
                            <div className="mb-2">
                              <span className="text-xs font-medium text-content-muted uppercase">Front</span>
                              <p className="text-sm text-content mt-1 line-clamp-3">{card.front}</p>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-content-muted uppercase">Back</span>
                              <p className="text-sm text-content mt-1 line-clamp-3">{card.back}</p>
                            </div>
                            {card.imageFilenames.length > 0 && (
                              <div className="mt-2 text-xs text-info">
                                {card.imageFilenames.length} image(s) attached
                              </div>
                            )}
                            {card.tags.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {card.tags.slice(0, 5).map((tag, tidx) => (
                                  <span key={tidx} className="px-1.5 py-0.5 bg-border text-xs text-content-muted rounded">
                                    {tag.split('::').pop()}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}

                  {/* Import Button */}
                  <button
                    onClick={handleAPKGImport}
                    disabled={isProcessing}
                    className="w-full py-3 px-4 bg-gradient-to-r from-sand-500 to-sand-600 hover:from-sand-600 hover:to-sand-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold rounded-xl shadow-lg shadow-sand-500/25 disabled:shadow-none transition-all disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Importing...' : `Import ${apkgStats.totalCards.toLocaleString()} Cards`}
                  </button>
                </div>
              )}

              {/* Disclaimer */}
              <p className="text-xs text-content-muted mt-4">
                Your uploaded content is stored privately and only accessible by you.
                We do not redistribute or share any imported content.
              </p>
            </div>
          )}

          {/* JSON Tab */}
          {activeTab === 'json' && (
            <div>
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
                  className="inline-flex items-center gap-2 px-4 py-2 bg-surface-muted hover:bg-border text-content-secondary rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload JSON File
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-content-secondary mb-2">
                  Or paste JSON directly:
                </label>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder={sampleFormat}
                  className="w-full h-64 p-4 font-mono text-sm border border-border rounded-xl focus:ring-2 focus:ring-secondary focus:border-secondary transition-all resize-none bg-surface text-content placeholder:text-content-muted"
                />
              </div>

              <button
                onClick={handleImport}
                disabled={!jsonInput.trim() || isProcessing}
                className="w-full py-3 px-4 bg-gradient-to-r from-sand-500 to-sand-600 hover:from-sand-600 hover:to-sand-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold rounded-xl shadow-lg shadow-sand-500/25 disabled:shadow-none transition-all disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Importing...' : 'Import Cards'}
              </button>

              <details className="mt-8">
                <summary className="cursor-pointer text-content-muted hover:text-content font-medium">
                  JSON Format Reference
                </summary>
                <div className="mt-4 p-4 bg-surface-muted rounded-xl">
                  <pre className="text-sm text-content-secondary overflow-x-auto">{sampleFormat}</pre>
                  <div className="mt-4 text-sm text-content-muted">
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
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
