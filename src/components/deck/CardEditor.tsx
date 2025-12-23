'use client';

import { useState, useRef } from 'react';
import type { Flashcard, MedicalSystem, Difficulty } from '@/types';

interface CardEditorProps {
  card: Flashcard;
  onSave: (card: Flashcard) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

export function CardEditor({ card, onSave, onCancel, onDelete }: CardEditorProps) {
  const [editedCard, setEditedCard] = useState<Flashcard>(card);
  const [newTag, setNewTag] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const systems: MedicalSystem[] = [
    'Cardiology', 'Pulmonology', 'Gastroenterology', 'Nephrology', 'Neurology',
    'Endocrinology', 'Hematology/Oncology', 'Infectious Disease', 'Rheumatology',
    'Dermatology', 'Psychiatry', 'OB/GYN', 'Pediatrics', 'Surgery',
    'Emergency Medicine', 'Preventive Medicine', 'General'
  ];

  const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

  const handleContentChange = (field: 'front' | 'back' | 'explanation', value: string) => {
    setEditedCard({
      ...editedCard,
      content: { ...editedCard.content, [field]: value }
    });
  };

  const handleMetadataChange = (field: string, value: any) => {
    setEditedCard({
      ...editedCard,
      metadata: { ...editedCard.metadata, [field]: value }
    });
  };

  const addTag = () => {
    if (newTag.trim() && !editedCard.metadata.tags.includes(newTag.trim())) {
      handleMetadataChange('tags', [...editedCard.metadata.tags, newTag.trim().toLowerCase()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    handleMetadataChange('tags', editedCard.metadata.tags.filter(t => t !== tag));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const currentImages = editedCard.content.images || [];
      setEditedCard({
        ...editedCard,
        content: { ...editedCard.content, images: [...currentImages, base64] }
      });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    const currentImages = editedCard.content.images || [];
    setEditedCard({
      ...editedCard,
      content: { 
        ...editedCard.content, 
        images: currentImages.filter((_, i) => i !== index) 
      }
    });
  };

  const handleSave = () => {
    onSave(editedCard);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Edit Card</h2>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Question */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Question (Front)
            </label>
            <textarea
              value={editedCard.content.front}
              onChange={(e) => handleContentChange('front', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-tribe-sage-500 focus:border-tribe-sage-500 resize-none"
              rows={4}
              placeholder="Enter the question..."
            />
          </div>

          {/* Answer */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Answer (Back)
            </label>
            <textarea
              value={editedCard.content.back}
              onChange={(e) => handleContentChange('back', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-tribe-sage-500 focus:border-tribe-sage-500 resize-none"
              rows={4}
              placeholder="Enter the answer..."
            />
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Explanation (Optional)
            </label>
            <textarea
              value={editedCard.content.explanation || ''}
              onChange={(e) => handleContentChange('explanation', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-tribe-sage-500 focus:border-tribe-sage-500 resize-none"
              rows={3}
              placeholder="Additional explanation..."
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Images
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(editedCard.content.images || []).map((img, idx) => (
                <div key={idx} className="relative group">
                  <img 
                    src={img} 
                    alt={`Card image ${idx + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                  />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-emerald-400 hover:text-tribe-sage-500 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-xs mt-1">Add</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Metadata row */}
          <div className="grid grid-cols-2 gap-4">
            {/* System */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                System
              </label>
              <select
                value={editedCard.metadata.system}
                onChange={(e) => handleMetadataChange('system', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-tribe-sage-500 focus:border-tribe-sage-500 bg-white"
              >
                {systems.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Difficulty
              </label>
              <select
                value={editedCard.metadata.difficulty}
                onChange={(e) => handleMetadataChange('difficulty', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-tribe-sage-500 focus:border-tribe-sage-500 bg-white"
              >
                {difficulties.map(d => (
                  <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Topic
            </label>
            <input
              type="text"
              value={editedCard.metadata.topic}
              onChange={(e) => handleMetadataChange('topic', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-tribe-sage-500 focus:border-tribe-sage-500"
              placeholder="e.g., Hypertension, Diabetes..."
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {editedCard.metadata.tags.map(tag => (
                <span 
                  key={tag}
                  className="px-2.5 py-1 text-sm bg-slate-100 text-slate-700 rounded-lg flex items-center gap-1"
                >
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-slate-400 hover:text-red-500"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-tribe-sage-500 focus:border-tribe-sage-500"
                placeholder="Add a tag..."
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          {onDelete && (
            <div>
              {showDeleteConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-600">Delete this card?</span>
                  <button
                    onClick={() => onDelete(card.id)}
                    className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                  >
                    Yes, delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Delete card
                </button>
              )}
            </div>
          )}
          
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-tribe-sage-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
