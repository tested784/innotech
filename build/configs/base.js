var path = require('path');
var serverConfig = require(path.resolve(__dirname, "../serverConfig.js"));
var WebpackNotifierPlugin = require('webpack-notifier');
var outputName = 'app';
var autoprefixer = require('autoprefixer');
var precss = require('precss');

try {
  outputName = serverConfig.outputName;
} catch (e) {
  console.log('Cannot find serverConfig.js file. Using default app.js output file. \n');
}

module.exports = {
  entry: {
    app: path.resolve(__dirname, serverConfig.srcPath + "/js/app.js")
  },
  output: {
    path: path.resolve(__dirname, serverConfig.publicPath),
    filename: 'js/' + outputName + '.js'
  },
  resolve: {
    root: [path.resolve(__dirname, serverConfig.srcPath + "/js"), path.resolve(__dirname, '../node_modules')],
    extensions: ['', '.js']
  },
  resolveLoader: {
    root: [path.resolve(__dirname, '../node_modules')]
  },
  module: {
    loaders: [{
      test: /\.(jpe?g|png|gif)$/i,
      loaders: ['file?hash=sha512&digest=hex&name=[path][name].[ext]&context=' + serverConfig.srcPath, 'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false']
    }, {
      test: /\.svg$/,
      loader: 'svg-sprite?' + JSON.stringify({
        name: '[name]',
        prefixize: true
      })
    }]
  },
  postcss: function () {
    return [autoprefixer, precss];
  },
  plugins: [
    new WebpackNotifierPlugin({
      contentImage: path.join(__dirname, './assets/burst-logo-vulkaan.png')
    })
  ]
};