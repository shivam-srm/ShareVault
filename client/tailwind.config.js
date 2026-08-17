/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: ['class', '[data-mode="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fade-up 0.8s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fade-in 0.6s ease-out both',
        'scale-in': 'scale-in 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'float-slow': 'float-slow 8s ease-in-out infinite',
        'blob': 'blob 18s ease-in-out infinite',
        'aurora': 'aurora-drift 20s ease-in-out infinite',
        'gradient': 'gradient-shift 6s ease infinite',
        'pulse-glow': 'pulse-glow 2.5s ease-out infinite',
      },
    },
  },
  plugins: [],
};
