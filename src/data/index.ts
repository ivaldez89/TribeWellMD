// Data exports for TribeWellMD concept-based learning

// Concept taxonomy - clinical decision points
export {
  allConcepts,
  cardiologyConcepts,
  endocrinologyConcepts,
  pulmonologyConcepts,
  getConceptByCode,
  getConceptsByUWorldQID,
  getConceptsByAMBOSSCode,
  getConceptsBySystem,
  getHighYieldConcepts
} from './concept-taxonomy';

// Understanding-based flashcards
export {
  understandingCards,
  getCardsByConceptCode,
  getCardsByUWorldQID,
  getCardsBySystem
} from './understanding-cards';

// QBank lookup service
export {
  lookupUWorldQID,
  lookupAMBOSSCode,
  lookupQBankCode,
  parseQBankInput,
  getMappingStats
} from './qbank-lookup';
