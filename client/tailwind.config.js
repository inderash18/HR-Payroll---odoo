/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#e8edf5',
        app: '#ffffff',
        surface: '#f8fafc',
        elevated: '#f1f5f9',
        sidebar: '#0d0f12',
        primary: {
          DEFAULT: '#0f1217',
          hover: '#1e2229',
          soft: '#f1f5f9',
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        slate: {
          850: '#151b28',
          900: '#0f172a',
          950: '#0d0f12',
        },
        success: {
          bg: '#f0fdf4',
          border: '#bbf7d0',
          text: '#166534',
          accent: '#15803d',
        },
        warning: {
          bg: '#fffbeb',
          border: '#fef3c7',
          text: '#92400e',
          accent: '#d97706',
        },
        danger: {
          bg: '#fef2f2',
          border: '#fecaca',
          text: '#991b1b',
          accent: '#dc2626',
        },
        info: {
          bg: '#eff6ff',
          border: '#bfdbfe',
          text: '#1e40af',
          accent: '#2563eb',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
        md: '0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04)',
        lg: '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
        card: '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.03)',
      },
    },
  },
  plugins: [],
}
