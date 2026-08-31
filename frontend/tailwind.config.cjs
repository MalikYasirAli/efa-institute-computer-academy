module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx,html}'],
  theme: {
    extend: {
      colors: {
        'efa-navy': {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#071133',
          700: '#041023'
        },
        'efa-indigo': {
          400: '#6366f1',
          500: '#4f46e5'
        },
        'efa-lime': {
          400: '#a3e635',
          500: '#84cc16'
        },
        neutral: {
          100: '#f7fafc',
          200: '#f1f5f9',
          400: '#94a3b8',
          700: '#334155'
        }
      },
      borderRadius: {
        lg: '12px'
      }
    }
  },
  plugins: [],
  darkMode: 'class'
};
