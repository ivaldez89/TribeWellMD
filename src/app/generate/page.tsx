'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ContentPageLayout } from '@/components/layout/PageLayout';
import { useFlashcards } from '@/hooks/useFlashcards';
import type { Flashcard, MedicalSystem } from '@/types';

interface GeneratedCard {
  front: string;
  back: string;
  explanation?: string;
  system?: string;
  topic?: string;
}

export default function GeneratePage() {
  const { stats, addCards } = useFlashcards();

  const [input, setInput] = useState('');
  const [topic, setTopic] = useState('');
  const [system, setSystem] = useState('General');
  const [rotation, setRotation] = useState('Step 2 CK');
  const [cardStyle, setCardStyle] = useState<'qa' | 'cloze' | 'clinical'>('qa');
  const [numCards, setNumCards] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState(0);

  const SYSTEMS = [
    'General',
    'Cardiovascular',
    'Respiratory',
    'Gastrointestinal',
    'Renal',
    'Neurology',
    'Endocrine',
    'Hematology/Oncology',
    'Infectious Disease',
    'Rheumatology',
    'Dermatology',
    'Psychiatry',
    'Obstetrics/Gynecology',
    'Pediatrics',
    'Surgery',
    'Emergency Medicine',
    'Musculoskeletal',
  ];

  const ROTATIONS = [
    'Step 2 CK',
    'Internal Medicine',
    'Surgery',
    'Pediatrics',
    'Obstetrics/Gynecology',
    'Psychiatry',
    'Family Medicine',
    'Neurology',
    'Emergency Medicine',
  ];

  // Map UI system names to MedicalSystem type
  const systemMap: Record<string, MedicalSystem> = {
    'General': 'General',
    'Cardiovascular': 'Cardiology',
    'Respiratory': 'Pulmonology',
    'Gastrointestinal': 'Gastroenterology',
    'Renal': 'Nephrology',
    'Neurology': 'Neurology',
    'Endocrine': 'Endocrinology',
    'Hematology/Oncology': 'Hematology/Oncology',
    'Infectious Disease': 'Infectious Disease',
    'Rheumatology': 'Rheumatology',
    'Dermatology': 'Dermatology',
    'Psychiatry': 'Psychiatry',
    'Obstetrics/Gynecology': 'OB/GYN',
    'Pediatrics': 'Pediatrics',
    'Surgery': 'Surgery',
    'Emergency Medicine': 'Emergency Medicine',
    'Musculoskeletal': 'General',
  };

  const generatePrompt = () => {
    const styleInstructions = {
      qa: 'Create question and answer pairs. Questions should test understanding, not just recall.',
      cloze: 'Create "fill in the blank" style cards where the answer completes a key fact or concept.',
      clinical: 'Create clinical vignette style questions similar to USMLE Step 2 CK format with patient presentations.',
    };

    return `You are a medical education expert creating high-yield flashcards for USMLE Step 2 CK preparation.

INPUT CONTENT:
${input}

${topic ? `SPECIFIC TOPIC FOCUS: ${topic}` : ''}

INSTRUCTIONS:
- Create exactly ${numCards} flashcards
- ${styleInstructions[cardStyle]}
- Focus on clinically relevant, high-yield information
- Make questions specific and unambiguous
- Answers should be concise but complete
- Include a brief explanation for complex concepts
- Categorize under system: ${system}

OUTPUT FORMAT:
Return a JSON array of flashcard objects. Each object must have:
- "front": the question or prompt (string)
- "back": the answer (string)
- "explanation": optional brief explanation or clinical pearl (string or null)
- "topic": specific subtopic within ${system} (string)

Example format:
[
  {
    "front": "A 45-year-old man presents with crushing chest pain radiating to his left arm. ECG shows ST elevation in leads V1-V4. What is the most likely diagnosis?",
    "back": "Anterior STEMI (ST-elevation myocardial infarction)",
    "explanation": "ST elevation in V1-V4 indicates anterior wall involvement, typically from LAD occlusion.",
    "topic": "Acute Coronary Syndrome"
  }
]

Return ONLY the JSON array, no other text.`;
  };

  const handleGenerate = async () => {
    if (!input.trim()) {
      setError('Please enter some content to generate cards from.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedCards([]);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: generatePrompt(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate cards');
      }

      const data = await response.json();

      // Parse the response - Claude should return JSON
      let cards: GeneratedCard[];
      try {
        // Handle if response is already parsed or is a string
        if (typeof data.content === 'string') {
          // Clean up the response - remove markdown code blocks if present
          let cleanContent = data.content.trim();
          if (cleanContent.startsWith('```json')) {
            cleanContent = cleanContent.slice(7);
          }
          if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.slice(3);
          }
          if (cleanContent.endsWith('```')) {
            cleanContent = cleanContent.slice(0, -3);
          }
          cards = JSON.parse(cleanContent.trim());
        } else {
          cards = data.content;
        }
      } catch (parseError) {
        console.error('Parse error:', parseError);
        throw new Error('Failed to parse generated cards. Please try again.');
      }

      if (!Array.isArray(cards)) {
        throw new Error('Invalid response format. Please try again.');
      }

      setGeneratedCards(cards);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveCards = async () => {
    if (generatedCards.length === 0) return;

    const now = new Date().toISOString();
    const mappedSystem = systemMap[system] || 'General';

    const cardsToAdd: Flashcard[] = generatedCards.map((card, index) => ({
      id: `gen-${Date.now()}-${index}`,
      schemaVersion: '1.0',
      userId: 'local-user',
      createdAt: now,
      updatedAt: now,
      content: {
        front: card.front,
        back: card.back,
        explanation: card.explanation || undefined,
      },
      metadata: {
        tags: ['ai-generated'],
        system: mappedSystem,
        topic: card.topic || topic || 'General',
        difficulty: 'medium',
        clinicalVignette: cardStyle === 'clinical',
        source: 'ai_generated',
      },
      spacedRepetition: {
        state: 'new',
        interval: 0,
        ease: 2.5,
        reps: 0,
        lapses: 0,
        nextReview: now,
        stability: 0,
        difficulty: 0,
      },
    }));

    // Await the addCards call to ensure persistence completes
    await addCards(cardsToAdd);
    setSavedCount(cardsToAdd.length);
    setGeneratedCards([]);
    setInput('');
    setTopic('');
  };

  const handleRemoveCard = (index: number) => {
    setGeneratedCards(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditCard = (index: number, field: 'front' | 'back' | 'explanation', value: string) => {
    setGeneratedCards(prev => prev.map((card, i) =>
      i === index ? { ...card, [field]: value } : card
    ));
  };

  return (
    <ContentPageLayout maxWidth="lg">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-content-muted hover:text-content transition-colors mb-4">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sand-500 to-sand-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-secondary">AI Card Generator</h1>
              <p className="text-content-muted">Paste lecture notes or describe a topic to generate flashcards</p>
            </div>
          </div>
        </div>

        {/* AI Disclaimer */}
        <div className="mb-6 p-4 bg-warning-light border border-warning/30 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-secondary text-sm">Important: Review AI-Generated Content</h3>
              <p className="text-content-muted text-sm mt-1">
                AI-generated flashcards may contain errors or inaccuracies. <strong>Always verify medical content</strong> before studying.
                For accuracy you can trust, use our <Link href="/library" className="underline font-medium text-primary hover:text-primary-hover">built-in decks</Link> or
                carefully review cards you create yourself.
              </p>
              <p className="text-content-muted/70 text-xs mt-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Enhanced AI models coming soon
              </p>
            </div>
          </div>
        </div>

        {/* Success message */}
        {savedCount > 0 && (
          <div className="mb-6 p-4 bg-success-light border border-success/30 rounded-xl flex items-center gap-3">
            <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-content">
              Successfully added {savedCount} cards to your deck!{' '}
              <Link href="/flashcards" className="underline font-medium text-primary hover:text-primary-hover">Start studying →</Link>
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Content Input */}
            <div className="bg-surface rounded-2xl border border-border p-6">
              <label className="block text-sm font-semibold text-secondary mb-2">
                Lecture Notes / Content
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your lecture notes, textbook content, or describe a topic you want to study...

Example:
- Paste a paragraph about heart failure management
- Copy notes from your pathology lecture
- Write 'Common causes of acute pancreatitis and their management'"
                className="w-full h-48 px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-secondary focus:border-secondary resize-none text-content bg-surface placeholder:text-content-muted"
              />
              <p className="mt-2 text-xs text-content-muted">
                {input.length} characters • More detail = better cards
              </p>
            </div>

            {/* Options */}
            <div className="bg-surface rounded-2xl border border-border p-6">
              <h3 className="font-semibold text-secondary mb-4">Card Settings</h3>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Topic Focus */}
                <div>
                  <label className="block text-sm font-medium text-content-secondary mb-1">
                    Topic Focus (optional)
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Heart Failure"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary text-sm bg-surface text-content placeholder:text-content-muted"
                  />
                </div>

                {/* System */}
                <div>
                  <label className="block text-sm font-medium text-content-secondary mb-1">
                    System
                  </label>
                  <select
                    value={system}
                    onChange={(e) => setSystem(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary text-sm bg-surface text-content"
                  >
                    {SYSTEMS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Rotation */}
                <div>
                  <label className="block text-sm font-medium text-content-secondary mb-1">
                    Rotation
                  </label>
                  <select
                    value={rotation}
                    onChange={(e) => setRotation(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary text-sm bg-surface text-content"
                  >
                    {ROTATIONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* Number of Cards */}
                <div>
                  <label className="block text-sm font-medium text-content-secondary mb-1">
                    Number of Cards
                  </label>
                  <select
                    value={numCards}
                    onChange={(e) => setNumCards(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary text-sm bg-surface text-content"
                  >
                    <option value={5}>5 cards</option>
                    <option value={10}>10 cards</option>
                    <option value={15}>15 cards</option>
                    <option value={20}>20 cards</option>
                    <option value={25}>25 cards</option>
                  </select>
                </div>
              </div>

              {/* Card Style */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-content-secondary mb-2">
                  Card Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'qa', label: 'Q&A', desc: 'Standard question/answer' },
                    { id: 'cloze', label: 'Fill-in', desc: 'Complete the blank' },
                    { id: 'clinical', label: 'Clinical', desc: 'USMLE vignette style' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setCardStyle(style.id as typeof cardStyle)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        cardStyle === style.id
                          ? 'border-secondary bg-secondary-light'
                          : 'border-border hover:border-border-focus'
                      }`}
                    >
                      <p className={`font-medium text-sm ${cardStyle === style.id ? 'text-secondary' : 'text-content'}`}>
                        {style.label}
                      </p>
                      <p className="text-xs text-content-muted">{style.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !input.trim()}
              className="w-full py-4 bg-gradient-to-r from-sand-500 to-sand-600 hover:from-sand-600 hover:to-sand-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold rounded-xl shadow-lg shadow-sand-500/25 disabled:shadow-none transition-all flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating Cards...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate {numCards} Cards
                </>
              )}
            </button>

            {/* Error */}
            {error && (
              <div className="p-4 bg-error-light border border-error/30 rounded-xl text-error text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-secondary">
                Generated Cards ({generatedCards.length})
              </h3>
              {generatedCards.length > 0 && (
                <button
                  onClick={handleSaveCards}
                  className="px-4 py-2 bg-gradient-to-r from-forest-500 to-forest-600 hover:from-forest-600 hover:to-forest-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save All to Deck
                </button>
              )}
            </div>

            {generatedCards.length === 0 ? (
              <div className="bg-surface rounded-2xl border border-border p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-muted flex items-center justify-center">
                  <svg className="w-8 h-8 text-content-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-content-muted">Generated cards will appear here</p>
                <p className="text-sm text-content-muted/70 mt-1">You can edit them before saving</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {generatedCards.map((card, index) => (
                  <div key={index} className="bg-surface rounded-xl border border-border overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-surface-muted border-b border-border">
                      <span className="text-sm font-medium text-content-secondary">Card {index + 1}</span>
                      <button
                        onClick={() => handleRemoveCard(index)}
                        className="text-content-muted hover:text-error transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-content-muted mb-1">Question</label>
                        <textarea
                          value={card.front}
                          onChange={(e) => handleEditCard(index, 'front', e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none focus:ring-2 focus:ring-secondary focus:border-secondary bg-surface text-content"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-content-muted mb-1">Answer</label>
                        <textarea
                          value={card.back}
                          onChange={(e) => handleEditCard(index, 'back', e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none focus:ring-2 focus:ring-secondary focus:border-secondary bg-surface text-content"
                          rows={2}
                        />
                      </div>
                      {card.explanation && (
                        <div>
                          <label className="block text-xs font-medium text-content-muted mb-1">Explanation</label>
                          <textarea
                            value={card.explanation}
                            onChange={(e) => handleEditCard(index, 'explanation', e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none focus:ring-2 focus:ring-secondary focus:border-secondary bg-warning-light text-content"
                            rows={2}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
    </ContentPageLayout>
  );
}
