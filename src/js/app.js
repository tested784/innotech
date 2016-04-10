/**
 * JS
 */
require('innotech/app.js');

/**
 *  SASS/SCSS
 */
require('../scss/app.scss');

/**
 *  IMG
 */

// zorgt ervoor dat alle images worden gecompiled
require.context('../img/', true, /\.(jpe?g|png|gif)$/);

/**
 *  SVG
 */

// zorgt ervoor dat alle svg's worden gecompiled naar 1 sprite, die automatisch in de HTML wordt geinject
var files = require.context('../svg', true, /^\.\/.*\.svg$/);
files.keys().forEach(files);