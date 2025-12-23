'use client';

import { useState } from 'react';
import type { DecisionNode, Choice, DecisionNodeType } from '@/types';

interface NodeEditorProps {
  node: DecisionNode;
  onChange: (node: DecisionNode) => void;
  onDelete?: () => void;
  isRoot?: boolean;
  availableNodeIds: string[];
}

export function NodeEditor({
  node,
  onChange,
  onDelete,
  isRoot = false,
  availableNodeIds
}: NodeEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const updateNode = (updates: Partial<DecisionNode>) => {
    onChange({ ...node, ...updates });
  };

  const updateChoice = (index: number, updates: Partial<Choice>) => {
    if (!node.choices) return;
    const newChoices = [...node.choices];
    newChoices[index] = { ...newChoices[index], ...updates };
    updateNode({ choices: newChoices });
  };

  const addChoice = () => {
    const newChoice: Choice = {
      id: `choice-${Date.now()}`,
      text: '',
      isOptimal: false,
      isAcceptable: false,
      feedback: '',
      consequence: '',
      nextNodeId: null
    };
    updateNode({ choices: [...(node.choices || []), newChoice] });
  };

  const removeChoice = (index: number) => {
    if (!node.choices) return;
    const newChoices = node.choices.filter((_, i) => i !== index);
    updateNode({ choices: newChoices });
  };

  const nodeTypeColors = {
    decision: 'border-indigo-300 bg-indigo-50',
    outcome: 'border-emerald-300 bg-tribe-sage-50',
    information: 'border-amber-300 bg-amber-50'
  };

  const nodeTypeIcons = {
    decision: '🔀',
    outcome: '🏁',
    information: 'ℹ️'
  };

  return (
    <div className={`rounded-xl border-2 ${nodeTypeColors[node.type]} overflow-hidden`}>
      {/* Node header */}
      <div
        className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-white/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{nodeTypeIcons[node.type]}</span>
          <div>
            <span className="font-medium text-slate-800">
              {node.id}
              {isRoot && <span className="ml-2 text-xs text-indigo-600">(Root)</span>}
            </span>
            <span className="ml-2 text-sm text-slate-500">
              {node.type}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isRoot && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
          <svg
            className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 bg-white/50">
          {/* Node type selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Node Type</label>
            <select
              value={node.type}
              onChange={(e) => updateNode({ type: e.target.value as DecisionNodeType })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="decision">Decision</option>
              <option value="outcome">Outcome</option>
              <option value="information">Information</option>
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
            <textarea
              value={node.content}
              onChange={(e) => updateNode({ content: e.target.value })}
              placeholder="Enter the scenario or information presented at this node..."
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y"
            />
          </div>

          {/* Question (for decision nodes) */}
          {node.type === 'decision' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Question</label>
              <input
                type="text"
                value={node.question || ''}
                onChange={(e) => updateNode({ question: e.target.value })}
                placeholder="What should you do next?"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}

          {/* Clinical Pearl */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Clinical Pearl (optional)
            </label>
            <textarea
              value={node.clinicalPearl || ''}
              onChange={(e) => updateNode({ clinicalPearl: e.target.value })}
              placeholder="Add a teaching point or clinical pearl..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y"
            />
          </div>

          {/* Choices (for decision nodes) */}
          {node.type === 'decision' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">Choices</label>
                <button
                  onClick={addChoice}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Choice
                </button>
              </div>

              <div className="space-y-4">
                {(node.choices || []).map((choice, index) => (
                  <ChoiceEditor
                    key={choice.id}
                    choice={choice}
                    index={index}
                    onChange={(updates) => updateChoice(index, updates)}
                    onDelete={() => removeChoice(index)}
                    availableNodeIds={availableNodeIds}
                  />
                ))}
              </div>

              {(!node.choices || node.choices.length === 0) && (
                <div className="text-center py-4 text-slate-500 text-sm border-2 border-dashed border-slate-200 rounded-lg">
                  No choices yet. Add a choice to create decision branches.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ChoiceEditorProps {
  choice: Choice;
  index: number;
  onChange: (updates: Partial<Choice>) => void;
  onDelete: () => void;
  availableNodeIds: string[];
}

function ChoiceEditor({ choice, index, onChange, onDelete, availableNodeIds }: ChoiceEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
      {/* Choice header */}
      <div
        className="px-3 py-2 flex items-center gap-3 cursor-pointer hover:bg-slate-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-shrink-0 w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-sm font-medium text-slate-600">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-700 truncate">
            {choice.text || <span className="text-slate-400 italic">Empty choice</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {choice.isOptimal && (
            <span className="px-1.5 py-0.5 text-xs font-medium bg-tribe-sage-100 text-tribe-sage-700 rounded">
              Optimal
            </span>
          )}
          {choice.isAcceptable && !choice.isOptimal && (
            <span className="px-1.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded">
              Acceptable
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 pt-2 space-y-3 border-t border-slate-100 bg-slate-50">
          {/* Choice text */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Choice Text</label>
            <input
              type="text"
              value={choice.text}
              onChange={(e) => onChange({ text: e.target.value })}
              placeholder="Enter the choice text..."
              className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Choice quality */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={choice.isOptimal}
                onChange={(e) => onChange({
                  isOptimal: e.target.checked,
                  isAcceptable: e.target.checked ? true : choice.isAcceptable
                })}
                className="w-4 h-4 text-tribe-sage-600 border-slate-300 rounded focus:ring-tribe-sage-500"
              />
              <span className="text-slate-700">Optimal</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={choice.isAcceptable}
                onChange={(e) => onChange({ isAcceptable: e.target.checked })}
                disabled={choice.isOptimal}
                className="w-4 h-4 text-amber-600 border-slate-300 rounded focus:ring-amber-500 disabled:opacity-50"
              />
              <span className="text-slate-700">Acceptable</span>
            </label>
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Feedback</label>
            <textarea
              value={choice.feedback}
              onChange={(e) => onChange({ feedback: e.target.value })}
              placeholder="Explain why this choice is correct/incorrect..."
              rows={2}
              className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y"
            />
          </div>

          {/* Consequence */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Consequence</label>
            <textarea
              value={choice.consequence}
              onChange={(e) => onChange({ consequence: e.target.value })}
              placeholder="What happens as a result of this choice..."
              rows={2}
              className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y"
            />
          </div>

          {/* Next node */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Next Node</label>
            <select
              value={choice.nextNodeId || ''}
              onChange={(e) => onChange({ nextNodeId: e.target.value || null })}
              className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Terminal (End)</option>
              {availableNodeIds.map(nodeId => (
                <option key={nodeId} value={nodeId}>{nodeId}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
