'use client';

import { useState } from 'react';
import type { CreateTribeData, TribeType, TribeVisibility, SocialCause } from '@/types/tribes';

interface CreateTribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateTribeData) => void;
}

const TRIBE_ICONS = ['🌊', '🔬', '🧘', '📚', '❤️', '🌱', '🎯', '💪', '🧠', '🌍', '🤝', '⭐'];

const TRIBE_COLORS = [
  { value: 'from-cyan-500 to-blue-600', label: 'Ocean' },
  { value: 'from-tribe-sage-500 to-tribe-sage-600', label: 'Forest' },
  { value: 'from-purple-500 to-indigo-600', label: 'Galaxy' },
  { value: 'from-red-500 to-rose-600', label: 'Ruby' },
  { value: 'from-amber-500 to-orange-600', label: 'Sunset' },
  { value: 'from-pink-500 to-fuchsia-600', label: 'Bloom' },
];

const CAUSES: { value: SocialCause; label: string }[] = [
  { value: 'environment', label: 'Environment' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'red-cross', label: 'Red Cross' },
  { value: 'animal-shelter', label: 'Animal Welfare' },
  { value: 'community', label: 'Community' },
];

export function CreateTribeModal({ isOpen, onClose, onCreate }: CreateTribeModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CreateTribeData>({
    name: '',
    description: '',
    mission: '',
    type: 'study',
    visibility: 'public',
    icon: '🌊',
    color: 'from-cyan-500 to-blue-600',
  });
  const [includeGoal, setIncludeGoal] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
    // Reset form
    setStep(1);
    setFormData({
      name: '',
      description: '',
      mission: '',
      type: 'study',
      visibility: 'public',
      icon: '🌊',
      color: 'from-cyan-500 to-blue-600',
    });
    setIncludeGoal(false);
    onClose();
  };

  const isStep1Valid = formData.name.length >= 3 && formData.description.length >= 10;
  const isStep2Valid = formData.mission.length >= 10;
  const isStep3Valid = !includeGoal || (formData.goalTitle && formData.goalTargetPoints);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-4 bg-gradient-to-r ${formData.color} text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{formData.icon}</span>
              <div>
                <h2 className="text-lg font-semibold">Create a Tribe</h2>
                <p className="text-sm text-white/80">Step {step} of 3</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tribe Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Future Cardiologists"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-tribe-sage-500 focus:border-tribe-sage-500"
                  maxLength={50}
                />
                <p className="text-xs text-slate-400 mt-1">{formData.name.length}/50 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What is this tribe about?"
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-tribe-sage-500 focus:border-tribe-sage-500"
                  maxLength={200}
                />
                <p className="text-xs text-slate-400 mt-1">{formData.description.length}/200 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tribe Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['study', 'specialty', 'wellness', 'cause'] as TribeType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, type })}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        formData.type === type
                          ? 'border-tribe-sage-500 bg-tribe-sage-50 text-tribe-sage-700'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {type === 'study' && '📚 Study Group'}
                      {type === 'specialty' && '🔬 Specialty'}
                      {type === 'wellness' && '🧘 Wellness'}
                      {type === 'cause' && '🌍 Social Cause'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Visibility
                </label>
                <div className="flex gap-2">
                  {(['public', 'private'] as TribeVisibility[]).map((vis) => (
                    <button
                      key={vis}
                      type="button"
                      onClick={() => setFormData({ ...formData, visibility: vis })}
                      className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        formData.visibility === vis
                          ? 'border-tribe-sage-500 bg-tribe-sage-50 text-tribe-sage-700'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {vis === 'public' ? '🌐 Public' : '🔒 Private'}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {formData.visibility === 'public'
                    ? 'Anyone can find and request to join'
                    : 'Invite-only, hidden from search'}
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mission Statement *
                </label>
                <textarea
                  value={formData.mission}
                  onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                  placeholder="What impact do you want to make?"
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-tribe-sage-500 focus:border-tribe-sage-500"
                  maxLength={300}
                />
                <p className="text-xs text-slate-400 mt-1">{formData.mission.length}/300 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Choose an Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {TRIBE_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`w-10 h-10 text-xl rounded-lg border transition-colors ${
                        formData.icon === icon
                          ? 'border-tribe-sage-500 bg-tribe-sage-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Theme Color
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TRIBE_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`p-3 rounded-lg border transition-colors ${
                        formData.color === color.value
                          ? 'ring-2 ring-tribe-sage-500 ring-offset-2'
                          : ''
                      }`}
                    >
                      <div className={`h-6 rounded bg-gradient-to-r ${color.value}`} />
                      <p className="text-xs text-slate-500 mt-1">{color.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <input
                  type="checkbox"
                  id="includeGoal"
                  checked={includeGoal}
                  onChange={(e) => setIncludeGoal(e.target.checked)}
                  className="w-5 h-5 text-tribe-sage-600 rounded focus:ring-tribe-sage-500"
                />
                <label htmlFor="includeGoal" className="flex-1">
                  <span className="font-medium text-slate-700">Add a Social Impact Goal</span>
                  <p className="text-sm text-slate-500">Set a collective goal to work toward</p>
                </label>
              </div>

              {includeGoal && (
                <div className="space-y-4 pl-4 border-l-2 border-teal-200">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Goal Title *
                    </label>
                    <input
                      type="text"
                      value={formData.goalTitle || ''}
                      onChange={(e) => setFormData({ ...formData, goalTitle: e.target.value })}
                      placeholder="e.g., Beach Cleanup Drive"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-tribe-sage-500 focus:border-tribe-sage-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Goal Description
                    </label>
                    <textarea
                      value={formData.goalDescription || ''}
                      onChange={(e) => setFormData({ ...formData, goalDescription: e.target.value })}
                      placeholder="Describe what you're working toward..."
                      rows={2}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-tribe-sage-500 focus:border-tribe-sage-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Cause Category
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {CAUSES.map((cause) => (
                        <button
                          key={cause.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, goalCause: cause.value })}
                          className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                            formData.goalCause === cause.value
                              ? 'border-tribe-sage-500 bg-tribe-sage-50 text-tribe-sage-700'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {cause.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Point Target *
                    </label>
                    <input
                      type="number"
                      value={formData.goalTargetPoints || ''}
                      onChange={(e) => setFormData({ ...formData, goalTargetPoints: parseInt(e.target.value) || 0 })}
                      placeholder="5000"
                      min={100}
                      max={100000}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-tribe-sage-500 focus:border-tribe-sage-500"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Members earn points through study and wellness activities
                    </p>
                  </div>
                </div>
              )}

              {/* Preview */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="text-sm font-medium text-slate-700 mb-2">Preview</h4>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${formData.color} flex items-center justify-center text-2xl`}>
                    {formData.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{formData.name || 'Tribe Name'}</p>
                    <p className="text-sm text-slate-500">{formData.visibility === 'public' ? 'Public' : 'Private'} • {formData.type}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
              >
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                className="px-6 py-2 bg-tribe-sage-500 text-white rounded-lg font-medium hover:bg-tribe-sage-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={!isStep3Valid}
                className="px-6 py-2 bg-tribe-sage-500 text-white rounded-lg font-medium hover:bg-tribe-sage-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Tribe
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
