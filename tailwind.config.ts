import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        card: '0 20px 50px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
