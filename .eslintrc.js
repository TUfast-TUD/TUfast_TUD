module.exports = {
  env: {
    browser: true,
    es2021: true,
    webextensions: true,
    jquery: true
  },
  extends: ['standard'],
  parser: '@typescript-eslint/parser',
  plugins: ['promise', '@typescript-eslint'],
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
