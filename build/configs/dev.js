var path = require('path');
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var precss = require('precss');
var _ = require('lodash');

var baseConfig = require('./base.js');

// Merge new config parts with base config
var config = _.merge({
  cache: true,
  devtool: 'eval'
}, baseConfig);

// Add needed loaders
config.module.loaders.push(
  {
    test: /\.html$/,
    loader: 'handlebars'
  }, {
    test: [/\.scss$/, /\.sass$/],
    loaders: ["style-loader", "raw-loader", "postcss-loader", "sass-loader"]
  }
);

module.exports = config;