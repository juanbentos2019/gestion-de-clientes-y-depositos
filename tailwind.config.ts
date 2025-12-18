import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fdfcf7',
          100: '#fbf8ed',
          200: '#f6eed1',
          300: '#f1e4b5',
          400: '#e7cf7d',
          500: '#ddbb45',
          600: '#c7a93e',
          700: '#a68d34',
          800: '#85712a',
          900: '#6d5d23',
        },
      },
    },
  },
  plugins: [],
};

export default config;
