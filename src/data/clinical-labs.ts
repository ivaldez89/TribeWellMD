/**
 * Clinical Laboratory Reference Ranges
 *
 * Standard reference values for medical education and exam preparation.
 * These are widely accepted clinical ranges from medical literature.
 *
 * Note: Reference ranges may vary slightly between laboratories.
 * These values are for educational purposes.
 */

export interface LabReference {
  id: string;
  name: string;
  abbreviation: string;
  category: LabCategory;
  unit: string;
  normalLow: number;
  normalHigh: number;
  criticalLow?: number;
  criticalHigh?: number;
  notes?: string;
  specimens?: string[];
}

export type LabCategory =
  | 'electrolytes'
  | 'renal'
  | 'hepatic'
  | 'cbc'
  | 'coagulation'
  | 'cardiac'
  | 'endocrine'
  | 'lipids'
  | 'inflammatory'
  | 'arterial-blood-gas'
  | 'urinalysis'
  | 'iron-studies'
  | 'vitamins';

export interface LabCategoryInfo {
  id: LabCategory;
  name: string;
  icon: string;
  color: string;
}

export const LAB_CATEGORIES: LabCategoryInfo[] = [
  { id: 'electrolytes', name: 'Electrolytes', icon: '⚡', color: '#3B82F6' },
  { id: 'renal', name: 'Renal Function', icon: '🫘', color: '#8B5CF6' },
  { id: 'hepatic', name: 'Hepatic Panel', icon: '🫁', color: '#10B981' },
  { id: 'cbc', name: 'Complete Blood Count', icon: '🩸', color: '#EF4444' },
  { id: 'coagulation', name: 'Coagulation', icon: '🩹', color: '#F59E0B' },
  { id: 'cardiac', name: 'Cardiac Markers', icon: '❤️', color: '#EC4899' },
  { id: 'endocrine', name: 'Endocrine', icon: '🦋', color: '#6366F1' },
  { id: 'lipids', name: 'Lipid Panel', icon: '💧', color: '#14B8A6' },
  { id: 'inflammatory', name: 'Inflammatory', icon: '🔥', color: '#F97316' },
  { id: 'arterial-blood-gas', name: 'Arterial Blood Gas', icon: '💨', color: '#06B6D4' },
  { id: 'urinalysis', name: 'Urinalysis', icon: '🧪', color: '#84CC16' },
  { id: 'iron-studies', name: 'Iron Studies', icon: '🔩', color: '#78716C' },
  { id: 'vitamins', name: 'Vitamins & Nutrients', icon: '💊', color: '#A855F7' },
];

export const CLINICAL_LABS: LabReference[] = [
  // ========== ELECTROLYTES ==========
  {
    id: 'sodium',
    name: 'Sodium',
    abbreviation: 'Na+',
    category: 'electrolytes',
    unit: 'mEq/L',
    normalLow: 136,
    normalHigh: 145,
    criticalLow: 120,
    criticalHigh: 160,
    notes: 'Primary extracellular cation',
  },
  {
    id: 'potassium',
    name: 'Potassium',
    abbreviation: 'K+',
    category: 'electrolytes',
    unit: 'mEq/L',
    normalLow: 3.5,
    normalHigh: 5.0,
    criticalLow: 2.5,
    criticalHigh: 6.5,
    notes: 'Primary intracellular cation; cardiac arrhythmia risk if abnormal',
  },
  {
    id: 'chloride',
    name: 'Chloride',
    abbreviation: 'Cl-',
    category: 'electrolytes',
    unit: 'mEq/L',
    normalLow: 98,
    normalHigh: 106,
  },
  {
    id: 'bicarbonate',
    name: 'Bicarbonate',
    abbreviation: 'HCO3-',
    category: 'electrolytes',
    unit: 'mEq/L',
    normalLow: 22,
    normalHigh: 28,
    notes: 'Key buffer; used in acid-base analysis',
  },
  {
    id: 'calcium',
    name: 'Calcium (Total)',
    abbreviation: 'Ca2+',
    category: 'electrolytes',
    unit: 'mg/dL',
    normalLow: 8.5,
    normalHigh: 10.5,
    criticalLow: 6.0,
    criticalHigh: 13.0,
    notes: 'Correct for albumin: add 0.8 for each 1 g/dL albumin below 4',
  },
  {
    id: 'calcium-ionized',
    name: 'Calcium (Ionized)',
    abbreviation: 'iCa2+',
    category: 'electrolytes',
    unit: 'mg/dL',
    normalLow: 4.5,
    normalHigh: 5.3,
    notes: 'Physiologically active form; not affected by albumin',
  },
  {
    id: 'magnesium',
    name: 'Magnesium',
    abbreviation: 'Mg2+',
    category: 'electrolytes',
    unit: 'mg/dL',
    normalLow: 1.7,
    normalHigh: 2.2,
    criticalLow: 1.0,
    notes: 'Often low in alcoholism; required for K+ correction',
  },
  {
    id: 'phosphorus',
    name: 'Phosphorus',
    abbreviation: 'PO4',
    category: 'electrolytes',
    unit: 'mg/dL',
    normalLow: 2.5,
    normalHigh: 4.5,
    notes: 'Inversely related to calcium',
  },

  // ========== RENAL FUNCTION ==========
  {
    id: 'bun',
    name: 'Blood Urea Nitrogen',
    abbreviation: 'BUN',
    category: 'renal',
    unit: 'mg/dL',
    normalLow: 7,
    normalHigh: 20,
    notes: 'Elevated in dehydration, GI bleeding, high protein diet',
  },
  {
    id: 'creatinine',
    name: 'Creatinine',
    abbreviation: 'Cr',
    category: 'renal',
    unit: 'mg/dL',
    normalLow: 0.7,
    normalHigh: 1.3,
    notes: 'Better marker of renal function than BUN',
  },
  {
    id: 'egfr',
    name: 'Estimated GFR',
    abbreviation: 'eGFR',
    category: 'renal',
    unit: 'mL/min/1.73m²',
    normalLow: 90,
    normalHigh: 120,
    notes: 'CKD staging: G1 ≥90, G2 60-89, G3a 45-59, G3b 30-44, G4 15-29, G5 <15',
  },
  {
    id: 'bun-cr-ratio',
    name: 'BUN/Creatinine Ratio',
    abbreviation: 'BUN:Cr',
    category: 'renal',
    unit: 'ratio',
    normalLow: 10,
    normalHigh: 20,
    notes: '>20 suggests prerenal azotemia; <10 suggests intrinsic renal or liver disease',
  },

  // ========== HEPATIC PANEL ==========
  {
    id: 'ast',
    name: 'Aspartate Aminotransferase',
    abbreviation: 'AST',
    category: 'hepatic',
    unit: 'U/L',
    normalLow: 10,
    normalHigh: 40,
    notes: 'Also in heart, muscle; AST:ALT >2 suggests alcoholic liver disease',
  },
  {
    id: 'alt',
    name: 'Alanine Aminotransferase',
    abbreviation: 'ALT',
    category: 'hepatic',
    unit: 'U/L',
    normalLow: 7,
    normalHigh: 56,
    notes: 'More specific for liver than AST',
  },
  {
    id: 'alp',
    name: 'Alkaline Phosphatase',
    abbreviation: 'ALP',
    category: 'hepatic',
    unit: 'U/L',
    normalLow: 44,
    normalHigh: 147,
    notes: 'Elevated in cholestasis, bone disease, pregnancy',
  },
  {
    id: 'ggt',
    name: 'Gamma-Glutamyl Transferase',
    abbreviation: 'GGT',
    category: 'hepatic',
    unit: 'U/L',
    normalLow: 9,
    normalHigh: 48,
    notes: 'Confirms hepatic source of elevated ALP; very sensitive to alcohol',
  },
  {
    id: 'bilirubin-total',
    name: 'Bilirubin (Total)',
    abbreviation: 'T.Bili',
    category: 'hepatic',
    unit: 'mg/dL',
    normalLow: 0.1,
    normalHigh: 1.2,
    notes: 'Jaundice visible when >2.5',
  },
  {
    id: 'bilirubin-direct',
    name: 'Bilirubin (Direct)',
    abbreviation: 'D.Bili',
    category: 'hepatic',
    unit: 'mg/dL',
    normalLow: 0.0,
    normalHigh: 0.3,
    notes: 'Conjugated; elevated in biliary obstruction',
  },
  {
    id: 'albumin',
    name: 'Albumin',
    abbreviation: 'Alb',
    category: 'hepatic',
    unit: 'g/dL',
    normalLow: 3.5,
    normalHigh: 5.5,
    notes: 'Marker of synthetic function; t½ ~20 days',
  },
  {
    id: 'total-protein',
    name: 'Total Protein',
    abbreviation: 'TP',
    category: 'hepatic',
    unit: 'g/dL',
    normalLow: 6.0,
    normalHigh: 8.3,
  },

  // ========== COMPLETE BLOOD COUNT ==========
  {
    id: 'wbc',
    name: 'White Blood Cells',
    abbreviation: 'WBC',
    category: 'cbc',
    unit: '×10³/µL',
    normalLow: 4.5,
    normalHigh: 11.0,
    criticalLow: 2.0,
    criticalHigh: 30.0,
  },
  {
    id: 'rbc',
    name: 'Red Blood Cells',
    abbreviation: 'RBC',
    category: 'cbc',
    unit: '×10⁶/µL',
    normalLow: 4.5,
    normalHigh: 5.5,
    notes: 'Male: 4.7-6.1; Female: 4.2-5.4',
  },
  {
    id: 'hemoglobin',
    name: 'Hemoglobin',
    abbreviation: 'Hgb',
    category: 'cbc',
    unit: 'g/dL',
    normalLow: 12.0,
    normalHigh: 16.0,
    criticalLow: 7.0,
    notes: 'Male: 14-18; Female: 12-16',
  },
  {
    id: 'hematocrit',
    name: 'Hematocrit',
    abbreviation: 'Hct',
    category: 'cbc',
    unit: '%',
    normalLow: 36,
    normalHigh: 46,
    notes: 'Male: 40-54%; Female: 36-48%',
  },
  {
    id: 'mcv',
    name: 'Mean Corpuscular Volume',
    abbreviation: 'MCV',
    category: 'cbc',
    unit: 'fL',
    normalLow: 80,
    normalHigh: 100,
    notes: '<80 microcytic; >100 macrocytic',
  },
  {
    id: 'mch',
    name: 'Mean Corpuscular Hemoglobin',
    abbreviation: 'MCH',
    category: 'cbc',
    unit: 'pg',
    normalLow: 27,
    normalHigh: 33,
  },
  {
    id: 'mchc',
    name: 'Mean Corpuscular Hgb Concentration',
    abbreviation: 'MCHC',
    category: 'cbc',
    unit: 'g/dL',
    normalLow: 32,
    normalHigh: 36,
    notes: 'Low in iron deficiency; high in spherocytosis',
  },
  {
    id: 'rdw',
    name: 'Red Cell Distribution Width',
    abbreviation: 'RDW',
    category: 'cbc',
    unit: '%',
    normalLow: 11.5,
    normalHigh: 14.5,
    notes: 'Elevated = anisocytosis (varied RBC sizes)',
  },
  {
    id: 'platelets',
    name: 'Platelets',
    abbreviation: 'Plt',
    category: 'cbc',
    unit: '×10³/µL',
    normalLow: 150,
    normalHigh: 400,
    criticalLow: 50,
    criticalHigh: 1000,
  },
  {
    id: 'reticulocytes',
    name: 'Reticulocyte Count',
    abbreviation: 'Retic',
    category: 'cbc',
    unit: '%',
    normalLow: 0.5,
    normalHigh: 2.0,
    notes: 'Elevated in hemolysis/hemorrhage (appropriate marrow response)',
  },

  // ========== COAGULATION ==========
  {
    id: 'pt',
    name: 'Prothrombin Time',
    abbreviation: 'PT',
    category: 'coagulation',
    unit: 'seconds',
    normalLow: 11,
    normalHigh: 13.5,
    notes: 'Extrinsic pathway; monitors warfarin',
  },
  {
    id: 'inr',
    name: 'International Normalized Ratio',
    abbreviation: 'INR',
    category: 'coagulation',
    unit: 'ratio',
    normalLow: 0.9,
    normalHigh: 1.1,
    notes: 'Warfarin target: 2-3 (afib, DVT); 2.5-3.5 (mechanical valve)',
  },
  {
    id: 'ptt',
    name: 'Partial Thromboplastin Time',
    abbreviation: 'PTT',
    category: 'coagulation',
    unit: 'seconds',
    normalLow: 25,
    normalHigh: 35,
    notes: 'Intrinsic pathway; monitors unfractionated heparin',
  },
  {
    id: 'fibrinogen',
    name: 'Fibrinogen',
    abbreviation: 'Fib',
    category: 'coagulation',
    unit: 'mg/dL',
    normalLow: 200,
    normalHigh: 400,
    criticalLow: 100,
    notes: 'Acute phase reactant; low in DIC',
  },
  {
    id: 'd-dimer',
    name: 'D-Dimer',
    abbreviation: 'D-dimer',
    category: 'coagulation',
    unit: 'ng/mL',
    normalLow: 0,
    normalHigh: 500,
    notes: 'Fibrin degradation product; sensitive but not specific for VTE',
  },

  // ========== CARDIAC MARKERS ==========
  {
    id: 'troponin-i',
    name: 'Troponin I',
    abbreviation: 'TnI',
    category: 'cardiac',
    unit: 'ng/mL',
    normalLow: 0,
    normalHigh: 0.04,
    notes: 'Rises 4-6h after MI, peaks 12-24h, elevated 7-10 days',
  },
  {
    id: 'troponin-t',
    name: 'Troponin T (High-Sensitivity)',
    abbreviation: 'hs-TnT',
    category: 'cardiac',
    unit: 'ng/L',
    normalLow: 0,
    normalHigh: 14,
    notes: 'High-sensitivity assay; <99th percentile is normal',
  },
  {
    id: 'ck-mb',
    name: 'Creatine Kinase MB',
    abbreviation: 'CK-MB',
    category: 'cardiac',
    unit: 'ng/mL',
    normalLow: 0,
    normalHigh: 5,
    notes: 'Less specific than troponin; useful for reinfarction',
  },
  {
    id: 'bnp',
    name: 'B-type Natriuretic Peptide',
    abbreviation: 'BNP',
    category: 'cardiac',
    unit: 'pg/mL',
    normalLow: 0,
    normalHigh: 100,
    notes: '<100 makes HF unlikely; >400 highly suggestive',
  },
  {
    id: 'nt-probnp',
    name: 'NT-proBNP',
    abbreviation: 'NT-proBNP',
    category: 'cardiac',
    unit: 'pg/mL',
    normalLow: 0,
    normalHigh: 300,
    notes: 'Age-adjusted: <50y: <450; 50-75y: <900; >75y: <1800',
  },

  // ========== ENDOCRINE ==========
  {
    id: 'glucose-fasting',
    name: 'Glucose (Fasting)',
    abbreviation: 'FBG',
    category: 'endocrine',
    unit: 'mg/dL',
    normalLow: 70,
    normalHigh: 99,
    criticalLow: 40,
    criticalHigh: 400,
    notes: '100-125: prediabetes; ≥126: diabetes (if confirmed)',
  },
  {
    id: 'hba1c',
    name: 'Hemoglobin A1c',
    abbreviation: 'HbA1c',
    category: 'endocrine',
    unit: '%',
    normalLow: 4.0,
    normalHigh: 5.6,
    notes: '5.7-6.4%: prediabetes; ≥6.5%: diabetes',
  },
  {
    id: 'tsh',
    name: 'Thyroid Stimulating Hormone',
    abbreviation: 'TSH',
    category: 'endocrine',
    unit: 'mIU/L',
    normalLow: 0.4,
    normalHigh: 4.0,
    notes: 'First-line thyroid test; elevated in hypothyroidism',
  },
  {
    id: 'free-t4',
    name: 'Free Thyroxine',
    abbreviation: 'Free T4',
    category: 'endocrine',
    unit: 'ng/dL',
    normalLow: 0.8,
    normalHigh: 1.8,
  },
  {
    id: 'free-t3',
    name: 'Free Triiodothyronine',
    abbreviation: 'Free T3',
    category: 'endocrine',
    unit: 'pg/mL',
    normalLow: 2.3,
    normalHigh: 4.2,
  },
  {
    id: 'cortisol-am',
    name: 'Cortisol (Morning)',
    abbreviation: 'Cortisol AM',
    category: 'endocrine',
    unit: 'µg/dL',
    normalLow: 6,
    normalHigh: 23,
    notes: 'Draw at 8 AM; diurnal variation',
  },
  {
    id: 'pth',
    name: 'Parathyroid Hormone',
    abbreviation: 'PTH',
    category: 'endocrine',
    unit: 'pg/mL',
    normalLow: 15,
    normalHigh: 65,
    notes: 'Interpret with calcium; PTH↑ + Ca↑ = primary hyperparathyroidism',
  },

  // ========== LIPID PANEL ==========
  {
    id: 'total-cholesterol',
    name: 'Total Cholesterol',
    abbreviation: 'TC',
    category: 'lipids',
    unit: 'mg/dL',
    normalLow: 0,
    normalHigh: 200,
    notes: 'Desirable <200; borderline 200-239; high ≥240',
  },
  {
    id: 'ldl',
    name: 'LDL Cholesterol',
    abbreviation: 'LDL-C',
    category: 'lipids',
    unit: 'mg/dL',
    normalLow: 0,
    normalHigh: 100,
    notes: 'Optimal <100; near optimal 100-129; borderline 130-159',
  },
  {
    id: 'hdl',
    name: 'HDL Cholesterol',
    abbreviation: 'HDL-C',
    category: 'lipids',
    unit: 'mg/dL',
    normalLow: 40,
    normalHigh: 60,
    notes: '<40 is low (cardiac risk); >60 is protective',
  },
  {
    id: 'triglycerides',
    name: 'Triglycerides',
    abbreviation: 'TG',
    category: 'lipids',
    unit: 'mg/dL',
    normalLow: 0,
    normalHigh: 150,
    notes: 'Normal <150; borderline 150-199; high 200-499; very high ≥500',
  },

  // ========== INFLAMMATORY MARKERS ==========
  {
    id: 'crp',
    name: 'C-Reactive Protein',
    abbreviation: 'CRP',
    category: 'inflammatory',
    unit: 'mg/L',
    normalLow: 0,
    normalHigh: 10,
    notes: 'Non-specific; rises rapidly with inflammation',
  },
  {
    id: 'hs-crp',
    name: 'High-Sensitivity CRP',
    abbreviation: 'hs-CRP',
    category: 'inflammatory',
    unit: 'mg/L',
    normalLow: 0,
    normalHigh: 3,
    notes: 'Cardiac risk: <1 low; 1-3 average; >3 high',
  },
  {
    id: 'esr',
    name: 'Erythrocyte Sedimentation Rate',
    abbreviation: 'ESR',
    category: 'inflammatory',
    unit: 'mm/hr',
    normalLow: 0,
    normalHigh: 20,
    notes: 'Male: 0-15; Female: 0-20; increases with age',
  },
  {
    id: 'procalcitonin',
    name: 'Procalcitonin',
    abbreviation: 'PCT',
    category: 'inflammatory',
    unit: 'ng/mL',
    normalLow: 0,
    normalHigh: 0.1,
    notes: '<0.25 bacterial infection unlikely; >0.5 suggests bacterial',
  },
  {
    id: 'lactate',
    name: 'Lactate',
    abbreviation: 'Lactate',
    category: 'inflammatory',
    unit: 'mmol/L',
    normalLow: 0.5,
    normalHigh: 2.0,
    criticalHigh: 4.0,
    notes: '>4 associated with increased mortality in sepsis',
  },

  // ========== ARTERIAL BLOOD GAS ==========
  {
    id: 'ph',
    name: 'pH (Arterial)',
    abbreviation: 'pH',
    category: 'arterial-blood-gas',
    unit: 'units',
    normalLow: 7.35,
    normalHigh: 7.45,
    criticalLow: 7.2,
    criticalHigh: 7.6,
    notes: '<7.35 acidemia; >7.45 alkalemia',
  },
  {
    id: 'pco2',
    name: 'Partial Pressure CO2',
    abbreviation: 'PaCO2',
    category: 'arterial-blood-gas',
    unit: 'mmHg',
    normalLow: 35,
    normalHigh: 45,
    notes: 'Respiratory component; ↑ = respiratory acidosis',
  },
  {
    id: 'po2',
    name: 'Partial Pressure O2',
    abbreviation: 'PaO2',
    category: 'arterial-blood-gas',
    unit: 'mmHg',
    normalLow: 80,
    normalHigh: 100,
    criticalLow: 60,
    notes: '<60 = hypoxemia; adjust for age: expected = 104 - (0.27 × age)',
  },
  {
    id: 'sao2',
    name: 'Oxygen Saturation (Arterial)',
    abbreviation: 'SaO2',
    category: 'arterial-blood-gas',
    unit: '%',
    normalLow: 95,
    normalHigh: 100,
    criticalLow: 90,
  },
  {
    id: 'base-excess',
    name: 'Base Excess',
    abbreviation: 'BE',
    category: 'arterial-blood-gas',
    unit: 'mEq/L',
    normalLow: -2,
    normalHigh: 2,
    notes: 'Metabolic component; negative = metabolic acidosis',
  },

  // ========== URINALYSIS ==========
  {
    id: 'urine-ph',
    name: 'Urine pH',
    abbreviation: 'U.pH',
    category: 'urinalysis',
    unit: 'units',
    normalLow: 4.5,
    normalHigh: 8.0,
    notes: 'Usually 5.5-6.5; alkaline in vegetarians, UTI with urease producers',
  },
  {
    id: 'urine-specific-gravity',
    name: 'Urine Specific Gravity',
    abbreviation: 'U.SpGr',
    category: 'urinalysis',
    unit: 'ratio',
    normalLow: 1.005,
    normalHigh: 1.030,
    notes: 'Concentrating ability; fixed at 1.010 in renal failure',
  },
  {
    id: 'urine-protein',
    name: 'Urine Protein',
    abbreviation: 'U.Prot',
    category: 'urinalysis',
    unit: 'mg/dL',
    normalLow: 0,
    normalHigh: 20,
    notes: 'Trace may be normal; persistent proteinuria needs workup',
  },
  {
    id: 'urine-albumin-cr-ratio',
    name: 'Urine Albumin/Creatinine Ratio',
    abbreviation: 'UACR',
    category: 'urinalysis',
    unit: 'mg/g',
    normalLow: 0,
    normalHigh: 30,
    notes: '30-300: moderately increased (microalbuminuria); >300: severely increased',
  },

  // ========== IRON STUDIES ==========
  {
    id: 'iron',
    name: 'Serum Iron',
    abbreviation: 'Fe',
    category: 'iron-studies',
    unit: 'µg/dL',
    normalLow: 60,
    normalHigh: 170,
    notes: 'Diurnal variation; draw fasting in morning',
  },
  {
    id: 'tibc',
    name: 'Total Iron Binding Capacity',
    abbreviation: 'TIBC',
    category: 'iron-studies',
    unit: 'µg/dL',
    normalLow: 250,
    normalHigh: 370,
    notes: 'Elevated in iron deficiency; low in chronic disease',
  },
  {
    id: 'transferrin-sat',
    name: 'Transferrin Saturation',
    abbreviation: 'Tsat',
    category: 'iron-studies',
    unit: '%',
    normalLow: 20,
    normalHigh: 50,
    notes: '<20% suggests iron deficiency; >45% suggests iron overload',
  },
  {
    id: 'ferritin',
    name: 'Ferritin',
    abbreviation: 'Ferritin',
    category: 'iron-studies',
    unit: 'ng/mL',
    normalLow: 20,
    normalHigh: 200,
    notes: 'Storage form; acute phase reactant (may be normal in iron deficiency with inflammation)',
  },

  // ========== VITAMINS ==========
  {
    id: 'vitamin-b12',
    name: 'Vitamin B12',
    abbreviation: 'B12',
    category: 'vitamins',
    unit: 'pg/mL',
    normalLow: 200,
    normalHigh: 900,
    notes: 'Low: pernicious anemia, strict vegan, metformin use',
  },
  {
    id: 'folate',
    name: 'Folate',
    abbreviation: 'Folate',
    category: 'vitamins',
    unit: 'ng/mL',
    normalLow: 3,
    normalHigh: 17,
    notes: 'RBC folate more accurate for chronic deficiency',
  },
  {
    id: 'vitamin-d',
    name: 'Vitamin D (25-OH)',
    abbreviation: '25-OH D',
    category: 'vitamins',
    unit: 'ng/mL',
    normalLow: 30,
    normalHigh: 100,
    notes: '<20: deficiency; 20-29: insufficiency; >100: potential toxicity',
  },
];

// Helper function to get category info
export function getCategoryInfo(category: LabCategory): LabCategoryInfo | undefined {
  return LAB_CATEGORIES.find(c => c.id === category);
}

// Helper to check if a value is abnormal
export function isAbnormal(lab: LabReference, value: number): 'low' | 'high' | 'normal' | 'critical-low' | 'critical-high' {
  if (lab.criticalLow !== undefined && value < lab.criticalLow) return 'critical-low';
  if (lab.criticalHigh !== undefined && value > lab.criticalHigh) return 'critical-high';
  if (value < lab.normalLow) return 'low';
  if (value > lab.normalHigh) return 'high';
  return 'normal';
}

// Helper to format a lab value with unit
export function formatLabValue(value: number, unit: string): string {
  // Handle decimal places based on the magnitude
  if (value < 1) return `${value.toFixed(2)} ${unit}`;
  if (value < 10) return `${value.toFixed(1)} ${unit}`;
  return `${Math.round(value)} ${unit}`;
}
