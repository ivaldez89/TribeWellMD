'use client';

import React, { useMemo } from 'react';
import { parseLabs, type LabValue } from '@/lib/utils/labParser';

interface LabTableProps {
  text: string;
  className?: string;
}

// Group labs into categories for better display
function groupLabs(labs: LabValue[]): Record<string, LabValue[]> {
  const groups: Record<string, LabValue[]> = {
    'Electrolytes': [],
    'Renal': [],
    'Blood Gas': [],
    'CBC': [],
    'Coagulation': [],
    'Liver': [],
    'Cardiac': [],
    'Inflammatory': [],
    'Endocrine': [],
    'Lipids': [],
    'Other': [],
  };

  const categoryMap: Record<string, string> = {
    'Sodium': 'Electrolytes',
    'Potassium': 'Electrolytes',
    'Chloride': 'Electrolytes',
    'Bicarbonate': 'Electrolytes',
    'Calcium': 'Electrolytes',
    'Magnesium': 'Electrolytes',
    'Phosphorus': 'Electrolytes',
    'Anion Gap': 'Electrolytes',
    'BUN': 'Renal',
    'Creatinine': 'Renal',
    'GFR': 'Renal',
    'eGFR': 'Renal',
    'Serum Osmolality': 'Renal',
    'Urine Osmolality': 'Renal',
    'Specific Gravity': 'Renal',
    'Urine pH': 'Renal',
    'Urine Protein': 'Renal',
    'Urine Glucose': 'Renal',
    'pH': 'Blood Gas',
    'pCO2': 'Blood Gas',
    'pO2': 'Blood Gas',
    'O2 Sat': 'Blood Gas',
    'SpO2': 'Blood Gas',
    'SaO2': 'Blood Gas',
    'Lactate': 'Blood Gas',
    'Hemoglobin': 'CBC',
    'Hematocrit': 'CBC',
    'WBC': 'CBC',
    'Platelets': 'CBC',
    'RBC': 'CBC',
    'MCV': 'CBC',
    'MCH': 'CBC',
    'MCHC': 'CBC',
    'RDW': 'CBC',
    'PT': 'Coagulation',
    'INR': 'Coagulation',
    'PTT': 'Coagulation',
    'aPTT': 'Coagulation',
    'D-dimer': 'Coagulation',
    'Fibrinogen': 'Coagulation',
    'AST': 'Liver',
    'ALT': 'Liver',
    'ALP': 'Liver',
    'GGT': 'Liver',
    'Total Bilirubin': 'Liver',
    'Direct Bilirubin': 'Liver',
    'Albumin': 'Liver',
    'Total Protein': 'Liver',
    'Ammonia': 'Liver',
    'Troponin': 'Cardiac',
    'Troponin I': 'Cardiac',
    'BNP': 'Cardiac',
    'NT-proBNP': 'Cardiac',
    'CK-MB': 'Cardiac',
    'LDH': 'Cardiac',
    'CRP': 'Inflammatory',
    'ESR': 'Inflammatory',
    'Procalcitonin': 'Inflammatory',
    'TSH': 'Endocrine',
    'Free T4': 'Endocrine',
    'Free T3': 'Endocrine',
    'Glucose': 'Endocrine',
    'HbA1c': 'Endocrine',
    'Cortisol': 'Endocrine',
    'Total Cholesterol': 'Lipids',
    'LDL': 'Lipids',
    'HDL': 'Lipids',
    'Triglycerides': 'Lipids',
    'Ferritin': 'Other',
    'Iron': 'Other',
    'TIBC': 'Other',
    'TSAT': 'Other',
    'Vitamin D': 'Other',
    'Vitamin B12': 'Other',
    'Folate': 'Other',
  };

  for (const lab of labs) {
    const category = categoryMap[lab.name] || 'Other';
    groups[category].push(lab);
  }

  // Remove empty groups
  return Object.fromEntries(
    Object.entries(groups).filter(([, labs]) => labs.length > 0)
  );
}

export function LabTable({ text, className = '' }: LabTableProps) {
  const labs = useMemo(() => parseLabs(text), [text]);
  const groupedLabs = useMemo(() => groupLabs(labs), [labs]);

  if (labs.length === 0) {
    return null;
  }

  // For small number of labs, use simple grid without categories
  if (labs.length <= 6) {
    return (
      <div className={`mb-6 ${className}`}>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200 dark:border-blue-800 overflow-hidden">
          <div className="px-4 py-2.5 bg-blue-100/50 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-800 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">Laboratory Values</span>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {labs.map((lab, idx) => (
                <div
                  key={idx}
                  className="flex items-baseline justify-between gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-800"
                >
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{lab.name}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                    {lab.value}
                    {lab.unit && <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-0.5">{lab.unit}</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For larger number of labs, use categorized table
  return (
    <div className={`mb-6 ${className}`}>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200 dark:border-blue-800 overflow-hidden">
        <div className="px-4 py-2.5 bg-blue-100/50 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-800 flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">Laboratory Values</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/50 dark:bg-gray-800/50">
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-blue-200 dark:border-blue-800">
                  Test
                </th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-blue-200 dark:border-blue-800">
                  Result
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedLabs).map(([category, categoryLabs]) => (
                <React.Fragment key={category}>
                  {/* Category header */}
                  <tr className="bg-gray-50 dark:bg-gray-800/30">
                    <td
                      colSpan={2}
                      className="px-4 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-b border-blue-100 dark:border-blue-900"
                    >
                      {category}
                    </td>
                  </tr>
                  {/* Lab values in category */}
                  {categoryLabs.map((lab, idx) => (
                    <tr
                      key={`${category}-${idx}`}
                      className="bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
                    >
                      <td className="px-4 py-2 text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800">
                        {lab.name}
                      </td>
                      <td className="px-4 py-2 text-right font-bold text-gray-900 dark:text-gray-100 tabular-nums border-b border-gray-100 dark:border-gray-800">
                        {lab.value}
                        {lab.unit && (
                          <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">
                            {lab.unit}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Compact inline version for smaller displays
export function LabBadges({ text, className = '' }: LabTableProps) {
  const labs = useMemo(() => parseLabs(text), [text]);

  if (labs.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {labs.slice(0, 8).map((lab, idx) => (
        <span
          key={idx}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium"
        >
          <span className="text-blue-600 dark:text-blue-400">{lab.name}:</span>
          <span className="font-bold tabular-nums">{lab.value}</span>
          {lab.unit && <span className="text-blue-500 dark:text-blue-400">{lab.unit}</span>}
        </span>
      ))}
      {labs.length > 8 && (
        <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs">
          +{labs.length - 8} more
        </span>
      )}
    </div>
  );
}

export default LabTable;
