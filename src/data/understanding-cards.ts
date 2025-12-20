// Understanding-Based Flashcards for TribeWellMD
// These cards test CLINICAL REASONING, not memorization
// Each card is linked to a concept code for targeted learning

import type { Flashcard } from '@/types';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);
const now = new Date().toISOString();

export const understandingCards: Flashcard[] = [
  // ============================================================================
  // ATRIAL FIBRILLATION - ANTICOAGULATION
  // ============================================================================
  {
    id: generateId(),
    schemaVersion: '1.0',
    createdAt: now,
    updatedAt: now,
    userId: 'system',
    content: {
      front: `A 72-year-old woman with newly diagnosed atrial fibrillation asks why she needs to take a blood thinner when her 65-year-old male neighbor with AFib doesn't take one.

Both have hypertension controlled on lisinopril. She also has well-controlled type 2 diabetes.

**What explains this difference, and is anticoagulation appropriate for her?**`,
      back: `**Yes, she should be anticoagulated. Her neighbor likely has a lower stroke risk score.**

**CHA2DS2-VASc Comparison:**
- **Her score = 5**: Age 65-74 (+1), Female (+1), HTN (+1), DM (+1), Age ≥75 would be +2 but she's 72
  - Actually: C (0), H (1), A2 (1 for 65-74), D (1), S2 (0), V (0), A (1 for 65-74), Sc (1) = **4-5 points**
- **His score = 1-2**: Age 65 (+1), HTN (+1), Male (0), no DM

**The Decision Threshold:**
- Men: Anticoagulate if score ≥ 2
- Women: Anticoagulate if score ≥ 3 (sex adds a point but raises threshold)
- Score of 1 = "gray zone" - shared decision-making

Her neighbor may be in that gray zone or just below threshold.`,
      explanation: `This tests understanding of CHA2DS2-VASc application, not just recall of the components. The "password" is knowing that the threshold differs by sex and that a score of 1 is a gray zone requiring discussion.`,
      references: ['2023 ACC/AHA AFib Guidelines', 'CHA2DS2-VASc Score']
    },
    metadata: {
      tags: ['atrial-fibrillation', 'anticoagulation', 'risk-stratification', 'clinical-reasoning'],
      system: 'Cardiology',
      topic: 'Atrial Fibrillation',
      difficulty: 'medium',
      clinicalVignette: true,
      source: 'TribeWellMD',
      usmleStep: 2,
      rotation: 'Internal Medicine',
      conceptCode: 'afib-anticoag-threshold',
      clinicalDecision: 'CHA2DS2-VASc >= 2 (men) or >= 3 (women) for anticoagulation',
      qbankCodes: { uworld: ['4911', '6845'], amboss: [] },
      relatedConcepts: ['afib-doac-vs-warfarin', 'afib-rate-vs-rhythm']
    },
    spacedRepetition: {
      state: 'new',
      interval: 0,
      ease: 2.5,
      reps: 0,
      lapses: 0,
      nextReview: now
    }
  },

  {
    id: generateId(),
    schemaVersion: '1.0',
    createdAt: now,
    updatedAt: now,
    userId: 'system',
    content: {
      front: `A 58-year-old man with persistent atrial fibrillation and hypertension is started on apixaban for stroke prevention.

Six months later, he develops severe mitral stenosis requiring mechanical mitral valve replacement.

**What change, if any, should be made to his anticoagulation regimen?**`,
      back: `**Switch from apixaban to warfarin immediately.**

**Why DOACs are contraindicated with mechanical valves:**
- RE-ALIGN trial: dabigatran caused MORE thromboembolic events and bleeding than warfarin in mechanical valve patients
- All DOACs (apixaban, rivaroxaban, dabigatran, edoxaban) are contraindicated
- Mechanism: DOACs don't adequately prevent the specific thrombotic pathways activated by mechanical valves

**Warfarin targets for mechanical valves:**
- Mitral position: INR 2.5-3.5 (higher risk location)
- Aortic position: INR 2.0-3.0
- Add low-dose aspirin (75-100mg) in most cases

**The two absolute DOAC contraindications in AFib:**
1. Mechanical heart valve
2. Moderate-to-severe mitral stenosis`,
      explanation: `This tests whether students understand the critical contraindication rather than just memorizing "mechanical valve = warfarin." The RE-ALIGN trial result is the key evidence.`,
      references: ['RE-ALIGN Trial', '2020 ACC/AHA Valvular Heart Disease Guidelines']
    },
    metadata: {
      tags: ['anticoagulation', 'mechanical-valve', 'doac', 'warfarin', 'contraindications'],
      system: 'Cardiology',
      topic: 'Valvular Disease',
      difficulty: 'medium',
      clinicalVignette: true,
      source: 'TribeWellMD',
      usmleStep: 2,
      rotation: 'Internal Medicine',
      conceptCode: 'afib-doac-vs-warfarin',
      clinicalDecision: 'Mechanical valves require warfarin; DOACs are contraindicated',
      qbankCodes: { uworld: ['7890'], amboss: [] },
      relatedConcepts: ['afib-anticoag-threshold', 'valve-mechanical-anticoag']
    },
    spacedRepetition: {
      state: 'new',
      interval: 0,
      ease: 2.5,
      reps: 0,
      lapses: 0,
      nextReview: now
    }
  },

  // ============================================================================
  // ATRIAL FIBRILLATION - RATE VS RHYTHM CONTROL
  // ============================================================================
  {
    id: generateId(),
    schemaVersion: '1.0',
    createdAt: now,
    updatedAt: now,
    userId: 'system',
    content: {
      front: `A 78-year-old woman with persistent atrial fibrillation, heart rate 95 bpm, is asymptomatic on metoprolol 50mg twice daily.

Her cardiologist suggests rhythm control with cardioversion and antiarrhythmic medication to "restore normal sinus rhythm."

**What would you tell this patient about the expected benefits of rhythm control vs. continuing rate control?**`,
      back: `**There is NO proven mortality benefit to rhythm control over rate control in most AFib patients.**

**Key Evidence:**
- AFFIRM trial (2002): No difference in mortality or stroke between rate and rhythm control
- RACE trial: Similar findings
- Both strategies require continued anticoagulation

**When rhythm control IS preferred:**
- Symptomatic despite adequate rate control
- Younger patients
- First episode / recent onset
- Heart failure with reduced EF (CASTLE-AF showed benefit)
- Patient preference after informed discussion

**For this patient:**
- Age 78, asymptomatic, rate controlled
- Rate control is appropriate
- No need to add risks of antiarrhythmics (proarrhythmia, organ toxicity)

**The "password":** Rhythm control doesn't improve survival in most AFib patients.`,
      explanation: `Students often assume "normal sinus rhythm" is inherently better. This tests understanding that the AFFIRM trial showed equivalent outcomes, and rhythm control is reserved for specific indications.`,
      references: ['AFFIRM Trial', 'RACE Trial', 'CASTLE-AF Trial']
    },
    metadata: {
      tags: ['atrial-fibrillation', 'rate-control', 'rhythm-control', 'AFFIRM-trial'],
      system: 'Cardiology',
      topic: 'Atrial Fibrillation',
      difficulty: 'medium',
      clinicalVignette: true,
      source: 'TribeWellMD',
      usmleStep: 2,
      rotation: 'Internal Medicine',
      conceptCode: 'afib-rate-vs-rhythm',
      clinicalDecision: 'Rate control preferred for most AFib; rhythm control if symptomatic or HFrEF',
      qbankCodes: { uworld: ['5678', '9012'], amboss: [] },
      relatedConcepts: ['afib-anticoag-threshold', 'afib-cardioversion-timing']
    },
    spacedRepetition: {
      state: 'new',
      interval: 0,
      ease: 2.5,
      reps: 0,
      lapses: 0,
      nextReview: now
    }
  },

  // ============================================================================
  // HEART FAILURE
  // ============================================================================
  {
    id: generateId(),
    schemaVersion: '1.0',
    createdAt: now,
    updatedAt: now,
    userId: 'system',
    content: {
      front: `A 62-year-old man with HFrEF (EF 30%) and atrial fibrillation with rapid ventricular response (HR 130) is admitted for acute decompensation.

The resident suggests starting diltiazem for rate control since "metoprolol isn't working fast enough."

**Why is this a dangerous plan?**`,
      back: `**Non-dihydropyridine CCBs (diltiazem, verapamil) are CONTRAINDICATED in HFrEF.**

**The danger:**
- Negative inotropic effect worsens systolic function
- Can precipitate cardiogenic shock in decompensated HF
- Diltiazem/verapamil decrease contractility more than they help with rate control in this setting

**Safe rate control options in HFrEF + AFib:**
1. **IV metoprolol** (may need higher/more frequent doses)
2. **IV amiodarone** (also has rate-controlling properties)
3. **Digoxin** (if above fail; less effective but no negative inotropy)

**What's safe vs. unsafe in HFrEF:**
| Safe | Contraindicated |
|------|-----------------|
| Beta-blockers (specific ones) | Non-DHP CCBs |
| ACEi/ARB/ARNI | Class IC antiarrhythmics |
| MRA | NSAIDs |
| SGLT2i | Thiazolidinediones |

**The "password":** Non-DHP CCBs are contraindicated in HFrEF.`,
      explanation: `This is a common clinical error. Students must recognize that diltiazem, while useful for rate control, has negative inotropic effects that can be fatal in HFrEF.`,
      references: ['2022 AHA/ACC/HFSA Heart Failure Guidelines']
    },
    metadata: {
      tags: ['heart-failure', 'hfref', 'rate-control', 'contraindications', 'calcium-channel-blockers'],
      system: 'Cardiology',
      topic: 'Heart Failure',
      difficulty: 'hard',
      clinicalVignette: true,
      source: 'TribeWellMD',
      usmleStep: 2,
      rotation: 'Internal Medicine',
      conceptCode: 'hfref-contraindications',
      clinicalDecision: 'Non-DHP CCBs contraindicated in HFrEF due to negative inotropy',
      qbankCodes: { uworld: ['8869', '25460'], amboss: [] },
      relatedConcepts: ['hfref-gdmt-mortality', 'afib-rate-vs-rhythm']
    },
    spacedRepetition: {
      state: 'new',
      interval: 0,
      ease: 2.5,
      reps: 0,
      lapses: 0,
      nextReview: now
    }
  },

  {
    id: generateId(),
    schemaVersion: '1.0',
    createdAt: now,
    updatedAt: now,
    userId: 'system',
    content: {
      front: `A 55-year-old man with newly diagnosed HFrEF (EF 25%) is being started on guideline-directed medical therapy.

He has no contraindications to any medications.

**What four medication classes have proven mortality benefit in HFrEF, and why is the order of initiation less important than getting all four on board?**`,
      back: `**The Four Pillars of HFrEF GDMT (all reduce mortality):**

1. **ACEi/ARB/ARNI** - ARNI (sacubitril/valsartan) superior to ACEi
2. **Beta-blocker** - Only carvedilol, metoprolol succinate, or bisoprolol
3. **MRA** (spironolactone/eplerenone) - Watch K+ and renal function
4. **SGLT2 inhibitor** - Benefit even in non-diabetics

**Why order matters less:**
- Each class reduces mortality INDEPENDENTLY (additive benefit)
- Traditional approach: ACEi → BB → MRA → SGLT2i (sequential)
- Modern approach: Start all four quickly, uptitrate together
- Getting to target doses of all four > which one you start first

**Key trials:**
- PARADIGM-HF: ARNI > ACEi
- DAPA-HF/EMPEROR-Reduced: SGLT2i benefit in HFrEF ± diabetes

**What does NOT reduce mortality:**
- Diuretics (symptom relief only)
- Digoxin (reduces hospitalizations, not mortality)
- Hydralazine-nitrate (mortality benefit only in Black patients or if ACEi-intolerant)`,
      explanation: `This tests understanding that all four pillars independently reduce mortality, not just that they're "recommended." The concept that rapid initiation of all four matters more than the traditional sequential approach is key.`,
      references: ['2022 AHA/ACC/HFSA HF Guidelines', 'PARADIGM-HF', 'DAPA-HF', 'EMPEROR-Reduced']
    },
    metadata: {
      tags: ['heart-failure', 'hfref', 'gdmt', 'mortality-benefit', 'four-pillars'],
      system: 'Cardiology',
      topic: 'Heart Failure',
      difficulty: 'medium',
      clinicalVignette: true,
      source: 'TribeWellMD',
      usmleStep: 2,
      rotation: 'Internal Medicine',
      conceptCode: 'hfref-gdmt-mortality',
      clinicalDecision: 'Four pillars (ACEi/ARB/ARNI, BB, MRA, SGLT2i) all independently reduce mortality',
      qbankCodes: { uworld: ['2107', '25217', '4908'], amboss: ['z5ar5O'] },
      relatedConcepts: ['hfref-contraindications', 'dm-sglt2-benefits']
    },
    spacedRepetition: {
      state: 'new',
      interval: 0,
      ease: 2.5,
      reps: 0,
      lapses: 0,
      nextReview: now
    }
  },

  // ============================================================================
  // HYPERTENSION
  // ============================================================================
  {
    id: generateId(),
    schemaVersion: '1.0',
    createdAt: now,
    updatedAt: now,
    userId: 'system',
    content: {
      front: `Two patients present with blood pressure 145/92:

**Patient A:** 45-year-old Black woman, no other medical history, 10-year ASCVD risk 4%

**Patient B:** 52-year-old White man with type 2 diabetes, 10-year ASCVD risk 12%

**Should you start antihypertensive medication in both? If so, what first-line agent(s) would you choose for each?**`,
      back: `**Patient A: Lifestyle modification first, then medication if BP persists**
- BP 145/92 is Stage 2 HTN
- But 10-year ASCVD risk < 10% and no compelling indication
- Per guidelines: Start meds at ≥ 140/90 for low-risk patients
- If meds needed: **Thiazide or CCB preferred** in Black patients (ACEi/ARB less effective as monotherapy)

**Patient B: Start medication immediately**
- Diabetes = compelling indication for earlier treatment
- Threshold: ≥ 130/80 with DM, CKD, or ASCVD risk ≥ 10%
- First-line: **ACEi or ARB** (renoprotective in diabetics)
- May need combination therapy for this BP

**Key Decision Points:**
| Feature | Lower Threshold (≥130/80) | Standard (≥140/90) |
|---------|---------------------------|---------------------|
| Diabetes | Yes | - |
| CKD | Yes | - |
| Known CVD | Yes | - |
| ASCVD risk ≥10% | Yes | - |
| Otherwise healthy | - | Yes |

**Race-based differences:** Black patients respond better to thiazides/CCBs; ACEi/ARB can still be used but often need combination.`,
      explanation: `This tests understanding of treatment thresholds based on risk stratification AND first-line agent selection based on patient characteristics.`,
      references: ['2017 ACC/AHA Hypertension Guidelines', 'SPRINT Trial']
    },
    metadata: {
      tags: ['hypertension', 'treatment-threshold', 'first-line-agents', 'race-based-medicine', 'diabetes'],
      system: 'Cardiology',
      topic: 'Hypertension',
      difficulty: 'medium',
      clinicalVignette: true,
      source: 'TribeWellMD',
      usmleStep: 2,
      rotation: 'Ambulatory',
      conceptCode: 'htn-treatment-threshold',
      clinicalDecision: 'Start meds at ≥130/80 if high risk; ≥140/90 if low risk',
      qbankCodes: { uworld: ['25216', '2107'], amboss: ['z5ar5O'] },
      relatedConcepts: ['htn-first-line-agents', 'dm-nephropathy-acei']
    },
    spacedRepetition: {
      state: 'new',
      interval: 0,
      ease: 2.5,
      reps: 0,
      lapses: 0,
      nextReview: now
    }
  },

  // ============================================================================
  // THYROID + AFib CONNECTION
  // ============================================================================
  {
    id: generateId(),
    schemaVersion: '1.0',
    createdAt: now,
    updatedAt: now,
    userId: 'system',
    content: {
      front: `A 45-year-old woman presents with palpitations, weight loss, and tremor. ECG shows atrial fibrillation with rapid ventricular response (HR 140). TSH is undetectable, free T4 is elevated.

**Two questions:**
1. What medication should be started immediately for symptom control?
2. Will treating her hyperthyroidism eliminate the need for anticoagulation?`,
      back: `**1. Start a beta-blocker immediately (propranolol preferred)**

**Why propranolol specifically:**
- Controls tachycardia and palpitations
- Reduces tremor
- BONUS: Inhibits peripheral T4 → T3 conversion
- Alternative: any beta-blocker works for rate control

**Also start:** Methimazole or PTU for hyperthyroidism treatment

---

**2. No - she still needs anticoagulation evaluation**

**Common misconception:** "AFib from hyperthyroidism is temporary, so no anticoagulation needed"

**Reality:**
- Still calculate CHA2DS2-VASc
- If score meets threshold, anticoagulate
- AFib may resolve with euthyroid state, but:
  - Takes weeks to months
  - Stroke risk exists during that time
  - Some patients remain in AFib even after treatment

**For this patient (age 45, female):**
- Score = 1 (female sex)
- Gray zone - discuss risks/benefits
- Consider at least short-term anticoagulation until euthyroid and reassessed`,
      explanation: `This connects two concepts: the use of beta-blockers in hyperthyroidism (with propranolol's unique benefit) and the persistent need for anticoagulation assessment regardless of the underlying cause.`,
      references: ['2016 ATA Hyperthyroidism Guidelines', 'ACC/AHA AFib Guidelines']
    },
    metadata: {
      tags: ['hyperthyroidism', 'atrial-fibrillation', 'beta-blockers', 'anticoagulation', 'thyroid-storm'],
      system: 'Endocrinology',
      topic: 'Thyroid Disease',
      difficulty: 'medium',
      clinicalVignette: true,
      source: 'TribeWellMD',
      usmleStep: 2,
      rotation: 'Internal Medicine',
      conceptCode: 'thyroid-hyperthyroid-afib',
      clinicalDecision: 'Beta-blockers for symptom control; still need anticoagulation assessment',
      qbankCodes: { uworld: ['25259', '26055', '14985', '6797'], amboss: ['YXan9Q'] },
      relatedConcepts: ['afib-anticoag-threshold', 'afib-rate-vs-rhythm']
    },
    spacedRepetition: {
      state: 'new',
      interval: 0,
      ease: 2.5,
      reps: 0,
      lapses: 0,
      nextReview: now
    }
  },

  // ============================================================================
  // GASTROENTEROLOGY
  // ============================================================================
  {
    id: generateId(),
    schemaVersion: '1.0',
    createdAt: now,
    updatedAt: now,
    userId: 'system',
    content: {
      front: `A 62-year-old man presents with 6 weeks of heartburn. He's been using over-the-counter antacids with partial relief. He mentions he's lost about 10 pounds "without trying" and has had some difficulty swallowing solid foods.

**Should you start empiric PPI therapy or pursue further workup first?**`,
      back: `**EGD first - do NOT start empiric PPI therapy.**

**Alarm Features Present (VBAD):**
- Weight loss (unintentional) - present
- Dysphagia - present
- Age > 60 with new symptoms
- These require endoscopy BEFORE PPI trial

**Why this matters:**
- PPIs can mask symptoms of esophageal/gastric cancer
- Healing of ulcers makes cancer harder to detect
- Delay in diagnosis worsens prognosis

**When empiric PPI is appropriate:**
- Age < 60
- No alarm features
- Typical GERD symptoms
- Trial of PPI x 8 weeks

**The "password":** GERD + alarm features = EGD first, not empiric PPI.`,
      explanation: `Students often default to PPIs for any reflux symptoms. This tests recognition that alarm features mandate endoscopy before empiric therapy.`,
      references: ['ACG Clinical Guidelines: GERD', 'ASGE Standards of Practice']
    },
    metadata: {
      tags: ['gerd', 'alarm-features', 'endoscopy', 'esophageal-cancer'],
      system: 'Gastroenterology',
      topic: 'GERD',
      difficulty: 'medium',
      clinicalVignette: true,
      source: 'TribeWellMD',
      usmleStep: 2,
      rotation: 'Internal Medicine',
      conceptCode: 'gerd-alarm-features',
      clinicalDecision: 'GERD with alarm features requires EGD before empiric PPI',
      qbankCodes: { uworld: ['12890', '15678'], amboss: [] },
      relatedConcepts: ['pud-hpylori-treatment', 'gi-bleed-management']
    },
    spacedRepetition: {
      state: 'new',
      interval: 0,
      ease: 2.5,
      reps: 0,
      lapses: 0,
      nextReview: now
    }
  },
  {
    id: generateId(),
    schemaVersion: '1.0',
    createdAt: now,
    updatedAt: now,
    userId: 'system',
    content: {
      front: `A 52-year-old woman with known cirrhosis presents with fever, diffuse abdominal pain, and worsening ascites. Paracentesis shows: WBC 800/mm³ with 400 PMNs (50%), protein 0.8 g/dL.

**What is the diagnosis and what THREE interventions should be started immediately?**`,
      back: `**Diagnosis: Spontaneous Bacterial Peritonitis (SBP)**

**Diagnostic criteria:** Ascitic PMN count > 250/mm³
(Her PMN count = 400 - meets criteria)

**Three Immediate Interventions:**

1. **IV Antibiotics** - Ceftriaxone 2g daily (or cefotaxime)
   - Covers gram-negatives (E. coli, Klebsiella)
   - Start empirically before culture results

2. **IV Albumin** - 1.5 g/kg day 1, then 1 g/kg day 3
   - Reduces mortality and hepatorenal syndrome
   - Especially if Cr > 1 or BUN > 30 or bilirubin > 4

3. **Start SBP Prophylaxis Planning**
   - After treatment, she needs lifelong secondary prophylaxis
   - Norfloxacin or TMP-SMX daily

**The "password":** SBP = PMN > 250 → immediate antibiotics + albumin

**What NOT to do:**
- Do not wait for culture results to start antibiotics
- Do not send fluid for Gram stain only (sensitivity too low)`,
      explanation: `This tests recognition of SBP criteria and the evidence-based bundle of antibiotics plus albumin for reducing mortality.`,
      references: ['AASLD Practice Guidance: Ascites', 'Hepatorenal Syndrome Prevention Trial']
    },
    metadata: {
      tags: ['cirrhosis', 'sbp', 'ascites', 'antibiotics', 'albumin'],
      system: 'Gastroenterology',
      topic: 'Cirrhosis',
      difficulty: 'hard',
      clinicalVignette: true,
      source: 'TribeWellMD',
      usmleStep: 2,
      rotation: 'Internal Medicine',
      conceptCode: 'cirrhosis-sbp-prophylaxis',
      clinicalDecision: 'SBP = PMN > 250; treat with ceftriaxone + albumin; lifelong prophylaxis after',
      qbankCodes: { uworld: [], amboss: [] },
      relatedConcepts: ['cirrhosis-variceal-bleed']
    },
    spacedRepetition: {
      state: 'new',
      interval: 0,
      ease: 2.5,
      reps: 0,
      lapses: 0,
      nextReview: now
    }
  },

  // ============================================================================
  // NEPHROLOGY
  // ============================================================================
  {
    id: generateId(),
    schemaVersion: '1.0',
    createdAt: now,
    updatedAt: now,
    userId: 'system',
    content: {
      front: `A 68-year-old man with CKD stage 3 (baseline Cr 1.8) is started on lisinopril for proteinuria. One week later, his creatinine is 2.2.

**Should you continue, adjust, or stop the ACE inhibitor?**`,
      back: `**CONTINUE the ACE inhibitor - this rise is expected and acceptable.**

**The "30% Rule":**
- Creatinine can rise up to 30% in the first 1-2 weeks after ACEi/ARB initiation
- This is due to decreased intraglomerular pressure (the mechanism of renoprotection!)
- His rise: (2.2-1.8)/1.8 = 22% ← Within acceptable range

**When to STOP ACEi/ARB:**
- Creatinine rises > 30% from baseline
- Potassium > 5.5 mEq/L
- Symptomatic hypotension

**Why continuing is BENEFICIAL:**
- ACEi/ARB slow CKD progression in proteinuric disease
- Long-term renoprotection outweighs short-term Cr bump
- Stopping would remove this protective effect

**What to do next:**
- Recheck creatinine and potassium in 1-2 weeks
- If stable, continue current dose
- Ensure adequate hydration, avoid NSAIDs

**The "password":** Up to 30% Cr rise is acceptable after starting ACEi/ARB.`,
      explanation: `Students often reflexively stop ACEi when creatinine rises. This tests understanding that modest rises are expected and stopping removes renoprotective benefit.`,
      references: ['KDIGO CKD Guidelines', 'REIN Study', 'RENAAL Trial']
    },
    metadata: {
      tags: ['ckd', 'ace-inhibitor', 'creatinine', 'renoprotection', 'proteinuria'],
      system: 'Nephrology',
      topic: 'Chronic Kidney Disease',
      difficulty: 'medium',
      clinicalVignette: true,
      source: 'TribeWellMD',
      usmleStep: 2,
      rotation: 'Internal Medicine',
      conceptCode: 'ckd-progression-acei',
      clinicalDecision: 'ACEi/ARB: continue if Cr rises < 30%; stop if > 30% or K > 5.5',
      qbankCodes: { uworld: [], amboss: [] },
      relatedConcepts: ['aki-prerenal-intrinsic', 'htn-first-line-agents']
    },
    spacedRepetition: {
      state: 'new',
      interval: 0,
      ease: 2.5,
      reps: 0,
      lapses: 0,
      nextReview: now
    }
  },
  {
    id: generateId(),
    schemaVersion: '1.0',
    createdAt: now,
    updatedAt: now,
    userId: 'system',
    content: {
      front: `An 82-year-old man in the ICU develops AKI. His labs show:
- BUN: 84 mg/dL
- Creatinine: 4.2 mg/dL (baseline 1.0)
- Urine sodium: 45 mEq/L
- FENa: 3.2%

Urinalysis shows muddy brown casts.

**What type of AKI does this patient have, and how does this differentiate from prerenal azotemia?**`,
      back: `**This is Acute Tubular Necrosis (ATN) - intrinsic renal disease.**

**ATN vs Prerenal Comparison:**

| Finding | This Patient (ATN) | Prerenal |
|---------|-------------------|----------|
| BUN:Cr ratio | 20:1 (84/4.2 = 20) | > 20:1 |
| FENa | 3.2% (> 2%) | < 1% |
| Urine sodium | 45 (high) | < 20 (low) |
| Urine sediment | Muddy brown casts | Bland or hyaline casts |

**Understanding the pathophysiology:**
- **Prerenal:** Kidneys working properly, just underperfused → hold onto sodium aggressively → low FENa
- **ATN:** Tubules damaged → can't reabsorb sodium → high FENa, high urine sodium

**The muddy brown casts clinch it:**
- Pathognomonic for ATN
- Made of sloughed tubular epithelial cells

**Treatment differences:**
- Prerenal: Volume resuscitation fixes it
- ATN: Supportive care, may need dialysis

**The "password":** FENa < 1% = prerenal; FENa > 2% + muddy brown casts = ATN`,
      explanation: `This tests the practical application of FENa and urinalysis findings to differentiate AKI types, not just knowing the formulas.`,
      references: ['KDIGO AKI Guidelines', 'Nephrology Case Studies']
    },
    metadata: {
      tags: ['aki', 'atn', 'prerenal', 'fena', 'muddy-brown-casts'],
      system: 'Nephrology',
      topic: 'Acute Kidney Injury',
      difficulty: 'medium',
      clinicalVignette: true,
      source: 'TribeWellMD',
      usmleStep: 2,
      rotation: 'Internal Medicine',
      conceptCode: 'aki-prerenal-intrinsic',
      clinicalDecision: 'FENa < 1% = prerenal; FENa > 2% + muddy brown casts = ATN',
      qbankCodes: { uworld: ['67890', '78901'], amboss: [] },
      relatedConcepts: ['ckd-progression-acei']
    },
    spacedRepetition: {
      state: 'new',
      interval: 0,
      ease: 2.5,
      reps: 0,
      lapses: 0,
      nextReview: now
    }
  },

  // ============================================================================
  // NEUROLOGY
  // ============================================================================
  {
    id: generateId(),
    schemaVersion: '1.0',
    createdAt: now,
    updatedAt: now,
    userId: 'system',
    content: {
      front: `A 72-year-old man wakes up at 6 AM with left arm weakness and slurred speech. His wife says he was fine when they went to bed at 10 PM. It's now 7 AM and he's in the ED.

CT head shows no hemorrhage.

**Is he a candidate for IV tPA? What about mechanical thrombectomy?**`,
      back: `**IV tPA: Uncertain - may still be a candidate with MRI**

**The Problem:**
- Last known normal: 10 PM (9 hours ago)
- Standard tPA window: 4.5 hours from last known normal
- He EXCEEDS the standard window

**BUT - Wake-up stroke protocol:**
- MRI with DWI/FLAIR can identify salvageable tissue
- If DWI positive but FLAIR negative = stroke is < 4.5 hours old
- "DWI-FLAIR mismatch" → can still give tPA

**Mechanical Thrombectomy: Likely candidate**
- Window extended to 6-24 hours for large vessel occlusion
- Need to confirm LVO on CTA
- DAWN and DEFUSE-3 trials showed benefit up to 24 hours

**Next Steps:**
1. Stat CTA to look for large vessel occlusion
2. If LVO present → thrombectomy candidate
3. MRI to assess DWI-FLAIR mismatch for tPA eligibility

**The "password":**
- tPA: 4.5h from last known normal (or DWI-FLAIR mismatch)
- Thrombectomy: Up to 24h for LVO with favorable imaging`,
      explanation: `This tests understanding that wake-up strokes can still be treated, and that thrombectomy has a much longer window than tPA for appropriate patients.`,
      references: ['WAKE-UP Trial', 'DAWN Trial', 'DEFUSE-3 Trial']
    },
    metadata: {
      tags: ['stroke', 'tpa', 'thrombectomy', 'wake-up-stroke', 'time-window'],
      system: 'Neurology',
      topic: 'Stroke',
      difficulty: 'hard',
      clinicalVignette: true,
      source: 'TribeWellMD',
      usmleStep: 2,
      rotation: 'Neurology',
      conceptCode: 'stroke-tpa-window',
      clinicalDecision: 'tPA within 4.5h; thrombectomy up to 24h for LVO; wake-up strokes may qualify',
      qbankCodes: { uworld: ['34567', '45678'], amboss: [] },
      relatedConcepts: ['stroke-secondary-prevention']
    },
    spacedRepetition: {
      state: 'new',
      interval: 0,
      ease: 2.5,
      reps: 0,
      lapses: 0,
      nextReview: now
    }
  },
  {
    id: generateId(),
    schemaVersion: '1.0',
    createdAt: now,
    updatedAt: now,
    userId: 'system',
    content: {
      front: `A 45-year-old woman presents with sudden-onset "worst headache of her life" that started 2 hours ago while lifting weights. She has no prior headache history. Current exam is normal.

CT head is negative for hemorrhage.

**What is your next step?**`,
      back: `**Lumbar puncture is MANDATORY - cannot rule out SAH with negative CT alone.**

**The Clinical Picture:**
- "Worst headache of life" = thunderclap headache
- Sudden onset during exertion
- No prior headache history
- Classic for subarachnoid hemorrhage (SAH)

**Why CT isn't enough:**
- CT sensitivity for SAH: ~95% at 6 hours, drops to ~50% at 1 week
- 5% of SAH patients have negative CT
- Negative CT does NOT rule out SAH

**LP Findings in SAH:**
- Elevated opening pressure
- Xanthochromia (yellow CSF from hemoglobin breakdown)
- Elevated RBCs that do NOT clear between tubes 1 and 4

**If LP is positive or equivocal:**
- CTA or conventional angiography to find aneurysm
- Neurosurgical consultation

**Headache Red Flags (SNOOP):**
- Sudden onset (thunderclap) ✓
- Neurologic signs
- Older age with new headache
- Other (exertional, positional, pregnancy)
- Pattern change

**The "password":** Thunderclap headache + negative CT = LP is mandatory.`,
      explanation: `This tests understanding that CT alone cannot rule out SAH, especially in a classic presentation. LP is essential even with negative imaging.`,
      references: ['ACEP Clinical Policy: Headache', 'Ottawa SAH Rule']
    },
    metadata: {
      tags: ['headache', 'sah', 'thunderclap', 'lumbar-puncture', 'red-flags'],
      system: 'Neurology',
      topic: 'Headache',
      difficulty: 'medium',
      clinicalVignette: true,
      source: 'TribeWellMD',
      usmleStep: 2,
      rotation: 'Emergency Medicine',
      conceptCode: 'headache-red-flags',
      clinicalDecision: 'Thunderclap headache needs LP even if CT negative',
      qbankCodes: { uworld: ['56789', '67890'], amboss: [] },
      relatedConcepts: ['stroke-tpa-window']
    },
    spacedRepetition: {
      state: 'new',
      interval: 0,
      ease: 2.5,
      reps: 0,
      lapses: 0,
      nextReview: now
    }
  },

  // ============================================================================
  // INFECTIOUS DISEASE
  // ============================================================================
  {
    id: generateId(),
    schemaVersion: '1.0',
    createdAt: now,
    updatedAt: now,
    userId: 'system',
    content: {
      front: `A 28-year-old healthy woman presents with 2 days of dysuria and urinary frequency. She has no fever, flank pain, or vaginal symptoms. Urine dipstick shows nitrites and leukocyte esterase.

**What is the most appropriate antibiotic regimen?**`,
      back: `**Nitrofurantoin 100mg BID x 5 days (or alternatives)**

**First-Line Options for Uncomplicated Cystitis:**
1. Nitrofurantoin 100mg BID x 5 days (preferred)
2. TMP-SMX 160/800mg BID x 3 days
3. Fosfomycin 3g single dose

**Why NOT fluoroquinolones:**
- Cipro/levo are overly broad for uncomplicated UTI
- Serious side effects (tendinopathy, aortic dissection, QT prolongation)
- Reserve for complicated UTI/pyelonephritis
- FDA black box warning for simple infections

**Uncomplicated vs Complicated UTI:**
| Uncomplicated | Complicated |
|---------------|-------------|
| Female | Male |
| No structural abnormality | Catheter/stent |
| No pregnancy | Pregnant |
| No fever/flank pain | Pyelonephritis |
| Normal urinary tract | Recent instrumentation |

**Key Points:**
- Urine culture not needed for uncomplicated cystitis
- Nitrofurantoin achieves high urinary concentration but NOT blood/tissue (not for pyelo)
- Fosfomycin = good for ESBL organisms

**The "password":** Uncomplicated UTI = nitrofurantoin/TMP-SMX/fosfomycin, NOT fluoroquinolones.`,
      explanation: `This tests appropriate antibiotic stewardship - knowing that fluoroquinolones are inappropriate for simple cystitis despite being commonly prescribed.`,
      references: ['IDSA UTI Guidelines', 'FDA Fluoroquinolone Safety Communication']
    },
    metadata: {
      tags: ['uti', 'cystitis', 'nitrofurantoin', 'antibiotic-stewardship'],
      system: 'Infectious Disease',
      topic: 'Urinary Tract Infection',
      difficulty: 'easy',
      clinicalVignette: true,
      source: 'TribeWellMD',
      usmleStep: 2,
      rotation: 'Ambulatory',
      conceptCode: 'uti-uncomplicated-treatment',
      clinicalDecision: 'Uncomplicated UTI: nitrofurantoin/TMP-SMX/fosfomycin; save fluoroquinolones for complicated',
      qbankCodes: { uworld: ['78901', '89012'], amboss: [] },
      relatedConcepts: ['cap-outpatient-treatment']
    },
    spacedRepetition: {
      state: 'new',
      interval: 0,
      ease: 2.5,
      reps: 0,
      lapses: 0,
      nextReview: now
    }
  },
  {
    id: generateId(),
    schemaVersion: '1.0',
    createdAt: now,
    updatedAt: now,
    userId: 'system',
    content: {
      front: `A 58-year-old man presents with fever, headache, and neck stiffness. LP shows: WBC 1200/μL (95% PMNs), protein 180 mg/dL, glucose 25 mg/dL (serum 100).

Gram stain shows gram-positive diplococci.

**What three medications should be started immediately, and in what order?**`,
      back: `**Start all three SIMULTANEOUSLY (or dex first/with antibiotics):**

1. **Dexamethasone 0.15 mg/kg q6h** - GIVE BEFORE OR WITH first antibiotic dose
2. **Ceftriaxone 2g IV q12h** - covers S. pneumoniae, N. meningitidis
3. **Vancomycin 15-20 mg/kg IV q8-12h** - covers drug-resistant S. pneumoniae

**Why dexamethasone timing matters:**
- Reduces mortality and neurologic sequelae (especially hearing loss)
- MUST be given before or with first antibiotic dose
- If given after antibiotics, benefit is lost
- Continue x 4 days if S. pneumoniae confirmed

**LP Findings = Bacterial Meningitis:**
| Finding | This Patient | Bacterial Pattern |
|---------|-------------|-------------------|
| WBC | 1200 (95% PMN) | High, neutrophil predominant |
| Protein | 180 | Elevated (> 100) |
| Glucose | 25 (CSF:serum = 0.25) | Low (< 40% serum) |

**When to add Ampicillin:**
- Age > 50 years (this patient - add it!)
- Immunocompromised
- Covers Listeria monocytogenes

**The "password":** Bacterial meningitis = dex + vanc + ceftriaxone (+ ampicillin if > 50 or immunocompromised)`,
      explanation: `This tests the critical timing of dexamethasone (before/with antibiotics) and age-based decision for Listeria coverage.`,
      references: ['IDSA Bacterial Meningitis Guidelines', 'European Dexamethasone Trial']
    },
    metadata: {
      tags: ['meningitis', 'ceftriaxone', 'vancomycin', 'dexamethasone', 'listeria'],
      system: 'Infectious Disease',
      topic: 'Central Nervous System Infections',
      difficulty: 'hard',
      clinicalVignette: true,
      source: 'TribeWellMD',
      usmleStep: 2,
      rotation: 'Internal Medicine',
      conceptCode: 'meningitis-empiric-treatment',
      clinicalDecision: 'Meningitis: dex + vanc + ceftriaxone; add ampicillin if > 50 or immunocompromised',
      qbankCodes: { uworld: ['90123', '01234'], amboss: [] },
      relatedConcepts: ['cap-outpatient-treatment']
    },
    spacedRepetition: {
      state: 'new',
      interval: 0,
      ease: 2.5,
      reps: 0,
      lapses: 0,
      nextReview: now
    }
  },

  // ============================================================================
  // OB/GYN
  // ============================================================================
  {
    id: generateId(),
    schemaVersion: '1.0',
    createdAt: now,
    updatedAt: now,
    userId: 'system',
    content: {
      front: `A 32-year-old G1P0 at 34 weeks presents with BP 165/105 on two readings 4 hours apart. Labs show platelets 85,000, AST 180, and 2+ proteinuria. She has a headache but no visual changes.

**What is the diagnosis and management plan?**`,
      back: `**Diagnosis: Preeclampsia with Severe Features**

**Severe features present:**
- BP ≥ 160/110 ✓ (165/105)
- Platelets < 100,000 ✓ (85K)
- Liver transaminases > 2x normal ✓ (AST 180)
- Symptoms (headache) ✓

**Immediate Management:**
1. **Magnesium sulfate** - seizure prophylaxis (4-6g IV bolus, then 1-2g/hr)
2. **Antihypertensive** - IV labetalol or hydralazine to get BP < 160/110
3. **Betamethasone** - fetal lung maturity (2 doses 24h apart)
4. **Plan for delivery** - after stabilization

**Delivery Timing:**
- ≥ 37 weeks with severe features → deliver
- 34-37 weeks with severe features → deliver after steroids (24-48h delay okay if stable)
- < 34 weeks → consider expectant management only if very stable

**This patient (34 weeks + severe features):**
- Give betamethasone now
- May delay delivery 24-48 hours for steroid benefit if she stabilizes
- If worsening → deliver immediately

**What magnesium does NOT do:**
- Does NOT treat hypertension (common misconception)
- Only for seizure prophylaxis

**The "password":** Severe preeclampsia ≥ 34 weeks = steroids + mag + deliver after stabilization.`,
      explanation: `This tests recognition of severe features, understanding that magnesium is for seizures (not BP), and the nuanced decision-making around delivery timing.`,
      references: ['ACOG Practice Bulletin: Gestational Hypertension and Preeclampsia']
    },
    metadata: {
      tags: ['preeclampsia', 'severe-features', 'magnesium', 'delivery-timing'],
      system: 'OB/GYN',
      topic: 'Hypertensive Disorders of Pregnancy',
      difficulty: 'hard',
      clinicalVignette: true,
      source: 'TribeWellMD',
      usmleStep: 2,
      rotation: 'OB/GYN',
      conceptCode: 'preeclampsia-management',
      clinicalDecision: 'Severe preeclampsia ≥ 34 weeks: mag + antihypertensives + steroids + deliver',
      qbankCodes: { uworld: [], amboss: [] },
      relatedConcepts: ['preeclampsia-diagnosis']
    },
    spacedRepetition: {
      state: 'new',
      interval: 0,
      ease: 2.5,
      reps: 0,
      lapses: 0,
      nextReview: now
    }
  },
  {
    id: generateId(),
    schemaVersion: '1.0',
    createdAt: now,
    updatedAt: now,
    userId: 'system',
    content: {
      front: `A 26-year-old woman presents with 6 weeks of amenorrhea and right lower quadrant pain. Transvaginal ultrasound shows a 2.5 cm right adnexal mass with no fetal cardiac activity. Beta-hCG is 3,200 mIU/mL. She is hemodynamically stable.

**Is she a candidate for methotrexate? What are the criteria?**`,
      back: `**Yes - she meets criteria for methotrexate treatment.**

**Methotrexate Eligibility Criteria (she meets all):**
| Criterion | Her Value | Requirement |
|-----------|-----------|-------------|
| Hemodynamic stability | Stable | ✓ Must be stable |
| Beta-hCG | 3,200 | ✓ < 5,000 |
| Mass size | 2.5 cm | ✓ < 3.5 cm |
| Fetal cardiac activity | None | ✓ Must be absent |

**Absolute Contraindications to MTX:**
- Hemodynamically unstable/ruptured ectopic
- Fetal cardiac activity present
- Beta-hCG > 5,000 (relative - can still try but lower success)
- Immunodeficiency
- Active hepatic or renal disease
- Blood dyscrasias

**Methotrexate Protocol:**
- Single dose: 50 mg/m² IM
- Check beta-hCG days 4 and 7
- Should drop ≥ 15% between days 4-7
- If not, repeat dose or surgical intervention

**Pre-treatment Labs:**
- CBC, BMP, LFTs
- Blood type and Rh (give RhoGAM if Rh negative)

**The "password":** MTX for ectopic if: stable, unruptured, mass < 3.5 cm, no cardiac activity, beta-hCG < 5,000.`,
      explanation: `This tests the specific criteria for medical vs. surgical management of ectopic pregnancy - a common USMLE topic.`,
      references: ['ACOG Practice Bulletin: Ectopic Pregnancy']
    },
    metadata: {
      tags: ['ectopic-pregnancy', 'methotrexate', 'beta-hcg', 'adnexal-mass'],
      system: 'OB/GYN',
      topic: 'Ectopic Pregnancy',
      difficulty: 'medium',
      clinicalVignette: true,
      source: 'TribeWellMD',
      usmleStep: 2,
      rotation: 'OB/GYN',
      conceptCode: 'ectopic-methotrexate',
      clinicalDecision: 'MTX for ectopic: stable, mass < 3.5 cm, no FCA, beta-hCG < 5,000',
      qbankCodes: { uworld: ['34567', '45678'], amboss: [] },
      relatedConcepts: ['gdm-screening']
    },
    spacedRepetition: {
      state: 'new',
      interval: 0,
      ease: 2.5,
      reps: 0,
      lapses: 0,
      nextReview: now
    }
  },

  // ============================================================================
  // PSYCHIATRY
  // ============================================================================
  {
    id: generateId(),
    schemaVersion: '1.0',
    createdAt: now,
    updatedAt: now,
    userId: 'system',
    content: {
      front: `A 35-year-old man is brought to the ED by his wife because he hasn't slept in 4 days, has been spending money excessively, and believes he has special powers to predict the stock market. He was recently started on fluoxetine by his PCP for depression.

**What is the likely diagnosis, and what medication change is critical?**`,
      back: `**Diagnosis: Bipolar I Disorder, Manic Episode (likely induced by antidepressant)**

**The Critical Issue:**
- Antidepressant monotherapy in bipolar → can trigger mania
- Fluoxetine (an SSRI) likely precipitated this manic episode
- He was likely misdiagnosed with unipolar depression

**Immediate Medication Changes:**
1. **STOP fluoxetine** - perpetuating the mania
2. **START mood stabilizer** - lithium or valproate
3. **ADD atypical antipsychotic** - olanzapine, quetiapine, or aripiprazole for acute mania

**Manic Episode Criteria (DSM-5) - he has all:**
- Elevated/expansive mood
- Decreased need for sleep (4 days!)
- Grandiosity (special powers)
- Increased goal-directed activity
- Excessive involvement in risky activities (spending)

**The "Never" Rule for Bipolar:**
- NEVER use antidepressant monotherapy
- If antidepressant needed for bipolar depression, MUST be with mood stabilizer

**Long-term Management:**
- Lithium (gold standard, also reduces suicide)
- Valproate (especially for rapid cycling)
- Avoid antidepressant if possible

**The "password":** Bipolar + antidepressant alone = manic episode risk. Always use mood stabilizer first.`,
      explanation: `This tests the critical danger of antidepressant monotherapy in bipolar disorder and the appropriate management of acute mania.`,
      references: ['APA Practice Guideline: Bipolar Disorder']
    },
    metadata: {
      tags: ['bipolar', 'mania', 'antidepressant', 'mood-stabilizer', 'lithium'],
      system: 'Psychiatry',
      topic: 'Bipolar Disorder',
      difficulty: 'medium',
      clinicalVignette: true,
      source: 'TribeWellMD',
      usmleStep: 2,
      rotation: 'Psychiatry',
      conceptCode: 'bipolar-treatment',
      clinicalDecision: 'Bipolar: NEVER antidepressant alone; always mood stabilizer ± atypical antipsychotic',
      qbankCodes: { uworld: [], amboss: [] },
      relatedConcepts: ['lithium-monitoring', 'mdd-first-line-treatment']
    },
    spacedRepetition: {
      state: 'new',
      interval: 0,
      ease: 2.5,
      reps: 0,
      lapses: 0,
      nextReview: now
    }
  },
  {
    id: generateId(),
    schemaVersion: '1.0',
    createdAt: now,
    updatedAt: now,
    userId: 'system',
    content: {
      front: `A 45-year-old man on haloperidol for schizophrenia presents with fever (39.5°C), severe muscle rigidity, altered mental status, and diaphoresis. Labs show WBC 14,000, CK 12,000.

A medical student suggests this might be serotonin syndrome.

**How do you differentiate NMS from serotonin syndrome, and what is the treatment?**`,
      back: `**This is Neuroleptic Malignant Syndrome (NMS), NOT Serotonin Syndrome.**

**Key Differentiating Features:**

| Feature | NMS (This Patient) | Serotonin Syndrome |
|---------|-------------------|-------------------|
| Causative drug | Antipsychotics | SSRIs, SNRIs, MAOIs |
| Onset | Days to weeks | Hours (< 24h) |
| Muscle tone | Lead-pipe rigidity | Clonus, hyperreflexia |
| Reflexes | Normal/decreased | Increased |
| Bowel sounds | Decreased | Increased (diarrhea) |
| CK | Very elevated | Mildly elevated |
| Fever | High (> 40°C possible) | Variable |

**This patient has NMS:**
- On antipsychotic (haloperidol)
- Lead-pipe rigidity
- Very high CK (muscle breakdown)
- Developed over days

**NMS Treatment:**
1. **Stop the antipsychotic** - immediately
2. **Supportive care** - IV fluids, cooling, ICU
3. **Dantrolene** - muscle relaxant
4. **Bromocriptine** - dopamine agonist (reverses blockade)

**Serotonin Syndrome Treatment:**
1. Stop serotonergic drug
2. Cyproheptadine (serotonin antagonist)
3. Supportive care

**The "password":** NMS = antipsychotic + lead-pipe rigidity + slow onset; SS = serotonergic drug + clonus + rapid onset.`,
      explanation: `This is a classic USMLE comparison. The physical exam findings (lead-pipe vs clonus) and timeline (days vs hours) are key differentiators.`,
      references: ['Neuroleptic Malignant Syndrome Review', 'Serotonin Syndrome Management']
    },
    metadata: {
      tags: ['nms', 'serotonin-syndrome', 'antipsychotic', 'emergency', 'differential-diagnosis'],
      system: 'Psychiatry',
      topic: 'Medication Adverse Effects',
      difficulty: 'hard',
      clinicalVignette: true,
      source: 'TribeWellMD',
      usmleStep: 2,
      rotation: 'Psychiatry',
      conceptCode: 'nms-serotonin-syndrome',
      clinicalDecision: 'NMS: rigidity/slow onset/antipsychotics; SS: clonus/rapid onset/serotonergics',
      qbankCodes: { uworld: ['90123', '01234'], amboss: [] },
      relatedConcepts: ['schizophrenia-first-episode', 'mdd-first-line-treatment']
    },
    spacedRepetition: {
      state: 'new',
      interval: 0,
      ease: 2.5,
      reps: 0,
      lapses: 0,
      nextReview: now
    }
  }
];

// Export helper to get cards by concept code
export function getCardsByConceptCode(conceptCode: string): Flashcard[] {
  return understandingCards.filter(card => card.metadata.conceptCode === conceptCode);
}

// Export helper to get cards by UWorld QID
export function getCardsByUWorldQID(qid: string): Flashcard[] {
  return understandingCards.filter(card =>
    card.metadata.qbankCodes?.uworld?.includes(qid)
  );
}

// Export helper to get all cards for a system
export function getCardsBySystem(system: string): Flashcard[] {
  return understandingCards.filter(card => card.metadata.system === system);
}
