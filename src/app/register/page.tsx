'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type UserRole = 'premed' | 'medical-student' | 'resident' | 'fellow' | 'attending' | 'institution';

interface RoleOption {
  id: UserRole;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

// SVG icons for each role
const BookIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const StethoscopeIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const UserMdIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const AcademicCapIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path d="M12 14l9-5-9-5-9 5 9 5z" />
    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
  </svg>
);

const TeacherIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const BuildingIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const roleOptions: RoleOption[] = [
  {
    id: 'premed',
    title: 'Pre-Med Student',
    description: 'Undergraduate preparing for medical school',
    icon: <BookIcon />,
    color: 'from-blue-500 to-indigo-500',
  },
  {
    id: 'medical-student',
    title: 'Medical Student',
    description: 'MS1, MS2, MS3, or MS4',
    icon: <StethoscopeIcon />,
    color: 'from-teal-500 to-cyan-500',
  },
  {
    id: 'resident',
    title: 'Resident',
    description: 'In residency training',
    icon: <UserMdIcon />,
    color: 'from-emerald-500 to-green-500',
  },
  {
    id: 'fellow',
    title: 'Fellow',
    description: 'In fellowship training',
    icon: <AcademicCapIcon />,
    color: 'from-purple-500 to-violet-500',
  },
  {
    id: 'attending',
    title: 'Attending / Faculty',
    description: 'Practicing physician or educator',
    icon: <TeacherIcon />,
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'institution',
    title: 'Institution',
    description: 'School administrator or wellness coordinator',
    icon: <BuildingIcon />,
    color: 'from-slate-500 to-slate-600',
  },
];

export default function RegisterPage() {
  const [step, setStep] = useState<'role' | 'details'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    institution: '',
    currentYear: '',
    specialty: '',
    pgyYear: '',
    jobTitle: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep('details');
  };

  const handleBack = () => {
    setStep('role');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    // Require .edu email
    if (!formData.email.toLowerCase().endsWith('.edu')) {
      setError('A .edu email address is required to register');
      setIsLoading(false);
      return;
    }

    // Password validation
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      let currentYear: string | undefined;
      switch (selectedRole) {
        case 'premed':
          currentYear = 'Pre-Med';
          break;
        case 'medical-student':
          currentYear = formData.currentYear || 'MS1';
          break;
        case 'resident':
          currentYear = 'Resident';
          break;
        case 'fellow':
          currentYear = 'Fellow';
          break;
        case 'attending':
          currentYear = 'Attending';
          break;
        case 'institution':
          currentYear = 'Other';
          break;
      }

      const supabase = createClient();

      // Sign up with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: selectedRole,
            institution: formData.institution,
            current_year: currentYear,
            specialty: formData.specialty || null,
            pgy_year: formData.pgyYear || null,
            job_title: formData.jobTitle || null,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else {
          setError(signUpError.message);
        }
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Also store profile in localStorage for now (can migrate to Supabase DB later)
        const profile = {
          id: data.user.id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          school: formData.institution,
          currentYear,
          role: selectedRole,
          ...(selectedRole === 'resident' || selectedRole === 'fellow' ? {
            interestedSpecialties: formData.specialty ? [formData.specialty] : [],
            pgyYear: formData.pgyYear,
          } : {}),
          ...(selectedRole === 'institution' ? {
            jobTitle: formData.jobTitle,
          } : {}),
          profileVisibility: 'connections' as const,
          showStudyStats: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        localStorage.setItem('tribewellmd_user_profile', JSON.stringify(profile));
        router.push('/profile');
        router.refresh();
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  const selectedRoleData = roleOptions.find(r => r.id === selectedRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-cyan-50 to-emerald-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-teal-200/40 to-cyan-200/40 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-200/40 to-teal-200/40 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-100/30 to-indigo-100/30 dark:from-cyan-900/10 dark:to-indigo-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 shadow-xl shadow-teal-500/25 overflow-hidden">
            <img src="/logo.jpeg" alt="TribeWellMD" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-slate-900 dark:text-white">Join </span>
            <span className="text-slate-900 dark:text-white">Tribe</span>
            <span className="text-teal-600 dark:text-teal-400">Well</span>
            <span className="text-indigo-600 dark:text-indigo-400">MD</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {step === 'role' ? 'Select your role to get started' : 'Tell us about yourself'}
          </p>
        </div>

        {/* Registration Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-white/50 dark:border-slate-700/50 p-8">
          {step === 'role' ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">I am a...</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {roleOptions.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className={`
                      relative p-4 rounded-xl border-2 text-left transition-all duration-200
                      hover:border-teal-500 hover:shadow-lg hover:scale-[1.02]
                      ${selectedRole === role.id
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                        : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center text-white shadow-lg`}>
                        {role.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{role.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{role.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 mt-6">
                <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                  Already have an account?{' '}
                  <Link href="/login" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to role selection
              </button>

              {selectedRoleData && (
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${selectedRoleData.color} text-white text-sm font-medium`}>
                  {selectedRoleData.icon}
                  <span>{selectedRoleData.title}</span>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:border-transparent transition-all ${
                    formData.email && !formData.email.toLowerCase().endsWith('.edu')
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'
                  }`}
                  placeholder="john.doe@school.edu"
                  required
                />
                {formData.email && !formData.email.toLowerCase().endsWith('.edu') ? (
                  <p className="mt-1 text-xs text-red-500 font-medium">A .edu email address is required to register</p>
                ) : (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">A .edu email address is required to register</p>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="Min. 8 characters"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:border-transparent transition-all ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'
                    }`}
                    placeholder="Confirm password"
                    required
                  />
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500 font-medium">Passwords do not match</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="institution" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {selectedRole === 'institution' ? 'Institution Name' : 'School / Program'} <span className="text-red-500">*</span>
                </label>
                <input
                  id="institution"
                  type="text"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder={selectedRole === 'institution' ? 'University of Example' : 'Example Medical School'}
                  required
                />
              </div>

              {selectedRole === 'medical-student' && (
                <div>
                  <label htmlFor="currentYear" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Current Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="currentYear"
                    value={formData.currentYear}
                    onChange={(e) => setFormData({ ...formData, currentYear: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Select your year...</option>
                    <option value="MS1">MS1 (First Year)</option>
                    <option value="MS2">MS2 (Second Year)</option>
                    <option value="MS3">MS3 (Third Year)</option>
                    <option value="MS4">MS4 (Fourth Year)</option>
                  </select>
                </div>
              )}

              {(selectedRole === 'resident' || selectedRole === 'fellow') && (
                <>
                  <div>
                    <label htmlFor="specialty" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Specialty <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="specialty"
                      value={formData.specialty}
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      required
                    >
                      <option value="">Select specialty...</option>
                      <option value="Internal Medicine">Internal Medicine</option>
                      <option value="Family Medicine">Family Medicine</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Surgery">Surgery</option>
                      <option value="Emergency Medicine">Emergency Medicine</option>
                      <option value="Psychiatry">Psychiatry</option>
                      <option value="OB/GYN">OB/GYN</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Radiology">Radiology</option>
                      <option value="Anesthesiology">Anesthesiology</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Ophthalmology">Ophthalmology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="pgyYear" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      PGY Year
                    </label>
                    <select
                      id="pgyYear"
                      value={formData.pgyYear}
                      onChange={(e) => setFormData({ ...formData, pgyYear: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select PGY year...</option>
                      <option value="PGY-1">PGY-1</option>
                      <option value="PGY-2">PGY-2</option>
                      <option value="PGY-3">PGY-3</option>
                      <option value="PGY-4">PGY-4</option>
                      <option value="PGY-5">PGY-5</option>
                      <option value="PGY-6+">PGY-6+</option>
                    </select>
                  </div>
                </>
              )}

              {selectedRole === 'institution' && (
                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="jobTitle"
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="Dean of Student Wellness"
                    required
                  />
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 hover:from-teal-600 hover:via-cyan-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>

              <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="text-teal-600 hover:text-teal-700 dark:text-teal-400">Terms</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-teal-600 hover:text-teal-700 dark:text-teal-400">Privacy Policy</Link>
              </p>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Study Smart. Find Your Tribe. Stay Well.
        </p>
      </div>
    </div>
  );
}
