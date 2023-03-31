const withNextra = require('nextra')('nextra-theme-blog', './theme.config.js')
module.exports = withNextra({
  webpack(config) {
      config.plugins.pop(); // remove stork plugin which was added by nextra. Remove when nextra version is bumped!
      return config;
  }
});