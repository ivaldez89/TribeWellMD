/**
 * LocalStorage utilities for persisting clinical vignette data
 */

import type {
  ClinicalVignette,
  VignetteProgress,
  VignetteSession
} from '@/types';

const STORAGE_KEYS = {
  VIGNETTES: 'tribewellmd_vignettes',
  VIGNETTE_PROGRESS: 'tribewellmd_vignette_progress',
  VIGNETTE_SESSIONS: 'tribewellmd_vignette_sessions',
} as const;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

// ============================================
// Vignettes CRUD
// ============================================

export function getVignettes(): ClinicalVignette[] {
  if (!isBrowser()) return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.VIGNETTES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading vignettes:', error);
    return [];
  }
}

export function saveVignettes(vignettes: ClinicalVignette[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.VIGNETTES, JSON.stringify(vignettes));
  } catch (error) {
    console.error('Error saving vignettes:', error);
  }
}

export function getVignette(id: string): ClinicalVignette | null {
  const vignettes = getVignettes();
  return vignettes.find(v => v.id === id) || null;
}

export function saveVignette(vignette: ClinicalVignette): void {
  const vignettes = getVignettes();
  const index = vignettes.findIndex(v => v.id === vignette.id);
  if (index >= 0) {
    vignettes[index] = { ...vignette, updatedAt: new Date().toISOString() };
  } else {
    vignettes.push(vignette);
  }
  saveVignettes(vignettes);
}

export function deleteVignette(id: string): void {
  const vignettes = getVignettes();
  saveVignettes(vignettes.filter(v => v.id !== id));

  // Also clean up related progress and sessions
  const progress = getVignetteProgress();
  delete progress[id];
  saveVignetteProgress(progress);
}

// ============================================
// Progress Tracking
// ============================================

export function getVignetteProgress(): Record<string, VignetteProgress> {
  if (!isBrowser()) return {};
  try {
    const data = localStorage.getItem(STORAGE_KEYS.VIGNETTE_PROGRESS);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error reading vignette progress:', error);
    return {};
  }
}

export function saveVignetteProgress(progress: Record<string, VignetteProgress>): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.VIGNETTE_PROGRESS, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving vignette progress:', error);
  }
}

export function getProgressForVignette(vignetteId: string): VignetteProgress | null {
  const progress = getVignetteProgress();
  return progress[vignetteId] || null;
}

export function updateProgressForVignette(vignetteId: string, update: Partial<VignetteProgress>): void {
  const progress = getVignetteProgress();
  const existing = progress[vignetteId] || createDefaultProgress(vignetteId);
  progress[vignetteId] = { ...existing, ...update };
  saveVignetteProgress(progress);
}

function createDefaultProgress(vignetteId: string): VignetteProgress {
  return {
    vignetteId,
    completions: 0,
    lastCompleted: null,
    nodePerformance: {},
    overallMastery: 'learning',
    nextReview: new Date().toISOString(),
  };
}

// ============================================
// Session Tracking
// ============================================

export function getVignetteSessions(): VignetteSession[] {
  if (!isBrowser()) return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.VIGNETTE_SESSIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading vignette sessions:', error);
    return [];
  }
}

export function saveVignetteSession(session: VignetteSession): void {
  if (!isBrowser()) return;
  try {
    const sessions = getVignetteSessions();
    const index = sessions.findIndex(s => s.id === session.id);
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.push(session);
    }
    localStorage.setItem(STORAGE_KEYS.VIGNETTE_SESSIONS, JSON.stringify(sessions));
  } catch (error) {
    console.error('Error saving vignette session:', error);
  }
}

export function getSessionsForVignette(vignetteId: string): VignetteSession[] {
  return getVignetteSessions().filter(s => s.vignetteId === vignetteId);
}

// ============================================
// Utility Functions
// ============================================

export function clearVignetteData(): void {
  if (!isBrowser()) return;
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
}

export function exportVignetteData(): string {
  return JSON.stringify({
    vignettes: getVignettes(),
    progress: getVignetteProgress(),
    sessions: getVignetteSessions(),
    exportedAt: new Date().toISOString(),
  }, null, 2);
}

export function importVignetteData(jsonString: string): { success: boolean; error?: string } {
  try {
    const data = JSON.parse(jsonString);
    if (data.vignettes && Array.isArray(data.vignettes)) {
      saveVignettes(data.vignettes);
    }
    if (data.progress && typeof data.progress === 'object') {
      saveVignetteProgress(data.progress);
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
