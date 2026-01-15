/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#09090b', // zinc-950
        panel: '#18181b',  // zinc-900
        surface: '#27272a', // zinc-800
        border: '#3f3f46', // zinc-700
        primary: {
          DEFAULT: '#06b6d4', // cyan-500
          hover: '#22d3ee',   // cyan-400
          foreground: '#000000',
        },
        accent: {
          DEFAULT: '#f59e0b', // amber-500
          hover: '#fbbf24',   // amber-400
          foreground: '#000000',
        },
        success: '#10b981', // emerald-500
        warning: '#f59e0b', // amber-500
        danger: '#f43f5e',  // rose-500
        text: {
          primary: '#f4f4f5', // zinc-100
          secondary: '#a1a1aa', // zinc-400
          muted: '#71717a', // zinc-500
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'liberation mono', 'courier new', 'monospace'],
      },
    },
  },
  plugins: [],
}