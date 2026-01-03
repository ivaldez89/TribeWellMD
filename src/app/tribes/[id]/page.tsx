'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ContentPageLayout } from '@/components/layout/PageLayout';
import { TribeHeader } from '@/components/tribes/TribeHeader';
import { TribeMemberList } from '@/components/tribes/TribeMemberList';
import { TribeChat } from '@/components/tribes/TribeChat';
import { TribeLeaderboard } from '@/components/tribes/TribeLeaderboard';
import { TribeGoalProgress } from '@/components/tribes/TribeGoalProgress';
import { useTribe } from '@/hooks/useTribes';
import { getUserMemberships, setPrimaryTribe as setStoragePrimaryTribe } from '@/lib/storage/tribeStorage';
import { Icons } from '@/components/ui/Icons';

type TabId = 'overview' | 'members' | 'chat' | 'leaderboard';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <Icons.Chart /> },
  { id: 'members', label: 'Members', icon: <Icons.Users /> },
  { id: 'chat', label: 'Chat', icon: <Icons.Chat /> },
  { id: 'leaderboard', label: 'Leaderboard', icon: <Icons.Trophy /> },
];

export default function TribePage() {
  const params = useParams();
  const router = useRouter();
  const tribeId = params.id as string;

  const { tribe, messages, isMember, isLoading, refresh, sendMessage, join, leave } = useTribe(tribeId);

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isPrimary, setIsPrimary] = useState(false);

  // Check if this is the user's primary tribe
  useEffect(() => {
    if (typeof window !== 'undefined' && isMember) {
      const memberships = getUserMemberships();
      const membership = memberships.find((m) => m.tribeId === tribeId);
      setIsPrimary(membership?.isPrimary || false);
    }
  }, [tribeId, isMember]);

  const handleJoin = () => {
    const result = join({ firstName: 'You', lastName: '' });
    if (!result.success && result.error) {
      alert(result.error);
    }
  };

  const handleLeave = () => {
    if (confirm('Are you sure you want to leave this tribe?')) {
      const result = leave();
      if (!result.success && result.error) {
        alert(result.error);
      } else {
        router.push('/tribes');
      }
    }
  };

  const handleSetPrimary = () => {
    setStoragePrimaryTribe('current-user', tribeId);
    setIsPrimary(true);
    refresh();
  };

  const handleSendMessage = (content: string) => {
    sendMessage(content, 'You');
  };

  if (isLoading) {
    return (
      <ContentPageLayout maxWidth="xl" className="bg-[#E8DFD0] dark:bg-slate-900" mainClassName="pt-20 pb-8">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-[#D4C4B0] dark:bg-slate-700 rounded-2xl"></div>
          <div className="h-12 bg-[#D4C4B0] dark:bg-slate-700 rounded-xl"></div>
          <div className="h-96 bg-[#D4C4B0] dark:bg-slate-700 rounded-xl"></div>
        </div>
      </ContentPageLayout>
    );
  }

  if (!tribe) {
    return (
      <ContentPageLayout maxWidth="xl" className="bg-[#E8DFD0] dark:bg-slate-900" mainClassName="pt-20 pb-8">
        <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 text-[#8B7355]"><Icons.Search /></div>
            <h1 className="text-2xl font-bold text-[#3D5A4C] dark:text-white mb-2">Tribe Not Found</h1>
            <p className="text-[#6B5344]/80 dark:text-slate-400 mb-6">
              This tribe doesn&apos;t exist or you don&apos;t have permission to view it.
            </p>
            <a
              href="/tribes"
              className="inline-block px-6 py-3 bg-gradient-to-r from-[#5B7B6D] to-[#6B8B7D] text-white rounded-xl font-medium hover:from-[#4A6B5D] hover:to-[#5B7B6D] transition-all focus:outline-none focus:ring-2 focus:ring-[#5B7B6D] focus:ring-offset-2 shadow-lg shadow-[#3D5A4C]/20"
            >
              Browse Tribes
            </a>
        </div>
      </ContentPageLayout>
    );
  }

  return (
    <ContentPageLayout maxWidth="xl" className="bg-[#E8DFD0] dark:bg-slate-900 relative" mainClassName="pt-20 pb-8">
      {/* Subtle organic pattern overlay on sides */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-0 left-0 w-1/4 h-full bg-gradient-to-r from-[#D4C4B0]/30 to-transparent" />
        <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-[#D4C4B0]/30 to-transparent" />
      </div>

      <div className="relative z-10 space-y-6">
          {/* Tribe Header */}
          <TribeHeader
            tribe={tribe}
            isMember={isMember}
            isPrimary={isPrimary}
            onJoin={handleJoin}
            onLeave={handleLeave}
            onSetPrimary={handleSetPrimary}
          />

          {/* Tabs */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-[#D4C4B0]/50 dark:border-slate-700 p-1">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#5B7B6D] to-[#6B8B7D] text-white shadow-sm'
                      : 'text-[#6B5344] dark:text-slate-400 hover:bg-[#F5EFE6] dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="w-5 h-5">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Goal Progress */}
                {tribe.currentGoal && (
                  <TribeGoalProgress goal={tribe.currentGoal} color={tribe.color} />
                )}

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Recent Activity */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-[#D4C4B0]/50 dark:border-slate-700 p-6 shadow-sm shadow-[#3D5A4C]/5">
                    <h3 className="font-semibold text-[#3D5A4C] dark:text-white mb-4 flex items-center gap-2">
                      <span className="w-5 h-5 text-[#5B7B6D]"><Icons.Chart /></span>
                      Recent Activity
                    </h3>
                    <div className="space-y-3">
                      {messages.slice(-3).reverse().map((msg) => (
                        <div key={msg.id} className="flex items-start gap-3 text-sm">
                          <div className="w-8 h-8 rounded-full bg-[#F5EFE6] dark:bg-slate-700 flex items-center justify-center text-[#6B5344] dark:text-slate-400">
                            {msg.type === 'system' ? <Icons.Bell /> : msg.type === 'achievement' ? <Icons.Trophy /> : <Icons.Chat />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[#3D5A4C] dark:text-slate-300 truncate">{msg.content}</p>
                            <p className="text-[#6B5344]/70 dark:text-slate-500 text-xs">{msg.senderName}</p>
                          </div>
                        </div>
                      ))}
                      {messages.length === 0 && (
                        <p className="text-[#6B5344]/70 dark:text-slate-400 text-sm">No recent activity</p>
                      )}
                    </div>
                  </div>

                  {/* Top Contributors */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-[#D4C4B0]/50 dark:border-slate-700 p-6 shadow-sm shadow-[#3D5A4C]/5">
                    <h3 className="font-semibold text-[#3D5A4C] dark:text-white mb-4 flex items-center gap-2">
                      <span className="w-5 h-5 text-[#C4A77D]"><Icons.Star /></span>
                      Top Contributors
                    </h3>
                    <div className="space-y-3">
                      {tribe.members
                        .sort((a, b) => b.contributionPoints - a.contributionPoints)
                        .slice(0, 3)
                        .map((member, index) => (
                          <div key={member.id} className="flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0 ? 'bg-[#C4A77D]/20 text-[#8B7355]' : index === 1 ? 'bg-[#D4C4B0]/50 text-[#6B5344]' : 'bg-[#E8DFD0] text-[#8B7355]'
                            }`}>
                              {index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-[#3D5A4C] dark:text-white truncate">
                                {member.firstName} {member.lastName}
                              </p>
                            </div>
                            <span className="text-sm font-semibold text-[#5B7B6D] dark:text-[#6B8B7D]">
                              {member.contributionPoints.toLocaleString()} pts
                            </span>
                          </div>
                        ))}
                      {tribe.members.length === 0 && (
                        <p className="text-[#6B5344]/70 dark:text-slate-400 text-sm">No members yet</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Point earning guide */}
                <div className="bg-gradient-to-r from-[#5B7B6D] to-[#3D5A4C] rounded-xl p-6 shadow-lg shadow-[#3D5A4C]/20">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 text-[#F5EFE6]"><Icons.Lightbulb /></span>
                    How to Earn Points
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-white/90">
                      <span className="w-4 h-4 text-[#C4A77D]"><Icons.Book /></span>
                      Complete flashcard sessions (+10 pts)
                    </div>
                    <div className="flex items-center gap-2 text-white/90">
                      <span className="w-4 h-4 text-[#C4A77D]"><Icons.Fire /></span>
                      Maintain study streak (+5 pts/day)
                    </div>
                    <div className="flex items-center gap-2 text-white/90">
                      <span className="w-4 h-4 text-[#C4A77D]"><Icons.Meditation /></span>
                      Complete wellness challenges (+5-12 pts)
                    </div>
                    <div className="flex items-center gap-2 text-white/90">
                      <span className="w-4 h-4 text-[#C4A77D]"><Icons.Handshake /></span>
                      Help a peer (+15 pts)
                    </div>
                  </div>
                  {!isMember && (
                    <p className="mt-4 text-sm text-white/80">
                      Join this tribe to start contributing points!
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'members' && (
              <TribeMemberList members={tribe.members} />
            )}

            {activeTab === 'chat' && (
              <TribeChat
                messages={messages}
                onSendMessage={handleSendMessage}
                isMember={isMember}
              />
            )}

            {activeTab === 'leaderboard' && (
              <TribeLeaderboard members={tribe.members} />
            )}
          </div>
      </div>
    </ContentPageLayout>
  );
}
