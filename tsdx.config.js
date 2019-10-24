const postcss = require('rollup-plugin-postcss');
const cssnano = require('cssnano');

module.exports = {
  rollup(config, options) {
    config.plugins.push(
      postcss({
        plugins: [
          cssnano({
            preset: 'default',
          }),
        ],
        inject: false,
        // extract: true,
        extract: !!options.writeMeta,
      })
    );
    return config;
  },
};
