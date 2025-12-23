'use client';

import { useState } from 'react';
import { CreateSessionData } from '@/types/studyRoom';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateSessionData) => Promise<void>;
  isCreating: boolean;
}

export function CreateRoomModal({
  isOpen,
  onClose,
  onCreate,
  isCreating,
}: CreateRoomModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [maxParticipants, setMaxParticipants] = useState(10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await onCreate({
      name: name.trim(),
      description: description.trim() || undefined,
      isPrivate,
      maxParticipants,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Create Study Room
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Room Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Room Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 50))}
              placeholder="e.g., Cardiology Review"
              required
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700 border-0 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-tribe-sage-500"
            />
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 text-right">
              {name.length}/50
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 200))}
              placeholder="What will you be studying?"
              rows={2}
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700 border-0 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-tribe-sage-500 resize-none"
            />
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 text-right">
              {description.length}/200
            </p>
          </div>

          {/* Max Participants */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Max Participants: {maxParticipants}
            </label>
            <input
              type="range"
              min={2}
              max={20}
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
              className="w-full accent-teal-500"
            />
            <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500">
              <span>2</span>
              <span>20</span>
            </div>
          </div>

          {/* Private toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div>
              <p className="font-medium text-slate-900 dark:text-white text-sm">
                Private Room
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Only people with the invite code can join
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPrivate(!isPrivate)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isPrivate ? 'bg-tribe-sage-500' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isPrivate ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!name.trim() || isCreating}
            className="w-full py-3 bg-gradient-to-r from-tribe-sage-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isCreating ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Create Room
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
