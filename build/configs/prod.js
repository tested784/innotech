var path = require('path');
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var precss = require('precss');
var _ = require('lodash');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var failPlugin = require('webpack-fail-plugin');

var baseConfig = require('./base.js');

// Merge new config parts with base config
var config = _.merge({
  cache: true,
  devtool: 'eval',
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: false,
      mangle: false
    }),
    new ExtractTextPlugin("css/app.css"),
    failPlugin
  ]
}, baseConfig);

// Add needed loaders
config.module.loaders.push(
  {
    test: /\.html$/,
    loader: 'handlebars'
  },
    {
      test   : /\.(ttf|eot|svg|woff(2))(\?[a-z0-9]+)?$/,
      loader : 'file-loader'
    },
  {
    test: [/\.scss$/, /\.sass$/],
    loader: ExtractTextPlugin.extract("style-loader", "css-loader?minimize!postcss-loader!sass-loader")
  }
);

module.exports = config;