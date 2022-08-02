module.exports = {
  env: {
    browser: true,
    es2021: true,
    webextensions: true,
    jquery: true
  },
  parser: '@typescript-eslint/parser',
  plugins: ['promise', '@typescript-eslint'],
  extends: [
    'standard',
    'plugin:vue/vue3-recommended',
  ],
  rules: {
    'prefer-arrow-callback': 'warn',
    'no-unused-vars': 'warn', // This should be no error!
    semi: ['warn', 'never'],
    quotes: ['warn', 'single', { avoidEscape: true }],
    'spaced-comment': 'warn',
    'no-multiple-empty-lines': 'warn',
    'eol-last': 'warn'
  }
}
