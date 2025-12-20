'use client';

import { useState, useMemo } from 'react';
import type { ClinicalVignette, DecisionNode, MedicalSystem, VignetteMetadata } from '@/types';
import { NodeEditor } from './NodeEditor';

interface VignetteEditorProps {
  vignette: ClinicalVignette;
  onChange: (vignette: ClinicalVignette) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

const MEDICAL_SYSTEMS: MedicalSystem[] = [
  'Cardiology',
  'Pulmonology',
  'Gastroenterology',
  'Nephrology',
  'Neurology',
  'Endocrinology',
  'Hematology/Oncology',
  'Infectious Disease',
  'Rheumatology',
  'Dermatology',
  'Psychiatry',
  'OB/GYN',
  'Pediatrics',
  'Surgery',
  'Emergency Medicine',
  'Preventive Medicine',
  'General'
];

export function VignetteEditor({
  vignette,
  onChange,
  onSave,
  onCancel,
  isSaving = false
}: VignetteEditorProps) {
  const [activeTab, setActiveTab] = useState<'metadata' | 'nodes'>('metadata');
  const [tagsInput, setTagsInput] = useState(vignette.metadata.tags.join(', '));

  const updateVignette = (updates: Partial<ClinicalVignette>) => {
    onChange({ ...vignette, ...updates, updatedAt: new Date().toISOString() });
  };

  const updateMetadata = (updates: Partial<VignetteMetadata>) => {
    updateVignette({ metadata: { ...vignette.metadata, ...updates } });
  };

  const updateNode = (nodeId: string, updates: DecisionNode) => {
    const newNodes = { ...vignette.nodes, [nodeId]: updates };
    updateVignette({ nodes: newNodes });
  };

  const addNode = () => {
    const nodeId = `node-${Date.now()}`;
    const newNode: DecisionNode = {
      id: nodeId,
      type: 'decision',
      content: '',
      question: '',
      choices: []
    };
    updateVignette({ nodes: { ...vignette.nodes, [nodeId]: newNode } });
  };

  const deleteNode = (nodeId: string) => {
    if (nodeId === vignette.rootNodeId) {
      alert('Cannot delete the root node');
      return;
    }
    const newNodes = { ...vignette.nodes };
    delete newNodes[nodeId];
    updateVignette({ nodes: newNodes });
  };

  const availableNodeIds = useMemo(() => {
    return Object.keys(vignette.nodes);
  }, [vignette.nodes]);

  const handleTagsChange = (value: string) => {
    setTagsInput(value);
    const tags = value.split(',').map(t => t.trim()).filter(t => t.length > 0);
    updateMetadata({ tags });
  };

  // Validation
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (!vignette.title.trim()) errors.push('Title is required');
    if (!vignette.initialScenario.trim()) errors.push('Initial scenario is required');
    if (!vignette.rootNodeId) errors.push('Root node must be set');
    if (!vignette.nodes[vignette.rootNodeId]) errors.push('Root node does not exist');
    if (Object.keys(vignette.nodes).length === 0) errors.push('At least one node is required');
    return errors;
  }, [vignette]);

  return (
    <div className="space-y-6">
      {/* Header with tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('metadata')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'metadata'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            Case Details
          </button>
          <button
            onClick={() => setActiveTab('nodes')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'nodes'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            Decision Nodes ({Object.keys(vignette.nodes).length})
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'metadata' && (
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={vignette.title}
                  onChange={(e) => updateVignette({ title: e.target.value })}
                  placeholder="e.g., Acute Stroke Workup"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Initial Scenario */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Initial Scenario <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={vignette.initialScenario}
                  onChange={(e) => updateVignette({ initialScenario: e.target.value })}
                  placeholder="Describe the presenting patient, chief complaint, history, vitals, and initial findings..."
                  rows={6}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y"
                />
              </div>

              {/* System and Difficulty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Medical System
                  </label>
                  <select
                    value={vignette.metadata.system}
                    onChange={(e) => updateMetadata({ system: e.target.value as MedicalSystem })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {MEDICAL_SYSTEMS.map(system => (
                      <option key={system} value={system}>{system}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={vignette.metadata.difficulty}
                    onChange={(e) => updateMetadata({ difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced' })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Topic and Estimated Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Topic
                  </label>
                  <input
                    type="text"
                    value={vignette.metadata.topic}
                    onChange={(e) => updateMetadata({ topic: e.target.value })}
                    placeholder="e.g., Stroke, ACS, Sepsis"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Estimated Minutes
                  </label>
                  <input
                    type="number"
                    value={vignette.metadata.estimatedMinutes}
                    onChange={(e) => updateMetadata({ estimatedMinutes: parseInt(e.target.value) || 5 })}
                    min={1}
                    max={30}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  placeholder="e.g., stroke, emergency, neurology"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                {vignette.metadata.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {vignette.metadata.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Root Node Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Root Node (Starting Point)
                </label>
                <select
                  value={vignette.rootNodeId}
                  onChange={(e) => updateVignette({ rootNodeId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select root node...</option>
                  {availableNodeIds.map(nodeId => (
                    <option key={nodeId} value={nodeId}>{nodeId}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {activeTab === 'nodes' && (
            <div className="space-y-4">
              {/* Add node button */}
              <div className="flex justify-end">
                <button
                  onClick={addNode}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Node
                </button>
              </div>

              {/* Nodes list */}
              <div className="space-y-4">
                {Object.entries(vignette.nodes).map(([nodeId, node]) => (
                  <NodeEditor
                    key={nodeId}
                    node={node}
                    onChange={(updated) => updateNode(nodeId, updated)}
                    onDelete={() => deleteNode(nodeId)}
                    isRoot={nodeId === vignette.rootNodeId}
                    availableNodeIds={availableNodeIds.filter(id => id !== nodeId)}
                  />
                ))}
              </div>

              {Object.keys(vignette.nodes).length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                  <div className="text-4xl mb-3">🔀</div>
                  <h3 className="text-lg font-medium text-slate-800 mb-1">No nodes yet</h3>
                  <p className="text-slate-500 mb-4">Add decision nodes to build your clinical case.</p>
                  <button
                    onClick={addNode}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Add First Node
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h4 className="font-medium text-red-800 mb-2">Please fix the following issues:</h4>
          <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-6 py-2.5 text-slate-700 hover:text-slate-900 font-medium rounded-lg hover:bg-slate-100 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={validationErrors.length > 0 || isSaving}
          className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium rounded-lg shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save Case
            </>
          )}
        </button>
      </div>
    </div>
  );
}
