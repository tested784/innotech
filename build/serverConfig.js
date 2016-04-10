var path = require('path');

module.exports = {
    outputName: "app",
    srcPath: path.resolve(__dirname, "../src"), // relatief vanuit /build map
    publicPath: path.resolve(__dirname, "../public") // relatief vanuit /build map
};