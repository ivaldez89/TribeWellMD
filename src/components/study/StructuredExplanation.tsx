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

        // If still no reason found, try harder to extract something meaningful
        if (!reason) {
          // Search the entire explanation for any sentence mentioning this option
          const sentences = rawExplanation.split(/(?<=[.!?])\s+/);
          for (const sentence of sentences) {
            if (sentence.toLowerCase().includes(keyTerm.toLowerCase()) && sentence.length > 20) {
              reason = sentence.trim();
              break;
            }
          }
        }

        // Last resort: Generate medical reasoning instead of tautology
        // NEVER say "does not address the key clinical finding" - explain the medicine
        if (!reason) {
          const optionTerm = option.text.split(/[,.(]/)[0]?.trim();
          const correctOpt = options.find(o => o.label === correctAnswer);
          const correctTerm = correctOpt?.text?.split(/[,.(]/)[0]?.trim() || '';

          // Generate a clinically meaningful fallback
          reason = `${optionTerm} would be appropriate in a different clinical context. In this scenario, the presentation and findings are more consistent with a condition requiring ${correctTerm}.`;
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

// Hook to get structured explanation data for inline use
export function useStructuredExplanation(
  explanation: string,
  options: { label: string; text: string }[],
  correctAnswer: string
): StructuredExplanationData {
  return useMemo(() => {
    return parseExplanation(explanation, options, correctAnswer);
  }, [explanation, options, correctAnswer]);
}

// Inline explanation component for individual answer choices
// "Medical Professor" reasoning: Explain the medicine, not the test logic
interface InlineExplanationProps {
  label: string;
  reason: string;
  isCorrect: boolean;
  isSelected: boolean;
}

export function InlineExplanation({ label, reason, isCorrect, isSelected }: InlineExplanationProps) {
  // Clean the reason text - remove AI filler phrases and tautologies
  // STRICT RULE: Never use "does not address the key clinical finding" or "is not the correct answer"
  const cleanedReason = useMemo(() => {
    if (!reason) return '';

    return reason
      // Remove tautological phrases (test logic, not medicine)
      .replace(/\b(this is not the correct answer|this is incorrect|this is the correct answer|this is correct)\b[.,:;]?\s*/gi, '')
      .replace(/\b(incorrect because|correct because)[:\s]*/gi, '')
      .replace(/\b(the answer is|would be|represents?|indicates?)\s+(incorrect|wrong|not correct|correct)\b[.,:;]?\s*/gi, '')
      .replace(/\bdoes not address the key clinical finding[^.]*\./gi, '')
      .replace(/\bis not the (correct|best|appropriate) (answer|choice|option)[^.]*\./gi, '')
      .replace(/\bwould not be appropriate here[^.]*\./gi, '')
      .replace(/\bis incorrect in this (case|scenario|context)[^.]*\./gi, '')
      .replace(/^\s*[-–—•]\s*/, '') // Remove leading bullets
      .replace(/^(A|B|C|D|E)[\.\):\s]+/i, '') // Remove option labels at start
      .trim();
  }, [reason]);

  // Don't render if there's no meaningful content after cleaning
  if (!cleanedReason || cleanedReason.length < 10) {
    return null;
  }

  // Determine background color based on correct/incorrect/selected state
  let bgClass = 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700';
  let textClass = 'text-content-muted';

  if (isCorrect) {
    bgClass = 'bg-success/8 border-success/20';
    textClass = 'text-success';
  } else if (isSelected) {
    bgClass = 'bg-error/8 border-error/20';
    textClass = 'text-error/80';
  }

  return (
    <div className={`mt-2 ml-14 px-4 py-2.5 rounded-lg border ${bgClass} transition-all`}>
      <p className={`text-xs leading-relaxed ${textClass}`}>
        {applyMedicalBolding(cleanedReason, true)}
      </p>
    </div>
  );
}

// Clinical Pearl component - High-Yield Learning Objective
// Format: "The most effective management for [Condition] in the setting of [Finding] is [Treatment] because [Mechanism]."
// Must be a standalone fact usable on a real exam
interface LearningObjectiveProps {
  explanation: string;
  options: { label: string; text: string }[];
  correctAnswer: string;
}

export function LearningObjective({
  explanation,
  options,
  correctAnswer
}: LearningObjectiveProps) {
  const structured = useMemo(() => {
    return parseExplanation(explanation, options, correctAnswer);
  }, [explanation, options, correctAnswer]);

  // Generate a Clinical Pearl in the required format
  const clinicalPearl = useMemo(() => {
    const correctOption = options.find(o => o.label === correctAnswer);
    const correctTerm = correctOption?.text?.split(/[,.(]/)[0]?.trim() || correctAnswer;

    // Try to extract condition, finding, and mechanism from explanation
    const explanationLower = explanation.toLowerCase();

    // Extract condition (what the patient has)
    let condition = '';
    const conditionPatterns = [
      /(?:diagnosed with|has|presenting with|suffering from)\s+([^,.]+)/i,
      /(?:patient with)\s+([^,.]+)/i,
      /(?:this is|consistent with|suggests?)\s+([^,.]+)/i,
    ];
    for (const pattern of conditionPatterns) {
      const match = explanation.match(pattern);
      if (match && match[1].length < 60) {
        condition = match[1].trim();
        break;
      }
    }

    // Extract key clinical finding
    let finding = '';
    const findingPatterns = [
      /(?:in the setting of|with|showing|demonstrates?)\s+([^,.]+(?:and|,)[^,.]+|[^,.]+)/i,
      /(?:laboratory|labs?|imaging|exam)\s+(?:shows?|reveals?|demonstrates?)\s+([^,.]+)/i,
      /(?:presents? with)\s+([^,.]+)/i,
    ];
    for (const pattern of findingPatterns) {
      const match = explanation.match(pattern);
      if (match && match[1].length < 80 && match[1].length > 5) {
        finding = match[1].trim();
        break;
      }
    }

    // Extract mechanism (why this treatment works)
    let mechanism = '';
    const mechanismPatterns = [
      /(?:because|due to|as it|since it|which)\s+([^.]+)/i,
      /(?:works by|acts by|mechanism)\s+([^.]+)/i,
      /(?:by)\s+(inhibiting|blocking|activating|increasing|decreasing|reducing)\s+([^.]+)/i,
    ];
    for (const pattern of mechanismPatterns) {
      const match = explanation.match(pattern);
      if (match) {
        mechanism = match[1]?.trim() || (match[2] ? `${match[1]} ${match[2]}`.trim() : '');
        if (mechanism.length > 10 && mechanism.length < 100) break;
        mechanism = '';
      }
    }

    // Build the Clinical Pearl
    if (condition && finding && mechanism) {
      return `The most effective management for ${condition} in the setting of ${finding} is ${correctTerm} because ${mechanism}.`;
    } else if (condition && mechanism) {
      return `For ${condition}, ${correctTerm} is the treatment of choice because ${mechanism}.`;
    } else if (finding && mechanism) {
      return `When a patient presents with ${finding}, ${correctTerm} is indicated because ${mechanism}.`;
    } else if (condition) {
      return `${correctTerm} is first-line therapy for ${condition}.`;
    } else if (structured.highYieldTakeaway && structured.highYieldTakeaway.length > 20) {
      // Use existing high-yield if available and meaningful
      let pearl = structured.highYieldTakeaway
        .replace(/^(remember|key point|takeaway|high-yield|board tip)[:\s]*/i, '')
        .replace(/\b(this is|the answer is)\b/gi, '')
        .trim();
      if (pearl.length > 0) {
        pearl = pearl.charAt(0).toUpperCase() + pearl.slice(1);
      }
      return pearl;
    }

    // Fallback: Generate a usable clinical fact
    return `${correctTerm} is the appropriate choice when the clinical presentation and findings point to this diagnosis or require this intervention.`;
  }, [structured, options, correctAnswer, explanation]);

  return (
    <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
          </svg>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-amber-800 dark:text-amber-200 uppercase tracking-wide mb-1">
            Clinical Pearl
          </h4>
          <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed font-medium">
            {clinicalPearl}
          </p>
        </div>
      </div>
    </div>
  );
}

// Legacy ExplanationSummary - kept for backward compatibility but now simplified
interface ExplanationSummaryProps {
  explanation: string;
  options: { label: string; text: string }[];
  correctAnswer: string;
  isCorrect: boolean;
  cognitiveError?: string | null;
}

export function ExplanationSummary({
  explanation,
  options,
  correctAnswer,
  isCorrect,
  cognitiveError
}: ExplanationSummaryProps) {
  // Now just renders the Learning Objective - no more verbose sections
  return (
    <LearningObjective
      explanation={explanation}
      options={options}
      correctAnswer={correctAnswer}
    />
  );
}

// Main component (kept for backward compatibility, but now deprecated in favor of inline approach)
export function StructuredExplanation({
  explanation,
  options,
  correctAnswer,
  selectedAnswer,
  isCorrect,
  isAnswered,
  cognitiveError
}: StructuredExplanationProps) {
  // Use the new ExplanationSummary component
  if (!isAnswered) {
    return null;
  }

  return (
    <ExplanationSummary
      explanation={explanation}
      options={options}
      correctAnswer={correctAnswer}
      isCorrect={isCorrect}
      cognitiveError={cognitiveError}
    />
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
