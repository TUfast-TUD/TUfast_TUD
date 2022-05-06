module.exports = {
  env: {
    browser: true,
    es2021: true,
    webextensions: true,
    jquery: true
  },
  extends: ['standard'],
  plugins: ['promise'],
  rules: {
    'prefer-arrow-callback': 'warn',
    'no-unused-vars': 'warn', // This should be no error!
    semi: ['warn', 'never'],
    quotes: ['warn', 'single', {"avoidEscape": true}]
  }
}
