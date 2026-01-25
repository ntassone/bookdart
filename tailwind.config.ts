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
        warm: {
          border: "var(--color-border)",
          bg: "var(--color-bg)",
          'bg-secondary': "var(--color-bg-secondary)",
          text: "var(--color-text)",
          'text-secondary': "var(--color-text-secondary)",
          'text-tertiary': "var(--color-text-tertiary)",
        },
      },
      borderRadius: {
        'DEFAULT': '2px',
        'none': '0',
        'sm': '2px',
        'md': '2px',
        'lg': '2px',
        'xl': '2px',
        '2xl': '2px',
        '3xl': '2px',
        'full': '9999px',
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
