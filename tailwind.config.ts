import type { Config } from "tailwindcss";

/**
 * TribeWellMD Tailwind Configuration
 *
 * SEMANTIC COLOR SYSTEM:
 * All colors reference CSS variables defined in globals.css
 * Components should use semantic class names like:
 * - bg-surface, bg-surface-elevated, bg-surface-muted
 * - bg-primary, bg-secondary, bg-accent
 * - text-primary, text-secondary, text-muted
 * - border-default, border-light
 *
 * DO NOT use raw color names in components (e.g., forest-500, sand-300)
 * Those are only for the token definitions.
 */

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-source-serif)', 'Georgia', 'serif'],
      },
      colors: {
        // =============================================================
        // SEMANTIC COLORS - Use these in components
        // =============================================================

        // Surfaces (cards, inputs, containers)
        surface: {
          DEFAULT: 'var(--surface-default)',
          elevated: 'var(--surface-elevated)',
          muted: 'var(--surface-muted)',
          subtle: 'var(--surface-subtle)',
        },

        // Page backgrounds
        background: {
          DEFAULT: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
        },

        // Primary brand color (main CTAs, active states)
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          light: 'var(--primary-light)',
          foreground: 'var(--primary-foreground)',
        },

        // Secondary brand color
        secondary: {
          DEFAULT: 'var(--secondary)',
          hover: 'var(--secondary-hover)',
          light: 'var(--secondary-light)',
          foreground: 'var(--secondary-foreground)',
        },

        // Accent color (highlights, badges)
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          light: 'var(--accent-light)',
          foreground: 'var(--accent-foreground)',
        },

        // Text colors
        'content': {
          DEFAULT: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          inverse: 'var(--text-inverse)',
        },

        // Border colors
        'border': {
          DEFAULT: 'var(--border)',
          light: 'var(--border-light)',
          focus: 'var(--border-focus)',
        },

        // Status colors
        success: {
          DEFAULT: 'var(--success)',
          light: 'var(--success-light)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          light: 'var(--warning-light)',
        },
        error: {
          DEFAULT: 'var(--error)',
          light: 'var(--error-light)',
        },
        info: {
          DEFAULT: 'var(--info)',
          light: 'var(--info-light)',
        },

        // =============================================================
        // RAW PALETTE - For token definitions & gradients ONLY
        // Do NOT use these directly in components
        // =============================================================

        // Forest greens
        forest: {
          50: '#F4F7F5',
          100: '#E8EFE9',
          200: '#C5D6C8',
          300: '#9BBAA1',
          400: '#6B8B7D',
          500: '#5B7B6D',
          600: '#3D5A4C',
          700: '#2D4A3C',
          800: '#1E3D2F',
          900: '#152E22',
          950: '#0A1A12',
        },

        // Earth/terracotta
        earth: {
          50: '#FAF5F4',
          100: '#F5E8E6',
          200: '#E8D0CC',
          300: '#D4ADA5',
          400: '#B87D73',
          500: '#A65D4D',
          600: '#8B4A3D',
          700: '#6B3A30',
          800: '#4A2920',
          900: '#3A1F18',
          950: '#1F100C',
        },

        // Burgundy
        burgundy: {
          50: '#FAF4F4',
          100: '#F5E6E6',
          200: '#E8CCCC',
          300: '#D4A5A5',
          400: '#B87373',
          500: '#8B3A3A',
          600: '#703030',
          700: '#552424',
          800: '#4A1F1F',
          900: '#3A1818',
          950: '#1F0C0C',
        },

        // Teal
        teal: {
          50: '#F2F7F8',
          100: '#E4EEF0',
          200: '#C5DCE0',
          300: '#9BC5CC',
          400: '#6BA3AD',
          500: '#4A8A96',
          600: '#3D717A',
          700: '#2D5A63',
          800: '#2D4A5A',
          900: '#1E3D47',
          950: '#0F2229',
        },

        // Sand/bark
        sand: {
          50: '#FDFCFA',
          100: '#F9F6F2',
          200: '#F0E9E0',
          300: '#E4D8C9',
          400: '#D4C4B0',
          500: '#C4A77D',
          600: '#A89070',
          700: '#8B7355',
          800: '#6B5344',
          900: '#4A3A30',
          950: '#2A201A',
        },

        // Sage (brand green - for legacy compatibility)
        sage: {
          50: '#F4F9F6',
          100: '#E6F2EC',
          200: '#CCE5D9',
          300: '#A3D1BC',
          400: '#73B89A',
          500: '#5DB075',
          600: '#4A9962',
          700: '#3D7D50',
          800: '#346542',
          900: '#2C5338',
          950: '#152E1D',
        },

        // =============================================================
        // LEGACY COLORS - Maintained for backward compatibility
        // Migrate these to semantic tokens over time
        // =============================================================

        // Legacy tribe colors (alias to new palette)
        tribe: {
          sage: {
            50: '#F4F9F6',
            100: '#E6F2EC',
            200: '#CCE5D9',
            300: '#A3D1BC',
            400: '#73B89A',
            500: '#5DB075',
            600: '#4A9962',
            700: '#3D7D50',
            800: '#346542',
            900: '#2C5338',
            950: '#152E1D',
          },
          coral: {
            50: '#fdf5f5',
            100: '#fae8e8',
            200: '#f5d4d4',
            300: '#e8b4b4',
            400: '#d68f8f',
            500: '#c26b6b',
            600: '#a85454',
            700: '#8c4444',
            800: '#743a3a',
            900: '#613434',
            950: '#341919',
          },
          sky: {
            50: '#f2f8fc',
            100: '#e3eff8',
            200: '#c1dff0',
            300: '#8bc5e3',
            400: '#4da5d3',
            500: '#4A90D9',
            600: '#2570b3',
            700: '#205a91',
            800: '#1e4c78',
            900: '#1e4164',
            950: '#142a43',
          },
        },

        // Legacy medical colors
        medical: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
      },
      boxShadow: {
        // Soft, nature-inspired shadows
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.04)',
        'soft-md': '0 4px 12px rgba(0, 0, 0, 0.05), 0 8px 24px rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 8px 24px rgba(0, 0, 0, 0.06), 0 16px 48px rgba(0, 0, 0, 0.06)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
