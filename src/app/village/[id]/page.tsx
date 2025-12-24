'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getCharityById } from '@/data/charities';
import { getCurrentVillageId, getUserProfile, switchVillage } from '@/lib/storage/profileStorage';
import { getVillagePosts, getVillageMembers, createPost } from '@/lib/storage/communityStorage';
import { useWellness } from '@/hooks/useWellness';
import { VillagePostCard } from '@/components/village/VillagePostCard';
import { VillageMemberCard } from '@/components/village/VillageMemberCard';
import { DirectMessages } from '@/components/village/DirectMessages';
import type { VillagePost, VillageMemberProfile } from '@/types/community';

export default function VillageCommunityPage() {
  const params = useParams();
  const router = useRouter();
  const villageId = params.id as string;

  const [posts, setPosts] = useState<VillagePost[]>([]);
  const [members, setMembers] = useState<VillageMemberProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'feed' | 'members'>('feed');
  const [newPostContent, setNewPostContent] = useState('');
  const [postType, setPostType] = useState<VillagePost['postType']>('update');
  const [isPosting, setIsPosting] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState<VillageMemberProfile | undefined>();

  const charity = getCharityById(villageId);
  const currentVillageId = getCurrentVillageId();
  const isUserVillage = currentVillageId === villageId;
  const profile = getUserProfile();
  const { getVillageLeaderboard, getUserVillageStats } = useWellness();

  const villageStats = getUserVillageStats();
  const leaderboard = getVillageLeaderboard();
  const villageRankData = leaderboard.find(v => v.villageId === villageId);

  useEffect(() => {
    loadCommunityData();
  }, [villageId]);

  function loadCommunityData() {
    const villagePosts = getVillagePosts(villageId);
    const villageMembers = getVillageMembers(villageId);
    setPosts(villagePosts);
    setMembers(villageMembers);
  }

  async function handleCreatePost() {
    if (!newPostContent.trim() || !isUserVillage) return;

    setIsPosting(true);
    const post = createPost(villageId, newPostContent.trim(), postType);

    if (post) {
      setPosts(prev => [post, ...prev]);
      setNewPostContent('');
      setPostType('update');
      setShowPostForm(false);
    }

    setIsPosting(false);
  }

  function handlePostDeleted(postId: string) {
    setPosts(prev => prev.filter(p => p.id !== postId));
  }

  function handlePostUpdated(updatedPost: VillagePost) {
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
  }

  function handleMessageMember(member: VillageMemberProfile) {
    setMessageRecipient(member);
    setShowMessages(true);
  }

  function handleSwitchVillage() {
    if (confirm(`Are you sure you want to switch to ${charity?.shortName}? Your points will stay with your current Village.`)) {
      const success = switchVillage(villageId);
      if (success) {
        router.refresh();
        window.location.reload();
      } else {
        alert('Failed to switch Village. Please try again.');
      }
    }
  }

  if (!charity) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Header />
        <main className="pt-4 pb-20 md:pb-8">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Village Not Found
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                This Village doesn&apos;t exist or may have been removed.
              </p>
              <Link
                href="/impact"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B7B6D] text-white rounded-lg hover:bg-[#4A6A5C] transition-colors"
              >
                View All Villages
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="pt-4 pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Village Header */}
        <div className="bg-gradient-to-br from-[#5B7B6D] to-[#7FA08F] rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">{charity.shortName}</h1>
                {isUserVillage && (
                  <span className="px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full">
                    Your Village
                  </span>
                )}
              </div>
              <p className="text-white/80 text-sm md:text-base mb-3">{charity.focus}</p>
              <p className="text-white/90 text-sm max-w-2xl">{charity.description}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <a
                href={charity.website}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Visit Website
              </a>
              {isUserVillage && (
                <>
                  <Link
                    href="/connections"
                    className="px-4 py-2 bg-white text-[#5B7B6D] text-sm font-medium rounded-lg hover:bg-white/90 transition-colors"
                  >
                    Find Connections
                  </Link>
                  <Link
                    href="/impact"
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Switch Village
                  </Link>
                </>
              )}
              {!isUserVillage && (
                <button
                  onClick={handleSwitchVillage}
                  className="px-4 py-2 bg-white text-[#5B7B6D] text-sm font-medium rounded-lg hover:bg-white/90 transition-colors"
                >
                  Switch to This Village
                </button>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/20">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold">{villageRankData?.memberCount || members.length}</p>
              <p className="text-white/70 text-xs md:text-sm">Members</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold">${(villageRankData?.totalDonated || 0).toFixed(2)}</p>
              <p className="text-white/70 text-xs md:text-sm">Total Donated</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold">{(villageRankData?.totalPoints || 0).toLocaleString()}</p>
              <p className="text-white/70 text-xs md:text-sm">Total Points</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold">#{leaderboard.findIndex(v => v.villageId === villageId) + 1 || '-'}</p>
              <p className="text-white/70 text-xs md:text-sm">Leaderboard Rank</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'feed'
                ? 'text-[#5B7B6D] border-b-2 border-[#5B7B6D]'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            Community Feed
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'members'
                ? 'text-[#5B7B6D] border-b-2 border-[#5B7B6D]'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            Members ({members.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'feed' ? (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Main Feed */}
            <div className="md:col-span-2 space-y-4">
              {/* Create Post (only for village members) */}
              {isUserVillage && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                  {!showPostForm ? (
                    <button
                      onClick={() => setShowPostForm(true)}
                      className="w-full text-left px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                    >
                      Share something with your Village...
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-[#5B7B6D] flex items-center justify-center text-white font-medium">
                          {profile?.firstName?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {profile?.firstName} {profile?.lastName}
                          </p>
                          <p className="text-xs text-slate-500">{profile?.currentYear || profile?.role}</p>
                        </div>
                      </div>
                      <textarea
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="What's on your mind?"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#5B7B6D] text-slate-900 dark:text-white placeholder:text-slate-400"
                        rows={3}
                        autoFocus
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {(['update', 'motivation', 'milestone', 'question', 'resource'] as const).map((type) => (
                            <button
                              key={type}
                              onClick={() => setPostType(type)}
                              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                                postType === type
                                  ? 'bg-[#5B7B6D] text-white'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                              }`}
                            >
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setShowPostForm(false);
                              setNewPostContent('');
                            }}
                            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleCreatePost}
                            disabled={!newPostContent.trim() || isPosting}
                            className="px-4 py-2 bg-[#5B7B6D] text-white text-sm font-medium rounded-lg hover:bg-[#4A6A5C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {isPosting ? 'Posting...' : 'Post'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Posts */}
              {posts.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
                  <p className="text-slate-600 dark:text-slate-400 mb-2">No posts yet</p>
                  <p className="text-sm text-slate-500">Be the first to share something with your Village!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <VillagePostCard
                    key={post.id}
                    post={post}
                    onPostDeleted={handlePostDeleted}
                    onPostUpdated={handlePostUpdated}
                  />
                ))
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* About Card */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">About {charity.shortName}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{charity.mission}</p>
                <div className="space-y-2">
                  {charity.impactMetrics.slice(0, 3).map((metric, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-slate-500">{metric.label}</span>
                      <span className="font-medium text-slate-900 dark:text-white">{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Contributors */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Top Contributors</h3>
                <div className="space-y-3">
                  {members.slice(0, 5).map((member, index) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <span className="w-5 text-sm font-medium text-slate-500">{index + 1}</span>
                      <div className="w-8 h-8 rounded-full bg-[#C4A77D] flex items-center justify-center text-white text-sm font-medium">
                        {member.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {member.name}
                        </p>
                        <p className="text-xs text-slate-500">{member.pointsContributed.toLocaleString()} pts</p>
                      </div>
                      {member.isOnline && (
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* How Points Work */}
              <div className="bg-gradient-to-br from-[#F5F0E8] to-[#E8F0ED] dark:from-slate-800 dark:to-slate-700 rounded-xl p-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Points to Donations</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Every 1,000 points = $1.00 donated to {charity.shortName}
                </p>
                <div className="flex items-center justify-between p-2 bg-white/50 dark:bg-slate-600/50 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-300">Your contribution</span>
                  <span className="font-bold text-[#5B7B6D]">
                    {villageStats?.userPoints?.toLocaleString() || 0} pts
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Members Tab */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <VillageMemberCard
                key={member.id}
                member={member}
                onMessage={isUserVillage ? handleMessageMember : undefined}
              />
            ))}
          </div>
        )}

        {/* Messages Button - Fixed */}
        {isUserVillage && (
          <button
            onClick={() => setShowMessages(true)}
            className="fixed bottom-24 right-6 w-14 h-14 bg-[#5B7B6D] text-white rounded-full shadow-lg hover:bg-[#4A6A5C] transition-colors flex items-center justify-center z-40"
            aria-label="Messages"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        )}

        {/* Direct Messages Modal */}
        <DirectMessages
          isOpen={showMessages}
          onClose={() => {
            setShowMessages(false);
            setMessageRecipient(undefined);
          }}
          initialRecipient={messageRecipient}
        />
        </div>
      </main>
      <Footer />
    </div>
  );
}
