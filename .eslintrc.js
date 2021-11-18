module.exports = {
  env: {
    browser: true,
    es2021: true,
    webextensions: true,
    jquery: true
  },
  extends: [
    'standard',
    'plugin:vue/vue3-recommended',
  ],
  plugins: ['promise'],
  rules: {
    'prefer-arrow-callback': 'warn'
  }
}
