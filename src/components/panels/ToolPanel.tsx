'use client';

import { ReactNode, useEffect } from 'react';

/**
 * ToolPanel - Shared shell component for right-side tool panels
 *
 * This component standardizes the visual structure of all right-side panels
 * opened from the header (Messages, Labs, Music, Scene, Pomodoro, Streak).
 *
 * Responsibilities:
 * - Panel background and surface color
 * - Consistent padding and spacing
 * - Standard panel header (title + close button)
 * - Scroll container placement
 * - Light/dark theme handling
 * - Slide-in/out animation
 * - Escape key handling
 *
 * Variants:
 * - 'default': Full-featured panels (Messages, Labs, Music, Scene)
 * - 'compact': Lighter panels (Pomodoro, Streak) with more flexible header styling
 */

export interface ToolPanelProps {
  /** Whether the panel is open */
  isOpen: boolean;
  /** Callback when panel should close */
  onClose: () => void;
  /** Panel title displayed in header */
  title: string;
  /** Optional subtitle displayed under title */
  subtitle?: string;
  /** Icon element for the header */
  icon?: ReactNode;
  /** Header background - can be gradient class or custom element */
  headerBg?: string;
  /** Header text color class (default: text-secondary for default, text-white for compact) */
  headerTextColor?: string;
  /** Optional keyboard shortcut key to display in footer */
  shortcutKey?: string;
  /** Footer left text content */
  footerText?: string;
  /** Variant: 'default' for full panels, 'compact' for lighter panels */
  variant?: 'default' | 'compact';
  /** Panel content */
  children: ReactNode;
  /** Optional className for the content wrapper */
  contentClassName?: string;
  /** Whether to include the standard footer (default: true) */
  showFooter?: boolean;
  /** Custom footer content (replaces default footer) */
  footer?: ReactNode;
  /** Custom header content (replaces default header) */
  header?: ReactNode;
}

// Default header gradient for standard panels
const DEFAULT_HEADER_BG = 'bg-gradient-to-r from-sand-50 to-blue-50 dark:from-sand-950/30 dark:to-blue-950/30';

export function ToolPanel({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  headerBg,
  headerTextColor,
  shortcutKey,
  footerText,
  variant = 'default',
  children,
  contentClassName = '',
  showFooter = true,
  footer,
  header,
}: ToolPanelProps) {
  // Handle Escape key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Determine header styling based on variant
  const resolvedHeaderBg = headerBg || (variant === 'compact' ? '' : DEFAULT_HEADER_BG);
  const resolvedHeaderTextColor = headerTextColor || (variant === 'compact' ? 'text-white' : '');

  // Close button styling based on variant/header color
  const closeButtonClass = variant === 'compact' || headerTextColor?.includes('white')
    ? 'text-white/80 hover:text-white hover:bg-white/20'
    : 'text-content-muted hover:text-secondary hover:bg-surface-muted';

  return (
    <aside
      className={`fixed top-12 right-0 bottom-12 w-full sm:w-[380px] bg-surface border-l border-border shadow-2xl z-40 flex flex-col transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      {header ? (
        header
      ) : (
        <div className={`flex items-center justify-between px-4 py-3 border-b border-border ${resolvedHeaderBg}`}>
          <div className="flex items-center gap-3">
            {icon && (
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                variant === 'compact' ? 'bg-white/20' : 'bg-gradient-to-br from-sand-100 to-blue-100 dark:from-sand-900/50 dark:to-blue-900/50'
              }`}>
                {icon}
              </div>
            )}
            <div className={resolvedHeaderTextColor}>
              <h2 className={`text-sm font-bold ${resolvedHeaderTextColor || 'text-secondary'}`}>{title}</h2>
              {subtitle && (
                <p className={`text-[10px] ${variant === 'compact' ? 'opacity-90' : 'text-content-muted'}`}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${closeButtonClass}`}
            title="Close (Esc)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Content */}
      <div className={`flex-1 overflow-y-auto ${contentClassName}`}>
        {children}
      </div>

      {/* Footer */}
      {showFooter && (
        footer ? (
          footer
        ) : (
          <div className="px-4 py-2 border-t border-border bg-surface-muted/30 flex items-center justify-between">
            <p className="text-[10px] text-content-muted">
              {footerText || title}
            </p>
            {shortcutKey && (
              <p className="text-[10px] text-content-muted">
                <kbd className="px-1 py-0.5 bg-surface border border-border rounded font-mono text-[9px]">
                  {shortcutKey}
                </kbd>{' '}
                toggle
              </p>
            )}
          </div>
        )
      )}
    </aside>
  );
}

export default ToolPanel;
