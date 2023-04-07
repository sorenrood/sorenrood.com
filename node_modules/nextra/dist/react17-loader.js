function react17Loader (source, map) {
  this.cacheable();
  source = '/* @jsxRuntime classic */\n' + source;
  this.callback(null, source, map);
}

module.exports = react17Loader;
