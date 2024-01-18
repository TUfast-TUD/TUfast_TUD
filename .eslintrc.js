module.exports = {
  env: {
    browser: true,
    es2021: true,
    webextensions: true,
    jquery: true
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser'
  },
  plugins: ['promise', '@typescript-eslint'],
  extends: ['standard', 'plugin:vue/vue3-recommended', 'prettier'],
  rules: {
    'no-unused-vars': 'warn', // This should be no error!
    'spaced-comment': 'warn',
    'eol-last': 'warn',
    'vue/multi-word-component-names': 'off'
  }
}
