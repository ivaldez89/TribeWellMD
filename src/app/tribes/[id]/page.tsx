'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
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
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-[#F5F0E8] to-[#E8E0D5] pt-20 px-4 pb-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-64 bg-[#D4C4B0] rounded-2xl"></div>
              <div className="h-12 bg-[#D4C4B0] rounded-xl"></div>
              <div className="h-96 bg-[#D4C4B0] rounded-xl"></div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!tribe) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-[#F5F0E8] to-[#E8E0D5] pt-20 px-4 pb-8">
          <div className="max-w-4xl mx-auto text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 text-[#A89070]"><Icons.Search /></div>
            <h1 className="text-2xl font-bold text-[#8B7355] mb-2">Tribe Not Found</h1>
            <p className="text-[#A89070] mb-6">
              This tribe doesn&apos;t exist or you don&apos;t have permission to view it.
            </p>
            <a
              href="/tribes"
              className="inline-block px-6 py-3 bg-gradient-to-r from-[#C4A77D] to-[#A89070] text-white rounded-xl font-medium hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-[#C4A77D] focus:ring-offset-2"
            >
              Browse Tribes
            </a>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-[#F5F0E8] to-[#E8E0D5] pt-20 px-4 pb-8">
        <div className="max-w-4xl mx-auto space-y-6">
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
          <div className="bg-white rounded-xl shadow-sm border border-[#E8E0D5] p-1">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#C4A77D] to-[#A89070] text-white shadow-sm'
                      : 'text-[#A89070] hover:bg-[#F5F0E8]'
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
                  <div className="bg-white rounded-xl border border-[#E8E0D5] p-6">
                    <h3 className="font-semibold text-[#8B7355] mb-4 flex items-center gap-2">
                      <span className="w-5 h-5 text-[#5B7B6D]"><Icons.Chart /></span>
                      Recent Activity
                    </h3>
                    <div className="space-y-3">
                      {messages.slice(-3).reverse().map((msg) => (
                        <div key={msg.id} className="flex items-start gap-3 text-sm">
                          <div className="w-8 h-8 rounded-full bg-[#F5F0E8] flex items-center justify-center text-[#A89070]">
                            {msg.type === 'system' ? <Icons.Bell /> : msg.type === 'achievement' ? <Icons.Trophy /> : <Icons.Chat />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[#8B7355] truncate">{msg.content}</p>
                            <p className="text-[#A89070] text-xs">{msg.senderName}</p>
                          </div>
                        </div>
                      ))}
                      {messages.length === 0 && (
                        <p className="text-[#A89070] text-sm">No recent activity</p>
                      )}
                    </div>
                  </div>

                  {/* Top Contributors */}
                  <div className="bg-white rounded-xl border border-[#E8E0D5] p-6">
                    <h3 className="font-semibold text-[#8B7355] mb-4 flex items-center gap-2">
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
                              index === 0 ? 'bg-[#F5F0E8] text-[#C4A77D]' : index === 1 ? 'bg-[#E8E0D5] text-[#8B7355]' : 'bg-[#D4C4B0] text-[#A89070]'
                            }`}>
                              {index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-[#8B7355] truncate">
                                {member.firstName} {member.lastName}
                              </p>
                            </div>
                            <span className="text-sm font-semibold text-[#5B7B6D]">
                              {member.contributionPoints.toLocaleString()} pts
                            </span>
                          </div>
                        ))}
                      {tribe.members.length === 0 && (
                        <p className="text-[#A89070] text-sm">No members yet</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Point earning guide */}
                <div className="bg-gradient-to-r from-[#5B7B6D] to-[#2D5A4A] rounded-xl border border-[#5B7B6D] p-6">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 text-[#F5F0E8]"><Icons.Lightbulb /></span>
                    How to Earn Points
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-[#F5F0E8]">
                      <span className="w-4 h-4 text-[#C4A77D]"><Icons.Book /></span>
                      Complete flashcard sessions (+10 pts)
                    </div>
                    <div className="flex items-center gap-2 text-[#F5F0E8]">
                      <span className="w-4 h-4 text-[#C4A77D]"><Icons.Fire /></span>
                      Maintain study streak (+5 pts/day)
                    </div>
                    <div className="flex items-center gap-2 text-[#F5F0E8]">
                      <span className="w-4 h-4 text-[#C4A77D]"><Icons.Meditation /></span>
                      Complete wellness challenges (+5-12 pts)
                    </div>
                    <div className="flex items-center gap-2 text-[#F5F0E8]">
                      <span className="w-4 h-4 text-[#C4A77D]"><Icons.Handshake /></span>
                      Help a peer (+15 pts)
                    </div>
                  </div>
                  {!isMember && (
                    <p className="mt-4 text-sm text-[#E8E0D5]">
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
      </main>
    </>
  );
}
