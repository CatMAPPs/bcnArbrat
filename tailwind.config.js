/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        paper: '#F8F9FA',
        ink: '#111827',
        line: '#E5E7EB',
        muted: '#6B7280',
        risk: {
          low: '#4D7C0F',
          mid: '#D97706',
          high: '#B91C1C'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace']
      }
    }
  },
  plugins: []
};
