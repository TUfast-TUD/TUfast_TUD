// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    'src': { url: '/' },
  },
  plugins: [
    '@snowpack/plugin-sass',
  ],
  packageOptions: {
    knownEntrypoints: [
      'dayjs',
      'dayjs/plugin/customParseFormat'
    ]
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    metaUrlPath: 'snowpack',
  },
};
