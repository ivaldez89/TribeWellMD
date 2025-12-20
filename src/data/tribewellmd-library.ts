// TribeWellMD Pre-Built Card Library
// Organized by Shelf Exam > Topic > Subtopic
// All cards are understanding-based with clinical decision points ("passwords")

import type { Flashcard, MedicalSystem, Rotation, Difficulty } from '@/types';
import { allConcepts, ClinicalConcept } from './concept-taxonomy';

// Library category structure
export interface CardCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  subcategories?: CardSubcategory[];
}

export interface CardSubcategory {
  id: string;
  name: string;
  description: string;
  conceptCodes: string[]; // Links to concept-taxonomy codes
  cardCount?: number;
}

// ============================================================================
// SHELF EXAM CATEGORIES
// ============================================================================

export const shelfCategories: CardCategory[] = [
  {
    id: 'internal-medicine',
    name: 'Internal Medicine',
    description: 'Adult inpatient medicine, subspecialties, and hospital medicine',
    icon: '🩺',
    color: 'from-emerald-500 to-teal-500',
    subcategories: [
      {
        id: 'im-cardiology',
        name: 'Cardiology',
        description: 'Heart failure, arrhythmias, valvular disease, ACS',
        conceptCodes: ['afib-anticoag-threshold', 'afib-rate-vs-rhythm', 'afib-cardioversion-timing', 'afib-doac-vs-warfarin', 'hfref-gdmt-mortality', 'hfref-contraindications', 'htn-treatment-threshold', 'htn-first-line-agents', 'acs-stemi-door-to-balloon', 'acs-dual-antiplatelet', 'as-intervention-threshold', 'valve-mechanical-anticoag']
      },
      {
        id: 'im-pulmonology',
        name: 'Pulmonology',
        description: 'COPD, asthma, PE, respiratory failure',
        conceptCodes: ['copd-gold-inhaler', 'asthma-step-therapy', 'pe-wells-dimer']
      },
      {
        id: 'im-gastroenterology',
        name: 'Gastroenterology',
        description: 'GI bleeding, liver disease, IBD',
        conceptCodes: ['gerd-alarm-features', 'pud-hpylori-treatment', 'gi-bleed-management', 'cirrhosis-variceal-bleed', 'cirrhosis-sbp-prophylaxis', 'ibd-crohn-vs-uc']
      },
      {
        id: 'im-nephrology',
        name: 'Nephrology',
        description: 'AKI, CKD, electrolytes, dialysis',
        conceptCodes: ['aki-prerenal-intrinsic', 'ckd-progression-acei', 'hyperkalemia-ekg-treatment', 'hyponatremia-algorithm']
      },
      {
        id: 'im-endocrinology',
        name: 'Endocrinology',
        description: 'Diabetes, thyroid, adrenal disorders',
        conceptCodes: ['dm-a1c-goal', 'dm-sglt2-benefits', 'thyroid-hyperthyroid-afib']
      },
      {
        id: 'im-infectious-disease',
        name: 'Infectious Disease',
        description: 'Antibiotics, meningitis, pneumonia',
        conceptCodes: ['uti-uncomplicated-treatment', 'cap-outpatient-treatment', 'cellulitis-treatment', 'meningitis-empiric-treatment']
      }
    ]
  },
  {
    id: 'surgery',
    name: 'Surgery',
    description: 'General surgery, trauma, surgical subspecialties',
    icon: '🔪',
    color: 'from-red-500 to-orange-500',
    subcategories: [
      {
        id: 'surg-gi',
        name: 'GI Surgery',
        description: 'Acute abdomen, GI bleeding, hernias',
        conceptCodes: ['gi-bleed-management', 'cirrhosis-variceal-bleed']
      },
      {
        id: 'surg-trauma',
        name: 'Trauma',
        description: 'ATLS, hemorrhagic shock, fractures',
        conceptCodes: [] // To be expanded
      }
    ]
  },
  {
    id: 'obgyn',
    name: 'OB/GYN',
    description: 'Obstetrics, gynecology, reproductive health',
    icon: '🤰',
    color: 'from-pink-500 to-rose-500',
    subcategories: [
      {
        id: 'ob-hypertension',
        name: 'Hypertensive Disorders',
        description: 'Preeclampsia, eclampsia, chronic HTN in pregnancy',
        conceptCodes: ['preeclampsia-diagnosis', 'preeclampsia-management']
      },
      {
        id: 'ob-ectopic',
        name: 'Ectopic Pregnancy',
        description: 'Diagnosis and management of ectopic pregnancy',
        conceptCodes: ['ectopic-methotrexate']
      },
      {
        id: 'ob-diabetes',
        name: 'Gestational Diabetes',
        description: 'GDM screening and management',
        conceptCodes: ['gdm-screening']
      }
    ]
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics',
    description: 'Child health, development, pediatric diseases',
    icon: '👶',
    color: 'from-amber-500 to-yellow-500',
    subcategories: [
      {
        id: 'peds-development',
        name: 'Growth & Development',
        description: 'Milestones, failure to thrive, growth disorders',
        conceptCodes: [] // To be expanded
      }
    ]
  },
  {
    id: 'psychiatry',
    name: 'Psychiatry',
    description: 'Mental health, psychopharmacology, behavioral disorders',
    icon: '🧠',
    color: 'from-purple-500 to-violet-500',
    subcategories: [
      {
        id: 'psych-mood',
        name: 'Mood Disorders',
        description: 'Depression, bipolar disorder, treatment',
        conceptCodes: ['mdd-first-line-treatment', 'bipolar-treatment', 'lithium-monitoring']
      },
      {
        id: 'psych-psychosis',
        name: 'Psychotic Disorders',
        description: 'Schizophrenia, antipsychotics, side effects',
        conceptCodes: ['schizophrenia-first-episode', 'nms-serotonin-syndrome']
      }
    ]
  },
  {
    id: 'neurology',
    name: 'Neurology',
    description: 'Stroke, seizures, headaches, neuromuscular disorders',
    icon: '⚡',
    color: 'from-indigo-500 to-blue-500',
    subcategories: [
      {
        id: 'neuro-stroke',
        name: 'Stroke',
        description: 'Acute stroke, tPA, thrombectomy, prevention',
        conceptCodes: ['stroke-tpa-window', 'stroke-secondary-prevention']
      },
      {
        id: 'neuro-seizure',
        name: 'Seizures & Epilepsy',
        description: 'When to treat, status epilepticus',
        conceptCodes: ['seizure-when-to-treat']
      },
      {
        id: 'neuro-headache',
        name: 'Headache',
        description: 'Red flags, migraine, SAH',
        conceptCodes: ['headache-red-flags']
      }
    ]
  },
  {
    id: 'family-medicine',
    name: 'Family Medicine',
    description: 'Primary care, preventive medicine, chronic disease',
    icon: '👨‍👩‍👧‍👦',
    color: 'from-green-500 to-emerald-500',
    subcategories: [
      {
        id: 'fm-preventive',
        name: 'Preventive Care',
        description: 'Screening, immunizations, counseling',
        conceptCodes: [] // To be expanded
      },
      {
        id: 'fm-chronic',
        name: 'Chronic Disease Management',
        description: 'Diabetes, HTN, hyperlipidemia management',
        conceptCodes: ['htn-treatment-threshold', 'htn-first-line-agents', 'dm-a1c-goal', 'dm-sglt2-benefits']
      }
    ]
  },
  {
    id: 'emergency-medicine',
    name: 'Emergency Medicine',
    description: 'Acute care, resuscitation, emergency procedures',
    icon: '🚨',
    color: 'from-orange-500 to-red-500',
    subcategories: [
      {
        id: 'em-cardiac',
        name: 'Cardiac Emergencies',
        description: 'STEMI, arrhythmias, cardiac arrest',
        conceptCodes: ['acs-stemi-door-to-balloon', 'hyperkalemia-ekg-treatment']
      },
      {
        id: 'em-neuro',
        name: 'Neurological Emergencies',
        description: 'Stroke, status epilepticus, meningitis',
        conceptCodes: ['stroke-tpa-window', 'headache-red-flags', 'meningitis-empiric-treatment']
      }
    ]
  }
];

// ============================================================================
// TOPIC/SYSTEM CATEGORIES
// ============================================================================

export const topicCategories: CardCategory[] = [
  {
    id: 'cardiology',
    name: 'Cardiology',
    description: 'Heart and vascular diseases',
    icon: '❤️',
    color: 'from-red-500 to-rose-500',
    subcategories: [
      {
        id: 'card-arrhythmia',
        name: 'Arrhythmias',
        description: 'AFib, heart block, antiarrhythmics',
        conceptCodes: ['afib-anticoag-threshold', 'afib-rate-vs-rhythm', 'afib-cardioversion-timing', 'afib-doac-vs-warfarin']
      },
      {
        id: 'card-hf',
        name: 'Heart Failure',
        description: 'HFrEF, HFpEF, GDMT',
        conceptCodes: ['hfref-gdmt-mortality', 'hfref-contraindications']
      },
      {
        id: 'card-htn',
        name: 'Hypertension',
        description: 'Treatment thresholds, first-line agents',
        conceptCodes: ['htn-treatment-threshold', 'htn-first-line-agents']
      },
      {
        id: 'card-acs',
        name: 'Acute Coronary Syndrome',
        description: 'STEMI, NSTEMI, antiplatelet therapy',
        conceptCodes: ['acs-stemi-door-to-balloon', 'acs-dual-antiplatelet']
      },
      {
        id: 'card-valvular',
        name: 'Valvular Disease',
        description: 'AS, MR, mechanical valves',
        conceptCodes: ['as-intervention-threshold', 'valve-mechanical-anticoag']
      }
    ]
  },
  {
    id: 'pulmonology',
    name: 'Pulmonology',
    description: 'Respiratory diseases',
    icon: '🫁',
    color: 'from-sky-500 to-blue-500',
    subcategories: [
      {
        id: 'pulm-obstructive',
        name: 'Obstructive Lung Disease',
        description: 'COPD, asthma, bronchiectasis',
        conceptCodes: ['copd-gold-inhaler', 'asthma-step-therapy']
      },
      {
        id: 'pulm-vascular',
        name: 'Pulmonary Vascular',
        description: 'PE, pulmonary hypertension',
        conceptCodes: ['pe-wells-dimer']
      }
    ]
  },
  {
    id: 'gastroenterology',
    name: 'Gastroenterology',
    description: 'Digestive system diseases',
    icon: '🫶',
    color: 'from-amber-500 to-orange-500',
    subcategories: [
      {
        id: 'gi-upper',
        name: 'Upper GI',
        description: 'GERD, PUD, upper GI bleeding',
        conceptCodes: ['gerd-alarm-features', 'pud-hpylori-treatment']
      },
      {
        id: 'gi-bleeding',
        name: 'GI Bleeding',
        description: 'Upper and lower GI bleeding management',
        conceptCodes: ['gi-bleed-management', 'cirrhosis-variceal-bleed']
      },
      {
        id: 'gi-liver',
        name: 'Liver Disease',
        description: 'Cirrhosis, hepatitis, complications',
        conceptCodes: ['cirrhosis-sbp-prophylaxis', 'cirrhosis-variceal-bleed']
      },
      {
        id: 'gi-ibd',
        name: 'Inflammatory Bowel Disease',
        description: 'Crohn\'s, ulcerative colitis',
        conceptCodes: ['ibd-crohn-vs-uc']
      }
    ]
  },
  {
    id: 'nephrology',
    name: 'Nephrology',
    description: 'Kidney diseases and electrolytes',
    icon: '🫘',
    color: 'from-yellow-500 to-amber-500',
    subcategories: [
      {
        id: 'neph-aki',
        name: 'Acute Kidney Injury',
        description: 'Prerenal, intrinsic, postrenal',
        conceptCodes: ['aki-prerenal-intrinsic']
      },
      {
        id: 'neph-ckd',
        name: 'Chronic Kidney Disease',
        description: 'Progression, renoprotection',
        conceptCodes: ['ckd-progression-acei']
      },
      {
        id: 'neph-electrolytes',
        name: 'Electrolyte Disorders',
        description: 'Hyponatremia, hyperkalemia',
        conceptCodes: ['hyperkalemia-ekg-treatment', 'hyponatremia-algorithm']
      }
    ]
  },
  {
    id: 'endocrinology',
    name: 'Endocrinology',
    description: 'Hormonal and metabolic disorders',
    icon: '🧬',
    color: 'from-purple-500 to-pink-500',
    subcategories: [
      {
        id: 'endo-diabetes',
        name: 'Diabetes Mellitus',
        description: 'Type 1, Type 2, management',
        conceptCodes: ['dm-a1c-goal', 'dm-sglt2-benefits']
      },
      {
        id: 'endo-thyroid',
        name: 'Thyroid Disorders',
        description: 'Hyper/hypothyroidism, nodules',
        conceptCodes: ['thyroid-hyperthyroid-afib']
      }
    ]
  },
  {
    id: 'infectious-disease',
    name: 'Infectious Disease',
    description: 'Infections and antimicrobials',
    icon: '🦠',
    color: 'from-green-500 to-teal-500',
    subcategories: [
      {
        id: 'id-uti',
        name: 'Urinary Tract Infections',
        description: 'Cystitis, pyelonephritis',
        conceptCodes: ['uti-uncomplicated-treatment']
      },
      {
        id: 'id-respiratory',
        name: 'Respiratory Infections',
        description: 'CAP, HAP, bronchitis',
        conceptCodes: ['cap-outpatient-treatment']
      },
      {
        id: 'id-skin',
        name: 'Skin/Soft Tissue Infections',
        description: 'Cellulitis, abscess, necrotizing',
        conceptCodes: ['cellulitis-treatment']
      },
      {
        id: 'id-cns',
        name: 'CNS Infections',
        description: 'Meningitis, encephalitis',
        conceptCodes: ['meningitis-empiric-treatment']
      }
    ]
  },
  {
    id: 'neurology-topic',
    name: 'Neurology',
    description: 'Neurological disorders',
    icon: '🧠',
    color: 'from-indigo-500 to-purple-500',
    subcategories: [
      {
        id: 'neuro-cva',
        name: 'Cerebrovascular Disease',
        description: 'Stroke, TIA, prevention',
        conceptCodes: ['stroke-tpa-window', 'stroke-secondary-prevention']
      },
      {
        id: 'neuro-epilepsy',
        name: 'Epilepsy',
        description: 'Seizures, AEDs',
        conceptCodes: ['seizure-when-to-treat']
      },
      {
        id: 'neuro-headache',
        name: 'Headache Disorders',
        description: 'Migraine, cluster, secondary',
        conceptCodes: ['headache-red-flags']
      }
    ]
  },
  {
    id: 'psychiatry-topic',
    name: 'Psychiatry',
    description: 'Mental health disorders',
    icon: '💭',
    color: 'from-violet-500 to-purple-500',
    subcategories: [
      {
        id: 'psych-depression',
        name: 'Depressive Disorders',
        description: 'MDD, treatment, suicide risk',
        conceptCodes: ['mdd-first-line-treatment']
      },
      {
        id: 'psych-bipolar',
        name: 'Bipolar Disorder',
        description: 'Mania, mood stabilizers',
        conceptCodes: ['bipolar-treatment', 'lithium-monitoring']
      },
      {
        id: 'psych-psychosis',
        name: 'Psychotic Disorders',
        description: 'Schizophrenia, antipsychotics',
        conceptCodes: ['schizophrenia-first-episode']
      },
      {
        id: 'psych-emergencies',
        name: 'Psychiatric Emergencies',
        description: 'NMS, serotonin syndrome',
        conceptCodes: ['nms-serotonin-syndrome']
      }
    ]
  },
  {
    id: 'obgyn-topic',
    name: 'OB/GYN',
    description: 'Obstetrics and gynecology',
    icon: '🤱',
    color: 'from-pink-500 to-rose-500',
    subcategories: [
      {
        id: 'ob-htn',
        name: 'Hypertensive Disorders of Pregnancy',
        description: 'Preeclampsia, eclampsia, HELLP',
        conceptCodes: ['preeclampsia-diagnosis', 'preeclampsia-management']
      },
      {
        id: 'ob-early-pregnancy',
        name: 'Early Pregnancy Complications',
        description: 'Ectopic, miscarriage',
        conceptCodes: ['ectopic-methotrexate']
      },
      {
        id: 'ob-dm',
        name: 'Diabetes in Pregnancy',
        description: 'GDM, pregestational DM',
        conceptCodes: ['gdm-screening']
      }
    ]
  }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Get all concepts for a subcategory
export function getConceptsForSubcategory(subcategoryId: string): ClinicalConcept[] {
  // Find the subcategory in both shelf and topic categories
  for (const category of [...shelfCategories, ...topicCategories]) {
    const sub = category.subcategories?.find(s => s.id === subcategoryId);
    if (sub) {
      return sub.conceptCodes
        .map(code => allConcepts.find(c => c.code === code))
        .filter((c): c is ClinicalConcept => c !== undefined);
    }
  }
  return [];
}

// Get card count for a subcategory (based on understanding cards)
export function getCardCountForSubcategory(subcategoryId: string, understandingCards: Flashcard[]): number {
  const concepts = getConceptsForSubcategory(subcategoryId);
  const conceptCodes = concepts.map(c => c.code);

  return understandingCards.filter(card =>
    card.metadata.conceptCode && conceptCodes.includes(card.metadata.conceptCode)
  ).length;
}

// Get card count for a category
export function getCardCountForCategory(categoryId: string, understandingCards: Flashcard[]): number {
  const category = [...shelfCategories, ...topicCategories].find(c => c.id === categoryId);
  if (!category?.subcategories) return 0;

  return category.subcategories.reduce((total, sub) => {
    return total + getCardCountForSubcategory(sub.id, understandingCards);
  }, 0);
}

// Get all high-yield concepts
export function getHighYieldConcepts(): ClinicalConcept[] {
  return allConcepts.filter(c => c.highYield);
}

// Get concepts by system
export function getConceptsBySystem(system: MedicalSystem): ClinicalConcept[] {
  return allConcepts.filter(c => c.system === system);
}

// Search concepts by keyword
export function searchConcepts(query: string): ClinicalConcept[] {
  const lowerQuery = query.toLowerCase();
  return allConcepts.filter(c =>
    c.name.toLowerCase().includes(lowerQuery) ||
    c.clinicalDecision.toLowerCase().includes(lowerQuery) ||
    c.topic.toLowerCase().includes(lowerQuery) ||
    c.testableAngles.some(a => a.toLowerCase().includes(lowerQuery))
  );
}

// Get library stats
export function getLibraryStats(understandingCards: Flashcard[]) {
  const totalConcepts = allConcepts.length;
  const highYieldConcepts = allConcepts.filter(c => c.highYield).length;
  const totalCards = understandingCards.length;
  const systemCounts: Record<string, number> = {};

  for (const card of understandingCards) {
    const system = card.metadata.system;
    systemCounts[system] = (systemCounts[system] || 0) + 1;
  }

  const shelfExamCount = shelfCategories.length;
  const topicCount = topicCategories.length;

  return {
    totalConcepts,
    highYieldConcepts,
    totalCards,
    systemCounts,
    shelfExamCount,
    topicCount
  };
}

// Export types
export type { CardCategory, CardSubcategory };
