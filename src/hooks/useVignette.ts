'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  ClinicalVignette,
  DecisionNode,
  Choice,
  VignetteSession,
  DecisionRecord,
  VignetteProgress,
  NodePerformance,
  VignetteMastery
} from '@/types';
import {
  getVignette,
  saveVignetteSession,
  updateProgressForVignette,
  getProgressForVignette
} from '@/lib/storage/vignetteStorage';

interface UseVignetteReturn {
  // State
  vignette: ClinicalVignette | null;
  currentNode: DecisionNode | null;
  session: VignetteSession | null;
  decisionHistory: DecisionRecord[];
  isLoading: boolean;
  error: string | null;

  // Computed
  isComplete: boolean;
  pathTaken: string[];
  nodeCount: number;
  currentNodeIndex: number;
  selectedChoice: Choice | null;
  showFeedback: boolean;

  // Actions
  startVignette: () => void;
  makeChoice: (choiceId: string) => void;
  continueAfterFeedback: () => void;
  restartVignette: () => void;
  endSession: () => void;
}

export function useVignette(vignetteId: string): UseVignetteReturn {
  const [vignette, setVignette] = useState<ClinicalVignette | null>(null);
  const [currentNodeId, setCurrentNodeId] = useState<string>('');
  const [session, setSession] = useState<VignetteSession | null>(null);
  const [decisionHistory, setDecisionHistory] = useState<DecisionRecord[]>([]);
  const [nodeStartTime, setNodeStartTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Load vignette on mount
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    try {
      const loadedVignette = getVignette(vignetteId);
      if (loadedVignette) {
        setVignette(loadedVignette);
      } else {
        setError('Vignette not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vignette');
    } finally {
      setIsLoading(false);
    }
  }, [vignetteId]);

  // Computed values
  const currentNode = useMemo(() => {
    if (!vignette || !currentNodeId) return null;
    return vignette.nodes[currentNodeId] || null;
  }, [vignette, currentNodeId]);

  const isComplete = currentNode?.type === 'outcome';

  const pathTaken = useMemo(() => {
    return decisionHistory.map(d => d.nodeId);
  }, [decisionHistory]);

  const nodeCount = useMemo(() => {
    if (!vignette) return 0;
    return Object.keys(vignette.nodes).length;
  }, [vignette]);

  const currentNodeIndex = useMemo(() => {
    return pathTaken.length + 1;
  }, [pathTaken]);

  // Start a new session
  const startVignette = useCallback(() => {
    if (!vignette) return;

    const newSession: VignetteSession = {
      id: crypto.randomUUID(),
      vignetteId: vignette.id,
      startedAt: new Date().toISOString(),
      decisions: [],
      completedOptimally: true // Will be set to false if any suboptimal choice
    };

    setSession(newSession);
    setCurrentNodeId(vignette.rootNodeId);
    setDecisionHistory([]);
    setNodeStartTime(Date.now());
    setSelectedChoice(null);
    setShowFeedback(false);
  }, [vignette]);

  // Make a choice at the current decision node
  const makeChoice = useCallback((choiceId: string) => {
    if (!vignette || !currentNode || !session) return;
    if (currentNode.type !== 'decision' || !currentNode.choices) return;

    const choice = currentNode.choices.find(c => c.id === choiceId);
    if (!choice) return;

    const timeSpent = Date.now() - nodeStartTime;

    // Record the decision
    const decision: DecisionRecord = {
      nodeId: currentNode.id,
      choiceId,
      wasOptimal: choice.isOptimal,
      wasAcceptable: choice.isAcceptable,
      timeSpentMs: timeSpent,
      timestamp: new Date().toISOString()
    };

    const updatedDecisions = [...decisionHistory, decision];
    setDecisionHistory(updatedDecisions);

    // Update session
    const updatedSession: VignetteSession = {
      ...session,
      decisions: updatedDecisions,
      completedOptimally: session.completedOptimally && choice.isOptimal
    };
    setSession(updatedSession);

    // Show feedback
    setSelectedChoice(choice);
    setShowFeedback(true);
  }, [vignette, currentNode, session, nodeStartTime, decisionHistory]);

  // Continue to next node after viewing feedback
  const continueAfterFeedback = useCallback(() => {
    if (!selectedChoice) return;

    if (selectedChoice.nextNodeId) {
      setCurrentNodeId(selectedChoice.nextNodeId);
      setNodeStartTime(Date.now());
    }

    setSelectedChoice(null);
    setShowFeedback(false);
  }, [selectedChoice]);

  // Restart the vignette
  const restartVignette = useCallback(() => {
    startVignette();
  }, [startVignette]);

  // End session and save progress
  const endSession = useCallback(() => {
    if (!session || !vignette) return;

    // Finalize session
    const endedSession: VignetteSession = {
      ...session,
      endedAt: new Date().toISOString()
    };
    saveVignetteSession(endedSession);

    // Update progress
    const existingProgress = getProgressForVignette(vignette.id);
    const completions = (existingProgress?.completions || 0) + 1;

    // Calculate node performance updates
    const nodePerformance: Record<string, NodePerformance> = {
      ...(existingProgress?.nodePerformance || {})
    };

    for (const decision of session.decisions) {
      const existing = nodePerformance[decision.nodeId] || {
        attempts: 0,
        optimalChoices: 0,
        acceptableChoices: 0,
        avgTimeMs: 0
      };

      const newAttempts = existing.attempts + 1;
      const newAvgTime = (existing.avgTimeMs * existing.attempts + decision.timeSpentMs) / newAttempts;

      nodePerformance[decision.nodeId] = {
        attempts: newAttempts,
        optimalChoices: existing.optimalChoices + (decision.wasOptimal ? 1 : 0),
        acceptableChoices: existing.acceptableChoices + (decision.wasAcceptable && !decision.wasOptimal ? 1 : 0),
        avgTimeMs: newAvgTime
      };
    }

    // Calculate overall mastery
    let overallMastery: VignetteMastery = 'learning';
    if (completions >= 3) {
      const allNodesOptimal = Object.values(nodePerformance).every(
        np => np.optimalChoices / np.attempts >= 0.8
      );
      if (allNodesOptimal) {
        overallMastery = 'mastered';
      } else if (Object.values(nodePerformance).every(np => np.attempts >= 2)) {
        overallMastery = 'familiar';
      }
    } else if (completions >= 1) {
      overallMastery = 'familiar';
    }

    // Calculate next review date (simple spaced repetition)
    const daysUntilReview = overallMastery === 'mastered' ? 7 : overallMastery === 'familiar' ? 3 : 1;
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + daysUntilReview);

    updateProgressForVignette(vignette.id, {
      completions,
      lastCompleted: new Date().toISOString(),
      nodePerformance,
      overallMastery,
      nextReview: nextReview.toISOString()
    });

    // Reset state
    setSession(null);
    setCurrentNodeId('');
    setDecisionHistory([]);
    setSelectedChoice(null);
    setShowFeedback(false);
  }, [session, vignette]);

  return {
    vignette,
    currentNode,
    session,
    decisionHistory,
    isLoading,
    error,
    isComplete,
    pathTaken,
    nodeCount,
    currentNodeIndex,
    selectedChoice,
    showFeedback,
    startVignette,
    makeChoice,
    continueAfterFeedback,
    restartVignette,
    endSession
  };
}
