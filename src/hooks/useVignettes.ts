'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  ClinicalVignette,
  VignetteProgress,
  MedicalSystem,
  VignetteMastery
} from '@/types';
import {
  getVignettes,
  saveVignette,
  saveVignettes,
  deleteVignette as deleteVignetteFromStorage,
  getVignetteProgress
} from '@/lib/storage/vignetteStorage';
import { sampleVignettes } from '@/data/sample-vignettes';

interface VignetteStats {
  total: number;
  mastered: number;
  familiar: number;
  learning: number;
  dueToday: number;
}

interface UseVignettesReturn {
  // State
  vignettes: ClinicalVignette[];
  progress: Record<string, VignetteProgress>;
  isLoading: boolean;

  // CRUD operations
  addVignette: (vignette: ClinicalVignette) => void;
  updateVignette: (vignette: ClinicalVignette) => void;
  deleteVignette: (id: string) => void;
  importVignettes: (vignettes: ClinicalVignette[]) => void;

  // Filtering
  getBySystem: (system: MedicalSystem) => ClinicalVignette[];
  getByDifficulty: (difficulty: 'beginner' | 'intermediate' | 'advanced') => ClinicalVignette[];
  getByMastery: (mastery: VignetteMastery) => ClinicalVignette[];
  getDueForReview: () => ClinicalVignette[];
  searchVignettes: (query: string) => ClinicalVignette[];

  // Stats
  stats: VignetteStats;
  getProgressForVignette: (vignetteId: string) => VignetteProgress | null;

  // Utilities
  refreshVignettes: () => void;
  seedSampleVignettes: () => void;
}

export function useVignettes(): UseVignettesReturn {
  const [vignettes, setVignettes] = useState<ClinicalVignette[]>([]);
  const [progress, setProgress] = useState<Record<string, VignetteProgress>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load vignettes and progress on mount
  useEffect(() => {
    const loadData = () => {
      setIsLoading(true);
      try {
        const loadedVignettes = getVignettes();
        const loadedProgress = getVignetteProgress();

        // Seed sample vignettes if none exist
        if (loadedVignettes.length === 0) {
          saveVignettes(sampleVignettes);
          setVignettes(sampleVignettes);
        } else {
          setVignettes(loadedVignettes);
        }

        setProgress(loadedProgress);
      } catch (error) {
        console.error('Error loading vignettes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const loadData = useCallback(() => {
    setIsLoading(true);
    try {
      const loadedVignettes = getVignettes();
      const loadedProgress = getVignetteProgress();

      if (loadedVignettes.length === 0) {
        saveVignettes(sampleVignettes);
        setVignettes(sampleVignettes);
      } else {
        setVignettes(loadedVignettes);
      }

      setProgress(loadedProgress);
    } catch (error) {
      console.error('Error loading vignettes:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Calculate stats
  const stats = useMemo((): VignetteStats => {
    const now = new Date();
    let mastered = 0;
    let familiar = 0;
    let learning = 0;
    let dueToday = 0;

    for (const vignette of vignettes) {
      const vignetteProgress = progress[vignette.id];

      if (!vignetteProgress || vignetteProgress.completions === 0) {
        learning++;
      } else {
        switch (vignetteProgress.overallMastery) {
          case 'mastered':
            mastered++;
            break;
          case 'familiar':
            familiar++;
            break;
          default:
            learning++;
        }
      }

      // Check if due for review
      if (vignetteProgress) {
        const nextReview = new Date(vignetteProgress.nextReview);
        if (nextReview <= now) {
          dueToday++;
        }
      } else {
        // Never reviewed = due
        dueToday++;
      }
    }

    return {
      total: vignettes.length,
      mastered,
      familiar,
      learning,
      dueToday
    };
  }, [vignettes, progress]);

  // CRUD operations
  const addVignette = useCallback((vignette: ClinicalVignette) => {
    saveVignette(vignette);
    setVignettes(prev => [...prev, vignette]);
  }, []);

  const updateVignette = useCallback((vignette: ClinicalVignette) => {
    saveVignette(vignette);
    setVignettes(prev => prev.map(v => v.id === vignette.id ? vignette : v));
  }, []);

  const deleteVignette = useCallback((id: string) => {
    deleteVignetteFromStorage(id);
    setVignettes(prev => prev.filter(v => v.id !== id));
    setProgress(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  }, []);

  const importVignettes = useCallback((newVignettes: ClinicalVignette[]) => {
    const existingIds = new Set(vignettes.map(v => v.id));
    const uniqueNew = newVignettes.filter(v => !existingIds.has(v.id));

    if (uniqueNew.length === 0) return;

    const merged = [...vignettes, ...uniqueNew];
    saveVignettes(merged);
    setVignettes(merged);
  }, [vignettes]);

  // Filtering functions
  const getBySystem = useCallback((system: MedicalSystem): ClinicalVignette[] => {
    return vignettes.filter(v => v.metadata.system === system);
  }, [vignettes]);

  const getByDifficulty = useCallback((difficulty: 'beginner' | 'intermediate' | 'advanced'): ClinicalVignette[] => {
    return vignettes.filter(v => v.metadata.difficulty === difficulty);
  }, [vignettes]);

  const getByMastery = useCallback((mastery: VignetteMastery): ClinicalVignette[] => {
    return vignettes.filter(v => {
      const p = progress[v.id];
      if (!p) return mastery === 'learning';
      return p.overallMastery === mastery;
    });
  }, [vignettes, progress]);

  const getDueForReview = useCallback((): ClinicalVignette[] => {
    const now = new Date();
    return vignettes.filter(v => {
      const p = progress[v.id];
      if (!p) return true; // Never reviewed = due
      return new Date(p.nextReview) <= now;
    });
  }, [vignettes, progress]);

  const searchVignettes = useCallback((query: string): ClinicalVignette[] => {
    const lowerQuery = query.toLowerCase();
    return vignettes.filter(v =>
      v.title.toLowerCase().includes(lowerQuery) ||
      v.metadata.topic.toLowerCase().includes(lowerQuery) ||
      v.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      v.initialScenario.toLowerCase().includes(lowerQuery)
    );
  }, [vignettes]);

  // Get progress for a specific vignette
  const getProgressForVignette = useCallback((vignetteId: string): VignetteProgress | null => {
    return progress[vignetteId] || null;
  }, [progress]);

  // Refresh from storage
  const refreshVignettes = useCallback(() => {
    loadData();
  }, [loadData]);

  // Seed sample vignettes (force reseed)
  const seedSampleVignettes = useCallback(() => {
    const existingIds = new Set(vignettes.map(v => v.id));
    const newSamples = sampleVignettes.filter(v => !existingIds.has(v.id));

    if (newSamples.length > 0) {
      const merged = [...vignettes, ...newSamples];
      saveVignettes(merged);
      setVignettes(merged);
    }
  }, [vignettes]);

  return {
    vignettes,
    progress,
    isLoading,
    addVignette,
    updateVignette,
    deleteVignette,
    importVignettes,
    getBySystem,
    getByDifficulty,
    getByMastery,
    getDueForReview,
    searchVignettes,
    stats,
    getProgressForVignette,
    refreshVignettes,
    seedSampleVignettes
  };
}
