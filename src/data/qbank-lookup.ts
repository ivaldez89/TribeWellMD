// QBank Lookup Service
// Maps UWorld/AMBOSS question IDs to concept codes and flashcards

import type { ClinicalConcept, Flashcard, QBankLookupResult } from '@/types';
import { allConcepts, getConceptsByUWorldQID, getConceptsByAMBOSSCode } from './concept-taxonomy';
import { understandingCards, getCardsByUWorldQID } from './understanding-cards';

// Import the mappings extracted from AnKing
import uworldMappingData from './uworld-mapping.json';
import ambossMappingData from './amboss-mapping.json';

// Type the imported JSON
const uworldMapping: Record<string, string[]> = uworldMappingData as Record<string, string[]>;
const ambossMapping: Record<string, string[]> = ambossMappingData as Record<string, string[]>;

/**
 * Look up a UWorld question ID and get related concepts and cards
 */
export function lookupUWorldQID(qid: string): QBankLookupResult {
  // Normalize QID (remove leading zeros, etc.)
  const normalizedQid = qid.replace(/^0+/, '');

  // Get concepts that are directly mapped to this QID
  const directConcepts = getConceptsByUWorldQID(normalizedQid);

  // Get topic paths from AnKing mapping for additional context
  const ankingTopics = uworldMapping[normalizedQid] || [];

  // Get understanding-based cards linked to this QID
  const directCards = getCardsByUWorldQID(normalizedQid);

  // If we have direct concept matches, return them
  if (directConcepts.length > 0) {
    return {
      qid: normalizedQid,
      source: 'uworld',
      concepts: directConcepts,
      suggestedCards: directCards
    };
  }

  // Otherwise, try to infer concepts from AnKing topic paths
  const inferredConcepts = inferConceptsFromTopics(ankingTopics);

  return {
    qid: normalizedQid,
    source: 'uworld',
    concepts: inferredConcepts,
    suggestedCards: directCards.length > 0 ? directCards : getCardsByConcepts(inferredConcepts)
  };
}

/**
 * Look up an AMBOSS article code and get related concepts and cards
 */
export function lookupAMBOSSCode(code: string): QBankLookupResult {
  // Get concepts that are directly mapped to this code
  const directConcepts = getConceptsByAMBOSSCode(code);

  // Get topic paths from AnKing mapping
  const ankingTopics = ambossMapping[code] || [];

  // If we have direct concept matches, return them
  if (directConcepts.length > 0) {
    return {
      qid: code,
      source: 'amboss',
      concepts: directConcepts,
      suggestedCards: getCardsByConcepts(directConcepts)
    };
  }

  // Otherwise, try to infer concepts from AnKing topic paths
  const inferredConcepts = inferConceptsFromTopics(ankingTopics);

  return {
    qid: code,
    source: 'amboss',
    concepts: inferredConcepts,
    suggestedCards: getCardsByConcepts(inferredConcepts)
  };
}

/**
 * Infer relevant concepts from AnKing topic paths
 */
function inferConceptsFromTopics(topicPaths: string[]): ClinicalConcept[] {
  const matchedConcepts: ClinicalConcept[] = [];

  for (const topic of topicPaths) {
    const lowerTopic = topic.toLowerCase();

    // Check for AFib-related topics
    if (lowerTopic.includes('afib') || lowerTopic.includes('atrial_fibrillation') || lowerTopic.includes('arrhythmia')) {
      const afibConcepts = allConcepts.filter(c =>
        c.code.includes('afib') || c.topic === 'Atrial Fibrillation'
      );
      matchedConcepts.push(...afibConcepts);
    }

    // Check for heart failure topics
    if (lowerTopic.includes('heart_failure') || lowerTopic.includes('hf') || lowerTopic.includes('cardiomyopathy')) {
      const hfConcepts = allConcepts.filter(c =>
        c.code.includes('hfref') || c.topic === 'Heart Failure'
      );
      matchedConcepts.push(...hfConcepts);
    }

    // Check for hypertension topics
    if (lowerTopic.includes('hypertension') || lowerTopic.includes('blood_pressure')) {
      const htnConcepts = allConcepts.filter(c =>
        c.code.includes('htn') || c.topic === 'Hypertension'
      );
      matchedConcepts.push(...htnConcepts);
    }

    // Check for valvular disease topics
    if (lowerTopic.includes('valvular') || lowerTopic.includes('stenosis') || lowerTopic.includes('regurgitation')) {
      const valveConcepts = allConcepts.filter(c =>
        c.topic === 'Valvular Disease' || c.code.includes('valve')
      );
      matchedConcepts.push(...valveConcepts);
    }

    // Check for ACS topics
    if (lowerTopic.includes('acs') || lowerTopic.includes('myocardial_infarction') || lowerTopic.includes('stemi') || lowerTopic.includes('nstemi')) {
      const acsConcepts = allConcepts.filter(c =>
        c.code.includes('acs') || c.topic === 'Acute Coronary Syndrome'
      );
      matchedConcepts.push(...acsConcepts);
    }

    // Check for thyroid topics
    if (lowerTopic.includes('thyroid') || lowerTopic.includes('hyperthyroid')) {
      const thyroidConcepts = allConcepts.filter(c =>
        c.topic === 'Thyroid Disease' || c.code.includes('thyroid')
      );
      matchedConcepts.push(...thyroidConcepts);
    }

    // Check for diabetes topics
    if (lowerTopic.includes('diabetes') || lowerTopic.includes('dm') || lowerTopic.includes('a1c')) {
      const dmConcepts = allConcepts.filter(c =>
        c.topic === 'Diabetes Mellitus' || c.code.includes('dm-')
      );
      matchedConcepts.push(...dmConcepts);
    }

    // Check for pulmonary topics
    if (lowerTopic.includes('copd') || lowerTopic.includes('asthma') || lowerTopic.includes('pulmonary')) {
      const pulmConcepts = allConcepts.filter(c =>
        c.system === 'Pulmonology'
      );
      matchedConcepts.push(...pulmConcepts);
    }
  }

  // Deduplicate by concept code
  const uniqueConcepts = Array.from(
    new Map(matchedConcepts.map(c => [c.code, c])).values()
  );

  return uniqueConcepts;
}

/**
 * Get flashcards for a list of concepts
 */
function getCardsByConcepts(concepts: ClinicalConcept[]): Flashcard[] {
  const conceptCodes = concepts.map(c => c.code);
  return understandingCards.filter(card =>
    card.metadata.conceptCode && conceptCodes.includes(card.metadata.conceptCode)
  );
}

/**
 * Parse a QBank input string (could be UWorld QID or AMBOSS code)
 */
export function parseQBankInput(input: string): { source: 'uworld' | 'amboss' | 'unknown'; id: string } {
  const trimmed = input.trim();

  // UWorld QIDs are typically numeric
  if (/^\d+$/.test(trimmed)) {
    return { source: 'uworld', id: trimmed };
  }

  // AMBOSS codes are typically alphanumeric with specific patterns
  if (/^[A-Za-z0-9]{4,10}$/.test(trimmed)) {
    // Check if it exists in AMBOSS mapping
    if (ambossMapping[trimmed]) {
      return { source: 'amboss', id: trimmed };
    }
    // Check if it exists in UWorld mapping (some UWorld IDs are large)
    if (uworldMapping[trimmed]) {
      return { source: 'uworld', id: trimmed };
    }
  }

  return { source: 'unknown', id: trimmed };
}

/**
 * Main lookup function - automatically detects source
 */
export function lookupQBankCode(input: string): QBankLookupResult | null {
  const parsed = parseQBankInput(input);

  if (parsed.source === 'uworld') {
    return lookupUWorldQID(parsed.id);
  }

  if (parsed.source === 'amboss') {
    return lookupAMBOSSCode(parsed.id);
  }

  // Try both sources
  const uworldResult = lookupUWorldQID(parsed.id);
  if (uworldResult.concepts.length > 0 || uworldResult.suggestedCards.length > 0) {
    return uworldResult;
  }

  const ambossResult = lookupAMBOSSCode(parsed.id);
  if (ambossResult.concepts.length > 0 || ambossResult.suggestedCards.length > 0) {
    return ambossResult;
  }

  return null;
}

/**
 * Get statistics about the mapping coverage
 */
export function getMappingStats() {
  return {
    uworldQIDCount: Object.keys(uworldMapping).length,
    ambossCodeCount: Object.keys(ambossMapping).length,
    conceptCount: allConcepts.length,
    understandingCardCount: understandingCards.length
  };
}
