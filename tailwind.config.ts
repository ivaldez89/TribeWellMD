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
        // LANDING PAGE COLORS
        // Semantic tokens for landing/marketing pages
        // =============================================================
        landing: {
          header: 'var(--landing-header-bg)',
          'logo-accent': 'var(--landing-logo-accent)',
          'hero-accent': 'var(--landing-hero-accent)',
          'feature-from': 'var(--landing-feature-from)',
          'feature-to': 'var(--landing-feature-to)',
        },

        // =============================================================
        // 🔒 LOCKED FOREST THEME RAW PALETTE
        // For gradient definitions and legacy compatibility ONLY
        // Do NOT use these directly in components - use semantic tokens
        // =============================================================

        // Forest greens (mapped to approved palette)
        forest: {
          400: '#6E847D',  /* primary-soft */
          500: '#556B5E',  /* primary */
          600: '#405549',  /* primary-strong */
        },

        // Sand/earth (mapped to approved palette)
        sand: {
          400: '#B2ADA7',  /* secondary */
          600: '#786551',  /* secondary-strong */
          700: '#786551',  /* secondary-strong */
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
        'float-slow': 'float-slow 60s ease-in-out infinite',
        'float-diagonal': 'float-diagonal 45s ease-in-out infinite',
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
        'float-slow': {
          '0%, 100%': {
            transform: 'translate(0, 0) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -30px) scale(1.05)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.98)',
          },
        },
        'float-diagonal': {
          '0%, 100%': {
            transform: 'translate(0, 0) rotate(0deg)',
          },
          '50%': {
            transform: 'translate(40px, 40px) rotate(2deg)',
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
