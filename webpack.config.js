/* global process */

const fs = require('fs');
const path = require('path');

const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

const env = process.env; // eslint-disable-line no-process-env
const isProd = env.NODE_ENV === 'production';

function makeConfig() {
  const config = {
    mode: isProd ? 'production' : 'development',
    devtool: isProd ? false : 'source-map',
    entry: { 'html-highlighter': './src/main.js' },
    output: {
      path: path.join(__dirname, 'dist'),
      filename: isProd ? '[name].min.js' : '[name].js',
      library: '[name]',
      libraryTarget: 'umd',
      umdNamedDefine: true,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                // This is a feature of `babel-loader` for webpack (not Babel itself), which enables
                // caching results in `./node_modules/.cache/babel-loader/` directory for faster
                // rebuilds.
                cacheDirectory: true,
                cacheCompression: isProd,
                compact: isProd,
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        __DEV__: !isProd,
        __PROD__: isProd,
      }),
      new webpack.BannerPlugin(fs.readFileSync('./LICENSE', 'utf8')),
    ],
  };

  if (!isProd) return config;

  config.optimization = {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          parse: {
            // We want terser to parse ecma 8 code. However, we don't want it to apply any
            // minification steps that turns valid ecma 5 code into invalid ecma 5 code. This is
            // why the 'compress' and 'output' sections only apply transformations that are ecma
            // 5 safe.
            // https://github.com/facebook/create-react-app/pull/4234
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            // Disabled because of an issue with Uglify breaking seemingly valid code:
            // https://github.com/facebook/create-react-app/issues/2376
            //
            // Pending further investigation:
            // https://github.com/mishoo/UglifyJS2/issues/2011
            comparisons: false,
            // Disabled because of an issue with Terser breaking valid code:
            // https://github.com/facebook/create-react-app/issues/5250
            //
            // Pending further investigation:
            // https://github.com/terser-js/terser/issues/120
            inline: 2,
          },
          mangle: {
            safari10: true,
          },
          // TODO: unclear what this does; look in create-react-app for clues.
          keep_classnames: false,
          keep_fnames: false,
          output: {
            ecma: 5,
            comments: false,
            // Turned on because emoji and regex is not minified properly using default
            // https://github.com/facebook/create-react-app/issues/2488
            ascii_only: true,
          },
        },
        sourceMap: false,
      }),
    ],
  };

  return config;
}

module.exports = makeConfig();
