'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ContentPageLayout } from '@/components/layout/PageLayout';
import { getCurrentVillageId, getUserProfile } from '@/lib/storage/profileStorage';
import { getCharityById } from '@/data/charities';
import {
  getActiveConnections,
  getIncomingRequests,
  getOutgoingRequests,
  findPotentialMatches,
  sendConnectionRequest,
} from '@/lib/storage/connectionStorage';
import { getVillageMembers } from '@/lib/storage/communityStorage';
import { ConnectionCard } from '@/components/connections/ConnectionCard';
import { ConnectionRequestCard } from '@/components/connections/ConnectionRequestCard';
import { QuestionSession } from '@/components/connections/QuestionSession';
import type { ConnectionMatch } from '@/data/connectionQuestions';
import type { MatchScore, ConnectionRequest } from '@/lib/storage/connectionStorage';
import type { VillageMemberProfile } from '@/types/community';

export default function ConnectionsPage() {
  const [activeTab, setActiveTab] = useState<'connections' | 'requests' | 'find'>('connections');
  const [connections, setConnections] = useState<ConnectionMatch[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<ConnectionRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<ConnectionRequest[]>([]);
  const [potentialMatches, setPotentialMatches] = useState<MatchScore[]>([]);
  const [villageMembers, setVillageMembers] = useState<VillageMemberProfile[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);
  const [requestMessage, setRequestMessage] = useState('');

  const profile = getUserProfile();
  const villageId = getCurrentVillageId();
  const charity = villageId ? getCharityById(villageId) : null;

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    setConnections(getActiveConnections());
    setIncomingRequests(getIncomingRequests());
    setOutgoingRequests(getOutgoingRequests());

    if (villageId) {
      setPotentialMatches(findPotentialMatches(villageId, 10));
      setVillageMembers(getVillageMembers(villageId));
    }
  }

  function handleSendRequest(userId: string, userName: string) {
    if (!villageId) return;

    const request = sendConnectionRequest(userId, userName, villageId, requestMessage);
    if (request) {
      setSendingRequest(null);
      setRequestMessage('');
      loadData();
    }
  }

  function getMemberInfo(userId: string): VillageMemberProfile | undefined {
    return villageMembers.find(m => m.id === userId);
  }

  if (!villageId) {
    return (
      <ContentPageLayout maxWidth="xl" className="bg-slate-50 dark:bg-slate-900" mainClassName="pt-4 pb-20 md:pb-8">
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Join a Village First
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                Connection matching is available within your Village community. Choose a charity to join and start building meaningful connections!
              </p>
              <Link
                href="/village"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#5B7B6D] text-white font-medium rounded-lg hover:bg-[#4A6A5C] transition-colors"
              >
                Choose Your Village
              </Link>
            </div>
      </ContentPageLayout>
    );
  }

  return (
    <ContentPageLayout maxWidth="xl" className="bg-slate-50 dark:bg-slate-900" mainClassName="pt-4 pb-20 md:pb-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
              <Link href={`/village/${villageId}`} className="hover:text-[#5B7B6D]">
                {charity?.shortName}
              </Link>
              <span>/</span>
              <span>Connections</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Connection Matching
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Build meaningful relationships with fellow {charity?.shortName} Village members through progressive conversations.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('connections')}
              className={`px-4 py-3 font-medium transition-colors relative ${
                activeTab === 'connections'
                  ? 'text-[#5B7B6D] border-b-2 border-[#5B7B6D]'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              My Connections
              {connections.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-[#5B7B6D]/10 text-[#5B7B6D] rounded-full">
                  {connections.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-3 font-medium transition-colors relative ${
                activeTab === 'requests'
                  ? 'text-[#5B7B6D] border-b-2 border-[#5B7B6D]'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              Requests
              {incomingRequests.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full animate-pulse">
                  {incomingRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('find')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'find'
                  ? 'text-[#5B7B6D] border-b-2 border-[#5B7B6D]'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              Find Matches
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'connections' && (
            <div>
              {connections.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    No Active Connections
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4 max-w-sm mx-auto">
                    Start building meaningful relationships by finding matches in your Village.
                  </p>
                  <button
                    onClick={() => setActiveTab('find')}
                    className="px-4 py-2 bg-[#5B7B6D] text-white font-medium rounded-lg hover:bg-[#4A6A5C] transition-colors"
                  >
                    Find Matches
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {connections.map((connection) => (
                    <ConnectionCard
                      key={connection.id}
                      connection={connection}
                      onViewConnection={(id) => setActiveSession(id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-6">
              {/* Incoming Requests */}
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  Incoming Requests
                </h2>
                {incomingRequests.length === 0 ? (
                  <div className="text-center py-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-500">No incoming requests</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {incomingRequests.map((request) => (
                      <ConnectionRequestCard
                        key={request.id}
                        request={request}
                        type="incoming"
                        onResponded={loadData}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Outgoing Requests */}
              {outgoingRequests.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                    Sent Requests
                  </h2>
                  <div className="grid gap-4">
                    {outgoingRequests.map((request) => (
                      <ConnectionRequestCard
                        key={request.id}
                        request={request}
                        type="outgoing"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'find' && (
            <div>
              <div className="bg-gradient-to-br from-[#F5F0E8] to-[#E8F0ED] dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">How Connection Matching Works</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  We match you with Village members based on shared interests. Once connected, you&apos;ll answer progressive questions together to build a meaningful relationship. Both people must agree to advance to deeper levels.
                </p>
              </div>

              {potentialMatches.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    No Matches Available
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                    Check back later as more members join your Village, or update your interests in your profile.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {potentialMatches.map((match) => {
                    const member = getMemberInfo(match.userId);
                    if (!member) return null;

                    return (
                      <div
                        key={match.userId}
                        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <div className="w-14 h-14 rounded-full bg-[#C4A77D] flex items-center justify-center text-white font-medium text-lg">
                              {member.name[0]}
                            </div>
                            {member.isOnline && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-slate-900 dark:text-white">{member.name}</h3>
                              {match.score > 0 && (
                                <span className="px-2 py-0.5 text-xs bg-[#5B7B6D]/10 text-[#5B7B6D] dark:bg-[#5B7B6D]/20 dark:text-[#7FA08F] rounded-full">
                                  {Math.min(Math.round(match.score * 10), 100)}% match
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-500 mb-2">{member.role} • {member.school}</p>
                            {member.bio && (
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">{member.bio}</p>
                            )}

                            {/* Common Interests */}
                            {match.commonInterests.length > 0 && (
                              <div className="mb-3">
                                <p className="text-xs text-slate-500 mb-1">
                                  {match.commonInterests.length} shared interest{match.commonInterests.length !== 1 ? 's' : ''}:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {match.commonInterests.slice(0, 4).map((interest) => (
                                    <span
                                      key={interest}
                                      className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full"
                                    >
                                      {interest}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {sendingRequest === match.userId ? (
                              <div className="space-y-2">
                                <textarea
                                  value={requestMessage}
                                  onChange={(e) => setRequestMessage(e.target.value)}
                                  placeholder="Add a personal message (optional)"
                                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#5B7B6D] text-slate-900 dark:text-white placeholder:text-slate-400"
                                  rows={2}
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setSendingRequest(null)}
                                    className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleSendRequest(match.userId, member.name)}
                                    className="px-4 py-1.5 bg-[#5B7B6D] text-white text-sm font-medium rounded-lg hover:bg-[#4A6A5C] transition-colors"
                                  >
                                    Send Request
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setSendingRequest(match.userId)}
                                className="px-4 py-2 bg-[#5B7B6D] text-white text-sm font-medium rounded-lg hover:bg-[#4A6A5C] transition-colors"
                              >
                                Connect
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

      {/* Question Session Modal */}
      {activeSession && (
        <QuestionSession
          connectionId={activeSession}
          onClose={() => setActiveSession(null)}
          onConnectionEnded={loadData}
        />
      )}
    </ContentPageLayout>
  );
}
