/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        theme: {
          base: 'var(--bg-base)',
          surface: 'var(--bg-surface)',
          muted: 'var(--bg-muted)',
          subtle: 'var(--bg-subtle)',
          accent: 'var(--accent)',
          'accent-hover': 'var(--accent-hover)',
          'accent-secondary': 'var(--accent-secondary)',
          'accent-muted': 'var(--accent-muted)',
          'accent-border': 'var(--accent-muted-border)',
          text: 'var(--text)',
          'text-muted': 'var(--text-muted)',
          'text-subtle': 'var(--text-subtle)',
          border: 'var(--border)',
          'border-muted': 'var(--border-muted)',
        },
      },
      backgroundColor: {
        theme: {
          base: 'var(--bg-base)',
          surface: 'var(--bg-surface)',
          muted: 'var(--bg-muted)',
          subtle: 'var(--bg-subtle)',
        },
      },
      borderColor: {
        theme: {
          DEFAULT: 'var(--border)',
          muted: 'var(--border-muted)',
          accent: 'var(--accent-muted-border)',
        },
      },
      boxShadow: {
        'theme-sm': 'var(--shadow-sm)',
        theme: 'var(--shadow)',
        'theme-md': 'var(--shadow-md)',
        'theme-lg': 'var(--shadow-lg)',
        'theme-card': 'var(--shadow-card)',
      },
    },
  },
  plugins: [],
};
