var path = require('path');
var args = require('minimist')(process.argv.slice(2));

// List of allowed environments
var allowedEnvs = ['dev', 'prod'];

// Set the correct environment
var env;
if (args.env) {
  env = args.env;
} else {
  env = 'dev';
}

// Get available configurations
var configs = {
  dev: path.join(__dirname, '/configs/dev'),
  prod: path.join(__dirname, '/configs/prod')
};

/**
 * Get an allowed environment
 * @param  {String}  env
 * @return {String}
 */
function getValidEnv(env) {
  var isValid = env && env.length > 0 && allowedEnvs.indexOf(env) !== -1;
  return isValid ? env : 'dev';
}

/**
 * Build the webpack configuration
 * @param  {String} env Environment to use
 * @return {Object} Webpack config
 */
function buildConfig(env) {
  var usedEnv = getValidEnv(env);
  return require(configs[usedEnv]);
}

module.exports = buildConfig(env);
