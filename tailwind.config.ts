import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Custom spacing - strict 4pt/8pt system
      spacing: {
        '0': '0',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
        '32': '128px',
      },
      // Typography
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '1.5' }],
        sm: ['14px', { lineHeight: '1.5' }],
        base: ['16px', { lineHeight: '1.5' }],
        lg: ['18px', { lineHeight: '1.4' }],
        xl: ['20px', { lineHeight: '1.4' }],
        '2xl': ['24px', { lineHeight: '1.4' }],
        '3xl': ['30px', { lineHeight: '1.3' }],
        '4xl': ['36px', { lineHeight: '1.2' }],
      },
      // Colors
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        neutral: {
          0: '#ffffff',
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        semantic: {
          success: '#10b981',
          'success-light': '#d1fae5',
          warning: '#f59e0b',
          'warning-light': '#fef3c7',
          error: '#ef4444',
          'error-light': '#fee2e2',
          info: '#3b82f6',
          'info-light': '#dbeafe',
        },
      },
      // Border radius
      borderRadius: {
        none: '0',
        sm: '6px',
        DEFAULT: '8px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
      },
      // Shadows
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        none: 'none',
      },
      // Transitions
      transitionDuration: {
        DEFAULT: '150ms',
        fast: '100ms',
        normal: '150ms',
        slow: '300ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      // Focus ring
      ringWidth: {
        DEFAULT: '2px',
      },
      ringOffsetWidth: {
        DEFAULT: '2px',
      },
      ringColor: {
        DEFAULT: 'rgb(14 165 233)',
      },
    },
  },
  plugins: [],
}

export default config
