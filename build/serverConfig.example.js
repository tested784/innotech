var path = require('path');

module.exports = {
  outputName: "app",
  srcPath: path.resolve(__dirname, "../pad/naar/src"), // relatief vanuit /build map
  publicPath: path.resolve(__dirname, "../pad/naar/public") // relatief vanuit /build map
};