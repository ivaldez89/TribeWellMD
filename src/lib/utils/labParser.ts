// LabParser utility - Extracts medical lab values from question text
// Scans for common medical units and formats them into structured data

export interface LabValue {
  name: string;
  value: string;
  unit: string;
  raw: string;
}

// Common medical lab patterns with units
const LAB_PATTERNS = [
  // Electrolytes and basic metabolic panel
  /\b(Na\+?|Sodium|Na)\s*[:\s]+\s*([\d.]+)\s*(mEq\/L|mmol\/L|mg\/dL)?/gi,
  /\b(K\+?|Potassium|K)\s*[:\s]+\s*([\d.]+)\s*(mEq\/L|mmol\/L|mg\/dL)?/gi,
  /\b(Cl-?|Chloride|Cl)\s*[:\s]+\s*([\d.]+)\s*(mEq\/L|mmol\/L)?/gi,
  /\b(CO2|Bicarbonate|HCO3-?|TCO2)\s*[:\s]+\s*([\d.]+)\s*(mEq\/L|mmol\/L)?/gi,
  /\b(Ca2?\+?|Calcium)\s*[:\s]+\s*([\d.]+)\s*(mg\/dL|mmol\/L|mEq\/L)?/gi,
  /\b(Mg2?\+?|Magnesium)\s*[:\s]+\s*([\d.]+)\s*(mg\/dL|mmol\/L|mEq\/L)?/gi,
  /\b(Phosphorus|Phosphate|PO4)\s*[:\s]+\s*([\d.]+)\s*(mg\/dL|mmol\/L)?/gi,

  // Renal function
  /\b(BUN|Blood urea nitrogen)\s*[:\s]+\s*([\d.]+)\s*(mg\/dL)?/gi,
  /\b(Creatinine|Cr)\s*[:\s]+\s*([\d.]+)\s*(mg\/dL)?/gi,
  /\b(GFR|eGFR)\s*[:\s]+\s*([\d.]+)\s*(mL\/min(?:\/1\.73m2)?)?/gi,

  // Blood gases
  /\b(pH)\s*[:\s]+\s*([\d.]+)/gi,
  /\b(pCO2|PaCO2)\s*[:\s]+\s*([\d.]+)\s*(mmHg|mm Hg)?/gi,
  /\b(pO2|PaO2)\s*[:\s]+\s*([\d.]+)\s*(mmHg|mm Hg)?/gi,
  /\b(O2 sat|SpO2|SaO2|Oxygen saturation)\s*[:\s]+\s*([\d.]+)\s*(%)?/gi,

  // Liver function
  /\b(AST|Aspartate aminotransferase|SGOT)\s*[:\s]+\s*([\d.]+)\s*(U\/L|IU\/L)?/gi,
  /\b(ALT|Alanine aminotransferase|SGPT)\s*[:\s]+\s*([\d.]+)\s*(U\/L|IU\/L)?/gi,
  /\b(ALP|Alkaline phosphatase)\s*[:\s]+\s*([\d.]+)\s*(U\/L|IU\/L)?/gi,
  /\b(GGT|Gamma-glutamyl transferase)\s*[:\s]+\s*([\d.]+)\s*(U\/L|IU\/L)?/gi,
  /\b(Total bilirubin|Bilirubin, total|T\.? ?Bili)\s*[:\s]+\s*([\d.]+)\s*(mg\/dL)?/gi,
  /\b(Direct bilirubin|D\.? ?Bili)\s*[:\s]+\s*([\d.]+)\s*(mg\/dL)?/gi,
  /\b(Albumin)\s*[:\s]+\s*([\d.]+)\s*(g\/dL)?/gi,
  /\b(Total protein)\s*[:\s]+\s*([\d.]+)\s*(g\/dL)?/gi,

  // CBC
  /\b(WBC|White blood cells?|Leukocytes?)\s*[:\s]+\s*([\d.,]+)\s*(\/mm3|×10[39]\/L|K\/μL|cells?\/μL)?/gi,
  /\b(RBC|Red blood cells?|Erythrocytes?)\s*[:\s]+\s*([\d.]+)\s*(\/mm3|×10[612]\/L|M\/μL)?/gi,
  /\b(Hemoglobin|Hgb|Hb)\s*[:\s]+\s*([\d.]+)\s*(g\/dL)?/gi,
  /\b(Hematocrit|Hct)\s*[:\s]+\s*([\d.]+)\s*(%)?/gi,
  /\b(Platelets?|Plt)\s*[:\s]+\s*([\d.,]+)\s*(\/mm3|×10[39]\/L|K\/μL)?/gi,
  /\b(MCV)\s*[:\s]+\s*([\d.]+)\s*(fL)?/gi,
  /\b(MCH)\s*[:\s]+\s*([\d.]+)\s*(pg)?/gi,
  /\b(MCHC)\s*[:\s]+\s*([\d.]+)\s*(g\/dL)?/gi,
  /\b(RDW)\s*[:\s]+\s*([\d.]+)\s*(%)?/gi,

  // Coagulation
  /\b(PT|Prothrombin time)\s*[:\s]+\s*([\d.]+)\s*(seconds?|sec|s)?/gi,
  /\b(INR)\s*[:\s]+\s*([\d.]+)/gi,
  /\b(PTT|aPTT|Partial thromboplastin time)\s*[:\s]+\s*([\d.]+)\s*(seconds?|sec|s)?/gi,
  /\b(D-dimer)\s*[:\s]+\s*([\d.,]+)\s*(ng\/mL|μg\/mL|mg\/L)?/gi,
  /\b(Fibrinogen)\s*[:\s]+\s*([\d.]+)\s*(mg\/dL)?/gi,

  // Cardiac markers
  /\b(Troponin I?|TnI)\s*[:\s]+\s*([\d.<]+)\s*(ng\/mL|ng\/L)?/gi,
  /\b(BNP|NT-proBNP)\s*[:\s]+\s*([\d.,]+)\s*(pg\/mL)?/gi,
  /\b(CK-MB|CK MB)\s*[:\s]+\s*([\d.]+)\s*(ng\/mL|U\/L)?/gi,
  /\b(LDH|Lactate dehydrogenase)\s*[:\s]+\s*([\d.]+)\s*(U\/L)?/gi,

  // Inflammatory markers
  /\b(CRP|C-reactive protein)\s*[:\s]+\s*([\d.]+)\s*(mg\/L|mg\/dL)?/gi,
  /\b(ESR|Erythrocyte sedimentation rate|Sed rate)\s*[:\s]+\s*([\d.]+)\s*(mm\/hr?)?/gi,
  /\b(Procalcitonin)\s*[:\s]+\s*([\d.]+)\s*(ng\/mL)?/gi,

  // Endocrine
  /\b(TSH)\s*[:\s]+\s*([\d.]+)\s*(μIU\/mL|mIU\/L)?/gi,
  /\b(Free T4|FT4)\s*[:\s]+\s*([\d.]+)\s*(ng\/dL)?/gi,
  /\b(Free T3|FT3)\s*[:\s]+\s*([\d.]+)\s*(pg\/mL)?/gi,
  /\b(Glucose|Blood glucose|BG)\s*[:\s]+\s*([\d.]+)\s*(mg\/dL|mmol\/L)?/gi,
  /\b(HbA1c|A1c|Hemoglobin A1c)\s*[:\s]+\s*([\d.]+)\s*(%)?/gi,
  /\b(Cortisol)\s*[:\s]+\s*([\d.]+)\s*(μg\/dL)?/gi,

  // Lipids
  /\b(Total cholesterol|Cholesterol)\s*[:\s]+\s*([\d.]+)\s*(mg\/dL)?/gi,
  /\b(LDL|LDL-C)\s*[:\s]+\s*([\d.]+)\s*(mg\/dL)?/gi,
  /\b(HDL|HDL-C)\s*[:\s]+\s*([\d.]+)\s*(mg\/dL)?/gi,
  /\b(Triglycerides|TG)\s*[:\s]+\s*([\d.]+)\s*(mg\/dL)?/gi,

  // Urinalysis
  /\b(Specific gravity|Sp\.? ?Gr\.?)\s*[:\s]+\s*([\d.]+)/gi,
  /\b(Urine pH)\s*[:\s]+\s*([\d.]+)/gi,
  /\b(Urine protein)\s*[:\s]+\s*([\d.]+|trace|[+]+|negative)\s*(mg\/dL)?/gi,
  /\b(Urine glucose)\s*[:\s]+\s*([\d.]+|trace|[+]+|negative)\s*(mg\/dL)?/gi,

  // Osmolality
  /\b(Serum osmolality|Serum osm)\s*[:\s]+\s*([\d.]+)\s*(mOsm\/kg)?/gi,
  /\b(Urine osmolality|Urine osm)\s*[:\s]+\s*([\d.]+)\s*(mOsm\/kg)?/gi,

  // Iron studies
  /\b(Ferritin)\s*[:\s]+\s*([\d.]+)\s*(ng\/mL)?/gi,
  /\b(Iron|Serum iron)\s*[:\s]+\s*([\d.]+)\s*(μg\/dL)?/gi,
  /\b(TIBC)\s*[:\s]+\s*([\d.]+)\s*(μg\/dL)?/gi,
  /\b(Transferrin saturation|TSAT)\s*[:\s]+\s*([\d.]+)\s*(%)?/gi,

  // Vitamins
  /\b(Vitamin D|25-OH Vitamin D)\s*[:\s]+\s*([\d.]+)\s*(ng\/mL)?/gi,
  /\b(Vitamin B12|B12)\s*[:\s]+\s*([\d.]+)\s*(pg\/mL)?/gi,
  /\b(Folate)\s*[:\s]+\s*([\d.]+)\s*(ng\/mL)?/gi,

  // Lactate
  /\b(Lactate|Lactic acid)\s*[:\s]+\s*([\d.]+)\s*(mmol\/L|mg\/dL)?/gi,
  /\b(Ammonia)\s*[:\s]+\s*([\d.]+)\s*(μmol\/L|μg\/dL)?/gi,

  // Generic pattern for value : number unit
  /\b([A-Za-z][A-Za-z0-9\s-]{2,25})\s*[:\s]+\s*([\d.,]+)\s*(mEq\/L|mg\/dL|mOsm\/kg|mmol\/L|g\/dL|U\/L|IU\/L|ng\/mL|pg\/mL|μg\/dL|mm\/hr?|%|\/mm3)/gi,
];

// Alternative patterns that match inline format "sodium 140 mEq/L"
const INLINE_LAB_PATTERNS = [
  /\b(sodium|Na\+?)\s+([\d.]+)\s*(mEq\/L|mmol\/L)/gi,
  /\b(potassium|K\+?)\s+([\d.]+)\s*(mEq\/L|mmol\/L)/gi,
  /\b(chloride|Cl-?)\s+([\d.]+)\s*(mEq\/L|mmol\/L)/gi,
  /\b(bicarbonate|HCO3-?|CO2)\s+([\d.]+)\s*(mEq\/L|mmol\/L)/gi,
  /\b(calcium|Ca2?\+?)\s+([\d.]+)\s*(mg\/dL|mmol\/L)/gi,
  /\b(magnesium|Mg2?\+?)\s+([\d.]+)\s*(mg\/dL|mmol\/L|mEq\/L)/gi,
  /\b(BUN)\s+([\d.]+)\s*(mg\/dL)/gi,
  /\b(creatinine|Cr)\s+([\d.]+)\s*(mg\/dL)/gi,
  /\b(glucose)\s+([\d.]+)\s*(mg\/dL|mmol\/L)/gi,
  /\b(hemoglobin|Hgb|Hb)\s+([\d.]+)\s*(g\/dL)/gi,
  /\b(hematocrit|Hct)\s+([\d.]+)\s*(%)?/gi,
  /\b(WBC|white blood cells?)\s+([\d.,]+)\s*(\/mm3|×10[39]\/L|K\/μL)?/gi,
  /\b(platelets?|Plt)\s+([\d.,]+)\s*(\/mm3|×10[39]\/L|K\/μL)?/gi,
  /\b(pH)\s+([\d.]+)/gi,
  /\b(pCO2|PaCO2)\s+([\d.]+)\s*(mmHg|mm Hg)?/gi,
  /\b(pO2|PaO2)\s+([\d.]+)\s*(mmHg|mm Hg)?/gi,
  /\b(serum osmolality)\s+([\d.]+)\s*(mOsm\/kg)/gi,
  /\b(urine osmolality)\s+([\d.]+)\s*(mOsm\/kg)/gi,
  /\b(anion gap)\s+([\d.]+)\s*(mEq\/L)?/gi,
];

// Normalize lab names for consistent display
const LAB_NAME_MAP: Record<string, string> = {
  'na': 'Sodium',
  'na+': 'Sodium',
  'sodium': 'Sodium',
  'k': 'Potassium',
  'k+': 'Potassium',
  'potassium': 'Potassium',
  'cl': 'Chloride',
  'cl-': 'Chloride',
  'chloride': 'Chloride',
  'co2': 'Bicarbonate',
  'hco3': 'Bicarbonate',
  'hco3-': 'Bicarbonate',
  'bicarbonate': 'Bicarbonate',
  'tco2': 'Bicarbonate',
  'ca': 'Calcium',
  'ca+': 'Calcium',
  'ca2+': 'Calcium',
  'calcium': 'Calcium',
  'mg': 'Magnesium',
  'mg+': 'Magnesium',
  'mg2+': 'Magnesium',
  'magnesium': 'Magnesium',
  'phosphorus': 'Phosphorus',
  'phosphate': 'Phosphorus',
  'po4': 'Phosphorus',
  'bun': 'BUN',
  'blood urea nitrogen': 'BUN',
  'creatinine': 'Creatinine',
  'cr': 'Creatinine',
  'gfr': 'GFR',
  'egfr': 'eGFR',
  'ph': 'pH',
  'pco2': 'pCO2',
  'paco2': 'pCO2',
  'po2': 'pO2',
  'pao2': 'pO2',
  'o2 sat': 'O2 Sat',
  'spo2': 'SpO2',
  'sao2': 'SaO2',
  'oxygen saturation': 'O2 Sat',
  'ast': 'AST',
  'aspartate aminotransferase': 'AST',
  'sgot': 'AST',
  'alt': 'ALT',
  'alanine aminotransferase': 'ALT',
  'sgpt': 'ALT',
  'alp': 'ALP',
  'alkaline phosphatase': 'ALP',
  'ggt': 'GGT',
  'gamma-glutamyl transferase': 'GGT',
  'total bilirubin': 'Total Bilirubin',
  'bilirubin, total': 'Total Bilirubin',
  't. bili': 'Total Bilirubin',
  't bili': 'Total Bilirubin',
  'direct bilirubin': 'Direct Bilirubin',
  'd. bili': 'Direct Bilirubin',
  'd bili': 'Direct Bilirubin',
  'albumin': 'Albumin',
  'total protein': 'Total Protein',
  'wbc': 'WBC',
  'white blood cells': 'WBC',
  'white blood cell': 'WBC',
  'leukocytes': 'WBC',
  'leukocyte': 'WBC',
  'rbc': 'RBC',
  'red blood cells': 'RBC',
  'red blood cell': 'RBC',
  'erythrocytes': 'RBC',
  'erythrocyte': 'RBC',
  'hemoglobin': 'Hemoglobin',
  'hgb': 'Hemoglobin',
  'hb': 'Hemoglobin',
  'hematocrit': 'Hematocrit',
  'hct': 'Hematocrit',
  'platelets': 'Platelets',
  'platelet': 'Platelets',
  'plt': 'Platelets',
  'mcv': 'MCV',
  'mch': 'MCH',
  'mchc': 'MCHC',
  'rdw': 'RDW',
  'pt': 'PT',
  'prothrombin time': 'PT',
  'inr': 'INR',
  'ptt': 'PTT',
  'aptt': 'aPTT',
  'partial thromboplastin time': 'PTT',
  'd-dimer': 'D-dimer',
  'fibrinogen': 'Fibrinogen',
  'troponin': 'Troponin',
  'troponin i': 'Troponin I',
  'tni': 'Troponin I',
  'bnp': 'BNP',
  'nt-probnp': 'NT-proBNP',
  'ck-mb': 'CK-MB',
  'ck mb': 'CK-MB',
  'ldh': 'LDH',
  'lactate dehydrogenase': 'LDH',
  'crp': 'CRP',
  'c-reactive protein': 'CRP',
  'esr': 'ESR',
  'erythrocyte sedimentation rate': 'ESR',
  'sed rate': 'ESR',
  'procalcitonin': 'Procalcitonin',
  'tsh': 'TSH',
  'free t4': 'Free T4',
  'ft4': 'Free T4',
  'free t3': 'Free T3',
  'ft3': 'Free T3',
  'glucose': 'Glucose',
  'blood glucose': 'Glucose',
  'bg': 'Glucose',
  'hba1c': 'HbA1c',
  'a1c': 'HbA1c',
  'hemoglobin a1c': 'HbA1c',
  'cortisol': 'Cortisol',
  'total cholesterol': 'Total Cholesterol',
  'cholesterol': 'Total Cholesterol',
  'ldl': 'LDL',
  'ldl-c': 'LDL',
  'hdl': 'HDL',
  'hdl-c': 'HDL',
  'triglycerides': 'Triglycerides',
  'tg': 'Triglycerides',
  'specific gravity': 'Specific Gravity',
  'sp. gr.': 'Specific Gravity',
  'sp gr': 'Specific Gravity',
  'urine ph': 'Urine pH',
  'urine protein': 'Urine Protein',
  'urine glucose': 'Urine Glucose',
  'serum osmolality': 'Serum Osmolality',
  'serum osm': 'Serum Osmolality',
  'urine osmolality': 'Urine Osmolality',
  'urine osm': 'Urine Osmolality',
  'ferritin': 'Ferritin',
  'iron': 'Iron',
  'serum iron': 'Iron',
  'tibc': 'TIBC',
  'transferrin saturation': 'TSAT',
  'tsat': 'TSAT',
  'vitamin d': 'Vitamin D',
  '25-oh vitamin d': 'Vitamin D',
  'vitamin b12': 'Vitamin B12',
  'b12': 'Vitamin B12',
  'folate': 'Folate',
  'lactate': 'Lactate',
  'lactic acid': 'Lactate',
  'ammonia': 'Ammonia',
  'anion gap': 'Anion Gap',
};

// Default units for labs when not specified
const DEFAULT_UNITS: Record<string, string> = {
  'Sodium': 'mEq/L',
  'Potassium': 'mEq/L',
  'Chloride': 'mEq/L',
  'Bicarbonate': 'mEq/L',
  'Calcium': 'mg/dL',
  'Magnesium': 'mg/dL',
  'Phosphorus': 'mg/dL',
  'BUN': 'mg/dL',
  'Creatinine': 'mg/dL',
  'GFR': 'mL/min',
  'eGFR': 'mL/min',
  'pH': '',
  'pCO2': 'mmHg',
  'pO2': 'mmHg',
  'O2 Sat': '%',
  'SpO2': '%',
  'SaO2': '%',
  'AST': 'U/L',
  'ALT': 'U/L',
  'ALP': 'U/L',
  'GGT': 'U/L',
  'Total Bilirubin': 'mg/dL',
  'Direct Bilirubin': 'mg/dL',
  'Albumin': 'g/dL',
  'Total Protein': 'g/dL',
  'WBC': '/mm³',
  'RBC': 'M/μL',
  'Hemoglobin': 'g/dL',
  'Hematocrit': '%',
  'Platelets': 'K/μL',
  'MCV': 'fL',
  'MCH': 'pg',
  'MCHC': 'g/dL',
  'RDW': '%',
  'PT': 'sec',
  'INR': '',
  'PTT': 'sec',
  'aPTT': 'sec',
  'D-dimer': 'ng/mL',
  'Fibrinogen': 'mg/dL',
  'Troponin': 'ng/mL',
  'Troponin I': 'ng/mL',
  'BNP': 'pg/mL',
  'NT-proBNP': 'pg/mL',
  'CK-MB': 'ng/mL',
  'LDH': 'U/L',
  'CRP': 'mg/L',
  'ESR': 'mm/hr',
  'Procalcitonin': 'ng/mL',
  'TSH': 'μIU/mL',
  'Free T4': 'ng/dL',
  'Free T3': 'pg/mL',
  'Glucose': 'mg/dL',
  'HbA1c': '%',
  'Cortisol': 'μg/dL',
  'Total Cholesterol': 'mg/dL',
  'LDL': 'mg/dL',
  'HDL': 'mg/dL',
  'Triglycerides': 'mg/dL',
  'Specific Gravity': '',
  'Urine pH': '',
  'Serum Osmolality': 'mOsm/kg',
  'Urine Osmolality': 'mOsm/kg',
  'Ferritin': 'ng/mL',
  'Iron': 'μg/dL',
  'TIBC': 'μg/dL',
  'TSAT': '%',
  'Vitamin D': 'ng/mL',
  'Vitamin B12': 'pg/mL',
  'Folate': 'ng/mL',
  'Lactate': 'mmol/L',
  'Ammonia': 'μmol/L',
  'Anion Gap': 'mEq/L',
};

/**
 * Parse lab values from question text
 * @param text - The question stem or text to parse
 * @returns Array of extracted lab values
 */
export function parseLabs(text: string): LabValue[] {
  const labs: LabValue[] = [];
  const seenLabs = new Set<string>();

  // Try all patterns
  const allPatterns = [...LAB_PATTERNS, ...INLINE_LAB_PATTERNS];

  for (const pattern of allPatterns) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;

    while ((match = regex.exec(text)) !== null) {
      const rawName = match[1]?.trim() || '';
      const value = match[2]?.trim() || '';
      const unit = match[3]?.trim() || '';

      if (!rawName || !value) continue;

      // Normalize the lab name
      const normalizedName = LAB_NAME_MAP[rawName.toLowerCase()] || rawName;

      // Skip if we've already seen this lab
      const key = `${normalizedName}:${value}`;
      if (seenLabs.has(key)) continue;
      seenLabs.add(key);

      // Get default unit if none provided
      const finalUnit = unit || DEFAULT_UNITS[normalizedName] || '';

      labs.push({
        name: normalizedName,
        value,
        unit: finalUnit,
        raw: match[0],
      });
    }
  }

  // Sort by common ordering (electrolytes first, then renal, then CBC, etc.)
  const ORDER = [
    'Sodium', 'Potassium', 'Chloride', 'Bicarbonate', 'BUN', 'Creatinine', 'GFR', 'eGFR', 'Glucose',
    'Calcium', 'Magnesium', 'Phosphorus',
    'pH', 'pCO2', 'pO2', 'O2 Sat', 'SpO2', 'SaO2', 'Anion Gap',
    'Hemoglobin', 'Hematocrit', 'WBC', 'Platelets', 'RBC', 'MCV', 'MCH', 'MCHC', 'RDW',
    'PT', 'INR', 'PTT', 'aPTT', 'D-dimer', 'Fibrinogen',
    'AST', 'ALT', 'ALP', 'GGT', 'Total Bilirubin', 'Direct Bilirubin', 'Albumin', 'Total Protein',
    'Serum Osmolality', 'Urine Osmolality',
    'Troponin', 'Troponin I', 'BNP', 'NT-proBNP', 'CK-MB', 'LDH',
    'CRP', 'ESR', 'Procalcitonin',
    'TSH', 'Free T4', 'Free T3', 'HbA1c', 'Cortisol',
    'Total Cholesterol', 'LDL', 'HDL', 'Triglycerides',
    'Ferritin', 'Iron', 'TIBC', 'TSAT', 'Vitamin D', 'Vitamin B12', 'Folate',
    'Lactate', 'Ammonia',
    'Specific Gravity', 'Urine pH', 'Urine Protein', 'Urine Glucose',
  ];

  labs.sort((a, b) => {
    const indexA = ORDER.indexOf(a.name);
    const indexB = ORDER.indexOf(b.name);
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return labs;
}

/**
 * Check if the text contains any lab values
 * @param text - The question stem or text to check
 * @returns True if lab values are found
 */
export function hasLabs(text: string): boolean {
  return parseLabs(text).length > 0;
}

/**
 * Remove lab value mentions from text (for cleaner prose display)
 * @param text - The original text
 * @returns Text with lab value mentions removed
 */
export function removeLabsFromText(text: string): string {
  const labs = parseLabs(text);
  let cleanText = text;

  for (const lab of labs) {
    cleanText = cleanText.replace(lab.raw, '');
  }

  // Clean up extra whitespace
  cleanText = cleanText.replace(/\s+/g, ' ').trim();
  cleanText = cleanText.replace(/\s+,/g, ',').replace(/,\s*,/g, ',');
  cleanText = cleanText.replace(/\s+\./g, '.').replace(/\.\s*\./g, '.');

  return cleanText;
}
