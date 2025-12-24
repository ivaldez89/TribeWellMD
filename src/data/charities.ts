// Partner charities for TribeWellMD
// All partners are 501(c)(3) verified organizations

export interface Charity {
  id: string;
  name: string;
  shortName: string;
  description: string;
  mission: string;
  focus: string;
  icon: string;
  website: string;
  ein: string; // IRS Employer Identification Number for 501(c)(3) verification
  verified: boolean;
  featured: boolean;
  impactMetrics: {
    label: string;
    value: string;
  }[];
  categories: ('physician-wellness' | 'mental-health' | 'healthcare-access' | 'medical-education' | 'global-health')[];
}

export const PARTNER_CHARITIES: Charity[] = [
  {
    id: 'dr-lorna-breen',
    name: 'Dr. Lorna Breen Heroes Foundation',
    shortName: 'Dr. Breen Foundation',
    description: 'Reducing burnout in healthcare and safeguarding the well-being of healthcare professionals',
    mission: 'To reduce burnout in the health professional workforce and safeguard their well-being and job satisfaction.',
    focus: 'Physician Wellness',
    icon: 'Heart',
    website: 'https://drlornabreen.org',
    ein: '85-3879498',
    verified: true,
    featured: true,
    impactMetrics: [
      { label: 'Healthcare workers supported', value: '50,000+' },
      { label: 'States with legislation', value: '20+' },
      { label: 'Training programs', value: '100+' }
    ],
    categories: ['physician-wellness', 'mental-health']
  },
  {
    id: 'nami',
    name: 'NAMI (National Alliance on Mental Illness)',
    shortName: 'NAMI',
    description: 'Building better lives for Americans affected by mental illness',
    mission: 'To provide advocacy, education, support and public awareness so that all individuals and families affected by mental illness can build better lives.',
    focus: 'Mental Health',
    icon: 'HeartHand',
    website: 'https://nami.org',
    ein: '43-1201653',
    verified: true,
    featured: true,
    impactMetrics: [
      { label: 'People helped annually', value: '500,000+' },
      { label: 'Local affiliates', value: '600+' },
      { label: 'Crisis hotline calls', value: '1M+' }
    ],
    categories: ['mental-health']
  },
  {
    id: 'remote-area-medical',
    name: 'Remote Area Medical',
    shortName: 'RAM',
    description: 'Providing free healthcare to underserved communities',
    mission: 'To prevent pain and alleviate suffering by providing free quality healthcare to those in need.',
    focus: 'Healthcare Access',
    icon: 'Hospital',
    website: 'https://ramusa.org',
    ein: '58-1808756',
    verified: true,
    featured: true,
    impactMetrics: [
      { label: 'Patients served', value: '1M+' },
      { label: 'Services provided', value: '$200M+' },
      { label: 'Annual clinics', value: '60+' }
    ],
    categories: ['healthcare-access']
  },
  {
    id: 'snma',
    name: 'Student National Medical Association',
    shortName: 'SNMA',
    description: 'Supporting underrepresented minority medical students',
    mission: 'To support current and future underrepresented minority medical students, address the needs of underserved communities, and increase the number of clinically excellent, culturally competent and socially conscious physicians.',
    focus: 'Medical Education',
    icon: 'GraduationCap',
    website: 'https://snma.org',
    ein: '52-1136586',
    verified: true,
    featured: false,
    impactMetrics: [
      { label: 'Student members', value: '10,000+' },
      { label: 'Medical school chapters', value: '140+' },
      { label: 'Pipeline programs', value: '50+' }
    ],
    categories: ['medical-education']
  },
  {
    id: 'partners-in-health',
    name: 'Partners In Health',
    shortName: 'PIH',
    description: 'Bringing modern medical care to the world\'s poorest communities',
    mission: 'To provide a preferential option for the poor in health care by working in partnership with impoverished communities.',
    focus: 'Global Health',
    icon: 'Globe',
    website: 'https://pih.org',
    ein: '04-3567502',
    verified: true,
    featured: true,
    impactMetrics: [
      { label: 'Countries served', value: '12' },
      { label: 'Patients annually', value: '2.5M+' },
      { label: 'Community health workers', value: '12,000+' }
    ],
    categories: ['global-health', 'healthcare-access']
  },
  {
    id: 'doctors-without-borders',
    name: 'Doctors Without Borders (MSF)',
    shortName: 'MSF',
    description: 'Providing emergency medical care in crisis zones worldwide',
    mission: 'To provide lifesaving medical care to those most in need, regardless of race, religion, or political affiliation.',
    focus: 'Global Health & Crisis Response',
    icon: 'Globe',
    website: 'https://www.doctorswithoutborders.org',
    ein: '13-3433452',
    verified: true,
    featured: true,
    impactMetrics: [
      { label: 'Countries with projects', value: '70+' },
      { label: 'Outpatient consultations', value: '11M+' },
      { label: 'Staff worldwide', value: '63,000+' }
    ],
    categories: ['global-health', 'healthcare-access']
  },
  {
    id: 'american-heart-association',
    name: 'American Heart Association',
    shortName: 'AHA',
    description: 'Fighting heart disease and stroke through research and education',
    mission: 'To be a relentless force for a world of longer, healthier lives through groundbreaking research, advocacy, and community programs.',
    focus: 'Cardiovascular Health',
    icon: 'Heart',
    website: 'https://www.heart.org',
    ein: '13-5613797',
    verified: true,
    featured: true,
    impactMetrics: [
      { label: 'Research funding', value: '$5B+' },
      { label: 'CPR trainings annually', value: '22M+' },
      { label: 'Lives saved through research', value: 'Millions' }
    ],
    categories: ['healthcare-access', 'medical-education']
  },
  {
    id: 'st-jude',
    name: 'St. Jude Children\'s Research Hospital',
    shortName: 'St. Jude',
    description: 'Leading the way the world understands, treats and defeats childhood cancer',
    mission: 'To advance cures and means of prevention for pediatric catastrophic diseases through research and treatment.',
    focus: 'Pediatric Cancer Research',
    icon: 'Heart',
    website: 'https://www.stjude.org',
    ein: '62-0646012',
    verified: true,
    featured: true,
    impactMetrics: [
      { label: 'Survival rate improvement', value: '20% to 80%+' },
      { label: 'Countries sharing protocols', value: '80+' },
      { label: 'Families never billed', value: '100%' }
    ],
    categories: ['medical-education', 'healthcare-access']
  },
  {
    id: 'american-cancer-society',
    name: 'American Cancer Society',
    shortName: 'ACS',
    description: 'Dedicated to eliminating cancer through research, education, and patient support',
    mission: 'To save lives, celebrate lives, and lead the fight for a world without cancer.',
    focus: 'Cancer Research & Support',
    icon: 'Heart',
    website: 'https://www.cancer.org',
    ein: '13-1788491',
    verified: true,
    featured: false,
    impactMetrics: [
      { label: 'Research grants funded', value: '$5B+' },
      { label: '24/7 helpline calls', value: '1M+ annually' },
      { label: 'Free lodging nights', value: '2M+' }
    ],
    categories: ['healthcare-access', 'medical-education']
  },
  {
    id: 'direct-relief',
    name: 'Direct Relief',
    shortName: 'Direct Relief',
    description: 'Improving health and lives of people affected by poverty and emergencies',
    mission: 'To improve the health and lives of people affected by poverty or emergency situations by mobilizing and providing essential medical resources.',
    focus: 'Medical Aid & Disaster Response',
    icon: 'Hospital',
    website: 'https://www.directrelief.org',
    ein: '95-1831116',
    verified: true,
    featured: false,
    impactMetrics: [
      { label: 'Countries reached', value: '100+' },
      { label: 'Medical aid value', value: '$2B+ annually' },
      { label: 'Healthcare facilities supported', value: '3,000+' }
    ],
    categories: ['healthcare-access', 'global-health']
  }
];

// Get charity by ID
export const getCharityById = (id: string): Charity | undefined => {
  return PARTNER_CHARITIES.find(c => c.id === id);
};

// Get charities by category
export const getCharitiesByCategory = (category: Charity['categories'][number]): Charity[] => {
  return PARTNER_CHARITIES.filter(c => c.categories.includes(category));
};

// Get featured charities
export const getFeaturedCharities = (): Charity[] => {
  return PARTNER_CHARITIES.filter(c => c.featured);
};

// Charity categories with metadata - uses icon names from Icons.tsx
export const CHARITY_CATEGORIES = {
  'physician-wellness': {
    id: 'physician-wellness',
    title: 'Physician Wellness',
    description: 'Supporting the mental health and wellbeing of healthcare workers',
    icon: 'Heart',
    color: 'from-[#8B7355] to-[#A89070]'
  },
  'mental-health': {
    id: 'mental-health',
    title: 'Mental Health',
    description: 'Improving mental health awareness, treatment, and support',
    icon: 'HeartHand',
    color: 'from-[#5B7B6D] to-[#7FA08F]'
  },
  'healthcare-access': {
    id: 'healthcare-access',
    title: 'Healthcare Access',
    description: 'Providing medical care to underserved communities',
    icon: 'Hospital',
    color: 'from-[#5B7B6D] to-[#6D8B7D]'
  },
  'medical-education': {
    id: 'medical-education',
    title: 'Medical Education',
    description: 'Supporting medical students and training programs',
    icon: 'GraduationCap',
    color: 'from-[#A89070] to-[#C4A77D]'
  },
  'global-health': {
    id: 'global-health',
    title: 'Global Health',
    description: 'Addressing health challenges worldwide',
    icon: 'Globe',
    color: 'from-[#5B7B6D] to-[#6D9B8D]'
  }
} as const;

export type CharityCategoryId = keyof typeof CHARITY_CATEGORIES;
