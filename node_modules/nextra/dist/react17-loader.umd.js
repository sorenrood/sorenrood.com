(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.nextra = factory());
}(this, (function () {
  function react17Loader (source, map) {
    this.cacheable();
    source = '/* @jsxRuntime classic */\n' + source;
    this.callback(null, source, map);
  }

  return react17Loader;

})));
