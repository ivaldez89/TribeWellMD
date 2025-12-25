/**
 * TribeWellMD Design Tokens
 *
 * SINGLE SOURCE OF TRUTH for all theme colors.
 *
 * Architecture:
 * - Raw colors defined here (logo-derived palette)
 * - Exported as CSS variable mappings
 * - Tailwind references these via CSS variables
 * - Components use SEMANTIC tokens only (bg-primary, text-muted, etc.)
 *
 * To add a new theme in the future:
 * 1. Add new color definitions to this file
 * 2. Add CSS variable definitions in globals.css under [data-theme="new-theme"]
 * 3. Update ThemeProvider to support the new theme
 */

// =============================================================================
// RAW COLOR PALETTE - Logo-derived Forest Theme colors
// =============================================================================

export const forestPalette = {
  // Primary greens (from logo right side)
  forest: {
    50: '#F4F7F5',
    100: '#E8EFE9',
    200: '#C5D6C8',
    300: '#9BBAA1',
    400: '#6B8B7D',
    500: '#5B7B6D',  // Primary forest green
    600: '#3D5A4C',
    700: '#2D4A3C',
    800: '#1E3D2F',
    900: '#152E22',
    950: '#0A1A12',
  },

  // Warm earth tones (from logo left side - burgundy/rust)
  earth: {
    50: '#FAF5F4',
    100: '#F5E8E6',
    200: '#E8D0CC',
    300: '#D4ADA5',
    400: '#B87D73',
    500: '#A65D4D',  // Terracotta/rust
    600: '#8B4A3D',
    700: '#6B3A30',
    800: '#4A2920',
    900: '#3A1F18',
    950: '#1F100C',
  },

  // Deep burgundy/maroon (from logo warm tones)
  burgundy: {
    50: '#FAF4F4',
    100: '#F5E6E6',
    200: '#E8CCCC',
    300: '#D4A5A5',
    400: '#B87373',
    500: '#8B3A3A',  // Deep burgundy
    600: '#703030',
    700: '#552424',
    800: '#4A1F1F',
    900: '#3A1818',
    950: '#1F0C0C',
  },

  // Teal/blue-green (from logo bottom)
  teal: {
    50: '#F2F7F8',
    100: '#E4EEF0',
    200: '#C5DCE0',
    300: '#9BC5CC',
    400: '#6BA3AD',
    500: '#4A8A96',
    600: '#3D717A',
    700: '#2D5A63',
    800: '#2D4A5A',  // Deep teal from logo
    900: '#1E3D47',
    950: '#0F2229',
  },

  // Warm neutrals (sand/bark from logo)
  sand: {
    50: '#FDFCFA',
    100: '#F9F6F2',
    200: '#F0E9E0',
    300: '#E4D8C9',
    400: '#D4C4B0',
    500: '#C4A77D',  // Wheat
    600: '#A89070',  // Sand
    700: '#8B7355',  // Bark light
    800: '#6B5344',  // Bark
    900: '#4A3A30',
    950: '#2A201A',
  },

  // Sage (mid-tone green)
  sage: {
    50: '#F4F9F6',
    100: '#E6F2EC',
    200: '#CCE5D9',
    300: '#A3D1BC',
    400: '#73B89A',
    500: '#5DB075',  // Brand green (kept for compatibility)
    600: '#4A9962',
    700: '#3D7D50',
    800: '#346542',
    900: '#2C5338',
    950: '#152E1D',
  },
} as const;

// =============================================================================
// SEMANTIC TOKEN MAPPINGS
// These map semantic meanings to actual colors
// =============================================================================

export const forestThemeTokens = {
  // Surfaces
  surface: {
    default: '#FFFFFF',           // White - cards, inputs, text boxes (light mode)
    defaultDark: forestPalette.forest[900],
    elevated: '#FFFFFF',
    elevatedDark: forestPalette.forest[800],
    muted: forestPalette.sand[100],
    mutedDark: forestPalette.forest[800],
    subtle: forestPalette.sand[50],
    subtleDark: forestPalette.forest[950],
  },

  // Backgrounds
  background: {
    primary: forestPalette.sand[50],
    primaryDark: forestPalette.forest[950],
    secondary: forestPalette.sand[100],
    secondaryDark: forestPalette.forest[900],
  },

  // Primary actions (main CTA, active states)
  primary: {
    DEFAULT: forestPalette.forest[600],
    hover: forestPalette.forest[700],
    light: forestPalette.forest[100],
    lightDark: forestPalette.forest[800],
    foreground: '#FFFFFF',
  },

  // Secondary actions
  secondary: {
    DEFAULT: forestPalette.sand[600],
    hover: forestPalette.sand[700],
    light: forestPalette.sand[100],
    lightDark: forestPalette.sand[800],
    foreground: '#FFFFFF',
  },

  // Accent (highlights, badges)
  accent: {
    DEFAULT: forestPalette.earth[500],
    hover: forestPalette.earth[600],
    light: forestPalette.earth[100],
    lightDark: forestPalette.earth[800],
    foreground: '#FFFFFF',
  },

  // Text colors
  text: {
    primary: forestPalette.forest[900],
    primaryDark: forestPalette.sand[50],
    secondary: forestPalette.forest[700],
    secondaryDark: forestPalette.sand[200],
    muted: forestPalette.forest[500],
    mutedDark: forestPalette.sand[400],
    inverse: '#FFFFFF',
  },

  // Borders
  border: {
    DEFAULT: forestPalette.sand[300],
    defaultDark: forestPalette.forest[700],
    light: forestPalette.sand[200],
    lightDark: forestPalette.forest[800],
    focus: forestPalette.forest[500],
  },

  // Status colors
  success: {
    DEFAULT: forestPalette.sage[500],
    light: forestPalette.sage[100],
    dark: forestPalette.sage[700],
  },

  warning: {
    DEFAULT: forestPalette.sand[500],
    light: forestPalette.sand[100],
    dark: forestPalette.sand[700],
  },

  error: {
    DEFAULT: forestPalette.burgundy[500],
    light: forestPalette.burgundy[100],
    dark: forestPalette.burgundy[700],
  },

  info: {
    DEFAULT: forestPalette.teal[500],
    light: forestPalette.teal[100],
    dark: forestPalette.teal[700],
  },
} as const;

// =============================================================================
// GRADIENT DEFINITIONS
// Pre-defined gradients using theme colors
// =============================================================================

export const forestGradients = {
  // Card header gradients (for tribe cards, etc.)
  forest: `from-[${forestPalette.forest[600]}] to-[${forestPalette.forest[700]}]`,
  sage: `from-[${forestPalette.sage[500]}] to-[${forestPalette.sage[600]}]`,
  earth: `from-[${forestPalette.earth[500]}] to-[${forestPalette.earth[600]}]`,
  sand: `from-[${forestPalette.sand[600]}] to-[${forestPalette.sand[700]}]`,
  teal: `from-[${forestPalette.teal[600]}] to-[${forestPalette.teal[700]}]`,
  burgundy: `from-[${forestPalette.burgundy[500]}] to-[${forestPalette.burgundy[600]}]`,

  // Semantic gradients
  primary: `from-[${forestPalette.forest[500]}] to-[${forestPalette.forest[700]}]`,
  secondary: `from-[${forestPalette.sand[500]}] to-[${forestPalette.sand[700]}]`,
  accent: `from-[${forestPalette.earth[400]}] to-[${forestPalette.earth[600]}]`,
} as const;

// =============================================================================
// TYPE-BASED COLOR MAPPINGS
// For components that need type→color mapping (e.g., tribe types)
// =============================================================================

export const typeColorMap = {
  study: 'secondary',
  specialty: 'accent',
  wellness: 'primary',
  cause: 'primary',
} as const;

// CSS variable names for Tailwind mapping
export const cssVarNames = {
  // Surfaces
  '--surface-default': 'surface-default',
  '--surface-elevated': 'surface-elevated',
  '--surface-muted': 'surface-muted',
  '--surface-subtle': 'surface-subtle',

  // Backgrounds
  '--bg-primary': 'bg-primary',
  '--bg-secondary': 'bg-secondary',

  // Primary
  '--primary': 'primary',
  '--primary-hover': 'primary-hover',
  '--primary-light': 'primary-light',
  '--primary-foreground': 'primary-foreground',

  // Secondary
  '--secondary': 'secondary',
  '--secondary-hover': 'secondary-hover',
  '--secondary-light': 'secondary-light',
  '--secondary-foreground': 'secondary-foreground',

  // Accent
  '--accent': 'accent',
  '--accent-hover': 'accent-hover',
  '--accent-light': 'accent-light',
  '--accent-foreground': 'accent-foreground',

  // Text
  '--text-primary': 'text-primary',
  '--text-secondary': 'text-secondary',
  '--text-muted': 'text-muted',
  '--text-inverse': 'text-inverse',

  // Border
  '--border': 'border-default',
  '--border-light': 'border-light',
  '--border-focus': 'border-focus',

  // Status
  '--success': 'success',
  '--success-light': 'success-light',
  '--warning': 'warning',
  '--warning-light': 'warning-light',
  '--error': 'error',
  '--error-light': 'error-light',
  '--info': 'info',
  '--info-light': 'info-light',
} as const;

export type SemanticColor = keyof typeof cssVarNames;
