/**
 * Sample clinical vignettes for testing and demonstration
 */

import type { ClinicalVignette } from '@/types';

const now = new Date().toISOString();

export const sampleVignettes: ClinicalVignette[] = [
  // Vignette 1: Acute Stroke Workup
  {
    id: 'vignette-stroke-001',
    schemaVersion: '1.0',
    createdAt: now,
    updatedAt: now,
    title: 'Acute Stroke Workup',
    initialScenario: `72M with HTN and atrial fibrillation (not anticoagulated) presents with sudden left-sided weakness and slurred speech. Last seen normal 6 hours ago.

VS: BP 178/95, HR 88 (irregular), RR 16, SpO2 96% RA

Exam: Left facial droop, left hemiparesis (2/5), dysarthria. Alert but difficulty following commands.`,
    rootNodeId: 'node-1',
    nodes: {
      'node-1': {
        id: 'node-1',
        type: 'decision',
        content: 'Non-contrast CT head shows no hemorrhage.',
        question: 'What is your next step?',
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
        content: 'CTA: Right M1 occlusion with good collaterals. CT perfusion shows small core infarct with large penumbra (mismatch >1.8). Now 7 hours from LKW.',
        question: 'What do you recommend?',
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
        content: 'Post-thrombectomy day 1: Improved strength (4/5 left arm), can walk with assistance. Persistent AFib. CHA₂DS₂-VASc = 5.',
        question: 'What is your anticoagulation plan?',
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
    initialScenario: `58M with DM2, HTN, HLD presents with 2 hours of substernal chest pressure radiating to left arm. 7/10 "squeezing" pain with diaphoresis and dyspnea. Began while mowing lawn, not relieved by rest.

VS: BP 145/88, HR 92, RR 18, SpO2 97% RA

Exam: Uncomfortable, diaphoretic. Heart regular, no murmurs. Lungs clear.`,
    rootNodeId: 'cp-node-1',
    nodes: {
      'cp-node-1': {
        id: 'cp-node-1',
        type: 'decision',
        content: 'ECG shows ST elevations in V1-V4 with reciprocal ST depressions in inferior leads.',
        question: 'What is your immediate priority?',
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
        content: 'Patient received aspirin 325 mg. BP 142/85, HR 88. No drug allergies.',
        question: 'Which additional medications should you give?',
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
        content: 'Successful PCI with DES to 99% proximal LAD. Door-to-balloon 68 min. Pain resolved. Peak troponin 45. Echo: EF 45% with anterior hypokinesis.',
        question: 'What medical therapy before discharge?',
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
    initialScenario: `24F with T1DM presents with 2 days of nausea, vomiting, abdominal pain. Ran out of insulin 3 days ago, couldn't afford refills. Ill-appearing, dry mucous membranes, Kussmaul breathing.

VS: BP 98/62, HR 118, RR 28, Temp 99.1, SpO2 98% RA

Labs: Glucose 486, pH 7.18, HCO3 10, AG 24, K 5.4, BUN/Cr 28/1.4, beta-hydroxybutyrate elevated.`,
    rootNodeId: 'dka-node-1',
    nodes: {
      'dka-node-1': {
        id: 'dka-node-1',
        type: 'decision',
        content: 'DKA confirmed: hyperglycemia, acidosis, ketonemia. Estimated fluid deficit 5-6 liters.',
        question: 'What is your initial priority?',
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
        content: 'After 1L NS: BP 106/68, HR 108. Glucose 420, K 5.1 (down from 5.4).',
        question: 'How do you manage insulin and potassium?',
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
        content: '4 hours later: Patient more alert. Glucose 195, pH 7.28, HCO3 16, AG 14, K 4.0.',
        question: 'How should you adjust therapy?',
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
