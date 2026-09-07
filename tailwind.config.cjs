const forms = require('@tailwindcss/forms');

module.exports = {
  content: ['./src/main/webapp/**/*.{html,ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        'sc-primary': '#0d2538',
        'sc-accent': '#f59e0b',
        'sc-muted': '#6b7280',
      },
      boxShadow: {
        card: '0 20px 35px -15px rgba(13, 37, 56, 0.25)',
      },
      backgroundImage: {
        'sc-hero':
          'radial-gradient(circle at top, rgba(245, 158, 11, 0.25), transparent 60%), linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
      },
    },
  },
  plugins: [forms],
};
