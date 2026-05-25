import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0f14',
        foreground: '#ebf4ff',
        accent: '#00d1b2',
        panel: '#101821',
        border: '#1d2a36',
      },
    },
  },
  plugins: [],
};

export default config;

