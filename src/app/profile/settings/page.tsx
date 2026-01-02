'use client';

import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import {
  getUserProfile,
  saveUserProfile,
  saveAndSyncProfile,
  createDefaultProfile,
  getUserInitials,
  MEDICAL_SPECIALTIES,
  ACADEMIC_YEARS,
  type UserProfile
} from '@/lib/storage/profileStorage';
import { SchoolSelector } from '@/components/profile/SchoolSelector';
import type { SchoolType } from '@/lib/data/schools';
import {
  getConnectedUsers,
  getPendingRequestUsers,
  getConnectionCount,
  getPendingRequestCount,
  getConnections,
  acceptConnectionRequest,
  removeConnection,
  sendConnectionRequest,
  isConnectedTo,
  hasPendingRequestWith,
  getInitials,
  DEMO_USERS,
  type DemoUser,
  type Connection
} from '@/lib/storage/chatStorage';
import {
  getUserTribes,
  getPrimaryTribe,
  setPrimaryTribe,
  MAX_TRIBES_PER_USER,
} from '@/lib/storage/tribeStorage';
import type { Tribe } from '@/types/tribes';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Connections state
  const [connections, setConnections] = useState<DemoUser[]>([]);
  const [pendingRequests, setPendingRequests] = useState<DemoUser[]>([]);
  const [connectionCount, setConnectionCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [showAllConnections, setShowAllConnections] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<DemoUser[]>([]);

  // Tribes state
  const [userTribes, setUserTribes] = useState<Tribe[]>([]);
  const [primaryTribeId, setPrimaryTribeId] = useState<string | null>(null);

  // Load profile on mount
  useEffect(() => {
    const loadedProfile = getUserProfile();
    if (loadedProfile) {
      setProfile(loadedProfile);
    } else {
      // Create default profile for new users
      const newProfile = createDefaultProfile();
      setProfile(newProfile);
      setIsEditing(true); // Start in edit mode for new users
    }

    // Load connections
    setConnections(getConnectedUsers());
    setPendingRequests(getPendingRequestUsers());
    setConnectionCount(getConnectionCount());
    setPendingCount(getPendingRequestCount());

    // Load tribes
    setUserTribes(getUserTribes());
    const primary = getPrimaryTribe();
    setPrimaryTribeId(primary?.id || null);
  }, []);

  // Handle accepting a connection request
  const handleAcceptRequest = (userId: string) => {
    const allConnections = getConnections();
    const request = allConnections.find(
      c => c.status === 'pending' && c.userId === userId
    );
    if (request) {
      acceptConnectionRequest(request.id);
      // Refresh state
      setConnections(getConnectedUsers());
      setPendingRequests(getPendingRequestUsers());
      setConnectionCount(getConnectionCount());
      setPendingCount(getPendingRequestCount());
    }
  };

  // Handle declining a connection request
  const handleDeclineRequest = (userId: string) => {
    const allConnections = getConnections();
    const request = allConnections.find(
      c => c.status === 'pending' && c.userId === userId
    );
    if (request) {
      removeConnection(request.id);
      setPendingRequests(getPendingRequestUsers());
      setPendingCount(getPendingRequestCount());
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      const results = DEMO_USERS.filter(user => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const searchLower = query.toLowerCase();
        return (
          fullName.includes(searchLower) ||
          user.school?.toLowerCase().includes(searchLower) ||
          user.specialty?.toLowerCase().includes(searchLower) ||
          user.currentYear?.toLowerCase().includes(searchLower)
        );
      });
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // Handle sending a connection request
  const handleSendRequest = (userId: string) => {
    sendConnectionRequest(userId);
    // Refresh search results to update button state
    handleSearch(searchQuery);
  };

  // Handle setting primary tribe
  const handleSetPrimaryTribe = (tribeId: string) => {
    setPrimaryTribe('current-user', tribeId);
    setPrimaryTribeId(tribeId);
  };

  // Get connection status for a user
  const getConnectionStatus = (userId: string): 'connected' | 'pending-sent' | 'pending-received' | 'none' => {
    if (isConnectedTo(userId)) return 'connected';
    const pending = hasPendingRequestWith(userId);
    if (pending === 'sent') return 'pending-sent';
    if (pending === 'received') return 'pending-received';
    return 'none';
  };

  const handleSave = async () => {
    if (!profile) return;

    setIsSaving(true);

    // Save locally and sync to cloud
    await saveAndSyncProfile(profile);

    setIsSaving(false);
    setIsEditing(false);
    setSaveMessage('Profile saved successfully!');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setProfile({ ...profile, avatar: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleSpecialtyToggle = (specialty: string) => {
    if (!profile) return;

    const current = profile.interestedSpecialties || [];
    const updated = current.includes(specialty)
      ? current.filter(s => s !== specialty)
      : [...current, specialty].slice(0, 5); // Max 5 specialties

    setProfile({ ...profile, interestedSpecialties: updated });
  };

  const initials = getUserInitials();

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5F0E8] to-[#E8E0D5] dark:from-slate-900 dark:to-slate-800">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="w-8 h-8 border-4 border-[#C4A77D] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F0E8] to-[#E8E0D5] dark:from-slate-900 dark:to-slate-800">
      <Header />

      {/* Success Message Toast */}
      {saveMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 px-4 py-3 bg-[#C4A77D] text-white rounded-xl shadow-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">{saveMessage}</span>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header Card */}
        <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden mb-8">
          {/* Gradient Banner */}
          <div className="h-32 md:h-40 bg-gradient-to-r from-[#C4A77D] to-[#A89070] relative">
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="1" fill="white" />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />
              </svg>
            </div>
          </div>

          {/* Avatar & Name Section */}
          <div className="px-6 md:px-8 pb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 md:-mt-12">
              {/* Avatar */}
              <div className="relative">
                <div
                  onClick={() => isEditing && fileInputRef.current?.click()}
                  className={`
                    w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden
                    border-4 border-white dark:border-slate-800 shadow-xl
                    ${isEditing ? 'cursor-pointer group' : ''}
                  `}
                >
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#C4A77D] to-[#A89070] flex items-center justify-center text-white text-4xl font-bold">
                      {initials}
                    </div>
                  )}

                  {/* Edit overlay */}
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />

                {/* Online indicator */}
                <span className="absolute bottom-2 right-2 w-5 h-5 bg-[#5B7B6D] border-3 border-white dark:border-slate-800 rounded-full" />
              </div>

              {/* Name & Info */}
              <div className="flex-1 pt-4 md:pt-0 md:pb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                  {profile.firstName && profile.lastName
                    ? `${profile.firstName} ${profile.lastName}`
                    : 'Set Up Your Profile'}
                </h1>
                {profile.currentYear && (
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    {profile.currentYear} {profile.school ? `at ${profile.school}` : ''}
                  </p>
                )}
                {profile.bio && !isEditing && (
                  <p className="text-slate-600 dark:text-slate-300 mt-2 max-w-lg">{profile.bio}</p>
                )}
              </div>

              {/* Edit/Save Button */}
              <div className="md:pb-2">
                {isEditing ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setProfile(getUserProfile() || createDefaultProfile());
                        setIsEditing(false);
                      }}
                      className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-6 py-2 bg-gradient-to-r from-[#C4A77D] to-[#A89070] hover:from-[#A89070] hover:to-[#8B7355] text-white font-semibold rounded-xl shadow-lg shadow-[#C4A77D]/25 transition-all flex items-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Save Profile
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-xl transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#E8E0D5] dark:bg-[#8B7355]/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#8B7355] dark:text-[#C4A77D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                Basic Information
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Enter first name"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#C4A77D] focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Enter last name"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#C4A77D] focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    disabled={!isEditing}
                    placeholder="your.email@school.edu"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#C4A77D] focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={profile.bio || ''}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Tell others about yourself..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#C4A77D] focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#D4C4B0] dark:bg-[#5B7B6D]/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#8B7355] dark:text-[#A89070]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                  </svg>
                </div>
                Academic Information
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Current Year
                  </label>
                  <select
                    value={profile.currentYear || ''}
                    onChange={(e) => setProfile({ ...profile, currentYear: e.target.value as UserProfile['currentYear'] })}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#C4A77D] focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    <option value="">Select year...</option>
                    {ACADEMIC_YEARS.map(year => (
                      <option key={year.value} value={year.value}>{year.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    value={profile.graduationYear || ''}
                    onChange={(e) => setProfile({ ...profile, graduationYear: parseInt(e.target.value) || undefined })}
                    disabled={!isEditing}
                    placeholder="2027"
                    min={2020}
                    max={2040}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#C4A77D] focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    School / Institution
                  </label>
                  <SchoolSelector
                    value={profile.school || ''}
                    schoolId={profile.schoolId}
                    schoolType={profile.schoolType}
                    email={profile.email}
                    disabled={!isEditing}
                    onChange={(school) => setProfile({
                      ...profile,
                      school: school.name,
                      schoolId: school.id,
                      schoolType: school.type,
                    })}
                  />
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Use your .edu email to auto-verify your school, or search from our database
                  </p>
                </div>
              </div>
            </div>

            {/* Interested Specialties */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#E8E0D5] dark:bg-[#8B7355]/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#8B7355] dark:text-[#C4A77D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                Interested Specialties
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Select up to 5 specialties you're interested in
              </p>

              <div className="flex flex-wrap gap-2">
                {MEDICAL_SPECIALTIES.map(specialty => {
                  const isSelected = profile.interestedSpecialties?.includes(specialty);
                  return (
                    <button
                      key={specialty}
                      onClick={() => isEditing && handleSpecialtyToggle(specialty)}
                      disabled={!isEditing}
                      className={`
                        px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                        ${isSelected
                          ? 'bg-gradient-to-r from-[#C4A77D] to-[#A89070] text-white shadow-md'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }
                        ${!isEditing ? 'cursor-default opacity-80' : 'cursor-pointer'}
                      `}
                    >
                      {specialty}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Social */}
          <div className="space-y-6">
            {/* Connections Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#E8E0D5] dark:bg-[#8B7355]/30 flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#8B7355] dark:text-[#C4A77D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  Connections
                </h2>
                <span className="text-sm font-semibold text-[#8B7355] dark:text-[#C4A77D]">
                  {connectionCount}
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative mb-4">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Find students, residents, mentors..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C4A77D]/50 focus:border-[#C4A77D] transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 flex items-center justify-center transition-colors"
                    >
                      <svg className="w-3 h-3 text-slate-500 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Search Results */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-20 max-h-80 overflow-y-auto">
                    <div className="p-2">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-2">
                        {searchResults.length} {searchResults.length === 1 ? 'Result' : 'Results'}
                      </span>
                    </div>
                    <div className="pb-2">
                      {searchResults.map(user => {
                        const status = getConnectionStatus(user.id);
                        return (
                          <div
                            key={user.id}
                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                          >
                            <div className="relative flex-shrink-0">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C4A77D] to-[#A89070] flex items-center justify-center text-white font-bold text-sm">
                                {getInitials(user.firstName, user.lastName)}
                              </div>
                              {user.isOnline && (
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#5B7B6D] border-2 border-white dark:border-slate-800 rounded-full" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {user.currentYear} • {user.school}
                              </p>
                              {user.specialty && (
                                <p className="text-xs text-[#8B7355] dark:text-[#C4A77D] truncate">
                                  {user.specialty}
                                </p>
                              )}
                            </div>
                            <div className="flex-shrink-0">
                              {status === 'connected' ? (
                                <span className="px-2.5 py-1 bg-[#E8E0D5] dark:bg-[#8B7355]/30 text-[#8B7355] dark:text-[#C4A77D] text-xs font-medium rounded-full">
                                  Connected
                                </span>
                              ) : status === 'pending-sent' ? (
                                <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-medium rounded-full">
                                  Pending
                                </span>
                              ) : status === 'pending-received' ? (
                                <button
                                  onClick={() => handleAcceptRequest(user.id)}
                                  className="px-3 py-1 bg-[#C4A77D] hover:bg-[#A89070] text-white text-xs font-medium rounded-full transition-colors"
                                >
                                  Accept
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleSendRequest(user.id)}
                                  className="px-3 py-1 bg-gradient-to-r from-[#C4A77D] to-[#A89070] hover:from-[#A89070] hover:to-[#8B7355] text-white text-xs font-medium rounded-full shadow-sm transition-all"
                                >
                                  Connect
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {showSearchResults && searchQuery && searchResults.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-20 p-6 text-center">
                    <svg className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-sm text-slate-500 dark:text-slate-400">No users found matching "{searchQuery}"</p>
                  </div>
                )}
              </div>

              {/* Pending Requests */}
              {pendingRequests.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Pending Requests
                    </span>
                    <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-full">
                      {pendingCount}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {pendingRequests.map(user => (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C4A77D] to-[#A89070] flex items-center justify-center text-white font-bold text-sm">
                          {getInitials(user.firstName, user.lastName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {user.currentYear} • {user.school}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleAcceptRequest(user.id)}
                            className="w-8 h-8 rounded-full bg-[#C4A77D] hover:bg-[#A89070] text-white flex items-center justify-center transition-colors"
                            title="Accept"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeclineRequest(user.id)}
                            className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-500 hover:text-red-500 flex items-center justify-center transition-colors"
                            title="Decline"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Connected Users */}
              {connections.length > 0 ? (
                <div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3 block">
                    Your Tribe
                  </span>
                  <div className="space-y-2">
                    {(showAllConnections ? connections : connections.slice(0, 3)).map(user => (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C4A77D] to-[#A89070] flex items-center justify-center text-white font-bold text-sm">
                            {getInitials(user.firstName, user.lastName)}
                          </div>
                          {user.isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#5B7B6D] border-2 border-white dark:border-slate-700 rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {user.specialty}
                          </p>
                        </div>
                        <button className="w-8 h-8 rounded-full bg-[#E8E0D5] dark:bg-[#8B7355]/30 hover:bg-[#D4C4B0] dark:hover:bg-[#8B7355]/50 text-[#8B7355] dark:text-[#C4A77D] flex items-center justify-center transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  {connections.length > 3 && (
                    <button
                      onClick={() => setShowAllConnections(!showAllConnections)}
                      className="w-full mt-3 py-2 text-sm font-medium text-[#8B7355] dark:text-[#C4A77D] hover:text-[#5B7B6D] dark:hover:text-[#A89070] transition-colors"
                    >
                      {showAllConnections ? 'Show Less' : `View All ${connectionCount} Connections`}
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">No connections yet</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Start building your tribe!</p>
                </div>
              )}
            </div>

            {/* My Tribes Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#E8E0D5] dark:bg-[#8B7355]/30 flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#8B7355] dark:text-[#C4A77D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  My Tribes
                </h2>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {userTribes.length}/{MAX_TRIBES_PER_USER}
                </span>
              </div>

              {userTribes.length > 0 ? (
                <div className="space-y-2">
                  {userTribes.map(tribe => (
                    <a
                      key={tribe.id}
                      href={`/tribes/${tribe.id}`}
                      className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${tribe.color} flex items-center justify-center text-lg`}>
                        {tribe.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                            {tribe.name}
                          </p>
                          {primaryTribeId === tribe.id && (
                            <span className="px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-medium rounded">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {tribe.memberCount} members • {tribe.weeklyPoints > 0 ? `+${tribe.weeklyPoints} pts this week` : '0 pts this week'}
                        </p>
                      </div>
                      {primaryTribeId !== tribe.id && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSetPrimaryTribe(tribe.id);
                          }}
                          className="px-2 py-1 text-xs text-[#8B7355] dark:text-[#C4A77D] hover:bg-[#F5F0E8] dark:hover:bg-[#8B7355]/30 rounded-lg transition-colors"
                          title="Set as primary tribe"
                        >
                          Set Primary
                        </button>
                      )}
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">No tribes yet</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Join a tribe to collaborate with others!</p>
                </div>
              )}

              <a
                href="/tribes"
                className="flex items-center justify-center gap-2 w-full mt-4 py-2.5 bg-gradient-to-r from-[#C4A77D] to-[#A89070] hover:from-[#A89070] hover:to-[#8B7355] text-white font-medium rounded-xl transition-all text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Find Tribes
              </a>
            </div>

            {/* Quick Stats Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                Study Stats
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#F5F0E8] to-[#E8E0D5] dark:from-[#8B7355]/20 dark:to-[#5B7B6D]/20 rounded-xl">
                  <span className="text-slate-600 dark:text-slate-300">Cards Studied</span>
                  <span className="text-xl font-bold text-[#8B7355] dark:text-[#C4A77D]">0</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#E8E0D5] to-[#D4C4B0] dark:from-[#5B7B6D]/20 dark:to-[#2D5A4A]/20 rounded-xl">
                  <span className="text-slate-600 dark:text-slate-300">Cases Completed</span>
                  <span className="text-xl font-bold text-[#5B7B6D] dark:text-[#A89070]">0</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#D4C4B0] to-[#C4A77D] dark:from-[#A89070]/20 dark:to-[#C4A77D]/20 rounded-xl">
                  <span className="text-slate-600 dark:text-slate-300">Day Streak</span>
                  <span className="text-xl font-bold text-[#8B7355] dark:text-[#C4A77D]">0</span>
                </div>
              </div>
            </div>

            {/* Social Links Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#F5F0E8] dark:bg-[#A89070]/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#A89070] dark:text-[#C4A77D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                Social Links
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    value={profile.linkedIn || ''}
                    onChange={(e) => setProfile({ ...profile, linkedIn: e.target.value })}
                    disabled={!isEditing}
                    placeholder="linkedin.com/in/username"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:ring-2 focus:ring-[#C4A77D] focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Twitter/X
                  </label>
                  <input
                    type="text"
                    value={profile.twitter || ''}
                    onChange={(e) => setProfile({ ...profile, twitter: e.target.value })}
                    disabled={!isEditing}
                    placeholder="@username"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:ring-2 focus:ring-[#C4A77D] focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Privacy Settings Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                Privacy
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Profile Visibility
                  </label>
                  <select
                    value={profile.profileVisibility}
                    onChange={(e) => setProfile({ ...profile, profileVisibility: e.target.value as UserProfile['profileVisibility'] })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#C4A77D] focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    <option value="public">Public</option>
                    <option value="connections">Connections Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <span className="text-sm text-slate-600 dark:text-slate-300">Show Study Stats</span>
                  <button
                    onClick={() => isEditing && setProfile({ ...profile, showStudyStats: !profile.showStudyStats })}
                    disabled={!isEditing}
                    className={`
                      relative w-12 h-7 rounded-full transition-colors duration-200
                      ${profile.showStudyStats ? 'bg-[#C4A77D]' : 'bg-slate-300 dark:bg-slate-600'}
                      ${!isEditing ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <span
                      className={`
                        absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
                        ${profile.showStudyStats ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
