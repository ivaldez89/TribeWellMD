/**
 * Sample clinical vignettes for testing and demonstration
 */

import type { ClinicalVignette } from '@/types';

// Increment this version when sample vignette content changes
// This will trigger an update for existing users
export const SAMPLE_VIGNETTES_VERSION = 2;

const now = new Date().toISOString();

export const sampleVignettes: ClinicalVignette[] = [
  // Vignette 1: Acute Stroke Workup
  {
    id: 'vignette-stroke-001',
    schemaVersion: '1.0',
    createdAt: now,
    updatedAt: now,
    title: 'Acute Stroke Workup',
    initialScenario: `A 72-year-old man with a history of hypertension and atrial fibrillation (not on anticoagulation) is brought to the ED by his wife after she noticed sudden left-sided weakness and slurred speech. She reports he was last seen normal about 6 hours ago when she left for errands.

On exam, his blood pressure is 178/95, heart rate 88 and irregular, respiratory rate 16, and oxygen saturation 96% on room air. He has a left facial droop, left-sided weakness (2/5 strength), and dysarthria. He is alert but has difficulty following commands.`,
    rootNodeId: 'node-1',
    nodes: {
      'node-1': {
        id: 'node-1',
        type: 'decision',
        content: 'A non-contrast CT of the head is obtained and shows no evidence of hemorrhage.',
        question: 'What is the best next step in evaluation?',
        choices: [
          {
            id: 'choice-1a',
            text: 'Administer IV tPA immediately',
            isOptimal: false,
            isAcceptable: false,
            feedback: 'Patient is outside the 4.5-hour tPA window. Giving tPA now increases hemorrhage risk without benefit.',
            consequence: 'Patient develops intracerebral hemorrhage.',
            nextNodeId: 'node-outcome-bad'
          },
          {
            id: 'choice-1b',
            text: 'Order CTA head and neck',
            isOptimal: true,
            isAcceptable: true,
            feedback: 'Outside tPA window but may qualify for mechanical thrombectomy if large vessel occlusion (LVO) is present.',
            consequence: 'CTA reveals right M1 occlusion with good collaterals.',
            nextNodeId: 'node-2'
          },
          {
            id: 'choice-1c',
            text: 'Admit for observation and start aspirin',
            isOptimal: false,
            isAcceptable: false,
            feedback: 'Major stroke needs urgent evaluation for endovascular intervention. Observation misses a time-sensitive treatment window.',
            consequence: 'Deficits worsen as stroke evolves.',
            nextNodeId: 'node-outcome-bad'
          },
          {
            id: 'choice-1d',
            text: 'Start IV heparin for atrial fibrillation',
            isOptimal: false,
            isAcceptable: false,
            feedback: 'Anticoagulation in acute ischemic stroke is not recommended and increases hemorrhage risk.',
            consequence: 'Patient develops hemorrhagic transformation.',
            nextNodeId: 'node-outcome-bad'
          }
        ],
        clinicalPearl: 'Extended window thrombectomy can be performed up to 24 hours in select patients with favorable perfusion imaging.'
      },
      'node-2': {
        id: 'node-2',
        type: 'decision',
        content: 'CTA of the head and neck reveals a right M1 occlusion with good collateral circulation. CT perfusion imaging demonstrates a small core infarct with a large ischemic penumbra (mismatch ratio >1.8). It is now approximately 7 hours since he was last seen normal.',
        question: 'What is the most appropriate next step in management?',
        choices: [
          {
            id: 'choice-2a',
            text: 'Proceed with mechanical thrombectomy',
            isOptimal: true,
            isAcceptable: true,
            feedback: 'DAWN and DEFUSE-3 trials showed benefit up to 24 hours with favorable perfusion imaging.',
            consequence: 'Successful thrombectomy with TICI 3 recanalization.',
            nextNodeId: 'node-3'
          },
          {
            id: 'choice-2b',
            text: 'Medical management only - too late for intervention',
            isOptimal: false,
            isAcceptable: false,
            feedback: 'Extended window thrombectomy benefits patients with favorable perfusion profiles up to 24 hours.',
            consequence: 'Patient has persistent severe deficits.',
            nextNodeId: 'node-outcome-suboptimal'
          },
          {
            id: 'choice-2c',
            text: 'Try IV tPA first, then consider thrombectomy',
            isOptimal: false,
            isAcceptable: false,
            feedback: 'tPA is contraindicated beyond 4.5 hours. This delay worsens outcomes.',
            consequence: 'Time wasted on ineffective therapy.',
            nextNodeId: 'node-outcome-bad'
          }
        ],
        clinicalPearl: 'DAWN trial (6-24h) and DEFUSE-3 (6-16h) established benefit of late thrombectomy with favorable imaging.'
      },
      'node-3': {
        id: 'node-3',
        type: 'decision',
        content: 'The patient is now post-thrombectomy day 1. His left arm strength has improved to 4/5 and he is able to walk with assistance. He remains in atrial fibrillation with a CHA₂DS₂-VASc score of 5.',
        question: 'What is the most appropriate long-term antithrombotic strategy?',
        choices: [
          {
            id: 'choice-3a',
            text: 'Start DOAC immediately',
            isOptimal: false,
            isAcceptable: false,
            feedback: 'Immediate anticoagulation after large stroke increases hemorrhagic transformation risk. Guidelines recommend waiting.',
            consequence: 'Imaging shows hemorrhagic transformation.',
            nextNodeId: 'node-outcome-suboptimal'
          },
          {
            id: 'choice-3b',
            text: 'Start aspirin now, transition to DOAC in 4-14 days',
            isOptimal: true,
            isAcceptable: true,
            feedback: 'For moderate-large strokes, delay anticoagulation 4-14 days to reduce hemorrhage risk while using aspirin.',
            consequence: 'Transition to apixaban in 7-14 days based on repeat imaging.',
            nextNodeId: 'node-outcome-good'
          },
          {
            id: 'choice-3c',
            text: 'Use aspirin only long-term',
            isOptimal: false,
            isAcceptable: false,
            feedback: 'CHA₂DS₂-VASc of 5 indicates high recurrence risk. Anticoagulation is clearly indicated.',
            consequence: 'Recurrent cardioembolic stroke at 3 months.',
            nextNodeId: 'node-outcome-bad'
          }
        ],
        clinicalPearl: '"1-3-6-12 rule": Anticoagulation at 1 day for TIA, 3 days small stroke, 6 days moderate, 12 days large stroke.'
      },
      'node-outcome-good': {
        id: 'node-outcome-good',
        type: 'outcome',
        content: `Excellent! Patient recovers well with minimal deficits. Discharged on apixaban, statin, and BP meds. At 3 months, returned to independent function with no recurrent events.`
      },
      'node-outcome-suboptimal': {
        id: 'node-outcome-suboptimal',
        type: 'outcome',
        content: `Suboptimal outcome. Review decision points regarding extended window thrombectomy criteria and anticoagulation timing.`
      },
      'node-outcome-bad': {
        id: 'node-outcome-bad',
        type: 'outcome',
        content: `Poor outcome. Key points: tPA contraindicated >4.5h, thrombectomy possible up to 24h with favorable imaging, avoid early anticoagulation in large strokes.`
      }
    },
    metadata: {
      system: 'Neurology',
      topic: 'Stroke',
      difficulty: 'intermediate',
      conceptCodes: ['stroke-workup', 'thrombectomy-extended-window', 'afib-anticoagulation'],
      estimatedMinutes: 5,
      tags: ['stroke', 'thrombectomy', 'atrial fibrillation', 'anticoagulation']
    }
  },

  // Vignette 2: Chest Pain STEMI
  {
    id: 'vignette-chest-pain-001',
    schemaVersion: '1.0',
    createdAt: now,
    updatedAt: now,
    title: 'Chest Pain in the ED',
    initialScenario: `A 58-year-old man with a history of type 2 diabetes, hypertension, and hyperlipidemia presents to the emergency department with 2 hours of substernal chest pressure radiating to his left arm. He describes the pain as 7/10 in intensity with a "squeezing" quality, accompanied by diaphoresis and shortness of breath. The symptoms began while he was mowing his lawn and have not improved with rest.

On exam, his blood pressure is 145/88, heart rate 92, respiratory rate 18, and oxygen saturation 97% on room air. He appears uncomfortable and diaphoretic. Cardiac exam reveals a regular rhythm without murmurs, and his lungs are clear to auscultation.`,
    rootNodeId: 'cp-node-1',
    nodes: {
      'cp-node-1': {
        id: 'cp-node-1',
        type: 'decision',
        content: 'An ECG is obtained and shows ST-segment elevations in leads V1-V4 with reciprocal ST depressions in the inferior leads.',
        question: 'What is the most appropriate immediate next step in management?',
        choices: [
          {
            id: 'cp-choice-1a',
            text: 'Activate cardiac cath lab for primary PCI',
            isOptimal: true,
            isAcceptable: true,
            feedback: 'STEMI requires immediate reperfusion. Primary PCI is preferred when achievable within 120 minutes.',
            consequence: 'Cath lab activated, interventional team mobilized.',
            nextNodeId: 'cp-node-2'
          },
          {
            id: 'cp-choice-1b',
            text: 'Give aspirin and wait for troponin results',
            isOptimal: false,
            isAcceptable: false,
            feedback: 'STEMI is diagnosed by ECG - troponins should not delay reperfusion.',
            consequence: 'Precious time lost while infarct extends.',
            nextNodeId: 'cp-node-outcome-bad'
          },
          {
            id: 'cp-choice-1c',
            text: 'Start heparin and nitroglycerin drip, observe',
            isOptimal: false,
            isAcceptable: false,
            feedback: 'Anti-ischemic therapy does not replace urgent reperfusion in STEMI.',
            consequence: 'Patient develops cardiogenic shock.',
            nextNodeId: 'cp-node-outcome-bad'
          },
          {
            id: 'cp-choice-1d',
            text: 'CT chest to rule out aortic dissection first',
            isOptimal: false,
            isAcceptable: false,
            feedback: 'Classic ischemic symptoms with STEMI on ECG makes ACS likely. CT delays reperfusion.',
            consequence: 'CT delays reperfusion by 45 minutes. No dissection.',
            nextNodeId: 'cp-node-outcome-suboptimal'
          }
        ],
        clinicalPearl: 'Door-to-balloon goal is <90 minutes. Every 30-minute delay increases mortality ~7.5%.'
      },
      'cp-node-2': {
        id: 'cp-node-2',
        type: 'decision',
        content: 'The cath lab is activated. The patient has received aspirin 325 mg. His blood pressure is now 142/85 and heart rate 88. He has no known drug allergies.',
        question: 'Which of the following is the most appropriate additional pharmacotherapy at this time?',
        choices: [
          {
            id: 'cp-choice-2a',
            text: 'P2Y12 inhibitor, heparin, consider IV beta-blocker',
            isOptimal: true,
            isAcceptable: true,
            feedback: 'Standard STEMI therapy: DAPT (aspirin + P2Y12), anticoagulation, beta-blocker if stable.',
            consequence: 'Ticagrelor 180 mg, heparin bolus, metoprolol 5 mg IV given.',
            nextNodeId: 'cp-node-3'
          },
          {
            id: 'cp-choice-2b',
            text: 'Only aspirin is needed before PCI',
            isOptimal: false,
            isAcceptable: false,
            feedback: 'Single antiplatelet is insufficient. DAPT reduces stent thrombosis and mortality.',
            consequence: 'Suboptimal platelet inhibition during procedure.',
            nextNodeId: 'cp-node-3'
          },
          {
            id: 'cp-choice-2c',
            text: 'Start fibrinolytics while waiting for cath',
            isOptimal: false,
            isAcceptable: false,
            feedback: 'Fibrinolysis before PCI increases bleeding without added benefit when PCI available quickly.',
            consequence: 'Significant access site bleeding during PCI.',
            nextNodeId: 'cp-node-outcome-suboptimal'
          }
        ],
        clinicalPearl: 'Ticagrelor or prasugrel preferred over clopidogrel - faster onset and more potent.'
      },
      'cp-node-3': {
        id: 'cp-node-3',
        type: 'decision',
        content: 'The patient undergoes successful PCI with placement of a drug-eluting stent to a 99% proximal LAD lesion. Door-to-balloon time was 68 minutes. His chest pain has completely resolved. Peak troponin was 45 ng/mL. An echocardiogram shows an ejection fraction of 45% with anterior wall hypokinesis.',
        question: 'Which of the following is the most appropriate discharge medication regimen?',
        choices: [
          {
            id: 'cp-choice-3a',
            text: 'DAPT, high-intensity statin, ACE-I, beta-blocker',
            isOptimal: true,
            isAcceptable: true,
            feedback: 'GDMT post-STEMI: DAPT x12 months, high-intensity statin, ACE-I (especially with reduced EF), beta-blocker.',
            consequence: 'Started on aspirin, ticagrelor, atorvastatin 80, lisinopril, metoprolol succinate.',
            nextNodeId: 'cp-node-outcome-good'
          },
          {
            id: 'cp-choice-3b',
            text: 'DAPT and statin only',
            isOptimal: false,
            isAcceptable: true,
            feedback: 'With EF 45%, patient benefits from ACE-I and beta-blocker to prevent remodeling.',
            consequence: 'Missed optimization opportunities.',
            nextNodeId: 'cp-node-outcome-suboptimal'
          },
          {
            id: 'cp-choice-3c',
            text: 'Aspirin, clopidogrel, low-dose statin',
            isOptimal: false,
            isAcceptable: false,
            feedback: 'High-intensity statin indicated post-MI regardless of baseline cholesterol.',
            consequence: 'Suboptimal therapy increases recurrent event risk.',
            nextNodeId: 'cp-node-outcome-suboptimal'
          }
        ],
        clinicalPearl: 'Post-MI ABCDE: Antiplatelet, Beta-blocker, Cholesterol (high-intensity statin), ACE-I/ARB, Diabetes/lifestyle.'
      },
      'cp-node-outcome-good': {
        id: 'cp-node-outcome-good',
        type: 'outcome',
        content: `Excellent! Patient enrolled in cardiac rehab. At 6 months, EF improved to 50%, symptom-free on GDMT.`
      },
      'cp-node-outcome-suboptimal': {
        id: 'cp-node-outcome-suboptimal',
        type: 'outcome',
        content: `Suboptimal care. Review STEMI guidelines: rapid reperfusion, maximize GDMT before discharge.`
      },
      'cp-node-outcome-bad': {
        id: 'cp-node-outcome-bad',
        type: 'outcome',
        content: `Poor outcome. "Time is muscle" - STEMI is an ECG diagnosis, don't wait for labs. Primary PCI is preferred.`
      }
    },
    metadata: {
      system: 'Cardiology',
      topic: 'Acute Coronary Syndrome',
      difficulty: 'beginner',
      conceptCodes: ['stemi-management', 'pci-timing', 'gdmt-post-mi'],
      estimatedMinutes: 4,
      tags: ['STEMI', 'PCI', 'chest pain', 'cardiology']
    }
  },

  // Vignette 3: Diabetic Ketoacidosis
  {
    id: 'vignette-dka-001',
    schemaVersion: '1.0',
    createdAt: now,
    updatedAt: now,
    title: 'DKA Management',
    initialScenario: `A 24-year-old woman with type 1 diabetes mellitus presents to the emergency department with 2 days of nausea, vomiting, and diffuse abdominal pain. She reports that she ran out of insulin 3 days ago and could not afford to refill her prescription. On exam, she appears ill with dry mucous membranes and deep, labored breathing (Kussmaul respirations).

Her vital signs show a blood pressure of 98/62, heart rate 118, respiratory rate 28, temperature 99.1°F, and oxygen saturation 98% on room air. Laboratory studies reveal a glucose of 486 mg/dL, arterial pH 7.18, bicarbonate 10 mEq/L, anion gap 24, potassium 5.4 mEq/L, BUN 28 mg/dL, creatinine 1.4 mg/dL, and elevated beta-hydroxybutyrate.`,
    rootNodeId: 'dka-node-1',
    nodes: {
      'dka-node-1': {
        id: 'dka-node-1',
        type: 'decision',
        content: 'The clinical picture and laboratory findings confirm diabetic ketoacidosis with hyperglycemia, metabolic acidosis, and ketonemia. You estimate her total body fluid deficit to be approximately 5-6 liters.',
        question: 'What is the most appropriate initial step in management?',
        choices: [
          {
            id: 'dka-choice-1a',
            text: 'Start insulin drip immediately before fluids',
            isOptimal: false,
            isAcceptable: false,
            feedback: 'Insulin without volume resuscitation causes dangerous hypokalemia. Fluids first.',
            consequence: 'Patient becomes hypokalemic with cardiac arrhythmias.',
            nextNodeId: 'dka-node-outcome-bad'
          },
          {
            id: 'dka-choice-1b',
            text: 'IV NS bolus (1-2L first hour), then reassess',
            isOptimal: true,
            isAcceptable: true,
            feedback: 'Aggressive fluid resuscitation is first priority - restores volume, improves perfusion, helps lower glucose.',
            consequence: '1L NS bolus while preparing insulin protocol.',
            nextNodeId: 'dka-node-2'
          },
          {
            id: 'dka-choice-1c',
            text: 'Give D5W to prevent hypoglycemia',
            isOptimal: false,
            isAcceptable: false,
            feedback: 'Dextrose is contraindicated initially. Add when glucose <250 to continue insulin.',
            consequence: 'Glucose rises, worsening hyperosmolar state.',
            nextNodeId: 'dka-node-outcome-bad'
          },
          {
            id: 'dka-choice-1d',
            text: 'Give sodium bicarbonate for acidosis',
            isOptimal: false,
            isAcceptable: false,
            feedback: 'Routine bicarb not recommended unless pH <6.9. Acidosis corrects with fluids/insulin.',
            consequence: 'Potassium drops, causing ventricular ectopy.',
            nextNodeId: 'dka-node-outcome-suboptimal'
          }
        ],
        clinicalPearl: 'DKA "3 I\'s": IV fluids (first!), Insulin (after fluids), Identify precipitant.'
      },
      'dka-node-2': {
        id: 'dka-node-2',
        type: 'decision',
        content: 'After receiving 1 liter of normal saline, her blood pressure has improved to 106/68 and heart rate is 108. Repeat labs show glucose 420 mg/dL and potassium 5.1 mEq/L (down from 5.4).',
        question: 'What is the most appropriate next step in management?',
        choices: [
          {
            id: 'dka-choice-2a',
            text: 'Insulin drip 0.1 U/kg/hr; no K+ supplementation yet',
            isOptimal: false,
            isAcceptable: true,
            feedback: 'Starting insulin correct, but K+ will drop. Replace when K+ <5.2 to prevent hypokalemia.',
            consequence: 'Potassium drops to 3.2.',
            nextNodeId: 'dka-node-3'
          },
          {
            id: 'dka-choice-2b',
            text: 'Insulin drip 0.1 U/kg/hr; add 20-40 mEq KCl to fluids',
            isOptimal: true,
            isAcceptable: true,
            feedback: 'Insulin drives K+ into cells. Total body K+ is depleted despite normal serum levels.',
            consequence: 'Potassium remains stable as acidosis corrects.',
            nextNodeId: 'dka-node-3'
          },
          {
            id: 'dka-choice-2c',
            text: 'Give insulin 10 units IV bolus, then drip',
            isOptimal: false,
            isAcceptable: false,
            feedback: 'Insulin boluses no longer recommended - increase hypokalemia and cerebral edema risk.',
            consequence: 'Glucose drops too rapidly causing fluid shifts.',
            nextNodeId: 'dka-node-outcome-suboptimal'
          },
          {
            id: 'dka-choice-2d',
            text: 'Hold insulin until K+ <5.0',
            isOptimal: false,
            isAcceptable: false,
            feedback: 'Don\'t delay insulin for elevated K+ - it\'s often spurious from acidosis.',
            consequence: 'Acidosis worsens.',
            nextNodeId: 'dka-node-outcome-bad'
          }
        ],
        clinicalPearl: 'K+ rules: If <3.3, hold insulin until replaced. If 3.3-5.2, add 20-40 mEq/L. If >5.2, recheck in 2h.'
      },
      'dka-node-3': {
        id: 'dka-node-3',
        type: 'decision',
        content: 'Four hours into treatment, the patient appears more alert and is feeling better. Repeat laboratory studies show glucose 195 mg/dL, pH 7.28, bicarbonate 16 mEq/L, anion gap 14, and potassium 4.0 mEq/L.',
        question: 'What is the most appropriate adjustment to her current therapy?',
        choices: [
          {
            id: 'dka-choice-3a',
            text: 'Change to D5-1/2NS, continue insulin drip',
            isOptimal: true,
            isAcceptable: true,
            feedback: 'When glucose <250, add dextrose to prevent hypoglycemia while continuing insulin to clear ketones (AG still 14).',
            consequence: 'Glucose stabilizes while ketones clear.',
            nextNodeId: 'dka-node-outcome-good'
          },
          {
            id: 'dka-choice-3b',
            text: 'Stop insulin drip - glucose controlled',
            isOptimal: false,
            isAcceptable: false,
            feedback: 'AG still elevated (14) = ongoing ketosis. Continue insulin until AG normalizes.',
            consequence: 'Ketosis rebounds.',
            nextNodeId: 'dka-node-outcome-suboptimal'
          },
          {
            id: 'dka-choice-3c',
            text: 'Switch to SubQ insulin and discharge',
            isOptimal: false,
            isAcceptable: false,
            feedback: 'DKA not resolved (AG elevated). Need IV insulin until AG closes, then overlap SubQ.',
            consequence: 'Recurrent ketoacidosis after discharge.',
            nextNodeId: 'dka-node-outcome-bad'
          },
          {
            id: 'dka-choice-3d',
            text: 'Continue current fluids, reduce insulin by half',
            isOptimal: false,
            isAcceptable: true,
            feedback: 'Reducing insulin reasonable but adding dextrose preferred to maintain therapeutic insulin dose.',
            consequence: 'Slower but eventual recovery.',
            nextNodeId: 'dka-node-outcome-suboptimal'
          }
        ],
        clinicalPearl: 'DKA resolved when: glucose <200, HCO3 ≥18, pH >7.3, AND AG <12. All criteria must be met.'
      },
      'dka-node-outcome-good': {
        id: 'dka-node-outcome-good',
        type: 'outcome',
        content: `Excellent! DKA fully resolves. Transitioned to SubQ insulin with 2-hour overlap. Connected with social work for insulin access. Diabetes education provided.`
      },
      'dka-node-outcome-suboptimal': {
        id: 'dka-node-outcome-suboptimal',
        type: 'outcome',
        content: `Suboptimal management. Key principles: Fluids first, proactive K+ replacement, continue insulin until AG closes, add dextrose when glucose <250.`
      },
      'dka-node-outcome-bad': {
        id: 'dka-node-outcome-bad',
        type: 'outcome',
        content: `Poor outcome. Never start insulin before fluids. Never stop insulin based on glucose alone. Monitor K+ closely and replace proactively.`
      }
    },
    metadata: {
      system: 'Endocrinology',
      topic: 'Diabetic Emergencies',
      difficulty: 'intermediate',
      conceptCodes: ['dka-management', 'insulin-therapy', 'potassium-dka'],
      estimatedMinutes: 5,
      tags: ['DKA', 'diabetes', 'insulin', 'electrolytes']
    }
  }
];
