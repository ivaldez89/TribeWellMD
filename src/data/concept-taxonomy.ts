// Clinical Concept Taxonomy for Step 2 CK
// Each concept represents a testable clinical decision point ("password")
// Focus on UNDERSTANDING over memorization

import type { ClinicalConcept, MedicalSystem } from '@/types';

// ============================================================================
// CARDIOLOGY CONCEPTS
// ============================================================================

export const cardiologyConcepts: ClinicalConcept[] = [
  // ATRIAL FIBRILLATION
  {
    code: 'afib-anticoag-threshold',
    name: 'AFib Anticoagulation Decision',
    clinicalDecision: 'Anticoagulate AFib when CHA2DS2-VASc >= 2 (men) or >= 3 (women)',
    system: 'Cardiology',
    topic: 'Atrial Fibrillation',
    highYield: true,
    testableAngles: [
      'Calculate CHA2DS2-VASc and decide on anticoagulation',
      'Explain why a patient does/doesn\'t need anticoagulation',
      'Score of 1 = gray zone, shared decision-making',
      'Female sex adds 1 point but threshold is different'
    ],
    relatedConcepts: ['afib-rate-vs-rhythm', 'afib-cardioversion-timing', 'afib-doac-vs-warfarin'],
    qbankMapping: {
      uworld: ['4911', '6845', '12345'], // Sample QIDs
      amboss: ['z5ar5O']
    }
  },
  {
    code: 'afib-rate-vs-rhythm',
    name: 'AFib Rate vs Rhythm Control',
    clinicalDecision: 'Rate control is preferred for most AFib patients; rhythm control for symptomatic, young, or new-onset',
    system: 'Cardiology',
    topic: 'Atrial Fibrillation',
    highYield: true,
    testableAngles: [
      'AFFIRM trial showed no mortality benefit for rhythm control',
      'Rhythm control preferred if: symptomatic despite rate control, young, new-onset, HFrEF',
      'Rate control target: <110 bpm at rest (lenient) or <80 (strict)',
      'First-line rate control: beta-blockers or non-DHP CCBs'
    ],
    relatedConcepts: ['afib-anticoag-threshold', 'afib-cardioversion-timing', 'hf-beta-blocker-mortality'],
    qbankMapping: {
      uworld: ['5678', '9012'],
      amboss: []
    }
  },
  {
    code: 'afib-cardioversion-timing',
    name: 'AFib Cardioversion 48-Hour Rule',
    clinicalDecision: 'Cardioversion requires 3+ weeks anticoagulation OR TEE to rule out LAA thrombus if AFib > 48 hours',
    system: 'Cardiology',
    topic: 'Atrial Fibrillation',
    highYield: true,
    testableAngles: [
      '< 48 hours: can cardiovert immediately (still anticoagulate)',
      '> 48 hours or unknown: 3 weeks anticoagulation before OR TEE first',
      'Post-cardioversion: anticoagulate for 4 weeks minimum',
      'Hemodynamically unstable: cardiovert immediately regardless'
    ],
    relatedConcepts: ['afib-anticoag-threshold', 'afib-rate-vs-rhythm'],
    qbankMapping: {
      uworld: ['3456'],
      amboss: []
    }
  },
  {
    code: 'afib-doac-vs-warfarin',
    name: 'DOAC vs Warfarin in AFib',
    clinicalDecision: 'DOACs preferred over warfarin EXCEPT in mechanical valve or moderate-severe mitral stenosis',
    system: 'Cardiology',
    topic: 'Atrial Fibrillation',
    highYield: true,
    testableAngles: [
      'Mechanical valve = warfarin only (DOACs cause valve thrombosis)',
      'Moderate-severe mitral stenosis = warfarin only',
      'CKD with CrCl > 15-30: most DOACs still okay with dose adjustment',
      'DOACs have lower intracranial bleeding risk than warfarin'
    ],
    relatedConcepts: ['afib-anticoag-threshold', 'valve-mechanical-anticoag'],
    qbankMapping: {
      uworld: ['7890'],
      amboss: []
    }
  },

  // HEART FAILURE
  {
    code: 'hfref-gdmt-mortality',
    name: 'HFrEF GDMT Mortality Benefit',
    clinicalDecision: 'Four pillars reduce mortality in HFrEF: ACEi/ARB/ARNI, beta-blocker, MRA, SGLT2i',
    system: 'Cardiology',
    topic: 'Heart Failure',
    highYield: true,
    testableAngles: [
      'All 4 classes reduce mortality independently',
      'ARNI (sacubitril/valsartan) superior to ACEi alone',
      'Beta-blockers: carvedilol, metoprolol succinate, bisoprolol only',
      'SGLT2i benefit even in non-diabetics'
    ],
    relatedConcepts: ['hfref-contraindications', 'hfpef-treatment', 'hf-diuretic-role'],
    qbankMapping: {
      uworld: ['2107', '25217', '4908'],
      amboss: ['z5ar5O']
    }
  },
  {
    code: 'hfref-contraindications',
    name: 'HFrEF Medication Contraindications',
    clinicalDecision: 'Avoid non-DHP CCBs and most antiarrhythmics in HFrEF (negative inotropy)',
    system: 'Cardiology',
    topic: 'Heart Failure',
    highYield: true,
    testableAngles: [
      'Non-DHP CCBs (verapamil, diltiazem) = negative inotropy, worsen HF',
      'Class IC antiarrhythmics (flecainide) contraindicated - proarrhythmic in structural heart disease',
      'NSAIDs worsen HF (sodium retention, vasoconstriction)',
      'Thiazolidinediones cause fluid retention'
    ],
    relatedConcepts: ['hfref-gdmt-mortality', 'afib-rate-vs-rhythm'],
    qbankMapping: {
      uworld: ['8869', '25460'],
      amboss: []
    }
  },

  // HYPERTENSION
  {
    code: 'htn-treatment-threshold',
    name: 'HTN Treatment Threshold',
    clinicalDecision: 'Start meds at >= 130/80 if ASCVD risk >= 10% or existing CVD/DM/CKD; else >= 140/90',
    system: 'Cardiology',
    topic: 'Hypertension',
    highYield: true,
    testableAngles: [
      'SPRINT trial: intensive control (< 120) reduces mortality in high-risk patients',
      'Lower threshold (130/80) for: DM, CKD, existing CVD, 10-year ASCVD risk >= 10%',
      'Goal < 130/80 for most patients with indication for treatment',
      'Lifestyle modification first if BP 120-129/<80'
    ],
    relatedConcepts: ['htn-first-line-agents', 'htn-secondary-causes', 'dm-bp-target'],
    qbankMapping: {
      uworld: ['25216', '2107'],
      amboss: ['z5ar5O']
    }
  },
  {
    code: 'htn-first-line-agents',
    name: 'First-Line Antihypertensives',
    clinicalDecision: 'First-line: thiazide, ACEi/ARB, or CCB; choice depends on comorbidities',
    system: 'Cardiology',
    topic: 'Hypertension',
    highYield: true,
    testableAngles: [
      'Black patients without CKD/DM: thiazide or CCB preferred (ACEi less effective)',
      'DM with proteinuria: ACEi/ARB (renoprotective)',
      'HFrEF: ACEi/ARB + beta-blocker',
      'Pregnancy: labetalol, nifedipine, methyldopa (NOT ACEi/ARB)'
    ],
    relatedConcepts: ['htn-treatment-threshold', 'dm-nephropathy-acei', 'pregnancy-htn'],
    qbankMapping: {
      uworld: [],
      amboss: []
    }
  },

  // ACUTE CORONARY SYNDROME
  {
    code: 'acs-stemi-door-to-balloon',
    name: 'STEMI Door-to-Balloon Time',
    clinicalDecision: 'STEMI requires PCI within 90 minutes (door-to-balloon) or 120 minutes if transfer needed',
    system: 'Cardiology',
    topic: 'Acute Coronary Syndrome',
    highYield: true,
    testableAngles: [
      'Door-to-balloon: 90 min if PCI-capable, 120 min if transfer needed',
      'If PCI not available within 120 min: give fibrinolytics within 30 min',
      'Fibrinolytics contraindicated: recent stroke, active bleeding, aortic dissection',
      'All STEMI patients get: aspirin, P2Y12 inhibitor, anticoagulation'
    ],
    relatedConcepts: ['acs-nstemi-management', 'acs-dual-antiplatelet'],
    qbankMapping: {
      uworld: [],
      amboss: []
    }
  },
  {
    code: 'acs-dual-antiplatelet',
    name: 'Dual Antiplatelet Therapy Duration',
    clinicalDecision: 'DAPT for 12 months after ACS, can shorten to 6 months if high bleeding risk',
    system: 'Cardiology',
    topic: 'Acute Coronary Syndrome',
    highYield: true,
    testableAngles: [
      'Aspirin + P2Y12 inhibitor (clopidogrel, ticagrelor, prasugrel)',
      'Ticagrelor/prasugrel more potent than clopidogrel',
      'Prasugrel contraindicated: prior stroke/TIA, age > 75, weight < 60 kg',
      'After 12 months: continue aspirin indefinitely, consider stopping P2Y12'
    ],
    relatedConcepts: ['acs-stemi-door-to-balloon', 'afib-anticoag-threshold'],
    qbankMapping: {
      uworld: [],
      amboss: []
    }
  },

  // VALVULAR DISEASE
  {
    code: 'as-intervention-threshold',
    name: 'Aortic Stenosis Intervention Criteria',
    clinicalDecision: 'Replace severe AS when symptomatic (angina, syncope, HF) or EF < 50%',
    system: 'Cardiology',
    topic: 'Valvular Disease',
    highYield: true,
    testableAngles: [
      'Severe AS: valve area < 1.0 cm2, mean gradient > 40 mmHg, velocity > 4 m/s',
      'Symptoms: angina, syncope, heart failure (poor prognosis once symptomatic)',
      'Asymptomatic severe AS with EF < 50%: intervene',
      'TAVR vs SAVR: TAVR for high surgical risk, equivalent in intermediate risk'
    ],
    relatedConcepts: ['mr-intervention-criteria', 'valve-mechanical-anticoag'],
    qbankMapping: {
      uworld: ['101689', '4911'],
      amboss: []
    }
  },
  {
    code: 'valve-mechanical-anticoag',
    name: 'Mechanical Valve Anticoagulation',
    clinicalDecision: 'Mechanical valves require lifelong warfarin; DOACs are CONTRAINDICATED',
    system: 'Cardiology',
    topic: 'Valvular Disease',
    highYield: true,
    testableAngles: [
      'Warfarin ONLY - DOACs cause valve thrombosis (RE-ALIGN trial)',
      'INR target depends on valve position: mitral (2.5-3.5), aortic (2.0-3.0)',
      'Bioprosthetic valves: short-term anticoag then aspirin only',
      'Bridge with heparin for procedures'
    ],
    relatedConcepts: ['afib-doac-vs-warfarin', 'as-intervention-threshold'],
    qbankMapping: {
      uworld: [],
      amboss: []
    }
  }
];

// ============================================================================
// ENDOCRINOLOGY CONCEPTS
// ============================================================================

export const endocrinologyConcepts: ClinicalConcept[] = [
  {
    code: 'dm-a1c-goal',
    name: 'Diabetes A1c Target',
    clinicalDecision: 'A1c < 7% for most; relax to < 8% in elderly or those with hypoglycemia risk',
    system: 'Endocrinology',
    topic: 'Diabetes Mellitus',
    highYield: true,
    testableAngles: [
      'Younger, newly diagnosed, no CVD: target < 6.5-7%',
      'Elderly, limited life expectancy, hypoglycemia risk: target < 8%',
      'Pregnancy: tighter control (< 6%)',
      'Avoid hypoglycemia - worse outcomes than modest hyperglycemia'
    ],
    relatedConcepts: ['dm-first-line-therapy', 'dm-sglt2-benefits'],
    qbankMapping: {
      uworld: [],
      amboss: []
    }
  },
  {
    code: 'dm-sglt2-benefits',
    name: 'SGLT2 Inhibitor Benefits',
    clinicalDecision: 'SGLT2i reduce CV death and HF hospitalization in diabetics with CVD or HFrEF',
    system: 'Endocrinology',
    topic: 'Diabetes Mellitus',
    highYield: true,
    testableAngles: [
      'EMPA-REG, CANVAS: CV mortality benefit in T2DM with CVD',
      'Benefit in HFrEF even without diabetes (DAPA-HF, EMPEROR-Reduced)',
      'Renal protection: slow CKD progression',
      'Side effects: UTI, yeast infections, euglycemic DKA, Fournier gangrene'
    ],
    relatedConcepts: ['dm-a1c-goal', 'hfref-gdmt-mortality'],
    qbankMapping: {
      uworld: [],
      amboss: []
    }
  },
  {
    code: 'thyroid-hyperthyroid-afib',
    name: 'Hyperthyroidism and AFib',
    clinicalDecision: 'Hyperthyroidism causes AFib; treat with beta-blockers while awaiting thyroid control',
    system: 'Endocrinology',
    topic: 'Thyroid Disease',
    highYield: true,
    testableAngles: [
      'Beta-blockers control symptoms AND reduce conversion to T3',
      'Propranolol preferred (also blocks T4 to T3 conversion)',
      'AFib may resolve once euthyroid',
      'Still need to address anticoagulation (CHA2DS2-VASc)'
    ],
    relatedConcepts: ['afib-anticoag-threshold', 'afib-rate-vs-rhythm'],
    qbankMapping: {
      uworld: ['25259', '26055', '14985', '6797'],
      amboss: ['YXan9Q']
    }
  }
];

// ============================================================================
// PULMONOLOGY CONCEPTS
// ============================================================================

export const pulmonologyConcepts: ClinicalConcept[] = [
  {
    code: 'copd-gold-inhaler',
    name: 'COPD Inhaler Selection (GOLD)',
    clinicalDecision: 'COPD: start LAMA or LABA; add ICS only if eosinophils > 300 or frequent exacerbations',
    system: 'Pulmonology',
    topic: 'COPD',
    highYield: true,
    testableAngles: [
      'Group A (few symptoms, low risk): SABA prn',
      'Group B (more symptoms): LAMA or LABA',
      'Group E (exacerbations): LAMA + LABA, add ICS if eosinophils > 300',
      'ICS increases pneumonia risk in COPD (unlike asthma)'
    ],
    relatedConcepts: ['asthma-step-therapy', 'copd-acute-exacerbation'],
    qbankMapping: {
      uworld: [],
      amboss: []
    }
  },
  {
    code: 'asthma-step-therapy',
    name: 'Asthma Step Therapy',
    clinicalDecision: 'All asthmatics need ICS; step up by adding LABA, then increase doses',
    system: 'Pulmonology',
    topic: 'Asthma',
    highYield: true,
    testableAngles: [
      'Step 1: PRN ICS-formoterol (preferred) or SABA with PRN ICS',
      'Step 2: Daily low-dose ICS',
      'Step 3: Low-dose ICS + LABA',
      'LABA alone (without ICS) increases mortality in asthma - never monotherapy'
    ],
    relatedConcepts: ['copd-gold-inhaler'],
    qbankMapping: {
      uworld: [],
      amboss: []
    }
  },
  {
    code: 'pe-wells-dimer',
    name: 'PE Workup: Wells Score + D-dimer',
    clinicalDecision: 'Low/intermediate Wells score + negative D-dimer rules out PE; high Wells = go straight to CTA',
    system: 'Pulmonology',
    topic: 'Pulmonary Embolism',
    highYield: true,
    testableAngles: [
      'Wells score < 4 (PE unlikely): check D-dimer first',
      'Wells >= 4 (PE likely): skip D-dimer, go to CTA',
      'D-dimer has high sensitivity but low specificity',
      'Age-adjusted D-dimer cutoff: age x 10 for patients > 50'
    ],
    relatedConcepts: ['pe-anticoagulation-duration', 'dvt-wells-ultrasound'],
    qbankMapping: {
      uworld: ['4567', '8901'],
      amboss: []
    }
  }
];

// ============================================================================
// GASTROENTEROLOGY CONCEPTS
// ============================================================================

export const gastroenterologyConcepts: ClinicalConcept[] = [
  {
    code: 'gerd-alarm-features',
    name: 'GERD Alarm Features',
    clinicalDecision: 'GERD with alarm features (dysphagia, weight loss, bleeding, age >60) needs EGD, not just PPI',
    system: 'Gastroenterology',
    topic: 'GERD',
    highYield: true,
    testableAngles: [
      'Alarm features: dysphagia, odynophagia, weight loss, GI bleeding, anemia, age > 60 new onset',
      'EGD before PPI trial if alarm features present',
      'Barrett esophagus: intestinal metaplasia, needs surveillance EGD',
      'Long-term PPI risks: C. diff, pneumonia, B12 deficiency, fractures'
    ],
    relatedConcepts: ['pud-hpylori-treatment', 'gi-bleed-management'],
    qbankMapping: {
      uworld: ['12890', '15678'],
      amboss: []
    }
  },
  {
    code: 'pud-hpylori-treatment',
    name: 'H. pylori Treatment',
    clinicalDecision: 'H. pylori: quadruple therapy (PPI + bismuth + metronidazole + tetracycline) OR triple therapy with clarithromycin',
    system: 'Gastroenterology',
    topic: 'Peptic Ulcer Disease',
    highYield: true,
    testableAngles: [
      'Test all PUD patients for H. pylori',
      'Bismuth quadruple therapy: 14 days (preferred if clarithromycin resistance area)',
      'Triple therapy: PPI + clarithromycin + amoxicillin x 14 days',
      'Confirm eradication with urea breath test or stool antigen (wait 4 weeks after treatment)'
    ],
    relatedConcepts: ['gerd-alarm-features', 'gi-bleed-management'],
    qbankMapping: {
      uworld: [],
      amboss: []
    }
  },
  {
    code: 'gi-bleed-management',
    name: 'GI Bleed Initial Management',
    clinicalDecision: 'Upper GI bleed: PPI drip + EGD within 24h; Lower: colonoscopy after bowel prep',
    system: 'Gastroenterology',
    topic: 'GI Bleeding',
    highYield: true,
    testableAngles: [
      'Resuscitate first: 2 large-bore IVs, crystalloid, type and cross',
      'Upper GI bleed: IV PPI (esomeprazole 80mg bolus then 8mg/hr), EGD within 24h',
      'Transfuse PRBCs if Hgb < 7 (or < 9 if CAD/active ischemia)',
      'Massive bleed with instability: go to angiography or surgery'
    ],
    relatedConcepts: ['pud-hpylori-treatment', 'cirrhosis-variceal-bleed'],
    qbankMapping: {
      uworld: ['25678', '30123'],
      amboss: []
    }
  },
  {
    code: 'cirrhosis-variceal-bleed',
    name: 'Variceal Bleed Management',
    clinicalDecision: 'Variceal bleed: octreotide + antibiotic prophylaxis + urgent EGD with banding',
    system: 'Gastroenterology',
    topic: 'Cirrhosis',
    highYield: true,
    testableAngles: [
      'Octreotide (or terlipressin): reduces splanchnic blood flow',
      'Antibiotics (ceftriaxone): reduce SBP and mortality',
      'EGD with band ligation within 12 hours',
      'Refractory: consider TIPS (but watch for hepatic encephalopathy)'
    ],
    relatedConcepts: ['cirrhosis-sbp-prophylaxis', 'gi-bleed-management'],
    qbankMapping: {
      uworld: [],
      amboss: []
    }
  },
  {
    code: 'cirrhosis-sbp-prophylaxis',
    name: 'SBP Prophylaxis in Cirrhosis',
    clinicalDecision: 'Give SBP prophylaxis (norfloxacin/TMP-SMX) if ascitic protein < 1.5 with renal/liver dysfunction',
    system: 'Gastroenterology',
    topic: 'Cirrhosis',
    highYield: true,
    testableAngles: [
      'Primary prophylaxis: ascitic protein < 1.5 g/dL + renal dysfunction OR Child-Pugh >= 9',
      'Secondary prophylaxis: after any SBP episode - lifelong',
      'Fluoroquinolone (norfloxacin) or TMP-SMX',
      'SBP diagnosis: ascitic PMN > 250/mm3, treat empirically with ceftriaxone'
    ],
    relatedConcepts: ['cirrhosis-variceal-bleed', 'cirrhosis-hcc-screening'],
    qbankMapping: {
      uworld: [],
      amboss: []
    }
  },
  {
    code: 'ibd-crohn-vs-uc',
    name: 'Crohn vs UC Management Differences',
    clinicalDecision: 'UC: mesalamine works, surgery is curative; Crohn: mesalamine ineffective, surgery not curative',
    system: 'Gastroenterology',
    topic: 'Inflammatory Bowel Disease',
    highYield: true,
    testableAngles: [
      'UC: continuous from rectum, mesalamine first-line, colectomy curative',
      'Crohn: skip lesions, transmural (fistulas/strictures), mesalamine not helpful',
      'Crohn treatment: steroids for flare, biologics (anti-TNF) for maintenance',
      'Both increase colon cancer risk - need surveillance colonoscopy'
    ],
    relatedConcepts: ['ibd-toxic-megacolon'],
    qbankMapping: {
      uworld: ['45678', '56789'],
      amboss: []
    }
  }
];

// ============================================================================
// NEPHROLOGY CONCEPTS
// ============================================================================

export const nephrologyConcepts: ClinicalConcept[] = [
  {
    code: 'aki-prerenal-intrinsic',
    name: 'AKI: Prerenal vs Intrinsic',
    clinicalDecision: 'FENa < 1% suggests prerenal; FENa > 2% suggests ATN; BUN:Cr > 20:1 prerenal',
    system: 'Nephrology',
    topic: 'Acute Kidney Injury',
    highYield: true,
    testableAngles: [
      'FENa < 1% + BUN:Cr > 20:1 = prerenal (kidneys working, holding onto sodium)',
      'FENa > 2% + muddy brown casts = ATN (tubules damaged)',
      'FENa unreliable on diuretics - use FeUrea instead',
      'Prerenal: volume resuscitation; ATN: supportive care'
    ],
    relatedConcepts: ['ckd-progression-acei', 'contrast-nephropathy-prevention'],
    qbankMapping: {
      uworld: ['67890', '78901'],
      amboss: []
    }
  },
  {
    code: 'ckd-progression-acei',
    name: 'ACEi/ARB for CKD Progression',
    clinicalDecision: 'ACEi/ARB slows CKD progression in diabetic and proteinuric kidney disease',
    system: 'Nephrology',
    topic: 'Chronic Kidney Disease',
    highYield: true,
    testableAngles: [
      'Start ACEi/ARB if proteinuria > 300 mg/day (especially with DM)',
      'Creatinine can rise 30% initially - this is expected, dont stop',
      'Stop if K > 5.5 or Cr rises > 30%',
      'Do NOT combine ACEi + ARB (hyperkalemia, no added benefit)'
    ],
    relatedConcepts: ['aki-prerenal-intrinsic', 'dm-nephropathy-acei', 'htn-first-line-agents'],
    qbankMapping: {
      uworld: [],
      amboss: []
    }
  },
  {
    code: 'hyperkalemia-ekg-treatment',
    name: 'Hyperkalemia Emergency Treatment',
    clinicalDecision: 'K > 6.5 or EKG changes: give calcium gluconate first, then shift K (insulin/glucose), then remove K',
    system: 'Nephrology',
    topic: 'Electrolyte Disorders',
    highYield: true,
    testableAngles: [
      'EKG changes: peaked T waves, widened QRS, sine wave',
      'Calcium gluconate: stabilizes cardiac membrane (doesnt lower K)',
      'Insulin + glucose: shifts K into cells',
      'Remove K: kayexalate, diuretics, or dialysis'
    ],
    relatedConcepts: ['ckd-progression-acei'],
    qbankMapping: {
      uworld: ['89012', '90123'],
      amboss: []
    }
  },
  {
    code: 'hyponatremia-algorithm',
    name: 'Hyponatremia Workup',
    clinicalDecision: 'Hyponatremia: check volume status first, then urine osmolality, then urine sodium',
    system: 'Nephrology',
    topic: 'Electrolyte Disorders',
    highYield: true,
    testableAngles: [
      'Hypovolemic + low urine Na: GI/renal losses',
      'Euvolemic + high urine Na: SIADH',
      'Hypervolemic: CHF, cirrhosis, nephrotic syndrome',
      'SIADH treatment: fluid restriction first, then salt tabs or tolvaptan'
    ],
    relatedConcepts: ['siadh-causes', 'hyperkalemia-ekg-treatment'],
    qbankMapping: {
      uworld: [],
      amboss: []
    }
  }
];

// ============================================================================
// NEUROLOGY CONCEPTS
// ============================================================================

export const neurologyConcepts: ClinicalConcept[] = [
  {
    code: 'stroke-tpa-window',
    name: 'Stroke tPA Eligibility',
    clinicalDecision: 'IV tPA within 4.5 hours of symptom onset; mechanical thrombectomy up to 24 hours for large vessel occlusion',
    system: 'Neurology',
    topic: 'Stroke',
    highYield: true,
    testableAngles: [
      'tPA window: 4.5 hours from last known normal',
      'Contraindications: recent surgery, bleeding, INR > 1.7, platelets < 100k',
      'Wake-up stroke: MRI can identify salvageable tissue',
      'Large vessel occlusion: thrombectomy up to 24h with favorable imaging'
    ],
    relatedConcepts: ['stroke-secondary-prevention', 'tia-abcd2-workup'],
    qbankMapping: {
      uworld: ['34567', '45678'],
      amboss: []
    }
  },
  {
    code: 'stroke-secondary-prevention',
    name: 'Stroke Secondary Prevention',
    clinicalDecision: 'Post-stroke: antiplatelet (aspirin or clopidogrel), statin, BP control; anticoagulate only if AFib',
    system: 'Neurology',
    topic: 'Stroke',
    highYield: true,
    testableAngles: [
      'Antiplatelet: aspirin +/- clopidogrel (DAPT for 21 days if minor stroke)',
      'High-intensity statin regardless of LDL',
      'BP goal < 130/80 (but avoid hypotension in acute stroke)',
      'Anticoagulation only for cardioembolic (AFib) - not for atherosclerotic'
    ],
    relatedConcepts: ['stroke-tpa-window', 'afib-anticoag-threshold'],
    qbankMapping: {
      uworld: [],
      amboss: []
    }
  },
  {
    code: 'seizure-when-to-treat',
    name: 'When to Start AEDs After Seizure',
    clinicalDecision: 'Start AED after first unprovoked seizure only if high recurrence risk (EEG abnormal, structural lesion, nocturnal)',
    system: 'Neurology',
    topic: 'Epilepsy',
    highYield: true,
    testableAngles: [
      'First provoked seizure (alcohol, meds, metabolic): treat cause, no AED',
      'First unprovoked + normal EEG/MRI: 40% recurrence, can observe',
      'High risk features: abnormal EEG, structural lesion, prolonged seizure',
      'Two unprovoked seizures = epilepsy = start AED'
    ],
    relatedConcepts: ['status-epilepticus-treatment'],
    qbankMapping: {
      uworld: [],
      amboss: []
    }
  },
  {
    code: 'headache-red-flags',
    name: 'Headache Red Flags',
    clinicalDecision: 'Headache red flags (SNOOP): need neuroimaging before diagnosing primary headache',
    system: 'Neurology',
    topic: 'Headache',
    highYield: true,
    testableAngles: [
      'S: Systemic symptoms (fever, weight loss, cancer history)',
      'N: Neurologic signs (focal deficits, papilledema)',
      'O: Onset sudden (thunderclap - think SAH)',
      'O: Older age (> 50, new headache)',
      'P: Pattern change, positional, pregnancy'
    ],
    relatedConcepts: ['migraine-treatment', 'sah-workup'],
    qbankMapping: {
      uworld: ['56789', '67890'],
      amboss: []
    }
  }
];

// ============================================================================
// INFECTIOUS DISEASE CONCEPTS
// ============================================================================

export const infectiousDiseaseConcepts: ClinicalConcept[] = [
  {
    code: 'uti-uncomplicated-treatment',
    name: 'Uncomplicated UTI Treatment',
    clinicalDecision: 'Uncomplicated cystitis in women: nitrofurantoin 5 days or TMP-SMX 3 days or fosfomycin single dose',
    system: 'Infectious Disease',
    topic: 'Urinary Tract Infection',
    highYield: true,
    testableAngles: [
      'First-line: nitrofurantoin (5 days), TMP-SMX (3 days), fosfomycin (single dose)',
      'Avoid fluoroquinolones for uncomplicated UTI (save for complicated)',
      'Complicated UTI: male, structural abnormality, catheter, recent instrumentation',
      'Pyelonephritis: fluoroquinolone x 7 days or TMP-SMX x 14 days'
    ],
    relatedConcepts: ['uti-catheter-associated', 'uti-pregnancy'],
    qbankMapping: {
      uworld: ['78901', '89012'],
      amboss: []
    }
  },
  {
    code: 'cap-outpatient-treatment',
    name: 'Community-Acquired Pneumonia Outpatient',
    clinicalDecision: 'Healthy outpatient CAP: amoxicillin or doxycycline; with comorbidities: respiratory FQ or beta-lactam + macrolide',
    system: 'Infectious Disease',
    topic: 'Pneumonia',
    highYield: true,
    testableAngles: [
      'Healthy, no recent antibiotics: amoxicillin or doxycycline or macrolide',
      'Comorbidities (COPD, DM, CKD): respiratory FQ OR beta-lactam + macrolide',
      'Admitted to floor: ceftriaxone + azithromycin OR respiratory FQ',
      'ICU admission: ceftriaxone + azithromycin (add vanc + cefepime if MRSA/Pseudomonas risk)'
    ],
    relatedConcepts: ['hap-treatment', 'cap-severity-scoring'],
    qbankMapping: {
      uworld: [],
      amboss: []
    }
  },
  {
    code: 'cellulitis-treatment',
    name: 'Cellulitis Antibiotic Selection',
    clinicalDecision: 'Non-purulent cellulitis: cephalexin (strep); purulent/abscess: TMP-SMX or doxycycline (MRSA coverage)',
    system: 'Infectious Disease',
    topic: 'Skin/Soft Tissue Infection',
    highYield: true,
    testableAngles: [
      'Non-purulent (erysipelas): strep coverage (cephalexin, penicillin)',
      'Purulent/abscess: MRSA coverage (TMP-SMX, doxycycline), I&D if abscess',
      'Severe: IV vancomycin + piperacillin-tazobactam',
      'Diabetic foot: broad spectrum (Pseudomonas + anaerobe coverage)'
    ],
    relatedConcepts: ['diabetic-foot-infection'],
    qbankMapping: {
      uworld: [],
      amboss: []
    }
  },
  {
    code: 'meningitis-empiric-treatment',
    name: 'Bacterial Meningitis Empiric Treatment',
    clinicalDecision: 'Adult bacterial meningitis: vancomycin + ceftriaxone + dexamethasone; add ampicillin if > 50 or immunocompromised',
    system: 'Infectious Disease',
    topic: 'Central Nervous System Infections',
    highYield: true,
    testableAngles: [
      'Give dexamethasone BEFORE or WITH first antibiotic dose (reduces mortality)',
      'Vanc (MRSA, resistant pneumococcus) + ceftriaxone (pneumococcus, meningococcus)',
      'Age > 50 or immunocompromised: add ampicillin (Listeria coverage)',
      'LP shows: high protein, low glucose, high WBC with neutrophil predominance'
    ],
    relatedConcepts: ['meningitis-prophylaxis'],
    qbankMapping: {
      uworld: ['90123', '01234'],
      amboss: []
    }
  }
];

// ============================================================================
// OB/GYN CONCEPTS
// ============================================================================

export const obgynConcepts: ClinicalConcept[] = [
  {
    code: 'preeclampsia-diagnosis',
    name: 'Preeclampsia Diagnosis Criteria',
    clinicalDecision: 'Preeclampsia: BP >= 140/90 after 20 weeks + proteinuria OR end-organ damage (even without proteinuria)',
    system: 'OB/GYN',
    topic: 'Hypertensive Disorders of Pregnancy',
    highYield: true,
    testableAngles: [
      'BP >= 140/90 on two occasions 4 hours apart after 20 weeks',
      'Proteinuria: >= 300mg/24h OR protein:creatinine >= 0.3',
      'Severe features: BP >= 160/110, platelets < 100k, Cr > 1.1, liver transaminases 2x, pulmonary edema, neuro symptoms',
      'HELLP: Hemolysis, Elevated Liver enzymes, Low Platelets'
    ],
    relatedConcepts: ['preeclampsia-management', 'eclampsia-seizure'],
    qbankMapping: {
      uworld: ['12345', '23456'],
      amboss: []
    }
  },
  {
    code: 'preeclampsia-management',
    name: 'Preeclampsia Management',
    clinicalDecision: 'Preeclampsia with severe features at >= 34 weeks: deliver; < 34 weeks: steroids + magnesium, consider expectant management',
    system: 'OB/GYN',
    topic: 'Hypertensive Disorders of Pregnancy',
    highYield: true,
    testableAngles: [
      'Severe features at >= 34 weeks: deliver after stabilization',
      '< 34 weeks with severe features: steroids + magnesium, can delay delivery 24-48h if stable',
      'Magnesium sulfate: seizure prophylaxis (not for BP control)',
      'BP control: labetalol or hydralazine acutely'
    ],
    relatedConcepts: ['preeclampsia-diagnosis', 'pregnancy-htn'],
    qbankMapping: {
      uworld: [],
      amboss: []
    }
  },
  {
    code: 'ectopic-methotrexate',
    name: 'Ectopic Pregnancy Methotrexate Criteria',
    clinicalDecision: 'Methotrexate for ectopic if: stable, unruptured, mass < 3.5 cm, no fetal cardiac activity, beta-hCG < 5000',
    system: 'OB/GYN',
    topic: 'Ectopic Pregnancy',
    highYield: true,
    testableAngles: [
      'Stable vitals, no hemoperitoneum',
      'Beta-hCG < 5000 mIU/mL (higher levels = lower success rate)',
      'Mass < 3.5 cm, no fetal cardiac activity',
      'Contraindications: ruptured, immunodeficient, renal/hepatic dysfunction, blood dyscrasias'
    ],
    relatedConcepts: ['ectopic-surgery'],
    qbankMapping: {
      uworld: ['34567', '45678'],
      amboss: []
    }
  },
  {
    code: 'gdm-screening',
    name: 'Gestational Diabetes Screening',
    clinicalDecision: 'Screen all pregnant women for GDM at 24-28 weeks with glucose challenge test',
    system: 'OB/GYN',
    topic: 'Gestational Diabetes',
    highYield: true,
    testableAngles: [
      '24-28 weeks: 50g glucose challenge test (GCT)',
      'GCT >= 140: proceed to 3-hour 100g OGTT',
      'OGTT: 2 or more abnormal values = GDM',
      'High risk women: screen at first prenatal visit AND 24-28 weeks'
    ],
    relatedConcepts: ['dm-pregnancy-management'],
    qbankMapping: {
      uworld: [],
      amboss: []
    }
  }
];

// ============================================================================
// PSYCHIATRY CONCEPTS
// ============================================================================

export const psychiatryConcepts: ClinicalConcept[] = [
  {
    code: 'mdd-first-line-treatment',
    name: 'Depression First-Line Treatment',
    clinicalDecision: 'MDD first-line: SSRIs (sertraline, escitalopram); add psychotherapy for best outcomes',
    system: 'Psychiatry',
    topic: 'Depression',
    highYield: true,
    testableAngles: [
      'SSRIs first-line: sertraline, escitalopram (fluoxetine in adolescents)',
      'Takes 4-6 weeks for full effect - counsel on this',
      'Side effects: sexual dysfunction, GI upset, weight gain, serotonin syndrome',
      'Augment with atypical antipsychotic or switch class if no response'
    ],
    relatedConcepts: ['mdd-suicide-risk', 'bipolar-treatment'],
    qbankMapping: {
      uworld: ['56789', '67890'],
      amboss: []
    }
  },
  {
    code: 'bipolar-treatment',
    name: 'Bipolar Disorder Treatment',
    clinicalDecision: 'Bipolar: mood stabilizer (lithium, valproate) +/- atypical antipsychotic; antidepressants alone can trigger mania',
    system: 'Psychiatry',
    topic: 'Bipolar Disorder',
    highYield: true,
    testableAngles: [
      'Lithium: gold standard for bipolar, also reduces suicide',
      'Valproate: especially for rapid cycling or mixed episodes',
      'Acute mania: atypical antipsychotic (olanzapine, quetiapine)',
      'NEVER use antidepressant monotherapy - can trigger mania'
    ],
    relatedConcepts: ['lithium-monitoring', 'mdd-first-line-treatment'],
    qbankMapping: {
      uworld: [],
      amboss: []
    }
  },
  {
    code: 'lithium-monitoring',
    name: 'Lithium Monitoring and Toxicity',
    clinicalDecision: 'Lithium: check level, TSH, creatinine; narrow therapeutic window (0.6-1.2); toxicity causes tremor, confusion, seizures',
    system: 'Psychiatry',
    topic: 'Bipolar Disorder',
    highYield: true,
    testableAngles: [
      'Therapeutic level: 0.6-1.2 mEq/L',
      'Monitor: lithium level, creatinine, TSH every 6 months',
      'Side effects: hypothyroidism, nephrogenic DI, tremor, weight gain',
      'Toxicity: GI symptoms, coarse tremor, confusion, seizures, arrhythmias'
    ],
    relatedConcepts: ['bipolar-treatment'],
    qbankMapping: {
      uworld: ['78901', '89012'],
      amboss: []
    }
  },
  {
    code: 'schizophrenia-first-episode',
    name: 'First-Episode Schizophrenia Treatment',
    clinicalDecision: 'First-episode psychosis: second-generation antipsychotic (risperidone, olanzapine) preferred; treat for 1-2 years minimum',
    system: 'Psychiatry',
    topic: 'Schizophrenia',
    highYield: true,
    testableAngles: [
      'Second-generation (atypical) preferred: less EPS than first-gen',
      'Monitor metabolic effects: weight, glucose, lipids',
      'Clozapine for treatment-resistant (but requires ANC monitoring)',
      'First episode: lower doses, treat 1-2 years minimum'
    ],
    relatedConcepts: ['antipsychotic-side-effects', 'nms-serotonin-syndrome'],
    qbankMapping: {
      uworld: [],
      amboss: []
    }
  },
  {
    code: 'nms-serotonin-syndrome',
    name: 'NMS vs Serotonin Syndrome',
    clinicalDecision: 'NMS: rigid, slow onset, lead-pipe rigidity from antipsychotics; SS: hyperreflexic, rapid onset, clonus from serotonergic drugs',
    system: 'Psychiatry',
    topic: 'Medication Adverse Effects',
    highYield: true,
    testableAngles: [
      'NMS: antipsychotics, lead-pipe rigidity, hyperthermia, AMS, develops over days',
      'Serotonin syndrome: SSRIs/SNRIs/MAOIs, clonus, hyperreflexia, diarrhea, develops within 24h',
      'NMS treatment: stop antipsychotic, dantrolene, bromocriptine',
      'SS treatment: stop serotonergic drug, cyproheptadine, supportive care'
    ],
    relatedConcepts: ['schizophrenia-first-episode', 'mdd-first-line-treatment'],
    qbankMapping: {
      uworld: ['90123', '01234'],
      amboss: []
    }
  }
];

// ============================================================================
// MASTER CONCEPT LIST
// ============================================================================

export const allConcepts: ClinicalConcept[] = [
  ...cardiologyConcepts,
  ...endocrinologyConcepts,
  ...pulmonologyConcepts,
  ...gastroenterologyConcepts,
  ...nephrologyConcepts,
  ...neurologyConcepts,
  ...infectiousDiseaseConcepts,
  ...obgynConcepts,
  ...psychiatryConcepts
];

// Helper function to look up concept by code
export function getConceptByCode(code: string): ClinicalConcept | undefined {
  return allConcepts.find(c => c.code === code);
}

// Helper function to find concepts by UWorld QID
export function getConceptsByUWorldQID(qid: string): ClinicalConcept[] {
  return allConcepts.filter(c => c.qbankMapping.uworld.includes(qid));
}

// Helper function to find concepts by AMBOSS code
export function getConceptsByAMBOSSCode(code: string): ClinicalConcept[] {
  return allConcepts.filter(c => c.qbankMapping.amboss.includes(code));
}

// Helper function to get concepts by system
export function getConceptsBySystem(system: MedicalSystem): ClinicalConcept[] {
  return allConcepts.filter(c => c.system === system);
}

// Helper function to get high-yield concepts
export function getHighYieldConcepts(): ClinicalConcept[] {
  return allConcepts.filter(c => c.highYield);
}
