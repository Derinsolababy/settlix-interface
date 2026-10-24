import type { Config } from 'tailwindcss';

// Receipt paper and ink, one warm accent, and a ledger green for settled money.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F3EEE3',
        card: '#FBF8F2',
        ink: '#1C1B19',
        muted: '#6B655B',
        rule: '#D9D1C1',
        accent: { DEFAULT: '#B5482A', dark: '#8F3720', soft: '#F2DDD3' },
        settled: { DEFAULT: '#2F6B4F', soft: '#DCEBE1' },
        caution: { DEFAULT: '#8A5A00', soft: '#F5E7C8' },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        receipt: '0 1px 0 #D9D1C1, 0 18px 40px -24px rgba(28, 27, 25, 0.45)',
      },
    },
  },
  plugins: [],
};
export default config;
