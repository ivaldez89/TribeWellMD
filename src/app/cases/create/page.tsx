'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import type { ClinicalVignette, DecisionNode } from '@/types';
import { VignetteEditor } from '@/components/vignettes/VignetteEditor';
import { useVignettes } from '@/hooks/useVignettes';

function createEmptyVignette(): ClinicalVignette {
  const now = new Date().toISOString();
  const rootNodeId = 'node-1';

  const initialNode: DecisionNode = {
    id: rootNodeId,
    type: 'decision',
    content: '',
    question: 'What is your next step?',
    choices: []
  };

  return {
    id: `vignette-${Date.now()}`,
    schemaVersion: '1.0',
    createdAt: now,
    updatedAt: now,
    title: '',
    initialScenario: '',
    rootNodeId,
    nodes: { [rootNodeId]: initialNode },
    metadata: {
      system: 'General',
      topic: '',
      difficulty: 'intermediate',
      conceptCodes: [],
      estimatedMinutes: 5,
      tags: []
    }
  };
}

export default function CreateCasePage() {
  const router = useRouter();
  const { addVignette, importVignettes } = useVignettes();
  const [vignette, setVignette] = useState<ClinicalVignette>(createEmptyVignette);
  const [isSaving, setIsSaving] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    setIsSaving(true);

    // Simulate a small delay for UX
    setTimeout(() => {
      addVignette(vignette);
      setIsSaving(false);
      router.push('/cases');
    }, 500);
  };

  const handleCancel = () => {
    router.push('/cases');
  };

  const handleExport = () => {
    const jsonString = JSON.stringify(vignette, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${vignette.title || 'vignette'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    setImportError(null);
    try {
      const parsed = JSON.parse(importJson);

      // Validate basic structure
      if (!parsed.id || !parsed.nodes || !parsed.rootNodeId) {
        throw new Error('Invalid vignette structure. Missing required fields.');
      }

      // If it's an array, import multiple
      if (Array.isArray(parsed)) {
        importVignettes(parsed);
        router.push('/cases');
      } else {
        // Single vignette - load into editor
        setVignette({
          ...parsed,
          id: `vignette-${Date.now()}`, // Generate new ID
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        setShowImportModal(false);
        setImportJson('');
      }
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Invalid JSON format');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportJson(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Sub-header with page-specific actions */}
      <div className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/cases" className="text-content-muted hover:text-content-secondary transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-xl font-bold text-secondary">Create New Case</h1>
            </div>

            {/* Quick actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowImportModal(true)}
                className="px-3 py-2 text-sm text-content-muted hover:text-content-secondary hover:bg-surface-muted rounded-lg transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import
              </button>
              <button
                onClick={handleExport}
                className="px-3 py-2 text-sm text-content-muted hover:text-content-secondary hover:bg-surface-muted rounded-lg transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <VignetteEditor
          vignette={vignette}
          onChange={setVignette}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      </main>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-secondary">Import Case</h2>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportJson('');
                  setImportError(null);
                }}
                className="p-1.5 text-content-muted hover:text-content-secondary hover:bg-surface-muted rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* File upload */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".json"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-8 border-2 border-dashed border-border rounded-xl hover:border-secondary hover:bg-surface-muted/50 transition-colors flex flex-col items-center gap-2"
                >
                  <svg className="w-8 h-8 text-content-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-sm font-medium text-secondary">Upload JSON file</span>
                  <span className="text-xs text-content-muted">or paste JSON below</span>
                </button>
              </div>

              {/* JSON textarea */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">
                  Paste JSON
                </label>
                <textarea
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  placeholder='{"id": "...", "title": "...", "nodes": {...}}'
                  rows={8}
                  className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary font-mono text-sm text-content resize-y"
                />
              </div>

              {/* Error display */}
              {importError && (
                <div className="p-3 bg-error-light border border-error/30 rounded-lg text-sm text-error">
                  {importError}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportJson('');
                  setImportError(null);
                }}
                className="px-4 py-2 text-secondary hover:text-primary font-medium rounded-lg hover:bg-surface-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!importJson.trim()}
                className="px-4 py-2 bg-gradient-to-r from-sand-500 to-sand-600 hover:from-sand-600 hover:to-sand-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
