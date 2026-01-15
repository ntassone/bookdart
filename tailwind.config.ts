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
    },
  },
  plugins: [],
};
export default config;
