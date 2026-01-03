/**
 * Layout Constants
 *
 * Centralized source of truth for all layout-related constants.
 * Use these values throughout the application to maintain consistency.
 */

/** Fixed header height in pixels */
export const HEADER_HEIGHT = 48;

/** Fixed footer height in pixels */
export const FOOTER_HEIGHT = 48;

/** Tailwind class for sticky top offset (header height + buffer) */
export const STICKY_TOP_OFFSET = 'top-16';

/** Combined header + footer height for full-page calculations */
export const HEADER_FOOTER_HEIGHT = HEADER_HEIGHT + FOOTER_HEIGHT;

// Height values in pixels (legacy - use individual constants above)
export const LAYOUT = {
  HEADER_HEIGHT: 48,  // 3rem / h-12
  FOOTER_HEIGHT: 48,  // 3rem / h-12
} as const;

// Tailwind class names for consistency
export const LAYOUT_CLASSES = {
  HEADER_HEIGHT: 'h-12',
  FOOTER_HEIGHT: 'h-12',
  HEADER_SPACER: 'h-12',
  FOOTER_SPACER: 'h-12',
  // For positioning panels that need to avoid header/footer
  PANEL_TOP: 'top-12',
  PANEL_BOTTOM: 'bottom-12',
} as const;

// CSS values for inline styles
export const LAYOUT_STYLES = {
  headerHeight: '48px',
  footerHeight: '48px',
  contentHeight: 'calc(100vh - 96px)', // 100vh - header - footer
} as const;
