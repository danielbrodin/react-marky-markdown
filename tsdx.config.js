const copy = require('rollup-plugin-copy-assets');

module.exports = {
  rollup(config, options) {
    config.plugins.push(
      copy({
        assets: ['src/styles.css'],
      })
    );
    return config;
  },
};
