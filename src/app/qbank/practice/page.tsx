'use client';

import { useState, useEffect, useMemo, useCallback, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { BackgroundSelector, useStudyBackground, getBackgroundUrl } from '@/components/study/BackgroundSelector';
import {
  ExplanationSummary,
  useStructuredExplanation,
  InlineExplanation,
  type StructuredExplanationData
} from '@/components/study/StructuredExplanation';
import { QuestionNavigationGrid } from '@/components/study/QuestionNavigationGrid';
import { LabReferencePanel } from '@/components/study/LabReferencePanel';
import { createClient } from '@/lib/supabase/client';

// Question type matching Supabase schema
interface Question {
  id: string;
  question_id: string;
  concept_id: string;
  batch: string;
  system: string;
  stem: string;
  options: { label: string; text: string }[];
  correct_answer: string;
  explanation: string;
  cognitive_error: string | null;
}

interface QuestionState {
  selectedAnswer: string | null;
  isSubmitted: boolean;
  isCorrect: boolean | null;
}

// Ambient sound definitions
const AMBIENT_SOUNDS = [
  { id: 'whitenoise', name: 'White Noise', icon: 'radio' },
  { id: 'pinknoise', name: 'Pink Noise', icon: 'waves' },
  { id: 'brownnoise', name: 'Brown Noise', icon: 'sound' },
  { id: 'rain', name: 'Rain', icon: 'cloud' },
  { id: 'wind', name: 'Wind', icon: 'wind' },
  { id: 'binaural', name: 'Focus 40Hz', icon: 'brain' },
];

// Study music streams
const MUSIC_STREAMS = [
  { id: 'lofi', name: 'Lofi Hip Hop', icon: 'headphones', url: 'https://streams.ilovemusic.de/iloveradio17.mp3' },
  { id: 'classical', name: 'Classical', icon: 'music', url: 'https://live.musopen.org:8085/streamvbr0' },
  { id: 'piano', name: 'Piano', icon: 'piano', url: 'https://streams.ilovemusic.de/iloveradio28.mp3' },
  { id: 'jazz', name: 'Jazz', icon: 'jazz', url: 'https://streaming.radio.co/s774887f7b/listen' },
  { id: 'ambient', name: 'Ambient', icon: 'ambient', url: 'https://streams.ilovemusic.de/iloveradio6.mp3' },
  { id: 'chillout', name: 'Chill Out', icon: 'coffee', url: 'https://streams.ilovemusic.de/iloveradio7.mp3' },
];

// Noise generator using Web Audio API
class NoiseGenerator {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private isPlaying = false;

  start(type: string, volume: number) {
    this.stop();
    this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = volume;
    this.gainNode.connect(this.audioContext.destination);

    switch (type) {
      case 'whitenoise': this.createWhiteNoise(); break;
      case 'pinknoise': this.createPinkNoise(); break;
      case 'brownnoise': this.createBrownNoise(); break;
      case 'rain': this.createRain(); break;
      case 'wind': this.createWind(); break;
      case 'binaural': this.createBinaural(); break;
    }
    this.isPlaying = true;
  }

  private createWhiteNoise() {
    if (!this.audioContext || !this.gainNode) return;
    const bufferSize = 2 * this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
    this.noiseNode = this.audioContext.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;
    this.noiseNode.connect(this.gainNode);
    this.noiseNode.start();
  }

  private createPinkNoise() {
    if (!this.audioContext || !this.gainNode) return;
    const bufferSize = 2 * this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    this.noiseNode = this.audioContext.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;
    this.noiseNode.connect(this.gainNode);
    this.noiseNode.start();
  }

  private createBrownNoise() {
    if (!this.audioContext || !this.gainNode) return;
    const bufferSize = 2 * this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }
    this.noiseNode = this.audioContext.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;
    this.noiseNode.connect(this.gainNode);
    this.noiseNode.start();
  }

  private createRain() {
    if (!this.audioContext || !this.gainNode) return;
    const bufferSize = 2 * this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
      if (Math.random() > 0.9997) output[i] += (Math.random() - 0.5) * 0.3;
    }
    this.noiseNode = this.audioContext.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 3000;
    this.noiseNode.connect(filter);
    filter.connect(this.gainNode);
    this.noiseNode.start();
  }

  private createWind() {
    if (!this.audioContext || !this.gainNode) return;
    const bufferSize = 4 * this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      const mod = 0.7 + 0.3 * Math.sin(i / (this.audioContext!.sampleRate * 3));
      output[i] *= 3.5 * mod;
    }
    this.noiseNode = this.audioContext.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    this.noiseNode.connect(filter);
    filter.connect(this.gainNode);
    this.noiseNode.start();
  }

  private createBinaural() {
    if (!this.audioContext || !this.gainNode) return;
    const baseFreq = 200;
    const beatFreq = 40;
    const leftOsc = this.audioContext.createOscillator();
    const rightOsc = this.audioContext.createOscillator();
    leftOsc.frequency.value = baseFreq;
    rightOsc.frequency.value = baseFreq + beatFreq;
    leftOsc.type = 'sine';
    rightOsc.type = 'sine';
    const leftPan = this.audioContext.createStereoPanner();
    const rightPan = this.audioContext.createStereoPanner();
    leftPan.pan.value = -1;
    rightPan.pan.value = 1;
    leftOsc.connect(leftPan);
    rightOsc.connect(rightPan);
    leftPan.connect(this.gainNode);
    rightPan.connect(this.gainNode);
    leftOsc.start();
    rightOsc.start();
    this.oscillators = [leftOsc, rightOsc];
  }

  setVolume(volume: number) {
    if (this.gainNode) this.gainNode.gain.value = volume;
  }

  stop() {
    if (this.noiseNode) { this.noiseNode.stop(); this.noiseNode.disconnect(); this.noiseNode = null; }
    this.oscillators.forEach(osc => { osc.stop(); osc.disconnect(); });
    this.oscillators = [];
    if (this.gainNode) { this.gainNode.disconnect(); this.gainNode = null; }
    if (this.audioContext) { this.audioContext.close(); this.audioContext = null; }
    this.isPlaying = false;
  }

  getIsPlaying() { return this.isPlaying; }
}

// Format question stem with proper styling for lab values
// Labs are displayed as a clean, simple table without background colors
function formatStem(stem: string): React.ReactNode {
  const lines = stem.split('\n');
  const elements: React.ReactNode[] = [];
  let inLabSection = false;
  let labValues: string[] = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (trimmed.toLowerCase().includes('laboratory') || trimmed.toLowerCase().includes('lab studies') || trimmed.toLowerCase().includes('studies show')) {
      inLabSection = true;
      elements.push(
        <p key={`line-${idx}`} className="mt-4 mb-2 text-xs font-semibold text-content-muted uppercase tracking-wide">
          {trimmed}
        </p>
      );
      return;
    }

    const isLabValue = inLabSection && (
      trimmed.includes(':') ||
      /\d+\s*(mg|mEq|mm|g|%|\/dL|\/L|pH)/i.test(trimmed) ||
      trimmed.startsWith('•') ||
      trimmed.startsWith('-') ||
      trimmed.startsWith('*')
    );

    if (isLabValue && trimmed.length > 0) {
      const cleanValue = trimmed.replace(/^[•\-\*]\s*/, '');
      if (cleanValue.length > 0) labValues.push(cleanValue);
    } else {
      if (labValues.length > 0) {
        // Render labs as a clean table (no background colors per request)
        elements.push(
          <div key={`lab-${idx}`} className="my-4">
            <table className="w-full text-sm border-collapse">
              <tbody>
                {labValues.map((val, i) => {
                  const parts = val.split(':');
                  if (parts.length === 2) {
                    return (
                      <tr key={i} className="border-b border-border/50 last:border-0">
                        <td className="py-1.5 pr-4 text-content-muted">{parts[0].trim()}</td>
                        <td className="py-1.5 text-right font-medium text-secondary tabular-nums">{parts[1].trim()}</td>
                      </tr>
                    );
                  }
                  return (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td colSpan={2} className="py-1.5 text-content-muted">{val}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        labValues = [];
        inLabSection = false;
      }

      if (trimmed.length > 0) {
        const isQuestion = /^(which|what|how|why|the most|the next|the best|the primary|the initial)/i.test(trimmed);
        if (isQuestion) {
          elements.push(
            <p key={`line-${idx}`} className="mt-6 pt-4 border-t border-border text-base font-medium text-secondary">
              {trimmed}
            </p>
          );
        } else {
          elements.push(
            <p key={`line-${idx}`} className="mb-3 text-base text-secondary leading-relaxed">
              {trimmed}
            </p>
          );
        }
      }
    }
  });

  if (labValues.length > 0) {
    elements.push(
      <div key="lab-final" className="my-4">
        <table className="w-full text-sm border-collapse">
          <tbody>
            {labValues.map((val, i) => {
              const parts = val.split(':');
              if (parts.length === 2) {
                return (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-1.5 pr-4 text-content-muted">{parts[0].trim()}</td>
                    <td className="py-1.5 text-right font-medium text-secondary tabular-nums">{parts[1].trim()}</td>
                  </tr>
                );
              }
              return (
                <tr key={i} className="border-b border-border/50 last:border-0">
                  <td colSpan={2} className="py-1.5 text-content-muted">{val}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return <div className="space-y-0">{elements}</div>;
}

// Answer Options Component with Inline Explanations
interface AnswerOptionsProps {
  question: Question;
  currentState: QuestionState | null;
  urlMode: string;
  onSelectAnswer: (label: string) => void;
  onSubmit: () => void;
}

function AnswerOptionsWithExplanations({
  question,
  currentState,
  urlMode,
  onSelectAnswer,
  onSubmit
}: AnswerOptionsProps) {
  // Get structured explanation data using the hook
  const structured = useStructuredExplanation(
    question.explanation,
    question.options,
    question.correct_answer
  );

  const isSubmitted = currentState?.isSubmitted || false;
  const isTutorMode = urlMode === 'tutor';

  // Find the distractor analysis for each option
  const getOptionExplanation = (label: string) => {
    return structured.distractorAnalysis.find(d => d.label === label);
  };

  return (
    <div className="bg-surface rounded-2xl shadow-xl shadow-border/50 border border-border p-6 md:p-8 mb-6">
      <div className="space-y-4">
        {question.options.map((option) => {
          const isSelected = currentState?.selectedAnswer === option.label;
          const isCorrect = option.label === question.correct_answer;
          const optionExplanation = getOptionExplanation(option.label);

          // Container styling
          let containerClass = 'bg-surface border-border hover:border-primary/50';
          let bubbleClass = 'border-border-strong text-content-muted';

          if (isSubmitted) {
            if (isCorrect) {
              containerClass = 'bg-success/5 border-success';
              bubbleClass = 'bg-success border-success text-white';
            } else if (isSelected) {
              containerClass = 'bg-error/5 border-error';
              bubbleClass = 'bg-error border-error text-white';
            } else {
              containerClass = 'bg-surface-muted/50 border-border opacity-70';
            }
          } else if (isSelected) {
            containerClass = 'bg-primary/5 border-primary';
            bubbleClass = 'bg-primary border-primary text-white';
          }

          return (
            <div key={option.label} className="space-y-0">
              {/* Answer Choice Button */}
              <button
                onClick={() => onSelectAnswer(option.label)}
                disabled={isSubmitted}
                className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${containerClass} ${isSubmitted ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 font-medium transition-all ${bubbleClass}`}>
                  {isSubmitted && isCorrect ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isSubmitted && isSelected && !isCorrect ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    option.label
                  )}
                </div>
                <p className={`flex-1 pt-2 text-base leading-relaxed ${isSubmitted && !isCorrect && !isSelected ? 'text-content-muted' : 'text-secondary'}`}>
                  {option.text}
                </p>
              </button>

              {/* Inline Explanation - Shown directly beneath each choice after submission */}
              {isSubmitted && isTutorMode && optionExplanation && (
                <InlineExplanation
                  label={option.label}
                  reason={optionExplanation.reason}
                  isCorrect={isCorrect}
                  isSelected={isSelected}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Button - Always 100% visible and sticky once a selection is made */}
      {!isSubmitted && currentState?.selectedAnswer && (
        <div className="sticky bottom-4 mt-6 z-30">
          <button
            onClick={onSubmit}
            className="w-full py-4 rounded-xl font-semibold text-lg transition-all transform opacity-100 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] ring-2 ring-primary/30"
          >
            Submit Answer
          </button>
        </div>
      )}

      {/* Summary Section - Mechanisms & High-Yield at the bottom */}
      {isSubmitted && isTutorMode && (
        <div className="mt-8 pt-6 border-t border-border">
          <ExplanationSummary
            explanation={question.explanation}
            options={question.options}
            correctAnswer={question.correct_answer}
            isCorrect={currentState?.isCorrect || false}
            cognitiveError={question.cognitive_error}
          />
        </div>
      )}
    </div>
  );
}

function QBankPracticeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState<Record<string, QuestionState>>({});
  const [isMarked, setIsMarked] = useState<Record<string, boolean>>({});
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  // Study background state
  const { selectedBackground, setSelectedBackground, opacity, setOpacity } = useStudyBackground();

  // Audio state
  const [showAudio, setShowAudio] = useState(false);
  const [currentSound, setCurrentSound] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const noiseGenRef = useRef<NoiseGenerator | null>(null);
  const audioPanelRef = useRef<HTMLDivElement>(null);
  const audioButtonRef = useRef<HTMLButtonElement>(null);

  // Labs reference modal state
  const [showLabsReference, setShowLabsReference] = useState(false);

  // Music stream state
  const [currentMusic, setCurrentMusic] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMusicLoading, setIsMusicLoading] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.3);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Timer state for timed mode
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const urlMode = searchParams.get('mode') || 'tutor';
  const isTimed = urlMode === 'timed';

  // Get filters from URL params
  const urlBatches = searchParams.get('batches')?.split(',').filter(Boolean) || [];
  const urlSystems = searchParams.get('systems')?.split(',').filter(Boolean) || [];
  const urlCount = parseInt(searchParams.get('count') || '0', 10);

  // Initialize noise generator
  useEffect(() => {
    noiseGenRef.current = new NoiseGenerator();
    return () => { if (noiseGenRef.current) noiseGenRef.current.stop(); };
  }, []);

  // Initialize audio element for music
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = musicVolume;
    audioRef.current.preload = 'auto';
    const audio = audioRef.current;
    const handleCanPlay = () => setIsMusicLoading(false);
    const handleWaiting = () => setIsMusicLoading(true);
    const handlePlaying = () => setIsMusicLoading(false);
    const handleError = () => { setIsMusicLoading(false); setIsMusicPlaying(false); };
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('error', handleError);
    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Update sound volume
  useEffect(() => {
    if (noiseGenRef.current && isPlaying) noiseGenRef.current.setVolume(volume);
  }, [volume, isPlaying]);

  // Update music volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = musicVolume;
  }, [musicVolume]);

  // Close audio panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (showAudio && audioPanelRef.current && audioButtonRef.current &&
          !audioPanelRef.current.contains(event.target as Node) &&
          !audioButtonRef.current.contains(event.target as Node)) {
        setShowAudio(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAudio]);

  // Fetch questions from Supabase
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const supabase = createClient();
        let query = supabase.from('questions').select('*').eq('status', 'active');
        if (urlBatches.length > 0) query = query.in('batch', urlBatches);
        if (urlSystems.length > 0) query = query.in('system', urlSystems);
        query = query.order('batch').order('question_id');
        const { data, error } = await query;
        if (error) { setError(error.message); return; }
        let filteredData = data || [];
        if (urlCount > 0 && filteredData.length > urlCount) {
          filteredData = filteredData.sort(() => Math.random() - 0.5).slice(0, urlCount);
        }
        setQuestions(filteredData);
        if (isTimed && filteredData.length > 0) setTimeRemaining(90);
      } catch (err) {
        console.error('Failed to load questions:', err);
        setError('Failed to load questions');
      } finally {
        setIsLoading(false);
      }
    }
    fetchQuestions();
  }, []);

  // Timer effect
  useEffect(() => {
    if (!isTimed || isPaused || timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) { handleSubmit(); return 90; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimed, isPaused, timeRemaining, currentIndex]);

  // Keyboard shortcuts effect (for Labs reference modal and Escape to close)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setShowLabsReference(prev => !prev);
      }

      if (e.key === 'Escape' && showLabsReference) {
        setShowLabsReference(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showLabsReference]);

  const filteredQuestions = questions;
  const currentQuestion = filteredQuestions[currentIndex];
  const currentState = currentQuestion ? questionStates[currentQuestion.id] : null;

  // Play/pause ambient sound
  const playSound = useCallback((soundId: string) => {
    if (!noiseGenRef.current) return;
    if (audioRef.current && isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
      setCurrentMusic(null);
    }
    if (currentSound === soundId && isPlaying) {
      noiseGenRef.current.stop();
      setIsPlaying(false);
    } else {
      noiseGenRef.current.stop();
      noiseGenRef.current.start(soundId, volume);
      setCurrentSound(soundId);
      setIsPlaying(true);
    }
  }, [currentSound, isPlaying, volume, isMusicPlaying]);

  // Play/pause music stream
  const playMusic = useCallback((musicId: string) => {
    if (!audioRef.current) return;
    if (noiseGenRef.current && isPlaying) {
      noiseGenRef.current.stop();
      setIsPlaying(false);
      setCurrentSound(null);
    }
    if (currentMusic === musicId && isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
      setIsMusicLoading(false);
    } else {
      const stream = MUSIC_STREAMS.find(s => s.id === musicId);
      if (stream) {
        setIsMusicLoading(true);
        setCurrentMusic(musicId);
        audioRef.current.src = stream.url;
        audioRef.current.play().then(() => setIsMusicPlaying(true)).catch(() => { setIsMusicLoading(false); setIsMusicPlaying(false); });
      }
    }
  }, [currentMusic, isMusicPlaying, isPlaying]);

  const stopAll = useCallback(() => {
    if (noiseGenRef.current) noiseGenRef.current.stop();
    setIsPlaying(false);
    setCurrentSound(null);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
    setIsMusicPlaying(false);
    setCurrentMusic(null);
  }, []);

  // Handle answer selection
  const handleSelectAnswer = useCallback((label: string) => {
    if (!currentQuestion || currentState?.isSubmitted) return;
    setQuestionStates(prev => ({
      ...prev,
      [currentQuestion.id]: { selectedAnswer: label, isSubmitted: false, isCorrect: null }
    }));
  }, [currentQuestion, currentState?.isSubmitted]);

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (!currentQuestion || !questionStates[currentQuestion.id]?.selectedAnswer) return;
    const isCorrect = questionStates[currentQuestion.id].selectedAnswer === currentQuestion.correct_answer;
    setQuestionStates(prev => ({
      ...prev,
      [currentQuestion.id]: { ...prev[currentQuestion.id], isSubmitted: true, isCorrect }
    }));
    if (isTimed) setTimeRemaining(90);
  }, [currentQuestion, questionStates, isTimed]);

  // Toggle mark for review
  const toggleMark = useCallback(() => {
    if (!currentQuestion) return;
    setIsMarked(prev => ({ ...prev, [currentQuestion.id]: !prev[currentQuestion.id] }));
  }, [currentQuestion]);

  // Navigation
  const goToNext = useCallback(() => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      if (isTimed) setTimeRemaining(90);
    }
  }, [currentIndex, filteredQuestions.length, isTimed]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      if (isTimed) setTimeRemaining(90);
    }
  }, [currentIndex, isTimed]);

  // Stats
  const answeredCount = filteredQuestions.filter(q => questionStates[q.id]?.isSubmitted).length;
  const correctCount = filteredQuestions.filter(q => questionStates[q.id]?.isCorrect === true).length;

  const handleEndSession = () => {
    // Save test results to localStorage
    const testResult = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      shelves: urlBatches,
      systems: urlSystems,
      questionCount: filteredQuestions.length,
      answeredCount,
      correctCount,
      mode: urlMode as 'tutor' | 'timed'
    };

    try {
      const stored = localStorage.getItem('qbank-previous-tests');
      const previousTests = stored ? JSON.parse(stored) : [];
      // Add new test at the beginning, keep only last 20
      const updatedTests = [testResult, ...previousTests].slice(0, 20);
      localStorage.setItem('qbank-previous-tests', JSON.stringify(updatedTests));
    } catch (e) {
      console.error('Failed to save test result:', e);
    }

    stopAll();
    router.push('/qbank');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-secondary font-medium">Loading questions...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center p-4" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="bg-surface rounded-2xl shadow-xl p-8 max-w-md text-center">
            <div className="w-16 h-16 bg-error-light rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-secondary mb-2">Error Loading Questions</h2>
            <p className="text-content-muted mb-6">{error}</p>
            <button onClick={() => router.push('/qbank')} className="px-6 py-3 bg-gradient-to-r from-sand-500 to-sand-600 hover:from-sand-600 hover:to-sand-700 text-white font-medium rounded-xl transition-colors">
              Back to QBank
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No questions
  if (filteredQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center p-4" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="bg-surface rounded-2xl shadow-xl p-8 max-w-md text-center">
            <div className="w-16 h-16 bg-surface-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-content-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-secondary mb-2">No Questions Found</h3>
            <p className="text-content-muted text-sm mb-4">Adjust your filters to see questions.</p>
            <Link href="/qbank" className="text-primary hover:underline text-sm">Back to QBank</Link>
          </div>
        </div>
      </div>
    );
  }

  // Paused overlay
  if (isPaused) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center p-4" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="bg-surface rounded-2xl shadow-xl p-8 max-w-md text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-secondary mb-2">Session Paused</h3>
            <p className="text-content-muted text-sm mb-6">Your timer is paused. Click resume to continue.</p>
            <button onClick={() => setIsPaused(false)} className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-xl transition-all">
              Resume Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Consolidated Header with Practice Session Info */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface dark:bg-primary backdrop-blur-md border-b border-border-light shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Back button + Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/qbank" onClick={() => stopAll()} className="p-2 -ml-2 text-content-muted hover:text-secondary hover:bg-surface-muted rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <Link href="/home" className="flex items-center gap-2 group flex-shrink-0">
                <div className="w-8 h-8 rounded-lg shadow-soft group-hover:shadow-soft-md transition-shadow overflow-hidden">
                  <img src="/logo.jpeg" alt="TribeWellMD" className="w-full h-full object-cover" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-base font-bold text-content dark:text-primary-foreground">Tribe</span>
                  <span className="text-base font-bold text-primary dark:text-white">Well</span>
                  <span className="text-base font-light text-info dark:text-primary-foreground">MD</span>
                </div>
              </Link>
            </div>

            {/* Center: Question # and Timer */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Question Number */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-muted dark:bg-white/10 rounded-lg">
                <span className="text-xs text-content-muted dark:text-primary-foreground/70 hidden sm:inline">Question</span>
                <span className="font-bold text-secondary dark:text-white tabular-nums">
                  {currentIndex + 1}<span className="text-content-muted dark:text-primary-foreground/60 font-normal">/{filteredQuestions.length}</span>
                </span>
              </div>

              {/* Timer for timed mode */}
              {isTimed && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-muted dark:bg-white/10 rounded-lg">
                  <svg className="w-4 h-4 text-content-muted dark:text-primary-foreground/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className={`font-mono font-bold tabular-nums ${timeRemaining <= 10 ? 'text-error' : 'text-secondary dark:text-white'}`}>
                    {formatTime(timeRemaining)}
                  </span>
                  <button onClick={() => setIsPaused(true)} className="text-content-muted hover:text-secondary dark:text-primary-foreground/70 dark:hover:text-white">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Right: Tools (Labs, Audio, Scene) + Mobile Nav */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Mobile-only Question Navigator Grid */}
              <div className="lg:hidden">
                <QuestionNavigationGrid
                  totalQuestions={filteredQuestions.length}
                  currentIndex={currentIndex}
                  questionStates={questionStates}
                  isMarked={isMarked}
                  questionIds={filteredQuestions.map(q => q.id)}
                  onNavigate={setCurrentIndex}
                />
              </div>

              {/* Labs Reference button - toggles sidebar */}
              <button
                onClick={() => setShowLabsReference(!showLabsReference)}
                className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  showLabsReference
                    ? 'bg-sand-100 dark:bg-sand-900/40 text-sand-700 dark:text-sand-300'
                    : 'text-content-muted hover:text-secondary hover:bg-surface-muted dark:text-primary-foreground/70 dark:hover:text-white dark:hover:bg-white/10'
                }`}
                title="Lab Reference (L)"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
                <span className="hidden sm:inline">Labs</span>
              </button>

              {/* Audio dropdown */}
              <div className="relative">
                <button
                  ref={audioButtonRef}
                  onClick={() => setShowAudio(!showAudio)}
                  className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    showAudio || isPlaying || isMusicPlaying
                      ? 'bg-surface-muted dark:bg-white/20 text-secondary dark:text-white'
                      : 'text-content-muted hover:text-secondary hover:bg-surface-muted dark:text-primary-foreground/70 dark:hover:text-white dark:hover:bg-white/10'
                  }`}
                >
                  {isPlaying || isMusicPlaying ? (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-secondary dark:bg-white rounded-full animate-pulse" />
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    </span>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  )}
                  <span className="hidden sm:inline">Audio</span>
                </button>

                {/* Audio dropdown panel */}
                {showAudio && (
                  <div ref={audioPanelRef} className="absolute top-full right-0 mt-2 w-80 bg-surface rounded-xl shadow-xl border border-border z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-border-light flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                        <span className="font-semibold text-secondary">Audio</span>
                      </div>
                      {(isPlaying || isMusicPlaying) && (
                        <button onClick={stopAll} className="text-xs px-2 py-1 bg-error-light text-error rounded-lg hover:bg-error/20 transition-colors">Stop</button>
                      )}
                    </div>
                    <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                      <div>
                        <h4 className="text-xs font-semibold text-content-muted uppercase tracking-wide mb-2">Ambient Sounds</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {AMBIENT_SOUNDS.map((sound) => (
                            <button key={sound.id} onClick={() => playSound(sound.id)} className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all text-center ${currentSound === sound.id && isPlaying ? 'bg-surface-muted border-2 border-secondary shadow-sm' : 'bg-surface-muted/50 hover:bg-surface-muted border-2 border-transparent'}`}>
                              <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                              </svg>
                              <span className="text-xs font-medium text-secondary leading-tight">{sound.name}</span>
                              {currentSound === sound.id && isPlaying && <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />}
                            </button>
                          ))}
                        </div>
                        {isPlaying && (
                          <div className="flex items-center gap-2 mt-3 px-1">
                            <span className="text-xs text-content-muted">Vol</span>
                            <input type="range" min="0" max="1" step="0.05" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="flex-1 h-1.5 bg-surface-muted rounded-lg appearance-none cursor-pointer accent-secondary" />
                            <span className="text-xs text-content-muted w-8">{Math.round(volume * 100)}%</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-content-muted uppercase tracking-wide mb-2">Study Music</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {MUSIC_STREAMS.map((music) => (
                            <button key={music.id} onClick={() => playMusic(music.id)} disabled={isMusicLoading && currentMusic !== music.id} className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all text-center ${currentMusic === music.id && (isMusicPlaying || isMusicLoading) ? 'bg-surface-muted border-2 border-secondary shadow-sm' : 'bg-surface-muted/50 hover:bg-surface-muted border-2 border-transparent'} ${isMusicLoading && currentMusic !== music.id ? 'opacity-50' : ''}`}>
                              <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                              </svg>
                              <span className="text-xs font-medium text-secondary leading-tight">{music.name}</span>
                              {currentMusic === music.id && isMusicLoading && <span className="w-3 h-3 border-2 border-secondary border-t-transparent rounded-full animate-spin" />}
                              {currentMusic === music.id && isMusicPlaying && !isMusicLoading && <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />}
                            </button>
                          ))}
                        </div>
                        {isMusicPlaying && (
                          <div className="flex items-center gap-2 mt-3 px-1">
                            <span className="text-xs text-content-muted">Vol</span>
                            <input type="range" min="0" max="1" step="0.05" value={musicVolume} onChange={(e) => setMusicVolume(parseFloat(e.target.value))} className="flex-1 h-1.5 bg-surface-muted rounded-lg appearance-none cursor-pointer accent-secondary" />
                            <span className="text-xs text-content-muted w-8">{Math.round(musicVolume * 100)}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Scene selector */}
              <BackgroundSelector
                selectedBackground={selectedBackground}
                opacity={opacity}
                onBackgroundChange={setSelectedBackground}
                onOpacityChange={setOpacity}
                variant="light"
              />
            </div>
          </div>
        </div>
      </header>
      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Background */}
      {selectedBackground !== 'none' && (
        <div
          className="fixed inset-0 bg-no-repeat transition-opacity duration-500 pointer-events-none"
          style={{
            top: '64px',
            backgroundImage: `url(${getBackgroundUrl(selectedBackground)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: opacity,
            zIndex: 0
          }}
        />
      )}

      {/* Left Sidebar - Persistent Question Navigation - Single Column */}
      <aside className="fixed left-0 top-[64px] bottom-0 w-14 bg-surface border-r border-border z-20 overflow-y-auto hidden lg:block">
        <div className="p-2">
          <div className="text-[10px] font-semibold text-content-muted text-center mb-2 uppercase tracking-wide">Q's</div>
          <div className="flex flex-col gap-1">
            {filteredQuestions.map((q, idx) => {
              const state = questionStates[q.id];
              const marked = isMarked[q.id];
              const isCurrent = idx === currentIndex;

              // Determine button style based on state
              let buttonClass = 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600';

              if (state?.isSubmitted) {
                if (state.isCorrect) {
                  buttonClass = 'bg-green-500 text-white hover:bg-green-600';
                } else {
                  buttonClass = 'bg-red-500 text-white hover:bg-red-600';
                }
              } else if (marked) {
                buttonClass = 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/60';
              }

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-10 h-8 mx-auto rounded-lg font-medium text-xs transition-all flex items-center justify-center ${buttonClass} ${
                    isCurrent ? 'ring-2 ring-blue-500 ring-offset-1 ring-offset-surface' : ''
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          {/* Compact Legend */}
          <div className="mt-3 pt-2 border-t border-border space-y-1">
            <div className="flex items-center justify-center gap-1 text-[9px] text-content-muted">
              <span className="w-2 h-2 rounded bg-green-500" />
              <span className="w-2 h-2 rounded bg-red-500" />
              <span className="w-2 h-2 rounded bg-yellow-400" />
            </div>
          </div>
        </div>
      </aside>

      {/* End session confirmation modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-secondary mb-2">End Session?</h3>
            <p className="text-sm text-content-muted mb-4">
              You've answered {answeredCount} of {filteredQuestions.length} questions.
              {answeredCount > 0 && ` Score: ${Math.round((correctCount / answeredCount) * 100)}%`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowEndConfirm(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-surface-muted text-content-secondary hover:bg-border transition-all">Continue</button>
              <button onClick={handleEndSession} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-error/10 text-error hover:bg-error/20 transition-all">End Session</button>
            </div>
          </div>
        </div>
      )}

      {/* Main content - responsive split-screen layout */}
      <main className={`relative z-[1] px-4 py-6 lg:pl-20 transition-all duration-300 ${
        showLabsReference
          ? 'lg:pr-[400px]'
          : 'max-w-4xl mx-auto'
      }`}>
        {/* Question Presentation Card */}
        <div className="bg-surface rounded-2xl shadow-xl shadow-border/50 border border-border overflow-hidden mb-6">
          {/* Card header */}
          <div className="px-6 py-4 border-b border-border bg-surface-muted/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-secondary">Question</h2>
                <p className="text-xs text-content-muted">{currentQuestion?.system}</p>
              </div>
            </div>
            <button
              onClick={toggleMark}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                currentQuestion && isMarked[currentQuestion.id]
                  ? 'bg-warning/10 text-warning'
                  : 'text-content-muted hover:bg-surface-muted'
              }`}
            >
              <svg className="w-4 h-4" fill={currentQuestion && isMarked[currentQuestion.id] ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
              <span className="hidden sm:inline">{currentQuestion && isMarked[currentQuestion.id] ? 'Flagged' : 'Flag'}</span>
            </button>
          </div>

          {/* Question content - labs are formatted inline via formatStem */}
          <div className="p-6 md:p-8">
            {formatStem(currentQuestion.stem)}
          </div>
        </div>

        {/* Answer Options Card with Inline Explanations */}
        <AnswerOptionsWithExplanations
          question={currentQuestion}
          currentState={currentState}
          urlMode={urlMode}
          onSelectAnswer={handleSelectAnswer}
          onSubmit={handleSubmit}
        />

        {/* Navigation */}
        <div className="bg-surface rounded-2xl shadow-xl shadow-border/50 border border-border p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                currentIndex === 0 ? 'text-content-muted cursor-not-allowed' : 'text-secondary hover:bg-surface-muted'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            {/* Progress indicator - simplified since we have the grid above */}
            <div className="hidden sm:flex items-center gap-3 text-sm text-content-muted">
              <span className="tabular-nums font-medium text-secondary">
                {currentIndex + 1} / {filteredQuestions.length}
              </span>
              {answeredCount > 0 && (
                <span className="flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  {correctCount}
                  <span className="w-2 h-2 rounded-full bg-error ml-1" />
                  {answeredCount - correctCount}
                </span>
              )}
            </div>

            <button
              onClick={currentIndex === filteredQuestions.length - 1 ? () => setShowEndConfirm(true) : goToNext}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                currentIndex === filteredQuestions.length - 1
                  ? 'bg-gradient-to-r from-sand-500 to-sand-600 hover:from-sand-600 hover:to-sand-700 text-white'
                  : 'bg-primary hover:bg-primary-hover text-white'
              }`}
            >
              {currentIndex === filteredQuestions.length - 1 ? 'Finish' : 'Next'}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </main>

      {/* Keyboard shortcuts */}
      <div className="fixed bottom-4 left-0 right-0 text-center pointer-events-none z-10">
        <p className="inline-block px-4 py-2 bg-surface/90 backdrop-blur rounded-full text-xs text-content-muted shadow-sm">
          <kbd className="px-1.5 py-0.5 bg-surface-muted rounded font-mono">A-E</kbd> select
          <span className="mx-1.5">•</span>
          <kbd className="px-1.5 py-0.5 bg-surface-muted rounded font-mono">Enter</kbd> submit
          <span className="mx-1.5">•</span>
          <kbd className="px-1.5 py-0.5 bg-surface-muted rounded font-mono">L</kbd> labs
        </p>
      </div>

      {/* Labs Reference Panel - Right Sidebar */}
      <LabReferencePanel
        isOpen={showLabsReference}
        onClose={() => setShowLabsReference(false)}
      />
    </div>
  );
}

export default function QBankPracticePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-secondary font-medium">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <QBankPracticeContent />
    </Suspense>
  );
}
