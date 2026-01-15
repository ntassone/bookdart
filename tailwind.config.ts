import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    'animate-ping-sm',
    'animate-ping-md',
    'animate-ping-lg',
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      borderRadius: {
        'DEFAULT': '1px',
        'none': '0',
        'sm': '1px',
        'md': '1px',
        'lg': '1px',
        'xl': '1px',
        '2xl': '1px',
        '3xl': '1px',
        'full': '1px',
      },
      keyframes: {
        'ping-sm': {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(52px)' }, // 64px - 12px
        },
        'ping-md': {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(80px)' }, // 96px - 16px
        },
        'ping-lg': {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(108px)' }, // 128px - 20px
        },
      },
      animation: {
        'ping-sm': 'ping-sm 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite',
        'ping-md': 'ping-md 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite',
        'ping-lg': 'ping-lg 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite',
      },
    },
  },
  plugins: [],
};
export default config;
