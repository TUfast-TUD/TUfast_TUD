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
  plugins: ['promise', '@typescript-eslint', '@intlify/vue-i18n'],
  extends: ['standard', 'plugin:vue/vue3-recommended', 'prettier'],
  settings: {
    'vue-i18n': {
      localeDir: './src/i18n/locales/*.json',
      messageSyntaxVersion: '^11.0.0'
    }
  },
  overrides: [
    {
      files: ['**/*.json'],
      parser: 'jsonc-eslint-parser'
    }
  ],
  rules: {
    'no-unused-vars': 'warn', // This should be no error!
    'spaced-comment': 'warn',
    'eol-last': 'warn',
    'vue/multi-word-component-names': 'off',
    '@intlify/vue-i18n/no-missing-keys': 'error',
    '@intlify/vue-i18n/no-missing-keys-in-other-locales': 'error',
    '@intlify/vue-i18n/valid-message-syntax': 'error',
    '@intlify/vue-i18n/no-raw-text': [
      'error',
      {
        attributes: {
          '/.+/': ['title', 'aria-label', 'aria-placeholder', 'aria-roledescription', 'aria-valuetext'],
          input: ['placeholder'],
          textarea: ['placeholder'],
          img: ['alt']
        },
        ignorePattern: '^[\\s\\d:#+,!\\-()./&\\u2192]+$',
        ignoreText: [
          'Alt',
          'Q',
          'O',
          'M',
          'AKORA',
          'Tom Braun',
          'Fugi',
          'Lennart Guderian',
          'Oliver Hausdörfer',
          'Daniel Kluge',
          'Jan Polzer',
          'Steen Thomsen',
          'DigitalAcceleratorProgramm des Stifterverbands',
          'output.dd Projektschau',
          'BuyMeACoffee',
          'frage@tu-fast.de',
          'TUfast TU Dresden',
          'MHSTKUIKTTHPQAZNVWQBJE5YQ2WACQQP'
        ]
      }
    ]
  }
}
