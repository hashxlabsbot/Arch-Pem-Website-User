/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: { blue: '#3b82f6', navy: '#0f172a', green: '#10b981' },
      },
    },
  },
  // Disable preflight so landing page CSS controls base styles
  corePlugins: { preflight: false },
  plugins: [],
}
