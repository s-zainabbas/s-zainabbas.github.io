/** @type {import('tailwindcss').Config} */

// Theme colours point at CSS variables (defined in styles.css), so one set of
// utility classes works in both light and dark mode.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: ['./index.html', './script.js'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        page: token('page'),
        'page-alt': token('page-alt'),
        surface: token('surface'),
        ink: token('ink'),
        muted: token('muted'),
        subtle: token('subtle'),
        accent: token('accent')
      }
    }
  },
  plugins: []
};
