/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        graph: {
          bg: '#0f1117',
          panel: '#1a1d27',
          border: '#2a2d3e',
          accent: '#6366f1',
          'accent-hover': '#818cf8',
          text: '#e2e8f0',
          muted: '#64748b',
          node: {
            character: '#6366f1',
            faction: '#f59e0b',
            event: '#10b981',
            item: '#3b82f6',
            location: '#ec4899',
            concept: '#8b5cf6',
            evidence: '#94a3b8'
          }
        }
      }
    }
  },
  plugins: []
}
