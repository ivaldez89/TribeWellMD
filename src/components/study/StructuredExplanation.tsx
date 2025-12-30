'use client';

import React, { useMemo } from 'react';

// Types for structured explanation data
export interface DistractorAnalysis {
  label: string; // A, B, C, D, E
  text: string;  // The option text
  reason: string; // Why this is incorrect (or correct)
  isCorrect: boolean;
}

export interface ComparisonRow {
  option: string;
  characteristic: string;
  caveat: string;
}

export interface StructuredExplanationData {
  correctAnswer: {
    label: string;
    term: string;
  };
  mechanismsAndEvidence: string;
  distractorAnalysis: DistractorAnalysis[];
  comparisonTable: ComparisonRow[];
  highYieldTakeaway: string;
}

// Keywords that should be bolded in explanations
const MEDICAL_KEYWORDS = [
  // Lab values patterns
  /\b(K\+|Na\+|Ca2\+|Mg2\+|Cl-|HCO3-|BUN|Cr|GFR|eGFR)\s*[><=≥≤]\s*[\d.]+/gi,
  /\b\d+(\.\d+)?\s*(mg|mEq|mm|g|%|\/dL|\/L|mmol|mL|μg|ng|IU|U)\/?(dL|L|min|hr|day|kg)?\b/gi,
  /\bpH\s*[><=≥≤]?\s*[\d.]+/gi,
  // Common medical terms
  /\b(hyperkalemia|hypokalemia|hypernatremia|hyponatremia|hypercalcemia|hypocalcemia)\b/gi,
  /\b(acidosis|alkalosis|metabolic|respiratory)\b/gi,
  /\b(contraindicated|first-line|second-line|gold standard)\b/gi,
  /\b(pathognomonic|sensitive|specific|positive predictive|negative predictive)\b/gi,
  // Drug classes and mechanisms
  /\b(ACE inhibitor|ARB|beta-blocker|calcium channel blocker|diuretic|thiazide|loop diuretic)\b/gi,
  /\b(NSAID|opioid|antibiotic|antifungal|antiviral|anticoagulant|antiplatelet)\b/gi,
  // Diagnostic criteria
  /\b(CURB-65|Wells score|CHADS2|CHA2DS2-VASc|MELD|Child-Pugh|APACHE)\b/gi,
  // Key pathophysiology terms
  /\b(nephrotoxic|hepatotoxic|cardiotoxic|ototoxic|neurotoxic)\b/gi,
  /\b(mechanism of action|MOA|half-life|bioavailability|clearance)\b/gi,
];

// Keywords that trigger comparison table generation
const TABLE_TRIGGER_KEYWORDS = [
  'versus', 'vs', 'compared to', 'in contrast to', 'unlike', 'whereas',
  'on the other hand', 'alternatively', 'differentiate', 'distinguish'
];

// Parse wall-of-text explanation into structured format
export function parseExplanation(
  rawExplanation: string,
  options: { label: string; text: string }[],
  correctAnswer: string
): StructuredExplanationData {
  const lines = rawExplanation.split('\n').map(l => l.trim()).filter(Boolean);

  // Find the correct option
  const correctOption = options.find(o => o.label === correctAnswer);
  const correctTerm = correctOption?.text?.split(/[,.(]/)[0]?.trim() || correctAnswer;

  // Initialize structured data
  const result: StructuredExplanationData = {
    correctAnswer: {
      label: correctAnswer,
      term: correctTerm
    },
    mechanismsAndEvidence: '',
    distractorAnalysis: [],
    comparisonTable: [],
    highYieldTakeaway: ''
  };

  // RULE 1: Force "Why Not" into vertical list - identify option-specific explanations
  let currentSection = 'mechanisms';
  const mechanismLines: string[] = [];
  const distractorMap: Map<string, string[]> = new Map();
  let highYieldLine = '';

  // Initialize distractor map for all options
  for (const opt of options) {
    distractorMap.set(opt.label, []);
  }

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    // Detect "Why not" or distractor analysis section
    if (lowerLine.includes('why not') || lowerLine.includes('incorrect because') ||
        lowerLine.includes('other options') || lowerLine.includes('wrong because') ||
        lowerLine.includes('incorrect options') || lowerLine.includes('distractor')) {
      currentSection = 'distractors';
      continue;
    }

    // Detect high-yield or takeaway section
    if (lowerLine.includes('high-yield') || lowerLine.includes('takeaway') ||
        lowerLine.includes('bottom line') || lowerLine.includes('remember') ||
        lowerLine.includes('key point') || lowerLine.includes('board tip')) {
      currentSection = 'highyield';
      continue;
    }

    // STRICT RULE 1: Force option identification for vertical list
    // Match patterns like: "A.", "A)", "Option A", "(A)", "Choice A"
    const optionPatterns = [
      /^([A-E])[\.\):\s]/i,                          // "A." or "A)" or "A:"
      /^\(([A-E])\)/i,                               // "(A)"
      /^(?:Option|Choice)\s*([A-E])[\.\):\s]?/i,     // "Option A" or "Choice A"
      /^([A-E])\s*[-–—]\s*/i,                        // "A -" or "A –"
    ];

    let matchedOption: string | null = null;
    let remainingContent = line;

    for (const pattern of optionPatterns) {
      const match = line.match(pattern);
      if (match) {
        matchedOption = match[1].toUpperCase();
        remainingContent = line.slice(match[0].length).trim();
        break;
      }
    }

    // Also check for inline mentions like "...because A is..."
    if (!matchedOption) {
      const inlineMatch = line.match(/\b([A-E])\s+(?:is|would be|represents?|indicates?)\s+(?:incorrect|wrong|not|correct)/i);
      if (inlineMatch) {
        matchedOption = inlineMatch[1].toUpperCase();
        remainingContent = line;
      }
    }

    if (matchedOption && distractorMap.has(matchedOption)) {
      distractorMap.get(matchedOption)!.push(remainingContent);
      currentSection = 'distractors';
      continue;
    }

    // Add to appropriate section
    switch (currentSection) {
      case 'mechanisms':
        mechanismLines.push(line);
        break;
      case 'highyield':
        highYieldLine = line;
        break;
      case 'distractors':
        // If we're in distractor section but no option matched,
        // try to find which option this line relates to
        for (const opt of options) {
          const optTerm = opt.text.split(/[,.(]/)[0]?.trim().toLowerCase();
          if (optTerm && lowerLine.includes(optTerm)) {
            distractorMap.get(opt.label)!.push(line);
            break;
          }
        }
        break;
    }
  }

  // Build mechanisms text
  result.mechanismsAndEvidence = mechanismLines.join(' ');

  // If no mechanisms found, use the whole explanation
  if (!result.mechanismsAndEvidence && rawExplanation) {
    result.mechanismsAndEvidence = rawExplanation;
  }

  // RULE 1: Build distractor analysis with forced vertical separation
  for (const option of options) {
    const isCorrect = option.label === correctAnswer;
    const specificReasons = distractorMap.get(option.label) || [];
    let reason = specificReasons.join(' ');

    if (!reason) {
      // Generate a default reason based on whether it's correct or not
      if (isCorrect) {
        const shortExplanation = result.mechanismsAndEvidence.length > 150
          ? result.mechanismsAndEvidence.slice(0, 150) + '...'
          : result.mechanismsAndEvidence;
        reason = `Correct. ${shortExplanation}`;
      } else {
        // Try to extract why this option is wrong from the main explanation
        const optionText = option.text.toLowerCase();
        const keyTerm = optionText.split(/[,.(]/)[0]?.trim();

        if (keyTerm) {
          // Search for mentions of this option in the explanation
          const regex = new RegExp(`${keyTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^.]*\\.`, 'gi');
          const mentions = rawExplanation.match(regex);
          if (mentions && mentions.length > 0) {
            reason = mentions[0];
          }
        }

        if (!reason) {
          reason = `Not the best answer for this clinical scenario.`;
        }
      }
    }

    result.distractorAnalysis.push({
      label: option.label,
      text: option.text,
      reason,
      isCorrect
    });
  }

  // RULE 3: Auto-generate comparison table if trigger keywords found
  const shouldGenerateTable = TABLE_TRIGGER_KEYWORDS.some(kw =>
    rawExplanation.toLowerCase().includes(kw)
  );

  if (shouldGenerateTable) {
    result.comparisonTable = extractComparisonTable(rawExplanation, options);
  }

  // Also check for list-like patterns that suggest comparison
  // Use a multiline-compatible pattern without the 's' flag for broader compatibility
  const hasListPattern = /(\d+\.\s|-\s|•\s|[A-E]\.\s)[\s\S]+(\d+\.\s|-\s|•\s|[A-E]\.\s)/.test(rawExplanation);
  if (hasListPattern && result.comparisonTable.length === 0) {
    result.comparisonTable = extractComparisonTable(rawExplanation, options);
  }

  // Extract or generate high-yield takeaway
  if (highYieldLine) {
    result.highYieldTakeaway = highYieldLine;
  } else {
    // Generate from the correct answer explanation
    const keyContext = extractKeyContext(rawExplanation);
    result.highYieldTakeaway = `${result.correctAnswer.term} is the answer when ${keyContext}`;
  }

  return result;
}

// RULE 3: Extract comparison table data when keywords trigger it
function extractComparisonTable(explanation: string, options: { label: string; text: string }[]): ComparisonRow[] {
  const rows: ComparisonRow[] = [];

  // Look for drug/condition mentions and their characteristics
  for (const option of options) {
    const term = option.text.split(/[,.(]/)[0]?.trim();
    if (!term) continue;

    // Escape special regex characters in the term
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Try to find characteristics mentioned for this term
    const patterns = [
      new RegExp(`${escapedTerm}[^.]*\\b(causes?|leads? to|results? in|produces?)\\b[^.]*\\.`, 'gi'),
      new RegExp(`${escapedTerm}[^.]*\\b(is|are|was|were)\\b[^.]*\\.`, 'gi'),
      new RegExp(`${escapedTerm}[^.]*\\b(associated with|characterized by|indicated for)\\b[^.]*\\.`, 'gi'),
      new RegExp(`${escapedTerm}[^.]*\\b(contraindicated|avoid|should not)\\b[^.]*\\.`, 'gi'),
    ];

    for (const regex of patterns) {
      const matches = explanation.match(regex);
      if (matches && matches.length > 0) {
        let characteristic = matches[0]
          .replace(new RegExp(`^${escapedTerm}\\s*`, 'i'), '')
          .trim();

        // Truncate if too long
        if (characteristic.length > 120) {
          characteristic = characteristic.slice(0, 117) + '...';
        }

        // Extract caveat if present
        let caveat = '';
        const caveatMatch = matches[0].match(/\b(avoid|caution|contraindicated|not use)[^.]*$/i);
        if (caveatMatch) {
          caveat = caveatMatch[0];
        }

        rows.push({
          option: term,
          characteristic,
          caveat
        });
        break; // One entry per option
      }
    }
  }

  return rows.slice(0, 5); // Limit to 5 rows
}

// Extract key context for high-yield takeaway
function extractKeyContext(explanation: string): string {
  const contextPatterns = [
    /patient with ([^.]{10,80})/i,
    /in the setting of ([^.]{10,80})/i,
    /presenting with ([^.]{10,80})/i,
    /diagnosed with ([^.]{10,60})/i,
    /history of ([^.]{10,60})/i,
    /signs of ([^.]{10,60})/i,
  ];

  for (const pattern of contextPatterns) {
    const match = explanation.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return 'this clinical presentation';
}

// RULE 2: Apply bolding to medical terms - ONLY when isAnswered is true
// This function is called conditionally in the component
export function applyMedicalBolding(text: string, shouldBold: boolean): React.ReactNode {
  if (!text) return null;

  // RULE 2: If shouldBold is false, return plain text without any bolding
  if (!shouldBold) {
    return text;
  }

  const boldedTerms: { start: number; end: number; term: string }[] = [];

  // Find all terms that should be bolded
  for (const pattern of MEDICAL_KEYWORDS) {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    while ((match = regex.exec(text)) !== null) {
      boldedTerms.push({
        start: match.index,
        end: match.index + match[0].length,
        term: match[0]
      });
    }
  }

  // Sort by start position and remove overlaps
  boldedTerms.sort((a, b) => a.start - b.start);
  const filtered: typeof boldedTerms = [];
  let lastEnd = -1;
  for (const term of boldedTerms) {
    if (term.start >= lastEnd) {
      filtered.push(term);
      lastEnd = term.end;
    }
  }

  // Build React nodes
  if (filtered.length === 0) {
    return text;
  }

  const nodes: React.ReactNode[] = [];
  let currentIndex = 0;

  for (let i = 0; i < filtered.length; i++) {
    const term = filtered[i];
    // Add text before this term
    if (term.start > currentIndex) {
      nodes.push(<span key={`text-${i}`}>{text.slice(currentIndex, term.start)}</span>);
    }
    // Add bolded term - ONLY applies when shouldBold is true (checked above)
    nodes.push(
      <strong key={`bold-${term.start}`} className="text-secondary font-semibold">
        {term.term}
      </strong>
    );
    currentIndex = term.end;
  }

  // Add remaining text
  if (currentIndex < text.length) {
    nodes.push(<span key="text-final">{text.slice(currentIndex)}</span>);
  }

  return <>{nodes}</>;
}

// Props for the component
interface StructuredExplanationProps {
  explanation: string;
  options: { label: string; text: string }[];
  correctAnswer: string;
  selectedAnswer: string | null;
  isCorrect: boolean;
  isAnswered: boolean; // RULE 2: Controls bolding - must be true for bolding to apply
  cognitiveError?: string | null;
}

// Main component
export function StructuredExplanation({
  explanation,
  options,
  correctAnswer,
  selectedAnswer,
  isCorrect,
  isAnswered, // RULE 2: Bolding only applies when this is true
  cognitiveError
}: StructuredExplanationProps) {
  // Parse the explanation into structured format
  const structured = useMemo(() => {
    return parseExplanation(explanation, options, correctAnswer);
  }, [explanation, options, correctAnswer]);

  // Don't render anything if not answered yet
  if (!isAnswered) {
    return null;
  }

  return (
    <div className="space-y-5">
      {/* Result Header */}
      <div className={`flex items-center gap-3 pb-4 border-b ${isCorrect ? 'border-success/30' : 'border-warning/30'}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isCorrect ? 'bg-success/20' : 'bg-warning/20'
        }`}>
          {isCorrect ? (
            <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
        </div>
        <div>
          <p className={`text-sm font-medium ${isCorrect ? 'text-success' : 'text-warning'}`}>
            {isCorrect ? 'Correct!' : 'Incorrect'}
          </p>
          <p className="text-xs text-content-muted">
            {isCorrect
              ? 'Great job identifying the right answer'
              : `The correct answer was ${structured.correctAnswer.label}. ${structured.correctAnswer.term}`
            }
          </p>
        </div>
      </div>

      {/* The Correct Answer */}
      <div>
        <h4 className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          The Correct Answer
        </h4>
        <div className="p-3 rounded-xl bg-success/5 border border-success/20">
          <p className="text-sm text-secondary">
            <strong className="font-semibold">{structured.correctAnswer.label}. {structured.correctAnswer.term}</strong>
          </p>
        </div>
      </div>

      {/* Mechanisms & Evidence */}
      <div>
        <h4 className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Mechanisms & Evidence
        </h4>
        <div className="p-4 rounded-xl bg-surface-muted/50">
          <p className="text-sm text-secondary leading-relaxed">
            {/* RULE 2: Pass isAnswered to control bolding */}
            {applyMedicalBolding(structured.mechanismsAndEvidence, isAnswered)}
          </p>
        </div>
      </div>

      {/* RULE 1: Why Not - Distractor Analysis - VERTICAL LIST with line breaks */}
      <div>
        <h4 className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Why Not the Others?
        </h4>
        {/* RULE 1: Vertical list with clear separation - each option on its own line */}
        <div className="flex flex-col gap-3">
          {structured.distractorAnalysis.map((distractor) => {
            const isSelected = selectedAnswer === distractor.label;
            const bgClass = distractor.isCorrect
              ? 'bg-success/5 border-success/30'
              : isSelected
                ? 'bg-error/5 border-error/30'
                : 'bg-surface-muted/30 border-border/50';

            return (
              <div
                key={distractor.label}
                className={`p-3 rounded-xl border ${bgClass} transition-all`}
              >
                {/* RULE 1: Each option A-E on its own line with clear visual separation */}
                <div className="flex flex-col gap-2">
                  {/* Option header line */}
                  <div className="flex items-center gap-3">
                    <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      distractor.isCorrect
                        ? 'bg-success/20 text-success'
                        : isSelected
                          ? 'bg-error/20 text-error'
                          : 'bg-border text-content-muted'
                    }`}>
                      {distractor.label}
                    </span>
                    <p className="text-sm font-medium text-secondary flex-1">
                      {distractor.text}
                    </p>
                    {distractor.isCorrect && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-success/20 text-success font-medium">
                        Correct
                      </span>
                    )}
                    {isSelected && !distractor.isCorrect && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-error/20 text-error font-medium">
                        Your Answer
                      </span>
                    )}
                  </div>
                  {/* Reason line - separate from header for clarity */}
                  <div className="pl-11">
                    <p className="text-xs leading-relaxed">
                      {distractor.isCorrect ? (
                        <span className="text-success">
                          {applyMedicalBolding(distractor.reason, isAnswered)}
                        </span>
                      ) : (
                        <span className="text-content-muted">
                          {applyMedicalBolding(distractor.reason, isAnswered)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RULE 3: Comparison Table - Auto-generated when trigger keywords found */}
      {structured.comparisonTable.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Quick Comparison
          </h4>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-content-muted uppercase tracking-wide border-b border-border">
                    Option
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-content-muted uppercase tracking-wide border-b border-border">
                    Key Characteristic
                  </th>
                  {structured.comparisonTable.some(r => r.caveat) && (
                    <th className="px-4 py-3 text-left text-xs font-semibold text-content-muted uppercase tracking-wide border-b border-border">
                      Clinical Caveat
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {structured.comparisonTable.map((row, idx) => (
                  <tr key={idx} className="hover:bg-surface-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-secondary whitespace-nowrap">
                      {row.option}
                    </td>
                    <td className="px-4 py-3 text-content-muted">
                      {applyMedicalBolding(row.characteristic, isAnswered)}
                    </td>
                    {structured.comparisonTable.some(r => r.caveat) && (
                      <td className="px-4 py-3 text-content-muted text-xs">
                        {row.caveat ? applyMedicalBolding(row.caveat, isAnswered) : '—'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* High-Yield Takeaway */}
      {structured.highYieldTakeaway && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
          <h4 className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            High-Yield Takeaway
          </h4>
          <p className="text-sm text-secondary font-medium leading-relaxed">
            {applyMedicalBolding(structured.highYieldTakeaway, isAnswered)}
          </p>
        </div>
      )}

      {/* Cognitive Error (if provided) */}
      {cognitiveError && (
        <div className="p-3 rounded-xl bg-warning/5 border border-warning/20">
          <h4 className="text-xs font-semibold text-warning uppercase tracking-wide mb-1 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Common Cognitive Error
          </h4>
          <p className="text-xs text-content-muted">{cognitiveError}</p>
        </div>
      )}
    </div>
  );
}

// Export types for use in database migration
export interface QuestionExplanationSchema {
  // Current simple format
  explanation: string;

  // Proposed JSONB fields for cleaner data
  explanation_structured?: {
    correct_answer_logic: string;
    distractor_analysis: {
      [key: string]: string; // A: "reason", B: "reason", etc.
    };
    comparison_data?: {
      option: string;
      characteristic: string;
      caveat: string;
    }[];
    high_yield: string;
  };
}

/*
================================================================================
DATABASE MIGRATION RECOMMENDATION
================================================================================

If the current 'explanation' column contains inconsistent wall-of-text data,
consider adding a JSONB column to store structured explanations:

-- Migration SQL:
ALTER TABLE questions ADD COLUMN IF NOT EXISTS explanation_structured JSONB;

-- The JSONB structure would be:
{
  "correct_answer_logic": "Detailed explanation of why the correct answer is right...",
  "distractor_analysis": {
    "A": "Why A is incorrect: ...",
    "B": "Why B is incorrect: ...",
    "C": "Why C is incorrect: ...",
    "D": "Why D is incorrect: ...",
    "E": "Why E is correct because..."
  },
  "comparison_data": [
    { "option": "Drug A", "characteristic": "Causes X", "caveat": "Avoid in Y" },
    { "option": "Drug B", "characteristic": "Causes Z", "caveat": "Use in W" }
  ],
  "high_yield": "The key takeaway for boards is..."
}

-- Example insert:
UPDATE questions SET explanation_structured = '{
  "correct_answer_logic": "ACE inhibitors are first-line for diabetic nephropathy because they reduce intraglomerular pressure and slow progression of proteinuria.",
  "distractor_analysis": {
    "A": "Incorrect. Calcium channel blockers do not provide the same renoprotective effects as ACE inhibitors in diabetic patients.",
    "B": "Incorrect. Beta-blockers are not first-line for diabetic nephropathy and may mask hypoglycemia symptoms.",
    "C": "Correct. ACE inhibitors reduce proteinuria and slow CKD progression in diabetic nephropathy.",
    "D": "Incorrect. Thiazides are less effective in patients with reduced GFR.",
    "E": "Incorrect. Alpha-blockers have no proven benefit in diabetic nephropathy."
  },
  "comparison_data": [
    { "option": "ACE inhibitor", "characteristic": "Reduces intraglomerular pressure", "caveat": "Monitor K+ and Cr" },
    { "option": "ARB", "characteristic": "Similar renoprotection", "caveat": "Alternative if ACE-I not tolerated" }
  ],
  "high_yield": "ACE inhibitors are first-line for diabetic nephropathy due to their proven renoprotective effects independent of blood pressure lowering."
}'::jsonb WHERE id = 'question-uuid';

This allows the UI to reliably render structured content without parsing.
The old 'explanation' column can be kept for backward compatibility.

To populate, you can:
1. Manually update questions with structured data
2. Use AI (Claude API) to parse existing explanations into the new format
3. Gradually migrate as questions are edited

================================================================================
*/
