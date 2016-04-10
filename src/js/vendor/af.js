// af.js

// Copyright (C) Always & Forever Computer Entertainment, LLC - All Rights Reserved.
// Unauthorized copying of this file by any medium is strictly prohibited.
// Proprietary and confidential. Written by George Michael Brower <george@aaf.nyc>, 2015.
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Promise = require( 'utils/Promise' );
var extend = require( 'utils/extend' );
var defaults = require( 'utils/defaults' );

// kinda messy: define basePath up before export & type requires
// as some types might need to know its value.
assets.basePath = 'assets/'

module.exports = assets;

var types = {
    atlas:   require( 'assets/atlas' ),
    buffer:  require( 'assets/buffer' ),
    cube:    require( 'assets/cube' ),
    dom:     require( 'assets/dom' ),
    image:   require( 'assets/image' ),
    json:    require( 'assets/json' ),
    obj:     require( 'assets/obj' ),
    sample:  require( 'assets/sample' ),
    text:    require( 'assets/text' ),
    texture: require( 'assets/texture' ),
    spritesheet: require( 'assets/spritesheet' ),

};

function assets( path ) {

    if ( !assets.loaded.hasOwnProperty( path ) ) {
        throw new Error( 'Request for unloaded asset: ' + path );
    }

    return assets.loaded[ path ];

};

extend( assets, {

    loaded: {},
    promises: {},
    processed: {},

    process: function() {
        for ( var i in assets.loaded ) {
            var loader = assets.getType( i );
            if ( loader.process && !assets.processed[ i ] ) {
                assets.loaded[ i ] = loader.process( assets.loaded[ i ] );
                assets.processed[ i ] = true;
            }
        }
    },

    getType: function( path ) {

        var split = path.split( '/' );
        var key = split[ split.length - 2 ];
        return types[ key ];

    },

    load: function( opts ) {

        if ( opts.assets.length === 0 ) {
            var p = new Promise();
            p.resolve();
            return p;
        }

        var loaded = 0;
        var promises = [];

        opts.assets.forEach( function( path ) {

            var loader = assets.getType( path );
            if ( !loader ) {
                throw new Error( 'Unrecognized asset prefix: ' + path );
            }

            var promise = assets.promises[ path ];

            if ( !promise ) {

                promise = assets.promises[ path ] = new Promise();

                loader.load( assets.basePath + path, function( asset ) {
                    assets.loaded[ path ] = asset;
                    promise.resolve();
                } );

            }

            promise.then( function() {

                loaded++;

                if ( opts.loader ) {
                    opts.loader( loaded / opts.assets.length, loaded, opts.assets.length, path );
                }

            } );

            promises.push( promise );

        } );

        return Promise.all( promises );

    }

} );
},{"assets/atlas":2,"assets/buffer":3,"assets/cube":4,"assets/dom":5,"assets/image":6,"assets/json":7,"assets/obj":8,"assets/sample":9,"assets/spritesheet":10,"assets/text":11,"assets/texture":12,"utils/Promise":50,"utils/defaults":54,"utils/extend":55}],2:[function(require,module,exports){
var xhr     = require( 'utils/xhr' );
var Promise = require( 'utils/Promise' );

var assets  = require( 'assets' );
var image   = require( 'assets/image' );
var texture = require( 'assets/texture' );

var TextureAtlas = require( 'three/TextureAtlas' );

var PATH_INDEX = /\{(\d+)\}/;

// for three.js, requires three/TextureAtlas module

// atlas/textures{n}.json
// where atlas/textures[0-n].json
// and atlas/textures[0-n].png exists

module.exports = {

    load: function( metaPath, success, error ) {

        var match = metaPath.match( PATH_INDEX );
        var numSheets;

        if ( match ) {
            numSheets = match[ 1 ];
        } else {
            error && error( 'Invalid TextureAtlas meta path: ' + metaPath );
            return;
        }

        var promises = [];
        var rawAtlas = [];

        for ( var i = 0; i < numSheets; i++ ) {
            loadSheet( i );
        }

        function loadSheet( i ) {

            var jsonPath = metaPath.replace( PATH_INDEX, i );
            var promise = new Promise();

            xhr.get( jsonPath, function( text ) {

                var json = JSON.parse( text );
                var imagePath = assets.basePath + json.meta.image;

                var rawSheet = {
                    image: null,
                    json: json
                };

                rawAtlas.push( rawSheet );

                image.load( imagePath, function( image ) {

                    rawSheet.image = image;
                    promise.resolve();

                }, error );

            }, error );

            promises.push( promise );

        };

        Promise.all( promises ).then( function() {

            success( rawAtlas );

        } );

    },

    process: function( atlasData ) {

        var sheets = [];

        for ( var i = 0, l = atlasData.length; i < l; i++ ) {

            var data = atlasData[ i ];
            var tex = texture.process( data.image );

            // json has already been 'processed' in load
            var json = data.json;
            var sheet = new TextureAtlas.Sheet( tex, json );

            sheets.push( sheet );

        }

        return new TextureAtlas( sheets );

    }

}


},{"assets":1,"assets/image":6,"assets/texture":12,"three/TextureAtlas":47,"utils/Promise":50,"utils/xhr":62}],3:[function(require,module,exports){
var xhr = require( 'utils/xhr' );
module.exports = { load: xhr.getBuffer };
},{"utils/xhr":62}],4:[function(require,module,exports){
var Promise = require( 'utils/Promise' );

var suffixes = [ 'px', 'nx', 'py', 'ny', 'pz', 'nz' ];

module.exports = {

    load: function( path, load, error ) {

        var images = [];

        var promises = [];

        for ( var i = 0, l = suffixes.length; i < l; i++ ) {

            var img = new Image();
            var p = new Promise();

            promises.push( p );

            images.push( img );

            img.onload = p.resolve;
            img.onerror = p.reject;

        }

        for ( var i = 0, l = suffixes.length; i < l; i++ ) {
            images[ i ].src = path.replace( '*', suffixes[ i ] );
        }

        Promise.all( promises ).then( function() {
            load( images )
        } );

    },

    process: function( images ) {
        // console.log( images );
        var cube = new THREE.CubeTexture( images );

        cube.flipY = false;
        cube.needsUpdate = true;

        return cube;

    }

}
},{"utils/Promise":50}],5:[function(require,module,exports){
var xhr = require( 'utils/xhr' );

var el = document.createElement( 'div' );

module.exports = {
    load: xhr.get,
    process: function( text ) {
        el.innerHTML = text;
        return el.firstElementChild;
    }
};
},{"utils/xhr":62}],6:[function(require,module,exports){
module.exports = {
    load: function( path, load, error ) {
        var img = new Image();
        img.onload = function() { load( img ) };
        img.onerror = error;
        img.src = path;
    }
};
},{}],7:[function(require,module,exports){
var xhr = require( 'utils/xhr' );

module.exports = {
    load: xhr.get,
    process: function( text ) {
        return JSON.parse( text );
    }
};
},{"utils/xhr":62}],8:[function(require,module,exports){
var text = require( 'assets/text' );
var ready = require( 'common/ready' );

var loader;

ready.then( function() {
    if ( window.THREE && THREE.OBJLoader ) {
        loader = new THREE.OBJLoader();
    }
} );

module.exports = {
    load: text.load,
    process: function( text ) {
        var obj = loader.parse( text );
        return obj;
    }
}
},{"assets/text":11,"common/ready":21}],9:[function(require,module,exports){
var Sample = require( 'audio/Sample' );
var audio = require( 'common/audio' );
var xhr = require( 'utils/xhr' );

module.exports = {
    load: function( path, load, error ) {
        xhr.getBuffer( path, function( resp ) {
            audio.decodeAudioData( resp, load, error );
        }, error );
    },
    process: function( buffer ) {
        return new Sample( buffer );
    }
};
},{"audio/Sample":13,"common/audio":15,"utils/xhr":62}],10:[function(require,module,exports){
// hacky for slime clock
// doesn't actually "process"

var PATH_INDEX = /\{(\d+)\}/;

// use for pixi.js

// spritesheet/textures{f}
// where spritesheet/textures.json
// and spritesheet/textures.png exists
// and the spritesheet has {f} frames
// assumes the sprites are named textures0000.png internally.

module.exports = {

    load: function( metaPath, success, error ) {

        var match = metaPath.match( PATH_INDEX );
        var numFrames;

        if ( match ) {
            numFrames = parseInt( match[ 1 ] );
        } else {
            error && error( 'Invalid spritesheet meta path: ' + metaPath );
            return;
        }

        var basename = metaPath.replace( PATH_INDEX, '' ).replace( 'spritesheet/', '' );
        var frames = [];

        PIXI.loader.add( metaPath ).load( function() {

            for ( var i = 0; i < numFrames; i++ ) {
                var filename = basename + zeroPad( i, 4 ) + '.png';
                console.log( filename );
                var texture = PIXI.Texture.fromFrame( filename );
                frames.push( texture );
            }

            success( frames );

        } );

    },

    process: function( frames ) {

        return frames;

    }

}

function zeroPad( val, zeros ) {
    for ( var i = val.toString().length; i < zeros; i++ ) {
        val = '0' + val;
    }
    return val;
}
},{}],11:[function(require,module,exports){
var xhr = require( 'utils/xhr' );
module.exports = { load: xhr.get };
},{"utils/xhr":62}],12:[function(require,module,exports){
var image = require( 'assets/image' );


module.exports = {

    load: image.load,

    process: function( img ) {

        if (window.THREE) {

            var tex = new THREE.Texture(img);
            tex.needsUpdate = true;
            return tex;

        } else if (window.PIXI) {

            var src = img.src;

            var baseTexture = new PIXI.BaseTexture( img );
            baseTexture.imageUrl = src;
            PIXI.utils.BaseTextureCache[ src ] = baseTexture;

            baseTexture.resolution = 2;
            // if there is an @2x at the end of the src we are going to assume its a highres image
            if ( src.indexOf( PIXI.RETINA_PREFIX + '.' ) !== -1 ) {
            }

            return new PIXI.Texture( baseTexture );

        } else {

            throw 'I don\'t see PIXI or THREE, so I don\'t know what kind of texture you\'re trying to load.'

        }

    }

}
},{"assets/image":6}],13:[function(require,module,exports){
var audio = require( 'common/audio' );

module.exports = Sample;

function Sample( buffer ) {

    this.buffer = buffer;
    this.needsNewSource = true;

    this.updateSource();


}

Sample.prototype.updateSource = function() {

    this.gain = audio.createGain();
    this.gain.connect( audio.destination );

    this.source = audio.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.connect( this.gain );
    this.needsNewSource = false;

};

Sample.prototype.play =
Sample.prototype.start = function( time, offset, dur ) {

    time = time || 0;
    offset = offset || 0;

    if ( this.needsNewSource ) {
        this.updateSource();
    }

    this.source.loop = this.loop;

    if ( !dur ) {
        this.source.start( audio.currentTime + time );
    } else {
        this.source.start( audio.currentTime + time, offset, dur );
    }

    this.playing = true;
    this.needsNewSource = true;

};

Sample.prototype.stop = function( time ) {

    if ( this.source ) {
        this.source.stop( audio.currentTime + time || 0 );
        // delete this.source;
    }

    this.playing = false;
    this.needsNewSource = true;

};

Sample.prototype.fadeOut = function( dur, time ) {
    time = time || 0;
    this.gain.gain.linearRampToValueAtTime( 0.0, audio.currentTime + time + dur );
    this.playing = false;
    this.needsNewSource = true;

};
},{"common/audio":15}],14:[function(require,module,exports){
var ua = require( 'common/ua' );

if ( !window.THREE ) {
    return;
}

var inverse = new THREE.Quaternion();
var firstPerson = new THREE.Quaternion();

var quat = new THREE.Quaternion();

module.exports = {
    firstPerson: firstPerson,
    inverse: inverse
}

if ( !ua.handheld ) return;

var deviceOrientation = {};
var screenOrientation = 0;

var radians = Math.PI / 180;
var zee = new THREE.Vector3( 0, 0, 1 );
var euler = new THREE.Euler();
var q0 = new THREE.Quaternion();
var q1 = new THREE.Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis

window.addEventListener( 'deviceorientation', onDeviceOrientation, false );
window.addEventListener( 'orientationchange', onOrientationChange, false );

function onOrientationChange() {
    var orient = window.orientation ? window.orientation * radians : 0; // O
    q0.setFromAxisAngle( zee, - orient )
}

function onDeviceOrientation( event ) {

    var alpha  = event.gamma ? event.alpha * radians: 0; // Z
    var beta   = event.beta  ? event.beta  * radians: 0; // X'
    var gamma  = event.gamma ? event.gamma * radians: 0; // Y''

    euler.set( beta, alpha, -gamma, 'YXZ' ); // 'ZXY' for the device, but 'YXZ' for us

    firstPerson.setFromEuler( euler ); // orient the device
    firstPerson.multiply( q1 ); // camera looks out the back of the device, not the top
    firstPerson.multiply( q0 ); // adjust for screen orientation

    inverse.setFromEuler( euler );
    inverse.multiply( q1 );
    inverse.inverse();
    inverse.multiply( q0 );

}

},{"common/ua":23}],15:[function(require,module,exports){
var AudioContext = window.AudioContext || window.webkitAudioContext;

module.exports = AudioContext ? new AudioContext() : null;
},{}],16:[function(require,module,exports){
try {
    module.exports = document.createElement( 'canvas' ).getContext( 'webgl' ) ||
                     document.createElement( 'canvas' ).getContext( 'experimental-webgl' )
} catch( e ) {
    module.exports = null;
}
},{}],17:[function(require,module,exports){
var Promise = require( 'utils/Promise' );
module.exports = new Promise();
},{"utils/Promise":50}],18:[function(require,module,exports){
var array = require( 'utils/array' );
var Events = require( 'utils/Events' );
var now = require( 'utils/now' );

if ( window.Stats ) {

    var stats = new Stats();

    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';

    document.body.appendChild( stats.domElement );

}

var children = [];
var request;

var blurred = false;
var blurTimeout;
var blurTimeoutLength = 300;

var prevTime;

var update = function() {

    // next frame
    request = requestAnimationFrame( update );

    // measure stats
    stats && stats.begin();

    // does window have focus?
    if ( blurred ) {
        focus();
    }

    // check for blur
    clearTimeout( blurTimeout );
    blurTimeout = setTimeout( blur, blurTimeoutLength );

    prevTime = loop.time;

    if ( prevTime !== undefined ) {
        loop.delta = loop.time - prevTime;
    }

    loop.time = now();

    // run children
    for ( var i = 0, l = children.length; i < l; i++ ) {
        children[ i ]();
    }

    loop.frame++;

    // finish stats
    stats && stats.end();

};

function blur() {

    if ( blurred ) return;

    loop.fire( 'blur' );
    blurred = true;

};

function focus() {

    if ( !blurred ) return;

    loop.fire( 'focus' );
    blurred = false;

}

var loop = {
    delta: 0,
    frame: 0,
    start: function( fnc ) {

        if ( fnc ) {
            loop.add( fnc );
        }

        update();
    },

    stats: function( val ) {

        if ( !val ) {
            document.body.removeChild( stats.domElement );
        }

    },

    stop: function() {
            cancelAnimationFrame( request );
    },

    add: function( fnc ) {
        children.push( fnc );
    },

    remove: function( fnc ) {
        array.remove( children, fnc );
    }

};

Events.mixTo( loop );

module.exports = loop;
},{"utils/Events":49,"utils/array":51,"utils/now":59}],19:[function(require,module,exports){
module.exports = function(){};
},{}],20:[function(require,module,exports){
var Events = require( 'utils/Events' );

var pointer = module.exports = {
    x: 0,
    y: 0,
    nx: 0,
    ny: 0,
    px: 0,
    py: 0,
    dx: 0,
    dy: 0,
    ddx: 0,
    ddy: 0,
    down: false
};

Events.mixTo( pointer );


window.addEventListener( 'mousemove', function( e ) {



    move( e.clientX, e.clientY );

    if ( pointer.down ) {
        pointer.fire( 'drag', pointer.x, pointer.y );
    }


}, false );

window.addEventListener( 'touchmove', function( e ) {

    move( e.touches[ 0 ].clientX, e.touches[ 0 ].clientY );
    pointer.fire( 'drag', pointer.x, pointer.y );

}, false );

window.addEventListener( 'mousedown', function( e ) {

    down();

}, false );

window.addEventListener( 'touchstart', function( e ) {

    position( e.touches[ 0 ].clientX, e.touches[ 0 ].clientY );
    down();

}, false );

window.addEventListener( 'mouseup', function( e ) {

    up();

}, false );

window.addEventListener( 'touchend', function( e ) {

    e.touches.length <= 1 && up();

}, false );


function move( x, y ) {

    position( x, y );
    pointer.fire( 'move', x, y );

}

function position( x, y ) {

    pointer.px = pointer.x;
    pointer.py = pointer.y;

    pointer.x = x;
    pointer.y = y;

    pointer.dx = pointer.x - pointer.px;
    pointer.dy = pointer.y - pointer.py;

    pointer.nx = pointer.x / window.innerWidth;
    pointer.ny = pointer.y / window.innerHeight;

    if ( pointer.down ) {
        pointer.ddx += pointer.dx;
        pointer.ddy += pointer.dy;
    }

}

function down() {

    if ( pointer.down ) return;

    pointer.ddx = 0;
    pointer.ddy = 0;

    pointer.down = true;
    pointer.fire( 'down' );

}

function up() {

    pointer.down = false;
    pointer.fire( 'up' );

}
},{"utils/Events":49}],21:[function(require,module,exports){
var Promise = require( 'utils/Promise' );
var scope = require( 'common/scope' );

var ready = new Promise();

if ( scope.addEventListener ) {
    scope.addEventListener( 'load', ready.resolve );
}

module.exports = ready;
},{"common/scope":22,"utils/Promise":50}],22:[function(require,module,exports){
module.exports = function() { return this }();
},{}],23:[function(require,module,exports){
var gl      = require( 'common/gl' );
var audio   = require( 'common/audio' );

var string  = navigator.userAgent;
var gpu     = gl ? gl.getParameter( gl.VERSION ) : null;

var ua = module.exports = {

    string:     string,

    pixelRatio: ~~window.devicePixelRatio || 1,

    android:    !!string.match( /Android/ig ),
    blackberry: !!string.match( /BlackBerry/ig ),
    ios:        !!string.match( /iPhone|iPad|iPod/ig ) && !window.MSStream,
    operamini:  !!string.match( /Opera Mini/ig ),
    webos:      !!string.match( /webOS/ig ),
    chrome:     !!string.match( /Chrome/ig ),
    firefox:    !!string.match( /Firefox/ig ),
    ie:         !!string.match( /MSIE/ig ),
    opera:      !!string.match( /Opera/ig ),
    safari:     !!string.match( /Safari/ig ),

    touch:      'ontouchstart' in window,
    audio:      audio,

    gl:         gl,
    gpu:        gpu,

};

ua.handheld = ua.android || ua.blackberry || ua.ios || ua.operamini || ua.webos;
},{"common/audio":15,"common/gl":16}],24:[function(require,module,exports){
var href = window.location.href;
var h = href.indexOf( '#' );
var q = href.indexOf( '?' );
var search = h == -1 ? href.substring( q ) : href.substring( q, h );

var url = {

    hash: h == -1 ? undefined : href.substring( h+1 ),

    boolean: function( name, defaultValue ) {
        if ( !url.hasOwnProperty( name ) )
            return defaultValue;
        return url[ name ] !== 'false';
    },

    number: function( name, defaultValue ) {
        var r = parseFloat( url[ name ] );
        if ( r != r )
            return defaultValue;
        return r;
    },

    prop: function( prop, value ) {
        var str = prop + '=' + value;
        if ( q == -1 ) return '?' + str;
        var prev = prop + '=' + url[ prop ];
        var str;
        if ( search.indexOf( prev ) == -1 ) {
            str = search + '&' + str;
        } else {
            str = search.replace( prev, str );
        }
        str = str.replace( /\&+$/, '' ).replace( /&+/g, '&' );
        return str;
    },

    removeProp: function( prop ) {
        var str = search.replace( new RegExp( prop + '(=([^&]+))?', 'gm' ), '' );
        str = str.replace( /\&+$/, '' ).replace( /&+/g, '&' );
        return str;
    }

};

search.replace(
    /([^?=&]+)(=([^&]+))?/g,
    function( $0, $1, $2, $3 ) {
      url[ $1 ] = decodeURIComponent( $3 );
    }
);

module.exports = url;
},{}],25:[function(require,module,exports){
var loop = require( 'common/loop' );
var ready = require( 'common/ready' );
var init = require( 'common/init' );
var Promise = require( 'utils/Promise' );
var assets = require( 'assets' );

module.exports = function( app ) {

    var loaded = assets.load( {

        assets: app.assets,
        loader: app.loader

    } );

    Promise.all( [ loaded, ready ] ).then( function() {

        assets.process();
        init.resolve();
        app.init();

        if ( app.loop ) {
            loop.start( app.loop );
        }

    } );

};
},{"assets":1,"common/init":17,"common/loop":18,"common/ready":21,"utils/Promise":50}],26:[function(require,module,exports){
var noop = require( 'common/noop' );

module.exports = Keypath;

function Keypath( object, path ) {

    if ( !path ) throw 'Missing path paramater for Keypath'

    this.path = path;
    this.key = getKey( this.path );

    this.object = null;
    this.keyObject = null;

    this.bind( object );

};


Keypath.prototype.bind = function( object ) {

    this.object = object || null;
    this.keyObject = getKeyObject( this.object, this.path );

};

Keypath.prototype.set = function( value ) {

    if ( this.keyObject ) {
        this.keyObject[ this.key ] = value;
    }

};

Keypath.prototype.get = function() {

    if ( this.keyObject ) {
        return this.keyObject[ this.key ];
    }

};

function getKey( path ) {

    if ( path.indexOf( '.' ) === -1 ) {
        return path;
    } else {
        return path.substring( path.lastIndexOf( '.' ) + 1 );
    }

}


function getKeyObject( object, path ) {

    if ( !object ) return null;

    if ( path.indexOf( '.' ) === -1 ) {
        return object;
    }

    var paths = path.split( '.' );
    var parent = object;

    for ( var i = 0, l = paths.length - 1; i < l; i++ ) {
        parent = parent[ paths[ i ] ];
    }

    return parent;

}
},{"common/noop":19}],27:[function(require,module,exports){
var SignalType = require( 'map2/SignalType' );
var Signal     = require( 'map2/Signal' );
var Node       = require( 'map2/Node' );
var Keypath    = require( 'map/Keypath' );
var extend     = require( 'utils/extend' );

// Default Signals

require( 'map2/signals/call' );
require( 'map2/signals/number' );

// Default nodes

require( 'map2/nodes/args' );
require( 'map2/nodes/blank' );
require( 'map2/nodes/clock' );
require( 'map2/nodes/ease' );
require( 'map2/nodes/elastic' );
require( 'map2/nodes/multiply' );
require( 'map2/nodes/number' );
require( 'map2/nodes/pointer' );
require( 'map2/nodes/thresh' );

function Map() {

    this.nodes = {};

    this.activeSignals = {};
    this.signals = {};

}

Map.prototype.addNode = function( node ) {

    this.nodes[ node.id ] = node;

    return node;

};

Map.prototype.makeNode = function( type, name ) {

    var node = new Node( this, type, name );

    return this.addNode( node );

};

Map.prototype.expose = function( name, object, signals ) {

    if ( !signals ) {

        signals = Object.keys( object );

        if ( object.__proto__ ) {
            signals = signals.concat( Object.keys( object.__proto__ ) );
        }

    }

    var node = new Node( this, Node.types.blank, name );

    for ( var i = 0, l = signals.length; i < l; i++ ) {

        var keypath = new Keypath( object, signals[ i ] );
        node.makeSignalFromKeypath( keypath );

    }

    return this.addNode( node );

};

Map.prototype.update = function() {

    for ( var i in this.nodes ) {
        this.nodes[ i ].update();
    }

};

module.exports = Map;

},{"map/Keypath":26,"map2/Node":28,"map2/Signal":29,"map2/SignalType":30,"map2/nodes/args":31,"map2/nodes/blank":32,"map2/nodes/clock":33,"map2/nodes/ease":34,"map2/nodes/elastic":35,"map2/nodes/multiply":36,"map2/nodes/number":37,"map2/nodes/pointer":38,"map2/nodes/thresh":39,"map2/signals/call":40,"map2/signals/number":41,"utils/extend":55}],28:[function(require,module,exports){
var SignalType = require( 'map2/SignalType' );
var Signal = require( 'map2/Signal' );

var is = require( 'utils/is' );
var extend = require( 'utils/extend' );

Node.types = {};
Node.typeCounts = {};

Node.autoID = function( type ) {

    var name = type.type; // :-\


    Node.typeCounts[ name ] = ++Node.typeCounts[ name ] || 1;

    var count = Node.typeCounts[ name ];

    if ( count === 1 ) {
        return name;
    }

    return name + ( count - 1 ).toString();

};

function Node( map, type, name ) {

    if ( !type ) {
        throw 'Undefined type';
    }

    this.map = map;
    this.type = type;
    this.id = name || Node.autoID( type );
    this.name = name || this.id;

    this.signals = {};

    for ( var signalName in this.type.signals ) {

        var signalParams = this.type.signals[ signalName ];
        var signalType = SignalType.makeFromParams( signalParams );

        var signal = this.makeSignal( signalName, signalType );

        if ( signalParams.synonyms ) {

            for ( var i = 0, l = signalParams.synonyms.length; i < l; i++ ) {

                var synonym = signalParams.synonyms[ i ];
                this.signals[ synonym ] = signal;

            }

        }


    }

    if ( this.type.update ) {
        this.updateSignals = this.type.update;
    }

    this.display = {
        x: 0,
        y: 0,
        open: true
    };

    if ( this.type.init ){
        this.type.init.call( this );
    }

};

Node.prototype = {

    get id() {

        return this._id;

    },

    set id( value ) {

        if ( this.map.nodes[ value ] ) {
            throw new Error( 'Node id "' + value + '" collides with another node in this map.' );
        }

        if ( this._id ) delete this.map.nodes[ this._id ];

        this._id = value;

        this.map.nodes[ this._id ] = this;

    }

};

Node.prototype.set = function( signals ) {

    for ( var i in signals ) {
        this.signals[ i ].set( signals[ i ] );
    }

    return this;

};

Node.prototype.addSignal = function( signal ) {

    this.signals[ signal.name ] = signal;

    return signal;

};

Node.prototype.makeSignal = function( name, type ) {

    var signal = new Signal( this, name, type );

    return this.addSignal( signal );

};

Node.prototype.makeSignalFromKeypath = function( keypath ) {

    var value = keypath.get();
    var params = { value: value };
    var type;

    if ( is.number( value ) ) {

        type = new SignalType.types.number( params );

    } else {

        type = new SignalType( params );

    }

    var signal = new Signal( this, keypath.path, type );
    signal.bind( keypath );

    return this.addSignal( signal );

};

Node.prototype.computeNumAncestors = function() {

    var max = 0;

    for ( var j in this.signals ) {
        max = Math.max( this.signals[ j ].getNumAncestors(), max );
    }

    this.numAncestors = max;

};

Node.prototype.update = function() {

    if ( this.updateSignals ) {

        this.updateSignals( this.signals );

    }

    for ( var i in this.signals ) {

        var signal = this.signals[ i ];

        signal.updated = signal.needsUpdate;

        if ( signal.updated ) {
            signal.send();
        }

        signal.needsUpdate = false;

    }



};

module.exports = Node;
},{"map2/Signal":29,"map2/SignalType":30,"utils/extend":55,"utils/is":57}],29:[function(require,module,exports){
var SignalType = require( 'map2/SignalType' );
var is = require( 'utils/is' );
var array = require( 'utils/array' );

module.exports = Signal;

function Signal( node, name, type, parent ) {

    this.name = name;
    this.node = node;
    this.type = type;

    this.id = this.node.id + '/' + this.name;

    this.map = this.node.map;
    this.map.signals[ this.id ] = this;

    //

    this.keypath = undefined;

    this.sender = undefined;
    this.receivers = [];

    this.needsUpdate = false;

    this.parent = parent;
    this.children = [];
    this.namedChildren = {};

    this.value = this.type.getDefaultValue();
    this.initialValue = this.value;

    this.type.init( this );

};

Signal.prototype.makeChild = function( name, type ) {

    type = type || new SignalType();
    name = name || this.children.length;

    var signal = new Signal( this.node, name, type, this );

    this.children.push( signal );
    this.namedChildren[ name ] = signal;

    return signal;

};

Signal.prototype.removeChild = function( signal ) {

};

Signal.prototype.send = function( input ) {

    if ( input ) {

        this.type.send( this, input );

    } else {

        for ( var i = 0, l = this.receivers.length; i < l; i++ ) {
            this.type.send( this, this.receivers[ i ] );
        }

    }

};

Signal.prototype.bind = function( keypath ) {

    this.keypath = keypath;

    this.value = this.keypath.get();

    if ( is.function( this.value ) ) {
        this.value = this.value.bind( this.keypath.keyObject );
    }

};

Signal.prototype.set = function( value ) {

    this.prevValue = this.value;
    this.value = value;

    if ( this.keypath ) {
        this.keypath.set( this.value );
    }

    this.needsUpdate = true;

};

Signal.prototype.connect = function( input ) {

    if ( input.sender ) {
        input.sender.disconnect( input );
    }

    this.map.activeSignals[ input.id ] = input;

    input.sender = this;

    this.receivers.push( input );

    this.needsUpdate = true;


};

Signal.prototype.disconnect = function( input ) {

    delete this.map.activeSignals[ input.id ];

    array.remove( this.receivers, input );

    input.sender = undefined;

};

Signal.prototype.getNumAncestors = function() {

    if ( this.sender ) {
        var max = 0;
        for ( var i in this.sender.node.signals ) {
            max = Math.max( this.sender.node.signals[ i ].getNumAncestors(), max );
        }
        return 1 + max;
    }

    return 0;

};
},{"map2/SignalType":30,"utils/array":51,"utils/is":57}],30:[function(require,module,exports){
var is = require( 'utils/is' );

module.exports = SignalType;

SignalType.types = {};

function SignalType( params ) {

    params = params || {};

    this.name = 'any';
    this.defaultValue = params.hasOwnProperty( 'value' ) ? params.value : undefined;

    this.input = params.input !== undefined ? params.input : true;


};

SignalType.prototype.init = function( signal ) {


};

SignalType.prototype.getDefaultValue = function() {

    return this.defaultValue;

};

SignalType.prototype.send = function( signal, dest ) {

    dest.set( signal.value );

};

SignalType.makeFromParams = function( params ) {

    var Type;

    if ( params.type ) {
        Type = SignalType.types[ params.type ]
        if ( !Type ) {
            throw 'Tried to create signal of unrecognized type "' + params.type + '"';
        }
    } else {
        Type = SignalType;
    }

    return new Type( params );

};

},{"utils/is":57}],31:[function(require,module,exports){
var Node = require( 'map2/Node' );

Node.types.args = {

    type: 'args',
    group: 'utils',

    signals: {
        main: {
            type: 'call',
            args: []
        }
    }

};
},{"map2/Node":28}],32:[function(require,module,exports){
var Node = require( 'map2/Node' );

Node.types.blank = {

    type: 'node',
    signals: {}

};
},{"map2/Node":28}],33:[function(require,module,exports){
var Node = require( 'map2/Node' );
var loop = require( 'common/loop' );

Node.types.clock = {

    type: 'clock',
    group: 'generators',

    signals: {
        speed: {
            type: 'number',
            value: 1
        },
        out: {
            type: 'number',
            input: false
        }
    },

    update: function( signals ) {

        signals.out.set( signals.out.value + ( loop.delta || 0 ) * signals.speed.value );

    }

};
},{"common/loop":18,"map2/Node":28}],34:[function(require,module,exports){
var Node = require( 'map2/Node' );

Node.types.ease = {

    type: 'ease',
    group: 'easing',

    signals: {
        in: {
            type: 'number'
        },
        k: {
            type: 'number',
            min: 0,
            max: 1,
            value: 0.05,
        },
        eps: {
            type: 'number',
            min: 0,
            step: 0.00001,
            value: 0.0001
        },
        out: {
            type: 'number',
            input: false
        }
    },

    update: function( signals ) {

        var d0 = signals.in.value - signals.out.value;
        var out = signals.out.value + d0 * signals.k.value;

        var d = Math.abs( signals.in.value - out );

        if ( d > 0 || d0 !== 0 ) {

            if ( d < signals.eps.value ) {
                signals.out.set( signals.in.value );
            } else {
                signals.out.set( out );
            }

        }

    }

};
},{"map2/Node":28}],35:[function(require,module,exports){
var Node = require( 'map2/Node' );

Node.types.elastic = {

    type: 'elastic',
    group: 'easing',

    signals: {
        in: {
            type: 'number'
        },
        k: {
            type: 'number',
            min: 0,
            value: 1
        },
        damping: {
            type: 'number',
            min: 0,
            max: 1,
            value: 0.5,
            synonyms: [ 'd' ]
        },
        eps: {
            type: 'number',
            min: 0,
            value: 1e-8
        },
        out: {
            type: 'number',
            input: false
        },
        accel: {
            type: 'number',
            input: false
        },
        vel: {
            type: 'number',
            input: false
        }
    },

    update: function( signals ) {

        var d0 = signals.in.value - signals.out.value;
        var accel = signals.k.value * d0;

        var vel = ( signals.vel.value + accel ) * signals.damping.value;
        var out = signals.out.value + vel;

        var d = Math.abs( signals.in.value - out );
        // console.log( signals.in.value, signals.out.value );

        if ( d > 0 || d0 !== 0 ) {

            if ( d < signals.eps.value && vel < signals.eps.value ) {
                signals.out.set( signals.in.value );
                signals.accel.set( 0 );
                signals.vel.set( 0 );
            } else {
                signals.out.set( out );
                signals.accel.set( accel );
                signals.vel.set( vel );
            }

        }


    }

};
},{"map2/Node":28}],36:[function(require,module,exports){
var Node = require( 'map2/Node' );

Node.types.multiply = {

    type: 'multiply',
    group: 'math',

    signals: {
        a: {
            type: 'number',
            value: 1
        },
        b: {
            type: 'number',
            value: 1
        },
        c: {
            type: 'number',
            value: 1
        },
        out: {
            type: 'number',
            input: false
        }
    },

    update: function( signals ) {
        if ( signals.a.updated === true || signals.b.updated === true || signals.c.updated === true ) {
            signals.out.set( signals.a.value * signals.b.value * signals.c.value );
        }
    }

};
},{"map2/Node":28}],37:[function(require,module,exports){
var Node = require( 'map2/Node' );

Node.types.number = {

    type: 'number',
    group: 'utils',

    signals: {
        main: {
            type: 'number'
        }
    }

};
},{"map2/Node":28}],38:[function(require,module,exports){
var Node = require( 'map2/Node' );
var pointer = require( 'common/pointer' );

Node.types.pointer = {

    type: 'pointer',
    group: 'browser',

    signals: {
        x: {
            type: 'number',
            input: false
        },
        y: {
            type: 'number',
            input: false
        },
        nx: {
            type: 'number',
            input: false
        },
        ny: {
            type: 'number',
            input: false
        },
        isdown: {
        //     type: 'boolean',
            input: false,
            value: false
        },
        ondown: {
            type: 'call'
        },
        onup: {
            type: 'call'
        },
        onmove: {
            type: 'call'
        }
    },

    init: function() {

        var ondown = function() {
            this.signals.ondown.needsUpdate = true;
            this.signals.isdown.set( true );
        }.bind( this );

        var onup = function() {
            this.signals.onup.needsUpdate = true;
            this.signals.isdown.set( false );
        }.bind( this );

        var onmove = function() {
            this.signals.onmove.needsUpdate = true;
            this.signals.x.set( pointer.x );
            this.signals.y.set( pointer.y );
            this.signals.nx.set( pointer.x );
            this.signals.ny.set( pointer.y );
        }.bind( this );

        // unbinding? :-\
        // the whole this vs. signals as argument thing is getting weird
        pointer.on( 'down', ondown );
        pointer.on( 'up', onup );
        pointer.on( 'move', onmove );

    },

    update: function( signals ) {

    }

};
},{"common/pointer":20,"map2/Node":28}],39:[function(require,module,exports){
var Node = require( 'map2/Node' );
var loop = require( 'common/loop' );

Node.types.thresh = {

    type: 'thresh',
    group: 'logic',

    signals: {
        in: {
            type: 'number',
        },
        thresh: {
            type: 'number',
        },
        isover: {
            // type: 'boolean',
            value: false
        },
        onover: {
            type: 'call'
        },
        onunder: {
            type: 'call'
        }
    },

    update: function( signals ) {

        var d = signals.in.value - signals.thresh.value;
        var d0 = signals.in.prevValue - signals.thresh.value;

        var peaking = d > 0;
        var wasPeaking = d0 > 0;

        if ( peaking !== wasPeaking ) {
            signals.isover.set( peaking );
        }

        if ( peaking && !wasPeaking ) {
            signals.onover.needsUpdate = true;
        }

        if ( !peaking && wasPeaking ) {
            signals.onunder.needsUpdate = true;
        }

    },



};
},{"common/loop":18,"map2/Node":28}],40:[function(require,module,exports){
var SignalType = require( 'map2/SignalType' );

var pluck = require( 'utils/pluck' );
var inherit = require( 'utils/inherit' );

var scope = require( 'common/scope' );

SignalType.types.call = function( params ) {

    SignalType.call( this, params );

    this.name = 'call';

    this.defaultArgs = params.args || [];
    this.defaultContext = params.context || scope;

};

inherit( SignalType.types.call, SignalType );

SignalType.types.call.prototype.init = function( signal ) {

    signal.value = function() {
        signal.needsUpdate = true;
    };

    var contextSignal = signal.makeChild( 'context' );
    var argsSignal = signal.makeChild( 'args' );

    contextSignal.set( this.defaultContext );

    for ( var i = 0, l = this.defaultArgs.length; i < l; i++ ) {

        argsSignal.makeChild().set( this.defaultArgs[ i ] );

    }

};

SignalType.types.call.prototype.send = function() {

    var argValues = [];

    return function( signal, dest ) {

        var context = signal.namedChildren.context.value;
        var argSignals = signal.namedChildren.args.children;

        argValues.length = argSignals.length;
        pluck( argSignals, 'value', argValues );

        dest.value.apply( context, argValues );

        dest.needsUpdate = true;

    };

}();

},{"common/scope":22,"map2/SignalType":30,"utils/inherit":56,"utils/pluck":60}],41:[function(require,module,exports){
var SignalType = require( 'map2/SignalType' );

var inherit = require( 'utils/inherit' );

SignalType.types.number = function( params ) {

    SignalType.call( this, params );

    this.name = 'number';

    this.defaultValue = params.value === undefined ? 0 : params.value;

    this.min = params.min === undefined ? -Infinity : params.min;
    this.max = params.max === undefined ?  Infinity : params.max;

    if ( params.step ) {
        this.step = params.step;
    } else if ( this.min && this.max ) {
        this.step = Math.abs( this.max - this.min ) * 0.01;
    } else {
        this.step = 0.01;
    }


};

inherit( SignalType.types.number, SignalType );
},{"map2/SignalType":30,"utils/inherit":56}],42:[function(require,module,exports){
var shuffle = require( 'random/shuffle' );

// todo: breaks with one item

module.exports = Shuffler;

function Shuffler( arr ) {
    this.arr = shuffle( arr );
    this.index = 0;
};

Shuffler.prototype.next = function() {
    if ( this.index < this.arr.length ) {
        this.reset();
    }
    this.cur = this.arr[ this.index ]
    this.index++;
    return this.cur;
};

Shuffler.prototype.reset = function() {
    this.arr = shuffle( this.arr );
    if ( this.arr[ 0 ] === this.cur ) {
        this.arr.push( this.arr.shift() );
    }
    this.index = 0;
};
},{"random/shuffle":45}],43:[function(require,module,exports){
module.exports = noise;

function noise(x, y, z) {
  if ( noise.profile.generator === undefined ) {
    // caching
    noise.profile.generator = new noise.PerlinNoise(noise.profile.seed);
  }
  var generator = noise.profile.generator;
  var effect = 1,
    k = 1,
    sum = 0;
  for (var i = 0; i < noise.profile.octaves; ++i) {
    effect *= noise.profile.fallout;
    switch (arguments.length) {
    case 1:
      sum += effect * (1 + generator.noise1d(k * x)) / 2;
      break;
    case 2:
      sum += effect * (1 + generator.noise2d(k * x, k * y)) / 2;
      break;
    case 3:
      sum += effect * (1 + generator.noise3d(k * x, k * y, k * z)) / 2;
      break;
    }
    k *= 2;
  }
  return sum;
};


// these are lifted from Processing.js
// processing defaults
noise.profile = {
  generator: undefined,
  octaves: 2,
  fallout: 0.5,
  seed: undefined
};

// Pseudo-random generator
noise.Marsaglia = function(i1, i2) {
  // from http://www.math.uni-bielefeld.de/~sillke/ALGORITHMS/random/marsaglia-c
  var z = i1 || 362436069,
    w = i2 || 521288629;
  var nextInt = function () {
    z = (36969 * (z & 65535) + (z >>> 16)) & 0xFFFFFFFF;
    w = (18000 * (w & 65535) + (w >>> 16)) & 0xFFFFFFFF;
    return (((z & 0xFFFF) << 16) | (w & 0xFFFF)) & 0xFFFFFFFF;
  };

  this.nextDouble = function () {
    var i = nextInt() / 4294967296;
    return i < 0 ? 1 + i : i;
  };
  this.nextInt = nextInt;
}

noise.Marsaglia.createRandomized = function () {
  var now = new Date();
  return new noise.Marsaglia((now / 60000) & 0xFFFFFFFF, now & 0xFFFFFFFF);
};

// Noise functions and helpers
noise.PerlinNoise = function( seed ) {
  var random = seed !== undefined ? new noise.Marsaglia(seed) : noise.Marsaglia.createRandomized();
  var i, j;
  // http://www.noisemachine.com/talk1/17b.html
  // http://mrl.nyu.edu/~perlin/noise/
  // generate permutation
  var p = new Array(512);
  for (i = 0; i < 256; ++i) {
    p[i] = i;
  }
  for (i = 0; i < 256; ++i) {
    var t = p[j = random.nextInt() & 0xFF];
    p[j] = p[i];
    p[i] = t;
  }
  // copy to avoid taking mod in p[0];
  for (i = 0; i < 256; ++i) {
    p[i + 256] = p[i];
  }

  function grad3d(i, x, y, z) {
    var h = i & 15; // convert into 12 gradient directions
    var u = h < 8 ? x : y,
      v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  function grad2d(i, x, y) {
    var v = (i & 1) === 0 ? x : y;
    return (i & 2) === 0 ? -v : v;
  }

  function grad1d(i, x) {
    return (i & 1) === 0 ? -x : x;
  }

  function lerp(t, a, b) {
    return a + t * (b - a);
  }

  this.noise3d = function (x, y, z) {
    var X = Math.floor(x) & 255,
      Y = Math.floor(y) & 255,
      Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    var fx = (3 - 2 * x) * x * x,
      fy = (3 - 2 * y) * y * y,
      fz = (3 - 2 * z) * z * z;
    var p0 = p[X] + Y,
      p00 = p[p0] + Z,
      p01 = p[p0 + 1] + Z,
      p1 = p[X + 1] + Y,
      p10 = p[p1] + Z,
      p11 = p[p1 + 1] + Z;
    return lerp(fz,
    lerp(fy, lerp(fx, grad3d(p[p00], x, y, z), grad3d(p[p10], x - 1, y, z)),
    lerp(fx, grad3d(p[p01], x, y - 1, z), grad3d(p[p11], x - 1, y - 1, z))),
    lerp(fy, lerp(fx, grad3d(p[p00 + 1], x, y, z - 1), grad3d(p[p10 + 1], x - 1, y, z - 1)),
    lerp(fx, grad3d(p[p01 + 1], x, y - 1, z - 1), grad3d(p[p11 + 1], x - 1, y - 1, z - 1))));
  };

  this.noise2d = function (x, y) {
    var X = Math.floor(x) & 255,
      Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    var fx = (3 - 2 * x) * x * x,
      fy = (3 - 2 * y) * y * y;
    var p0 = p[X] + Y,
      p1 = p[X + 1] + Y;
    return lerp(fy,
    lerp(fx, grad2d(p[p0], x, y), grad2d(p[p1], x - 1, y)),
    lerp(fx, grad2d(p[p0 + 1], x, y - 1), grad2d(p[p1 + 1], x - 1, y - 1)));
  };

  this.noise1d = function (x) {
    var X = Math.floor(x) & 255;
    x -= Math.floor(x);
    var fx = (3 - 2 * x) * x * x;
    return lerp(fx, grad1d(p[X], x), grad1d(p[X + 1], x - 1));
  };

}

},{}],44:[function(require,module,exports){
var is = require( 'utils/is' );

module.exports = random;

function random( $1, $2 ) {

    if ( arguments.length == 0 ) {
        return Math.random();
    }

    if ( $1.length !== undefined ) {
        return $1[ ~~( Math.random() * $1.length ) ];
    }

    switch ( arguments.length ) {
        case 1:
            return Math.random() * $1;
        case 2:
            return Math.random() * ( $2 - $1 ) + $1;
        default:
            return Math.random();
    }

};

random.range = function( $1, $2 ) {

    switch ( arguments.length ) {
        case 1:
            return Math.random() * $1 * 2 - $1;
        case 2:
            return ( Math.random() * ( $2 - $1 ) + $1 ) * ( Math.random() < 0.5 ? 1 : -1 );
        default:
            return Math.random() * 2 - 1;
    }

};

random.int = function( $1, $2 ) {

    var min = -1, max = 1;

    switch ( arguments.length ) {
        case 1:
            min = 0;
            max = $1;
            break;
        case 2:
            min = $1;
            max = $2;
            break;
    }

    return ~~( Math.random() * ( max - min ) + min );

};

var TWO_PI = Math.PI * 2;

random.angle = function() {
    return Math.random() * TWO_PI;
};

random.chance = function( percent ) {
    return Math.random() < ( percent || 0.5 );
};

random.sign = function() {
    return Math.random() < 0.5 ? 1 : -1;
};
},{"utils/is":57}],45:[function(require,module,exports){
module.exports = function( o ) {
    for ( var j, x, i = o.length; i; j = ~~( Math.random() * i ), x = o[ --i ], o[ i ] = o[ j ], o[ j ] = x );
    return o;
};
},{}],46:[function(require,module,exports){
var scope = require( 'common/scope' );

var math = require( 'utils/math' );

module.exports = scope.af = {

    main:           require( 'main' ),

    assets:         require( 'assets' ),

    ready:          require( 'common/ready' ).then,

    audio:          require( 'common/audio' ),
    gl:             require( 'common/gl' ),
    loop:           require( 'common/loop' ),
    noop:           require( 'common/noop' ),
    scope:          require( 'common/scope' ),

    ua:             require( 'common/ua' ),
    url:            require( 'common/url' ),

    math:           require( 'utils/math' ),

    pointer:        require( 'common/pointer' ),
    accelerometer:  require( 'common/accelerometer' ),

    random:         require( 'random/random' ),
    noise:          require( 'random/noise' ),
    shuffle:        require( 'random/shuffle' ),
    Shuffler:       require( 'random/Shuffler' ),

    Promise:        require( 'utils/Promise' ),
    Events:         require( 'utils/Events' ),

    array:          require( 'utils/array' ),
    inherit:        require( 'utils/inherit' ),
    now:            require( 'utils/now' ),
    xhr:            require( 'utils/xhr' ),
    is:             require( 'utils/is' ),
    debounce:       require( 'utils/debounce' ),
    bindAll:        require( 'utils/bindAll' ),

    defaults:       require( 'utils/defaults' ),
    pluck:          require( 'utils/pluck' ),
    extend:         require( 'utils/extend' ),
    values:         require( 'utils/values' ),

    Sample:         require( 'audio/Sample' ),

    Map:            require( 'map2/Map' ),
    Node:           require( 'map2/Node' ),

    three: {

        tmp: require( 'three/tmp' )

    }

};

for ( var i in math ) {
    if ( scope.af[ i ] ) {
        throw 'Conflict while globalizing math: ' + i;
    }
    scope.af[ i ] = math[ i ];
}

// Legacy synonym

scope.af.utils = {
    defaults: scope.af.defaults,
    Events: scope.af.Events,
    extend: scope.af.extend,
    math: scope.af.math,
    array: scope.af.array
};

scope.af.common = {
    url: scope.af.url,
    ua: scope.af.ua,
    pointer: scope.af.pointer,
    loop: scope.af.loop
}

scope.aaf = scope.af;
},{"assets":1,"audio/Sample":13,"common/accelerometer":14,"common/audio":15,"common/gl":16,"common/loop":18,"common/noop":19,"common/pointer":20,"common/ready":21,"common/scope":22,"common/ua":23,"common/url":24,"main":25,"map2/Map":27,"map2/Node":28,"random/Shuffler":42,"random/noise":43,"random/random":44,"random/shuffle":45,"three/tmp":48,"utils/Events":49,"utils/Promise":50,"utils/array":51,"utils/bindAll":52,"utils/debounce":53,"utils/defaults":54,"utils/extend":55,"utils/inherit":56,"utils/is":57,"utils/math":58,"utils/now":59,"utils/pluck":60,"utils/values":61,"utils/xhr":62}],47:[function(require,module,exports){
module.exports = TextureAtlas;

function TextureAtlas( sheets ) {

    this.sheets = sheets;

    this.paths = {};
    this.frames = [];

    for ( var i = 0, l = this.sheets.length; i < l; i++ ) {
        var s = this.sheets[ i ];
        for ( var path in s.paths ) {
            this.paths[ path ] = s;
            this.frames.push( path );
        }
    }

    this.minUV = new THREE.Vector2();
    this.maxUV = new THREE.Vector2();
    this.offset = new THREE.Vector2();
    this.scale = new THREE.Vector2( 1, 1 );

    this.uniforms = {

        uAtlasSheet: {
            type: 't',
            value: null
        },

        uAtlasMinUV: {
            type: 'v2',
            value: this.minUV
        },

        uAtlasMaxUV: {
            type: 'v2',
            value: this.maxUV
        },

        uAtlasOffset: {
            type: 'v2',
            value: this.offset
        },

        uAtlasScale: {
            type: 'v2',
            value: this.scale
        }

    };

    this.activeSheet = undefined;
    this.setFrame( 0 );

};

TextureAtlas.prototype.setPath = function( path ) {

    this._setPath( path );
    this.frame = this.frames.indexOf( path );

};

TextureAtlas.prototype.setFrame = function( frame ) {

    this._setPath( this.frames[ frame ] );
    this.frame = frame;

};

TextureAtlas.prototype.nextFrame = function() {

    this.setFrame( ( this.frame + 1 ) % this.frames.length );

};

TextureAtlas.prototype._setPath = function( path ) {

    this.path = path;
    this.activeSheet = this.paths[ path ];
    this.activeSheet.setBounds( path, this.minUV, this.maxUV );
    this.uniforms.uAtlasSheet.value = this.activeSheet.texture;
    this.activeSheet.texture.repeat.set( 4, 4 );
    // this.activeSheet.texture._needsUpdate = true;

};

TextureAtlas.Sheet = function( texture, texturePackerData ) {

    this.texture = texture;
    // this.texture.generateMipmaps = false;
    // this.texture.magFilter = THREE.NearestFilter;
    this.texture.minFilter = THREE.NearestFilter;

    this.paths = texturePackerData.frames;
    this.frames = [];

    for ( var i in this.paths ) {
        this.frames.push( this.paths[ i ] );
    }

    this.width = texturePackerData.meta.size.w;
    this.height = texturePackerData.meta.size.h;

};

TextureAtlas.Sheet.prototype.setBounds = function( path, min, max ) {

    var frame = this.paths[ path ].frame;

    min.x = frame.x / this.width;
    max.y = 1.0 - frame.y / this.height;

    max.x = ( frame.x + frame.w ) / this.width;
    min.y = 1.0 - ( frame.y + frame.h ) / this.height;

};
},{}],48:[function(require,module,exports){
var ready = require( 'common/ready' )
var tmp = {};
module.exports = tmp;

ready.then( function() {

    if ( !window.THREE ) return;

    tmp.vec = new THREE.Vector3();
    tmp.vec1 = new THREE.Vector3();
    tmp.vec2 = new THREE.Vector3();
    tmp.mat = new THREE.Matrix4();

    tmp.quat = new THREE.Quaternion();
    tmp.quat2 = new THREE.Quaternion();

} );
},{"common/ready":21}],49:[function(require,module,exports){
module.exports = Events;

// Events
// -----------------
// Thanks to:
//  - https://github.com/documentcloud/backbone/blob/master/backbone.js
//  - https://github.com/joyent/node/blob/master/lib/events.js


// Regular expression used to split event strings
var eventSplitter = /\s+/


// A module that can be mixed in to *any object* in order to provide it
// with custom events. You may bind with `on` or remove with `off` callback
// functions to an event; `trigger`-ing an event fires all callbacks in
// succession.
//
//     var object = new Events();
//     object.on('expand', function(){ alert('expanded'); });
//     object.trigger('expand');
//
function Events() {
}


// Bind one or more space separated events, `events`, to a `callback`
// function. Passing `"all"` will bind the callback to all events fired.
Events.prototype.on = function(events, callback, context) {
  var cache, event, list
  if (!callback) return this

  cache = this.__events || (this.__events = {})
  events = events.split(eventSplitter)

  while (event = events.shift()) {
    list = cache[event] || (cache[event] = [])
    list.push(callback, context)
  }

  return this
}

Events.prototype.once = function(events, callback, context) {
  var that = this
  var cb = function() {
    that.off(events, cb)
    callback.apply(context || that, arguments)
  }
  return this.on(events, cb, context)
}

// Remove one or many callbacks. If `context` is null, removes all callbacks
// with that function. If `callback` is null, removes all callbacks for the
// event. If `events` is null, removes all bound callbacks for all events.
Events.prototype.off = function(events, callback, context) {
  var cache, event, list, i

  // No events, or removing *all* events.
  if (!(cache = this.__events)) return this
  if (!(events || callback || context)) {
    delete this.__events
    return this
  }

  events = events ? events.split(eventSplitter) : keys(cache)

  // Loop through the callback list, splicing where appropriate.
  while (event = events.shift()) {
    list = cache[event]
    if (!list) continue

    if (!(callback || context)) {
      delete cache[event]
      continue
    }

    for (i = list.length - 2; i >= 0; i -= 2) {
      if (!(callback && list[i] !== callback ||
          context && list[i + 1] !== context)) {
        list.splice(i, 2)
      }
    }
  }

  return this
}


// Trigger one or many events, firing all bound callbacks. Callbacks are
// passed the same arguments as `trigger` is, apart from the event name
// (unless you're listening on `"all"`, which will cause your callback to
// receive the true name of the event as the first argument).
Events.prototype.trigger = Events.prototype.fire = function(events) {
  var cache, event, all, list, i, len, rest = [], args, returned = true;
  if (!(cache = this.__events)) return this

  events = events.split(eventSplitter)

  // Fill up `rest` with the callback arguments.  Since we're only copying
  // the tail of `arguments`, a loop is much faster than Array#slice.
  for (i = 1, len = arguments.length; i < len; i++) {
    rest[i - 1] = arguments[i]
  }

  // For each event, walk through the list of callbacks twice, first to
  // trigger the event, then to trigger any `"all"` callbacks.
  while (event = events.shift()) {
    // Copy callback lists to prevent modification.
    if (all = cache.all) all = all.slice()
    if (list = cache[event]) list = list.slice()

    // Execute event callbacks except one named "all"
    if (event !== 'all') {
      returned = triggerEvents(list, rest, this) && returned
    }

    // Execute "all" callbacks.
    returned = triggerEvents(all, [event].concat(rest), this) && returned
  }

  return returned
}

Events.prototype.emit = Events.prototype.trigger


// Helpers
// -------

var keys = Object.keys

if (!keys) {
  keys = function(o) {
    var result = []

    for (var name in o) {
      if (o.hasOwnProperty(name)) {
        result.push(name)
      }
    }
    return result
  }
}

// Mix `Events` to object instance or Class function.
Events.mixTo = function(receiver) {
  var proto = Events.prototype

  if (isFunction(receiver)) {
    for (var key in proto) {
      if (proto.hasOwnProperty(key)) {
        receiver.prototype[key] = proto[key]
      }
    }
    Object.keys(proto).forEach(function(key) {
      receiver.prototype[key] = proto[key]
    })
  }
  else {
    var event = new Events
    for (var key in proto) {
      if (proto.hasOwnProperty(key)) {
        copyProto(key)
      }
    }
  }

  function copyProto(key) {
    receiver[key] = function() {
      proto[key].apply(event, Array.prototype.slice.call(arguments))
      return this
    }
  }
}

// Execute callbacks
function triggerEvents(list, args, context) {
  var pass = true

  if (list) {
    var i = 0, l = list.length, a1 = args[0], a2 = args[1], a3 = args[2]
    // call is faster than apply, optimize less than 3 argu
    // http://blog.csdn.net/zhengyinhui100/article/details/7837127
    switch (args.length) {
      case 0: for (; i < l; i += 2) {pass = list[i].call(list[i + 1] || context) !== false && pass} break;
      case 1: for (; i < l; i += 2) {pass = list[i].call(list[i + 1] || context, a1) !== false && pass} break;
      case 2: for (; i < l; i += 2) {pass = list[i].call(list[i + 1] || context, a1, a2) !== false && pass} break;
      case 3: for (; i < l; i += 2) {pass = list[i].call(list[i + 1] || context, a1, a2, a3) !== false && pass} break;
      default: for (; i < l; i += 2) {pass = list[i].apply(list[i + 1] || context, args) !== false && pass} break;
    }
  }
  // trigger will return false if one of the callbacks return false
  return pass;
}

function isFunction(func) {
  return Object.prototype.toString.call(func) === '[object Function]'
}

},{}],50:[function(require,module,exports){
// Fuck all that other promise shit. This is all you need.

module.exports = Promise;

function Promise() {

    var callbacks = [];
    var resolved = false;

    this.resolve = function() {

        if ( resolved ) return;

        resolved = true;
        callbacks.forEach( function( fnc ) { fnc() } );

    };

    this.then = function( fnc ) {

        resolved ? fnc() : callbacks.push( fnc );

        return this;

    }.bind( this );


}

Promise.all = function( arr ) {

    var all = new Promise();
    var resolved = 0;

    var callback = function() {
        resolved++;
        if ( resolved === arr.length ) {
            all.resolve();
        }
    };

    arr.forEach( function( val ) {
        val.then( callback );
    } );

    return all;

};
},{}],51:[function(require,module,exports){
exports.remove = function( array, object ) {
    var i = array.indexOf( object );
    if ( i > -1 ) array.splice( i, 1 );
};

exports.ensure = function( array, object ) {
    if ( array.indexOf( object ) === -1 ) array.push( object );
};

exports.contains = function( array, object ) {
    return array.indexOf( object ) !== -1;
};

exports.fill = function( array, value, begin, end ) {
    begin = begin || 0;
    end = end || array.length;
    for ( var i = begin; i < end; i++ ) {
        array[ i ] = value;
    }
    return array;
};
},{}],52:[function(require,module,exports){
var is = require( 'utils/is' );

module.exports = function( obj ) {

    for ( var i in obj ) {
        var prop = obj[ i ];
        if ( is.function( prop ) ) {
            obj[ i ] = obj[ i ].bind( obj );
        }
    }

};
},{"utils/is":57}],53:[function(require,module,exports){
module.exports = function(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};
},{}],54:[function(require,module,exports){
module.exports = function( a, b ) {
    a = a || {};
    for ( var i in b ) {
        if ( !a.hasOwnProperty( i ) ) {
            a[ i ] = b[ i ];
        }
    }
    return a;
};
},{}],55:[function(require,module,exports){
module.exports = function( a, b ) {
    for ( var i in b ) {
        a[ i ] = b[ i ];
    }
    return a;
};
},{}],56:[function(require,module,exports){
var extend = require( 'utils/extend' );

module.exports = function( child, parent ) {

    var prototype = child.prototype;

    child.prototype = Object.create( parent.prototype );
    child.prototype.constructor = child;

    for ( var i in prototype ) {
        child.prototype[ i ] = prototype[ i ];
    }

};
},{"utils/extend":55}],57:[function(require,module,exports){
// choice lifts from underscore

var toString = Object.prototype.toString;

module.exports = {

    string: function( obj ) {
        return toString.call( obj ) === '[object String]';
    },

    function: function( obj ) {
        return toString.call( obj ) === '[object Function]';
    },

    number: function( obj ) {
        return toString.call( obj ) === '[object Number]';
    },

    array: function( obj ) {
        return Array.isArray( obj );
    },

    object: function( obj ) {
        return obj === Object( obj );
    }

}
},{}],58:[function(require,module,exports){
var math = module.exports = {

    TWO_PI: Math.PI * 2,
    HALF_PI: Math.PI / 2,
    SQRT_TWO: Math.sqrt( 2 ),
    RAD: Math.PI / 180,

    map: function( t, a, b, c, d ) {

        if ( a === b ) {
            return c;
        }

        return c + ( d - c ) * ( t - a ) / ( b - a );

    },

    lerp: function( a, b, t ) {

        return ( b - a ) * t + a;

    },

    normalize: function( a, b, t ) {

        return ( t - a ) / ( b - a );

    },

    smoothstep: function( a, b, t ) {

        if ( a === b ) {
            return c;
        }

        t = Math.min( Math.max( ( t - a ) / ( b - a ), 0 ), 1 );
        return t * t * ( 3 - 2 * t );

    },

    smootherstep: function( a, b, t ) {

        t = Math.min( Math.max( ( t - a ) / ( b - a ), 0 ), 1 );
        return t * t * t * ( t * ( t * 6 - 15 ) + 10 );

    },

    clamp: function( t, a, b ) {

        var min = Math.min( a, b );
        var max = Math.max( a, b );
        return Math.max( min, Math.min( max, t ) );

    },

    cmap: function( t, a, b, c, d ) {

        return math.map( math.clamp( t, a, b ), a, b, c, d );

    },

    cnormalize: function( a, b, t ) {

        return math.normalize( a, b, math.clamp( t, 0, 1 ) );

    },

    clerp: function( a, b, t ) {

        return math.lerp( a, b, math.clamp( t, a, b ) );

    },

    distSq: function( a, b, c, d ) {

        return ( c - a ) * ( c - a ) + ( d - b ) * ( d - b );

    },

    dist: function( a, b, c, d ) {

        return Math.sqrt( ( c - a ) * ( c - a ) + ( d - b ) * ( d - b ) );

    },

    squared: function( x ) {

        return x * x;

    },

    sign: function( v ) {

        return v >= 0 ? 1 : -1;

    }

}
},{}],59:[function(require,module,exports){
var is = require( 'utils/is' );

var start = new Date().getTime() * 0.001;

module.exports = ( function() {

    if ( window.performance && is.function( window.performance.now ) ) {
        return function() {
            return performance.now() * 0.001;
        }
    } else if ( is.function( Date.now ) ) {
        return function() {
            return Date.now() * 0.001 - start;
        }
    } else {
        return function() {
            return new Date().getTime() * 0.001 - start;
        }
    }

} )();
},{"utils/is":57}],60:[function(require,module,exports){
module.exports = function( array, property, output ) {

    output = output || [];

    for ( var i = 0, l = array.length; i < l; i++ ) {
        output[ i ] = array[ i ][ property ];
    }

    return output;

};
},{}],61:[function(require,module,exports){
module.exports = function( obj ) {

    var values = [];

    for ( var i in obj ) {
        values.push( obj[ i ] );
    }

    return values;

}
},{}],62:[function(require,module,exports){
exports.get = function( url, success, error ) {
    var xhr = makeRequest( 'responseText', success, error );
    xhr.open( 'GET', url, true );
    xhr.send();
};

exports.getWithHeaders = function( url, headers, success, error ) {
    var xhr = makeRequest( 'responseText', success, error );
    xhr.open( 'GET', url, true );
    for ( var i in headers ) {
        xhr.setRequestHeader( i, headers[ i ] );
    }
    xhr.send();
};

exports.getBuffer = function( url, success, error ) {
    var xhr = makeRequest( 'response', succes, error );
    xhr.open( 'GET', url, true );
    xhr.responseType = 'arraybuffer';
    xhr.send();
};

function makeRequest( responseKey, success, error ) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function( e ) {
        if ( xhr.readyState == 4 ) {
            if ( xhr.status == 200 ) {
                return success( xhr[ responseKey ] );
            }
            if ( error ) {
                return error( xhr.status + ' ' + xhr.statusText );
            }
        }
    }
    return xhr;
}
},{}]},{},[46])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2FhZi9idWlsZC9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiLi4vYWFmL2xpYi9hc3NldHMuanMiLCIuLi9hYWYvbGliL2Fzc2V0cy9hdGxhcy5qcyIsIi4uL2FhZi9saWIvYXNzZXRzL2J1ZmZlci5qcyIsIi4uL2FhZi9saWIvYXNzZXRzL2N1YmUuanMiLCIuLi9hYWYvbGliL2Fzc2V0cy9kb20uanMiLCIuLi9hYWYvbGliL2Fzc2V0cy9pbWFnZS5qcyIsIi4uL2FhZi9saWIvYXNzZXRzL2pzb24uanMiLCIuLi9hYWYvbGliL2Fzc2V0cy9vYmouanMiLCIuLi9hYWYvbGliL2Fzc2V0cy9zYW1wbGUuanMiLCIuLi9hYWYvbGliL2Fzc2V0cy9zcHJpdGVzaGVldC5qcyIsIi4uL2FhZi9saWIvYXNzZXRzL3RleHQuanMiLCIuLi9hYWYvbGliL2Fzc2V0cy90ZXh0dXJlLmpzIiwiLi4vYWFmL2xpYi9hdWRpby9TYW1wbGUuanMiLCIuLi9hYWYvbGliL2NvbW1vbi9hY2NlbGVyb21ldGVyLmpzIiwiLi4vYWFmL2xpYi9jb21tb24vYXVkaW8uanMiLCIuLi9hYWYvbGliL2NvbW1vbi9nbC5qcyIsIi4uL2FhZi9saWIvY29tbW9uL2luaXQuanMiLCIuLi9hYWYvbGliL2NvbW1vbi9sb29wLmpzIiwiLi4vYWFmL2xpYi9jb21tb24vbm9vcC5qcyIsIi4uL2FhZi9saWIvY29tbW9uL3BvaW50ZXIuanMiLCIuLi9hYWYvbGliL2NvbW1vbi9yZWFkeS5qcyIsIi4uL2FhZi9saWIvY29tbW9uL3Njb3BlLmpzIiwiLi4vYWFmL2xpYi9jb21tb24vdWEuanMiLCIuLi9hYWYvbGliL2NvbW1vbi91cmwuanMiLCIuLi9hYWYvbGliL21haW4uanMiLCIuLi9hYWYvbGliL21hcC9LZXlwYXRoLmpzIiwiLi4vYWFmL2xpYi9tYXAyL01hcC5qcyIsIi4uL2FhZi9saWIvbWFwMi9Ob2RlLmpzIiwiLi4vYWFmL2xpYi9tYXAyL1NpZ25hbC5qcyIsIi4uL2FhZi9saWIvbWFwMi9TaWduYWxUeXBlLmpzIiwiLi4vYWFmL2xpYi9tYXAyL25vZGVzL2FyZ3MuanMiLCIuLi9hYWYvbGliL21hcDIvbm9kZXMvYmxhbmsuanMiLCIuLi9hYWYvbGliL21hcDIvbm9kZXMvY2xvY2suanMiLCIuLi9hYWYvbGliL21hcDIvbm9kZXMvZWFzZS5qcyIsIi4uL2FhZi9saWIvbWFwMi9ub2Rlcy9lbGFzdGljLmpzIiwiLi4vYWFmL2xpYi9tYXAyL25vZGVzL211bHRpcGx5LmpzIiwiLi4vYWFmL2xpYi9tYXAyL25vZGVzL251bWJlci5qcyIsIi4uL2FhZi9saWIvbWFwMi9ub2Rlcy9wb2ludGVyLmpzIiwiLi4vYWFmL2xpYi9tYXAyL25vZGVzL3RocmVzaC5qcyIsIi4uL2FhZi9saWIvbWFwMi9zaWduYWxzL2NhbGwuanMiLCIuLi9hYWYvbGliL21hcDIvc2lnbmFscy9udW1iZXIuanMiLCIuLi9hYWYvbGliL3JhbmRvbS9TaHVmZmxlci5qcyIsIi4uL2FhZi9saWIvcmFuZG9tL25vaXNlLmpzIiwiLi4vYWFmL2xpYi9yYW5kb20vcmFuZG9tLmpzIiwiLi4vYWFmL2xpYi9yYW5kb20vc2h1ZmZsZS5qcyIsIi4uL2FhZi9saWIvc3RhbmRhbG9uZSIsIi4uL2FhZi9saWIvdGhyZWUvVGV4dHVyZUF0bGFzLmpzIiwiLi4vYWFmL2xpYi90aHJlZS90bXAuanMiLCIuLi9hYWYvbGliL3V0aWxzL0V2ZW50cy5qcyIsIi4uL2FhZi9saWIvdXRpbHMvUHJvbWlzZS5qcyIsIi4uL2FhZi9saWIvdXRpbHMvYXJyYXkuanMiLCIuLi9hYWYvbGliL3V0aWxzL2JpbmRBbGwuanMiLCIuLi9hYWYvbGliL3V0aWxzL2RlYm91bmNlLmpzIiwiLi4vYWFmL2xpYi91dGlscy9kZWZhdWx0cy5qcyIsIi4uL2FhZi9saWIvdXRpbHMvZXh0ZW5kLmpzIiwiLi4vYWFmL2xpYi91dGlscy9pbmhlcml0LmpzIiwiLi4vYWFmL2xpYi91dGlscy9pcy5qcyIsIi4uL2FhZi9saWIvdXRpbHMvbWF0aC5qcyIsIi4uL2FhZi9saWIvdXRpbHMvbm93LmpzIiwiLi4vYWFmL2xpYi91dGlscy9wbHVjay5qcyIsIi4uL2FhZi9saWIvdXRpbHMvdmFsdWVzLmpzIiwiLi4vYWFmL2xpYi91dGlscy94aHIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkdBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSEE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBQcm9taXNlID0gcmVxdWlyZSggJ3V0aWxzL1Byb21pc2UnICk7XG52YXIgZXh0ZW5kID0gcmVxdWlyZSggJ3V0aWxzL2V4dGVuZCcgKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoICd1dGlscy9kZWZhdWx0cycgKTtcblxuLy8ga2luZGEgbWVzc3k6IGRlZmluZSBiYXNlUGF0aCB1cCBiZWZvcmUgZXhwb3J0ICYgdHlwZSByZXF1aXJlc1xuLy8gYXMgc29tZSB0eXBlcyBtaWdodCBuZWVkIHRvIGtub3cgaXRzIHZhbHVlLlxuYXNzZXRzLmJhc2VQYXRoID0gJ2Fzc2V0cy8nXG5cbm1vZHVsZS5leHBvcnRzID0gYXNzZXRzO1xuXG52YXIgdHlwZXMgPSB7IFxuICAgIGF0bGFzOiAgIHJlcXVpcmUoICdhc3NldHMvYXRsYXMnICksIFxuICAgIGJ1ZmZlcjogIHJlcXVpcmUoICdhc3NldHMvYnVmZmVyJyApLCBcbiAgICBjdWJlOiAgICByZXF1aXJlKCAnYXNzZXRzL2N1YmUnICksIFxuICAgIGRvbTogICAgIHJlcXVpcmUoICdhc3NldHMvZG9tJyApLCBcbiAgICBpbWFnZTogICByZXF1aXJlKCAnYXNzZXRzL2ltYWdlJyApLCBcbiAgICBqc29uOiAgICByZXF1aXJlKCAnYXNzZXRzL2pzb24nICksIFxuICAgIG9iajogICAgIHJlcXVpcmUoICdhc3NldHMvb2JqJyApLCBcbiAgICBzYW1wbGU6ICByZXF1aXJlKCAnYXNzZXRzL3NhbXBsZScgKSwgXG4gICAgdGV4dDogICAgcmVxdWlyZSggJ2Fzc2V0cy90ZXh0JyApLCBcbiAgICB0ZXh0dXJlOiByZXF1aXJlKCAnYXNzZXRzL3RleHR1cmUnICksIFxuICAgIHNwcml0ZXNoZWV0OiByZXF1aXJlKCAnYXNzZXRzL3Nwcml0ZXNoZWV0JyApLCBcbiAgICBcbn07XG5cbmZ1bmN0aW9uIGFzc2V0cyggcGF0aCApIHtcblxuICAgIGlmICggIWFzc2V0cy5sb2FkZWQuaGFzT3duUHJvcGVydHkoIHBhdGggKSApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCAnUmVxdWVzdCBmb3IgdW5sb2FkZWQgYXNzZXQ6ICcgKyBwYXRoICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFzc2V0cy5sb2FkZWRbIHBhdGggXTtcblxufTtcblxuZXh0ZW5kKCBhc3NldHMsIHtcblxuICAgIGxvYWRlZDoge30sXG4gICAgcHJvbWlzZXM6IHt9LFxuICAgIHByb2Nlc3NlZDoge30sXG5cbiAgICBwcm9jZXNzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgZm9yICggdmFyIGkgaW4gYXNzZXRzLmxvYWRlZCApIHtcbiAgICAgICAgICAgIHZhciBsb2FkZXIgPSBhc3NldHMuZ2V0VHlwZSggaSApO1xuICAgICAgICAgICAgaWYgKCBsb2FkZXIucHJvY2VzcyAmJiAhYXNzZXRzLnByb2Nlc3NlZFsgaSBdICkge1xuICAgICAgICAgICAgICAgIGFzc2V0cy5sb2FkZWRbIGkgXSA9IGxvYWRlci5wcm9jZXNzKCBhc3NldHMubG9hZGVkWyBpIF0gKTtcbiAgICAgICAgICAgICAgICBhc3NldHMucHJvY2Vzc2VkWyBpIF0gPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIGdldFR5cGU6IGZ1bmN0aW9uKCBwYXRoICkge1xuICAgICAgICBcbiAgICAgICAgdmFyIHNwbGl0ID0gcGF0aC5zcGxpdCggJy8nICk7XG4gICAgICAgIHZhciBrZXkgPSBzcGxpdFsgc3BsaXQubGVuZ3RoIC0gMiBdO1xuICAgICAgICByZXR1cm4gdHlwZXNbIGtleSBdO1xuXG4gICAgfSxcblxuICAgIGxvYWQ6IGZ1bmN0aW9uKCBvcHRzICkge1xuXG4gICAgICAgIGlmICggb3B0cy5hc3NldHMubGVuZ3RoID09PSAwICkge1xuICAgICAgICAgICAgdmFyIHAgPSBuZXcgUHJvbWlzZSgpO1xuICAgICAgICAgICAgcC5yZXNvbHZlKCk7XG4gICAgICAgICAgICByZXR1cm4gcDtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBsb2FkZWQgPSAwO1xuICAgICAgICB2YXIgcHJvbWlzZXMgPSBbXTtcblxuICAgICAgICBvcHRzLmFzc2V0cy5mb3JFYWNoKCBmdW5jdGlvbiggcGF0aCApIHsgXG5cbiAgICAgICAgICAgIHZhciBsb2FkZXIgPSBhc3NldHMuZ2V0VHlwZSggcGF0aCApO1xuICAgICAgICAgICAgaWYgKCAhbG9hZGVyICkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciggJ1VucmVjb2duaXplZCBhc3NldCBwcmVmaXg6ICcgKyBwYXRoICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBwcm9taXNlID0gYXNzZXRzLnByb21pc2VzWyBwYXRoIF07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICggIXByb21pc2UgKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcHJvbWlzZSA9IGFzc2V0cy5wcm9taXNlc1sgcGF0aCBdID0gbmV3IFByb21pc2UoKTtcblxuICAgICAgICAgICAgICAgIGxvYWRlci5sb2FkKCBhc3NldHMuYmFzZVBhdGggKyBwYXRoLCBmdW5jdGlvbiggYXNzZXQgKSB7XG4gICAgICAgICAgICAgICAgICAgIGFzc2V0cy5sb2FkZWRbIHBhdGggXSA9IGFzc2V0O1xuICAgICAgICAgICAgICAgICAgICBwcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcHJvbWlzZS50aGVuKCBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgIGxvYWRlZCsrO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmICggb3B0cy5sb2FkZXIgKSB7IFxuICAgICAgICAgICAgICAgICAgICBvcHRzLmxvYWRlciggbG9hZGVkIC8gb3B0cy5hc3NldHMubGVuZ3RoLCBsb2FkZWQsIG9wdHMuYXNzZXRzLmxlbmd0aCwgcGF0aCApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICBwcm9taXNlcy5wdXNoKCBwcm9taXNlICk7XG5cbiAgICAgICAgfSApO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKCBwcm9taXNlcyApO1xuXG4gICAgfVxuXG59ICk7IiwidmFyIHhociAgICAgPSByZXF1aXJlKCAndXRpbHMveGhyJyApO1xudmFyIFByb21pc2UgPSByZXF1aXJlKCAndXRpbHMvUHJvbWlzZScgKTtcblxudmFyIGFzc2V0cyAgPSByZXF1aXJlKCAnYXNzZXRzJyApO1xudmFyIGltYWdlICAgPSByZXF1aXJlKCAnYXNzZXRzL2ltYWdlJyApO1xudmFyIHRleHR1cmUgPSByZXF1aXJlKCAnYXNzZXRzL3RleHR1cmUnICk7XG5cbnZhciBUZXh0dXJlQXRsYXMgPSByZXF1aXJlKCAndGhyZWUvVGV4dHVyZUF0bGFzJyApO1xuXG52YXIgUEFUSF9JTkRFWCA9IC9cXHsoXFxkKylcXH0vO1xuXG4vLyBmb3IgdGhyZWUuanMsIHJlcXVpcmVzIHRocmVlL1RleHR1cmVBdGxhcyBtb2R1bGVcblxuLy8gYXRsYXMvdGV4dHVyZXN7bn0uanNvblxuLy8gd2hlcmUgYXRsYXMvdGV4dHVyZXNbMC1uXS5qc29uXG4vLyBhbmQgYXRsYXMvdGV4dHVyZXNbMC1uXS5wbmcgZXhpc3RzXG5cbm1vZHVsZS5leHBvcnRzID0geyBcblxuICAgIGxvYWQ6IGZ1bmN0aW9uKCBtZXRhUGF0aCwgc3VjY2VzcywgZXJyb3IgKSB7IFxuXG4gICAgICAgIHZhciBtYXRjaCA9IG1ldGFQYXRoLm1hdGNoKCBQQVRIX0lOREVYICk7XG4gICAgICAgIHZhciBudW1TaGVldHM7XG5cbiAgICAgICAgaWYgKCBtYXRjaCApIHsgXG4gICAgICAgICAgICBudW1TaGVldHMgPSBtYXRjaFsgMSBdO1xuICAgICAgICB9IGVsc2UgeyBcbiAgICAgICAgICAgIGVycm9yICYmIGVycm9yKCAnSW52YWxpZCBUZXh0dXJlQXRsYXMgbWV0YSBwYXRoOiAnICsgbWV0YVBhdGggKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBwcm9taXNlcyA9IFtdO1xuICAgICAgICB2YXIgcmF3QXRsYXMgPSBbXTtcblxuICAgICAgICBmb3IgKCB2YXIgaSA9IDA7IGkgPCBudW1TaGVldHM7IGkrKyApIHsgXG4gICAgICAgICAgICBsb2FkU2hlZXQoIGkgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGxvYWRTaGVldCggaSApIHsgXG5cbiAgICAgICAgICAgIHZhciBqc29uUGF0aCA9IG1ldGFQYXRoLnJlcGxhY2UoIFBBVEhfSU5ERVgsIGkgKTtcbiAgICAgICAgICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoKTtcblxuICAgICAgICAgICAgeGhyLmdldCgganNvblBhdGgsIGZ1bmN0aW9uKCB0ZXh0ICkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHZhciBqc29uID0gSlNPTi5wYXJzZSggdGV4dCApO1xuICAgICAgICAgICAgICAgIHZhciBpbWFnZVBhdGggPSBhc3NldHMuYmFzZVBhdGggKyBqc29uLm1ldGEuaW1hZ2U7XG5cbiAgICAgICAgICAgICAgICB2YXIgcmF3U2hlZXQgPSB7XG4gICAgICAgICAgICAgICAgICAgIGltYWdlOiBudWxsLCBcbiAgICAgICAgICAgICAgICAgICAganNvbjoganNvblxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICByYXdBdGxhcy5wdXNoKCByYXdTaGVldCApO1xuXG4gICAgICAgICAgICAgICAgaW1hZ2UubG9hZCggaW1hZ2VQYXRoLCBmdW5jdGlvbiggaW1hZ2UgKSB7IFxuXG4gICAgICAgICAgICAgICAgICAgIHJhd1NoZWV0LmltYWdlID0gaW1hZ2U7XG4gICAgICAgICAgICAgICAgICAgIHByb21pc2UucmVzb2x2ZSgpO1xuXG4gICAgICAgICAgICAgICAgfSwgZXJyb3IgKTtcblxuICAgICAgICAgICAgfSwgZXJyb3IgKTtcblxuICAgICAgICAgICAgcHJvbWlzZXMucHVzaCggcHJvbWlzZSApO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgUHJvbWlzZS5hbGwoIHByb21pc2VzICkudGhlbiggZnVuY3Rpb24oKSB7XG4gICAgICAgICBcbiAgICAgICAgICAgIHN1Y2Nlc3MoIHJhd0F0bGFzICk7XG5cbiAgICAgICAgfSApO1xuXG4gICAgfSwgXG5cbiAgICBwcm9jZXNzOiBmdW5jdGlvbiggYXRsYXNEYXRhICkge1xuXG4gICAgICAgIHZhciBzaGVldHMgPSBbXTtcblxuICAgICAgICBmb3IgKCB2YXIgaSA9IDAsIGwgPSBhdGxhc0RhdGEubGVuZ3RoOyBpIDwgbDsgaSsrICkgeyBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGRhdGEgPSBhdGxhc0RhdGFbIGkgXTtcbiAgICAgICAgICAgIHZhciB0ZXggPSB0ZXh0dXJlLnByb2Nlc3MoIGRhdGEuaW1hZ2UgKTtcblxuICAgICAgICAgICAgLy8ganNvbiBoYXMgYWxyZWFkeSBiZWVuICdwcm9jZXNzZWQnIGluIGxvYWRcbiAgICAgICAgICAgIHZhciBqc29uID0gZGF0YS5qc29uO1xuICAgICAgICAgICAgdmFyIHNoZWV0ID0gbmV3IFRleHR1cmVBdGxhcy5TaGVldCggdGV4LCBqc29uICk7XG5cbiAgICAgICAgICAgIHNoZWV0cy5wdXNoKCBzaGVldCApO1xuXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFRleHR1cmVBdGxhcyggc2hlZXRzICk7XG5cbiAgICB9XG5cbn1cblxuIiwidmFyIHhociA9IHJlcXVpcmUoICd1dGlscy94aHInICk7XG5tb2R1bGUuZXhwb3J0cyA9IHsgbG9hZDogeGhyLmdldEJ1ZmZlciB9OyIsInZhciBQcm9taXNlID0gcmVxdWlyZSggJ3V0aWxzL1Byb21pc2UnICk7XG5cbnZhciBzdWZmaXhlcyA9IFsgJ3B4JywgJ254JywgJ3B5JywgJ255JywgJ3B6JywgJ256JyBdO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHsgXG4gICAgXG4gICAgbG9hZDogZnVuY3Rpb24oIHBhdGgsIGxvYWQsIGVycm9yICkge1xuICAgICAgICAgICAgXG4gICAgICAgIHZhciBpbWFnZXMgPSBbXTtcbiAgICAgICAgXG4gICAgICAgIHZhciBwcm9taXNlcyA9IFtdO1xuXG4gICAgICAgIGZvciAoIHZhciBpID0gMCwgbCA9IHN1ZmZpeGVzLmxlbmd0aDsgaSA8IGw7IGkrKyApIHsgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgICAgIHZhciBwID0gbmV3IFByb21pc2UoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcHJvbWlzZXMucHVzaCggcCApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpbWFnZXMucHVzaCggaW1nICk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGltZy5vbmxvYWQgPSBwLnJlc29sdmU7XG4gICAgICAgICAgICBpbWcub25lcnJvciA9IHAucmVqZWN0O1xuXG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKCB2YXIgaSA9IDAsIGwgPSBzdWZmaXhlcy5sZW5ndGg7IGkgPCBsOyBpKysgKSB7IFxuICAgICAgICAgICAgaW1hZ2VzWyBpIF0uc3JjID0gcGF0aC5yZXBsYWNlKCAnKicsIHN1ZmZpeGVzWyBpIF0gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIFByb21pc2UuYWxsKCBwcm9taXNlcyApLnRoZW4oIGZ1bmN0aW9uKCkgeyBcbiAgICAgICAgICAgIGxvYWQoIGltYWdlcyApIFxuICAgICAgICB9ICk7XG5cbiAgICB9LCBcbiAgICBcbiAgICBwcm9jZXNzOiBmdW5jdGlvbiggaW1hZ2VzICkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyggaW1hZ2VzICk7XG4gICAgICAgIHZhciBjdWJlID0gbmV3IFRIUkVFLkN1YmVUZXh0dXJlKCBpbWFnZXMgKTtcbiAgICAgICAgXG4gICAgICAgIGN1YmUuZmxpcFkgPSBmYWxzZTtcbiAgICAgICAgY3ViZS5uZWVkc1VwZGF0ZSA9IHRydWU7XG5cbiAgICAgICAgcmV0dXJuIGN1YmU7XG5cbiAgICB9XG5cbn0iLCJ2YXIgeGhyID0gcmVxdWlyZSggJ3V0aWxzL3hocicgKTtcblxudmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7IFxuICAgIGxvYWQ6IHhoci5nZXQsIFxuICAgIHByb2Nlc3M6IGZ1bmN0aW9uKCB0ZXh0ICkge1xuICAgICAgICBlbC5pbm5lckhUTUwgPSB0ZXh0O1xuICAgICAgICByZXR1cm4gZWwuZmlyc3RFbGVtZW50Q2hpbGQ7XG4gICAgfVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBsb2FkOiBmdW5jdGlvbiggcGF0aCwgbG9hZCwgZXJyb3IgKSB7XG4gICAgICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgaW1nLm9ubG9hZCA9IGZ1bmN0aW9uKCkgeyBsb2FkKCBpbWcgKSB9O1xuICAgICAgICBpbWcub25lcnJvciA9IGVycm9yO1xuICAgICAgICBpbWcuc3JjID0gcGF0aDtcbiAgICB9XG59OyIsInZhciB4aHIgPSByZXF1aXJlKCAndXRpbHMveGhyJyApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHsgXG4gICAgbG9hZDogeGhyLmdldCwgXG4gICAgcHJvY2VzczogZnVuY3Rpb24oIHRleHQgKSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKCB0ZXh0ICk7XG4gICAgfVxufTsiLCJ2YXIgdGV4dCA9IHJlcXVpcmUoICdhc3NldHMvdGV4dCcgKTtcbnZhciByZWFkeSA9IHJlcXVpcmUoICdjb21tb24vcmVhZHknICk7XG5cbnZhciBsb2FkZXI7XG4gICAgXG5yZWFkeS50aGVuKCBmdW5jdGlvbigpIHtcbiAgICBpZiAoIHdpbmRvdy5USFJFRSAmJiBUSFJFRS5PQkpMb2FkZXIgKSB7XG4gICAgICAgIGxvYWRlciA9IG5ldyBUSFJFRS5PQkpMb2FkZXIoKTtcbiAgICB9XG59ICk7XG5cbm1vZHVsZS5leHBvcnRzID0geyBcbiAgICBsb2FkOiB0ZXh0LmxvYWQsIFxuICAgIHByb2Nlc3M6IGZ1bmN0aW9uKCB0ZXh0ICkge1xuICAgICAgICB2YXIgb2JqID0gbG9hZGVyLnBhcnNlKCB0ZXh0ICk7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfVxufSIsInZhciBTYW1wbGUgPSByZXF1aXJlKCAnYXVkaW8vU2FtcGxlJyApO1xudmFyIGF1ZGlvID0gcmVxdWlyZSggJ2NvbW1vbi9hdWRpbycgKTtcbnZhciB4aHIgPSByZXF1aXJlKCAndXRpbHMveGhyJyApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHsgXG4gICAgbG9hZDogZnVuY3Rpb24oIHBhdGgsIGxvYWQsIGVycm9yICkge1xuICAgICAgICB4aHIuZ2V0QnVmZmVyKCBwYXRoLCBmdW5jdGlvbiggcmVzcCApIHtcbiAgICAgICAgICAgIGF1ZGlvLmRlY29kZUF1ZGlvRGF0YSggcmVzcCwgbG9hZCwgZXJyb3IgKTtcbiAgICAgICAgfSwgZXJyb3IgKTtcbiAgICB9LCBcbiAgICBwcm9jZXNzOiBmdW5jdGlvbiggYnVmZmVyICkge1xuICAgICAgICByZXR1cm4gbmV3IFNhbXBsZSggYnVmZmVyICk7XG4gICAgfSBcbn07IiwiLy8gaGFja3kgZm9yIHNsaW1lIGNsb2NrXG4vLyBkb2Vzbid0IGFjdHVhbGx5IFwicHJvY2Vzc1wiXG5cbnZhciBQQVRIX0lOREVYID0gL1xceyhcXGQrKVxcfS87XG5cbi8vIHVzZSBmb3IgcGl4aS5qc1xuXG4vLyBzcHJpdGVzaGVldC90ZXh0dXJlc3tmfVxuLy8gd2hlcmUgc3ByaXRlc2hlZXQvdGV4dHVyZXMuanNvblxuLy8gYW5kIHNwcml0ZXNoZWV0L3RleHR1cmVzLnBuZyBleGlzdHNcbi8vIGFuZCB0aGUgc3ByaXRlc2hlZXQgaGFzIHtmfSBmcmFtZXNcbi8vIGFzc3VtZXMgdGhlIHNwcml0ZXMgYXJlIG5hbWVkIHRleHR1cmVzMDAwMC5wbmcgaW50ZXJuYWxseS5cblxubW9kdWxlLmV4cG9ydHMgPSB7IFxuXG4gICAgbG9hZDogZnVuY3Rpb24oIG1ldGFQYXRoLCBzdWNjZXNzLCBlcnJvciApIHsgXG5cbiAgICAgICAgdmFyIG1hdGNoID0gbWV0YVBhdGgubWF0Y2goIFBBVEhfSU5ERVggKTtcbiAgICAgICAgdmFyIG51bUZyYW1lcztcblxuICAgICAgICBpZiAoIG1hdGNoICkgeyBcbiAgICAgICAgICAgIG51bUZyYW1lcyA9IHBhcnNlSW50KCBtYXRjaFsgMSBdICk7XG4gICAgICAgIH0gZWxzZSB7IFxuICAgICAgICAgICAgZXJyb3IgJiYgZXJyb3IoICdJbnZhbGlkIHNwcml0ZXNoZWV0IG1ldGEgcGF0aDogJyArIG1ldGFQYXRoICk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYmFzZW5hbWUgPSBtZXRhUGF0aC5yZXBsYWNlKCBQQVRIX0lOREVYLCAnJyApLnJlcGxhY2UoICdzcHJpdGVzaGVldC8nLCAnJyApO1xuICAgICAgICB2YXIgZnJhbWVzID0gW107XG5cbiAgICAgICAgUElYSS5sb2FkZXIuYWRkKCBtZXRhUGF0aCApLmxvYWQoIGZ1bmN0aW9uKCkgeyBcblxuICAgICAgICAgICAgZm9yICggdmFyIGkgPSAwOyBpIDwgbnVtRnJhbWVzOyBpKysgKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZpbGVuYW1lID0gYmFzZW5hbWUgKyB6ZXJvUGFkKCBpLCA0ICkgKyAnLnBuZyc7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coIGZpbGVuYW1lICk7XG4gICAgICAgICAgICAgICAgdmFyIHRleHR1cmUgPSBQSVhJLlRleHR1cmUuZnJvbUZyYW1lKCBmaWxlbmFtZSApO1xuICAgICAgICAgICAgICAgIGZyYW1lcy5wdXNoKCB0ZXh0dXJlICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN1Y2Nlc3MoIGZyYW1lcyApO1xuXG4gICAgICAgIH0gKTtcblxuICAgIH0sIFxuXG4gICAgcHJvY2VzczogZnVuY3Rpb24oIGZyYW1lcyApIHtcblxuICAgICAgICByZXR1cm4gZnJhbWVzO1xuXG4gICAgfVxuXG59XG5cbmZ1bmN0aW9uIHplcm9QYWQoIHZhbCwgemVyb3MgKSB7XG4gICAgZm9yICggdmFyIGkgPSB2YWwudG9TdHJpbmcoKS5sZW5ndGg7IGkgPCB6ZXJvczsgaSsrICkge1xuICAgICAgICB2YWwgPSAnMCcgKyB2YWw7XG4gICAgfVxuICAgIHJldHVybiB2YWw7XG59IiwidmFyIHhociA9IHJlcXVpcmUoICd1dGlscy94aHInICk7XG5tb2R1bGUuZXhwb3J0cyA9IHsgbG9hZDogeGhyLmdldCB9OyIsInZhciBpbWFnZSA9IHJlcXVpcmUoICdhc3NldHMvaW1hZ2UnICk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgXG4gICAgbG9hZDogaW1hZ2UubG9hZCwgXG5cbiAgICBwcm9jZXNzOiBmdW5jdGlvbiggaW1nICkge1xuXG4gICAgICAgIGlmICggd2luZG93LlRIUkVFICkge1xuXG4gICAgICAgICAgICB2YXIgdGV4ID0gbmV3IFRIUkVFLlRleHR1cmUoIGltZyApO1xuICAgICAgICAgICAgdGV4Lm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiB0ZXg7XG5cbiAgICAgICAgfSBlbHNlIGlmICggd2luZG93LlBJWEkgKSB7XG5cbiAgICAgICAgICAgIHZhciBzcmMgPSBpbWcuc3JjO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgYmFzZVRleHR1cmUgPSBuZXcgUElYSS5CYXNlVGV4dHVyZSggaW1nICk7XG4gICAgICAgICAgICBiYXNlVGV4dHVyZS5pbWFnZVVybCA9IHNyYztcbiAgICAgICAgICAgIFBJWEkudXRpbHMuQmFzZVRleHR1cmVDYWNoZVsgc3JjIF0gPSBiYXNlVGV4dHVyZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYmFzZVRleHR1cmUucmVzb2x1dGlvbiA9IDI7XG4gICAgICAgICAgICAvLyBpZiB0aGVyZSBpcyBhbiBAMnggYXQgdGhlIGVuZCBvZiB0aGUgc3JjIHdlIGFyZSBnb2luZyB0byBhc3N1bWUgaXRzIGEgaGlnaHJlcyBpbWFnZVxuICAgICAgICAgICAgaWYgKCBzcmMuaW5kZXhPZiggUElYSS5SRVRJTkFfUFJFRklYICsgJy4nICkgIT09IC0xICkge1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbmV3IFBJWEkuVGV4dHVyZSggYmFzZVRleHR1cmUgKTtcblxuICAgICAgICB9IGVsc2UgeyBcblxuICAgICAgICAgICAgdGhyb3cgJ0kgZG9uXFwndCBzZWUgUElYSSBvciBUSFJFRSwgc28gSSBkb25cXCd0IGtub3cgd2hhdCBraW5kIG9mIHRleHR1cmUgeW91XFwncmUgdHJ5aW5nIHRvIGxvYWQuJ1xuXG4gICAgICAgIH1cblxuICAgIH1cblxufSIsInZhciBhdWRpbyA9IHJlcXVpcmUoICdjb21tb24vYXVkaW8nICk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2FtcGxlO1xuXG5mdW5jdGlvbiBTYW1wbGUoIGJ1ZmZlciApIHtcbiAgICBcbiAgICB0aGlzLmJ1ZmZlciA9IGJ1ZmZlcjtcbiAgICB0aGlzLm5lZWRzTmV3U291cmNlID0gdHJ1ZTtcbiAgICBcbiAgICB0aGlzLnVwZGF0ZVNvdXJjZSgpO1xuXG5cbn1cblxuU2FtcGxlLnByb3RvdHlwZS51cGRhdGVTb3VyY2UgPSBmdW5jdGlvbigpIHtcbiAgICBcbiAgICB0aGlzLmdhaW4gPSBhdWRpby5jcmVhdGVHYWluKCk7XG4gICAgdGhpcy5nYWluLmNvbm5lY3QoIGF1ZGlvLmRlc3RpbmF0aW9uICk7XG5cbiAgICB0aGlzLnNvdXJjZSA9IGF1ZGlvLmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgIHRoaXMuc291cmNlLmJ1ZmZlciA9IHRoaXMuYnVmZmVyO1xuICAgIHRoaXMuc291cmNlLmNvbm5lY3QoIHRoaXMuZ2FpbiApO1xuICAgIHRoaXMubmVlZHNOZXdTb3VyY2UgPSBmYWxzZTtcbiAgICBcbn07XG5cblNhbXBsZS5wcm90b3R5cGUucGxheSA9XG5TYW1wbGUucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oIHRpbWUsIG9mZnNldCwgZHVyICkge1xuICAgIFxuICAgIHRpbWUgPSB0aW1lIHx8IDA7XG4gICAgb2Zmc2V0ID0gb2Zmc2V0IHx8IDA7XG5cbiAgICBpZiAoIHRoaXMubmVlZHNOZXdTb3VyY2UgKSB7IFxuICAgICAgICB0aGlzLnVwZGF0ZVNvdXJjZSgpO1xuICAgIH1cblxuICAgIHRoaXMuc291cmNlLmxvb3AgPSB0aGlzLmxvb3A7XG5cbiAgICBpZiAoICFkdXIgKSB7XG4gICAgICAgIHRoaXMuc291cmNlLnN0YXJ0KCBhdWRpby5jdXJyZW50VGltZSArIHRpbWUgKTtcbiAgICB9IGVsc2UgeyBcbiAgICAgICAgdGhpcy5zb3VyY2Uuc3RhcnQoIGF1ZGlvLmN1cnJlbnRUaW1lICsgdGltZSwgb2Zmc2V0LCBkdXIgKTtcbiAgICB9XG5cbiAgICB0aGlzLnBsYXlpbmcgPSB0cnVlO1xuICAgIHRoaXMubmVlZHNOZXdTb3VyY2UgPSB0cnVlO1xuXG59O1xuXG5TYW1wbGUucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbiggdGltZSApIHtcblxuICAgIGlmICggdGhpcy5zb3VyY2UgKSB7XG4gICAgICAgIHRoaXMuc291cmNlLnN0b3AoIGF1ZGlvLmN1cnJlbnRUaW1lICsgdGltZSB8fCAwICk7XG4gICAgICAgIC8vIGRlbGV0ZSB0aGlzLnNvdXJjZTtcbiAgICB9XG5cbiAgICB0aGlzLnBsYXlpbmcgPSBmYWxzZTtcbiAgICB0aGlzLm5lZWRzTmV3U291cmNlID0gdHJ1ZTtcblxufTtcblxuU2FtcGxlLnByb3RvdHlwZS5mYWRlT3V0ID0gZnVuY3Rpb24oIGR1ciwgdGltZSApIHtcbiAgICB0aW1lID0gdGltZSB8fCAwO1xuICAgIHRoaXMuZ2Fpbi5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKCAwLjAsIGF1ZGlvLmN1cnJlbnRUaW1lICsgdGltZSArIGR1ciApO1xuICAgIHRoaXMucGxheWluZyA9IGZhbHNlO1xuICAgIHRoaXMubmVlZHNOZXdTb3VyY2UgPSB0cnVlO1xuXG59OyIsInZhciB1YSA9IHJlcXVpcmUoICdjb21tb24vdWEnICk7XG5cbmlmICggIXdpbmRvdy5USFJFRSApIHtcbiAgICByZXR1cm47XG59XG5cbnZhciBpbnZlcnNlID0gbmV3IFRIUkVFLlF1YXRlcm5pb24oKTtcbnZhciBmaXJzdFBlcnNvbiA9IG5ldyBUSFJFRS5RdWF0ZXJuaW9uKCk7XG5cbnZhciBxdWF0ID0gbmV3IFRIUkVFLlF1YXRlcm5pb24oKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZmlyc3RQZXJzb246IGZpcnN0UGVyc29uLCBcbiAgICBpbnZlcnNlOiBpbnZlcnNlXG59XG5cbmlmICggIXVhLmhhbmRoZWxkICkgcmV0dXJuO1xuXG52YXIgZGV2aWNlT3JpZW50YXRpb24gPSB7fTtcbnZhciBzY3JlZW5PcmllbnRhdGlvbiA9IDA7XG5cbnZhciByYWRpYW5zID0gTWF0aC5QSSAvIDE4MDtcbnZhciB6ZWUgPSBuZXcgVEhSRUUuVmVjdG9yMyggMCwgMCwgMSApO1xudmFyIGV1bGVyID0gbmV3IFRIUkVFLkV1bGVyKCk7XG52YXIgcTAgPSBuZXcgVEhSRUUuUXVhdGVybmlvbigpO1xudmFyIHExID0gbmV3IFRIUkVFLlF1YXRlcm5pb24oIC0gTWF0aC5zcXJ0KCAwLjUgKSwgMCwgMCwgTWF0aC5zcXJ0KCAwLjUgKSApOyAvLyAtIFBJLzIgYXJvdW5kIHRoZSB4LWF4aXNcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdkZXZpY2VvcmllbnRhdGlvbicsIG9uRGV2aWNlT3JpZW50YXRpb24sIGZhbHNlICk7XG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ29yaWVudGF0aW9uY2hhbmdlJywgb25PcmllbnRhdGlvbkNoYW5nZSwgZmFsc2UgKTtcblxuZnVuY3Rpb24gb25PcmllbnRhdGlvbkNoYW5nZSgpIHtcbiAgICB2YXIgb3JpZW50ID0gd2luZG93Lm9yaWVudGF0aW9uID8gd2luZG93Lm9yaWVudGF0aW9uICogcmFkaWFucyA6IDA7IC8vIE9cbiAgICBxMC5zZXRGcm9tQXhpc0FuZ2xlKCB6ZWUsIC0gb3JpZW50IClcbn1cblxuZnVuY3Rpb24gb25EZXZpY2VPcmllbnRhdGlvbiggZXZlbnQgKSB7XG4gICAgXG4gICAgdmFyIGFscGhhICA9IGV2ZW50LmdhbW1hID8gZXZlbnQuYWxwaGEgKiByYWRpYW5zOiAwOyAvLyBaXG4gICAgdmFyIGJldGEgICA9IGV2ZW50LmJldGEgID8gZXZlbnQuYmV0YSAgKiByYWRpYW5zOiAwOyAvLyBYJ1xuICAgIHZhciBnYW1tYSAgPSBldmVudC5nYW1tYSA/IGV2ZW50LmdhbW1hICogcmFkaWFuczogMDsgLy8gWScnXG5cbiAgICBldWxlci5zZXQoIGJldGEsIGFscGhhLCAtZ2FtbWEsICdZWFonICk7IC8vICdaWFknIGZvciB0aGUgZGV2aWNlLCBidXQgJ1lYWicgZm9yIHVzXG5cbiAgICBmaXJzdFBlcnNvbi5zZXRGcm9tRXVsZXIoIGV1bGVyICk7IC8vIG9yaWVudCB0aGUgZGV2aWNlXG4gICAgZmlyc3RQZXJzb24ubXVsdGlwbHkoIHExICk7IC8vIGNhbWVyYSBsb29rcyBvdXQgdGhlIGJhY2sgb2YgdGhlIGRldmljZSwgbm90IHRoZSB0b3BcbiAgICBmaXJzdFBlcnNvbi5tdWx0aXBseSggcTAgKTsgLy8gYWRqdXN0IGZvciBzY3JlZW4gb3JpZW50YXRpb25cblxuICAgIGludmVyc2Uuc2V0RnJvbUV1bGVyKCBldWxlciApO1xuICAgIGludmVyc2UubXVsdGlwbHkoIHExICk7XG4gICAgaW52ZXJzZS5pbnZlcnNlKCk7XG4gICAgaW52ZXJzZS5tdWx0aXBseSggcTAgKTtcblxufVxuIiwidmFyIEF1ZGlvQ29udGV4dCA9IHdpbmRvdy5BdWRpb0NvbnRleHQgfHwgd2luZG93LndlYmtpdEF1ZGlvQ29udGV4dDtcblxubW9kdWxlLmV4cG9ydHMgPSBBdWRpb0NvbnRleHQgPyBuZXcgQXVkaW9Db250ZXh0KCkgOiBudWxsOyIsInRyeSB7IFxuICAgIG1vZHVsZS5leHBvcnRzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKS5nZXRDb250ZXh0KCAnd2ViZ2wnICkgfHwgXG4gICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApLmdldENvbnRleHQoICdleHBlcmltZW50YWwtd2ViZ2wnICkgXG59IGNhdGNoKCBlICkge1xuICAgIG1vZHVsZS5leHBvcnRzID0gbnVsbDtcbn0iLCJ2YXIgUHJvbWlzZSA9IHJlcXVpcmUoICd1dGlscy9Qcm9taXNlJyApO1xubW9kdWxlLmV4cG9ydHMgPSBuZXcgUHJvbWlzZSgpOyIsInZhciBhcnJheSA9IHJlcXVpcmUoICd1dGlscy9hcnJheScgKTtcbnZhciBFdmVudHMgPSByZXF1aXJlKCAndXRpbHMvRXZlbnRzJyApO1xudmFyIG5vdyA9IHJlcXVpcmUoICd1dGlscy9ub3cnICk7XG5cbmlmICggd2luZG93LlN0YXRzICkge1xuXG4gICAgdmFyIHN0YXRzID0gbmV3IFN0YXRzKCk7XG5cbiAgICBzdGF0cy5kb21FbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICBzdGF0cy5kb21FbGVtZW50LnN0eWxlLmxlZnQgPSAnMHB4JztcbiAgICBzdGF0cy5kb21FbGVtZW50LnN0eWxlLnRvcCA9ICcwcHgnO1xuXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggc3RhdHMuZG9tRWxlbWVudCApO1xuXG59XG5cbnZhciBjaGlsZHJlbiA9IFtdO1xudmFyIHJlcXVlc3Q7XG5cbnZhciBibHVycmVkID0gZmFsc2U7XG52YXIgYmx1clRpbWVvdXQ7XG52YXIgYmx1clRpbWVvdXRMZW5ndGggPSAzMDA7XG5cbnZhciBwcmV2VGltZTtcblxudmFyIHVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgLy8gbmV4dCBmcmFtZVxuICAgIHJlcXVlc3QgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoIHVwZGF0ZSApO1xuXG4gICAgLy8gbWVhc3VyZSBzdGF0c1xuICAgIHN0YXRzICYmIHN0YXRzLmJlZ2luKCk7XG5cbiAgICAvLyBkb2VzIHdpbmRvdyBoYXZlIGZvY3VzP1xuICAgIGlmICggYmx1cnJlZCApIHsgXG4gICAgICAgIGZvY3VzKCk7XG4gICAgfVxuXG4gICAgLy8gY2hlY2sgZm9yIGJsdXJcbiAgICBjbGVhclRpbWVvdXQoIGJsdXJUaW1lb3V0ICk7XG4gICAgYmx1clRpbWVvdXQgPSBzZXRUaW1lb3V0KCBibHVyLCBibHVyVGltZW91dExlbmd0aCApO1xuICAgIFxuICAgIHByZXZUaW1lID0gbG9vcC50aW1lO1xuXG4gICAgaWYgKCBwcmV2VGltZSAhPT0gdW5kZWZpbmVkICkgeyBcbiAgICAgICAgbG9vcC5kZWx0YSA9IGxvb3AudGltZSAtIHByZXZUaW1lO1xuICAgIH1cblxuICAgIGxvb3AudGltZSA9IG5vdygpO1xuXG4gICAgLy8gcnVuIGNoaWxkcmVuXG4gICAgZm9yICggdmFyIGkgPSAwLCBsID0gY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbDsgaSsrICkgeyBcbiAgICAgICAgY2hpbGRyZW5bIGkgXSgpO1xuICAgIH0gICBcblxuICAgIGxvb3AuZnJhbWUrKztcblxuICAgIC8vIGZpbmlzaCBzdGF0c1xuICAgIHN0YXRzICYmIHN0YXRzLmVuZCgpO1xuXG59O1xuXG5mdW5jdGlvbiBibHVyKCkge1xuICAgIFxuICAgIGlmICggYmx1cnJlZCApIHJldHVybjtcblxuICAgIGxvb3AuZmlyZSggJ2JsdXInICk7XG4gICAgYmx1cnJlZCA9IHRydWU7XG5cbn07XG5cbmZ1bmN0aW9uIGZvY3VzKCkge1xuICAgIFxuICAgIGlmICggIWJsdXJyZWQgKSByZXR1cm47XG5cbiAgICBsb29wLmZpcmUoICdmb2N1cycgKTtcbiAgICBibHVycmVkID0gZmFsc2U7XG5cbn1cblxudmFyIGxvb3AgPSB7XG4gICAgZGVsdGE6IDAsIFxuICAgIGZyYW1lOiAwLCBcbiAgICBzdGFydDogZnVuY3Rpb24oIGZuYyApIHsgXG5cbiAgICAgICAgaWYgKCBmbmMgKSB7IFxuICAgICAgICAgICAgbG9vcC5hZGQoIGZuYyApO1xuICAgICAgICB9XG5cbiAgICAgICAgdXBkYXRlKCk7XG4gICAgfSxcbiAgICBcbiAgICBzdGF0czogZnVuY3Rpb24oIHZhbCApIHtcblxuICAgICAgICBpZiAoICF2YWwgKSB7IFxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCggc3RhdHMuZG9tRWxlbWVudCApO1xuICAgICAgICB9XG5cbiAgICB9LCBcblxuICAgIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoIHJlcXVlc3QgKTtcbiAgICB9LCBcblxuICAgIGFkZDogZnVuY3Rpb24oIGZuYyApIHtcbiAgICAgICAgY2hpbGRyZW4ucHVzaCggZm5jICk7XG4gICAgfSwgXG5cbiAgICByZW1vdmU6IGZ1bmN0aW9uKCBmbmMgKSB7XG4gICAgICAgIGFycmF5LnJlbW92ZSggY2hpbGRyZW4sIGZuYyApO1xuICAgIH1cblxufTtcblxuRXZlbnRzLm1peFRvKCBsb29wICk7XG5cbm1vZHVsZS5leHBvcnRzID0gbG9vcDsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7fTsiLCJ2YXIgRXZlbnRzID0gcmVxdWlyZSggJ3V0aWxzL0V2ZW50cycgKTtcblxudmFyIHBvaW50ZXIgPSBtb2R1bGUuZXhwb3J0cyA9IHsgXG4gICAgeDogMCwgXG4gICAgeTogMCwgXG4gICAgbng6IDAsIFxuICAgIG55OiAwLCBcbiAgICBweDogMCxcbiAgICBweTogMCxcbiAgICBkeDogMCxcbiAgICBkeTogMCxcbiAgICBkZHg6IDAsXG4gICAgZGR5OiAwLFxuICAgIGRvd246IGZhbHNlXG59O1xuXG5FdmVudHMubWl4VG8oIHBvaW50ZXIgKTtcblxuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlbW92ZScsIGZ1bmN0aW9uKCBlICkge1xuICAgIFxuXG5cbiAgICBtb3ZlKCBlLmNsaWVudFgsIGUuY2xpZW50WSApO1xuXG4gICAgaWYgKCBwb2ludGVyLmRvd24gKSB7IFxuICAgICAgICBwb2ludGVyLmZpcmUoICdkcmFnJywgcG9pbnRlci54LCBwb2ludGVyLnkgKTtcbiAgICB9XG5cblxufSwgZmFsc2UgKTtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaG1vdmUnLCBmdW5jdGlvbiggZSApIHtcbiAgICBcbiAgICBtb3ZlKCBlLnRvdWNoZXNbIDAgXS5jbGllbnRYLCBlLnRvdWNoZXNbIDAgXS5jbGllbnRZICk7XG4gICAgcG9pbnRlci5maXJlKCAnZHJhZycsIHBvaW50ZXIueCwgcG9pbnRlci55ICk7XG5cbn0sIGZhbHNlICk7XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vkb3duJywgZnVuY3Rpb24oIGUgKSB7XG5cbiAgICBkb3duKCk7XG5cbn0sIGZhbHNlICk7XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hzdGFydCcsIGZ1bmN0aW9uKCBlICkge1xuXG4gICAgcG9zaXRpb24oIGUudG91Y2hlc1sgMCBdLmNsaWVudFgsIGUudG91Y2hlc1sgMCBdLmNsaWVudFkgKTtcbiAgICBkb3duKCk7XG5cbn0sIGZhbHNlICk7XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAnbW91c2V1cCcsIGZ1bmN0aW9uKCBlICkge1xuXG4gICAgdXAoKTtcblxufSwgZmFsc2UgKTtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaGVuZCcsIGZ1bmN0aW9uKCBlICkge1xuICAgIFxuICAgIGUudG91Y2hlcy5sZW5ndGggPD0gMSAmJiB1cCgpO1xuXG59LCBmYWxzZSApO1xuXG5cbmZ1bmN0aW9uIG1vdmUoIHgsIHkgKSB7XG5cbiAgICBwb3NpdGlvbiggeCwgeSApO1xuICAgIHBvaW50ZXIuZmlyZSggJ21vdmUnLCB4LCB5ICk7XG5cbn1cblxuZnVuY3Rpb24gcG9zaXRpb24oIHgsIHkgKSB7XG5cbiAgICBwb2ludGVyLnB4ID0gcG9pbnRlci54O1xuICAgIHBvaW50ZXIucHkgPSBwb2ludGVyLnk7XG5cbiAgICBwb2ludGVyLnggPSB4O1xuICAgIHBvaW50ZXIueSA9IHk7XG5cbiAgICBwb2ludGVyLmR4ID0gcG9pbnRlci54IC0gcG9pbnRlci5weDtcbiAgICBwb2ludGVyLmR5ID0gcG9pbnRlci55IC0gcG9pbnRlci5weTtcblxuICAgIHBvaW50ZXIubnggPSBwb2ludGVyLnggLyB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICBwb2ludGVyLm55ID0gcG9pbnRlci55IC8gd2luZG93LmlubmVySGVpZ2h0O1xuXG4gICAgaWYgKCBwb2ludGVyLmRvd24gKSB7XG4gICAgICAgIHBvaW50ZXIuZGR4ICs9IHBvaW50ZXIuZHg7XG4gICAgICAgIHBvaW50ZXIuZGR5ICs9IHBvaW50ZXIuZHk7XG4gICAgfVxuXG59XG5cbmZ1bmN0aW9uIGRvd24oKSB7XG4gICAgXG4gICAgaWYgKCBwb2ludGVyLmRvd24gKSByZXR1cm47XG5cbiAgICBwb2ludGVyLmRkeCA9IDA7XG4gICAgcG9pbnRlci5kZHkgPSAwO1xuXG4gICAgcG9pbnRlci5kb3duID0gdHJ1ZTtcbiAgICBwb2ludGVyLmZpcmUoICdkb3duJyApO1xuXG59XG5cbmZ1bmN0aW9uIHVwKCkge1xuXG4gICAgcG9pbnRlci5kb3duID0gZmFsc2U7XG4gICAgcG9pbnRlci5maXJlKCAndXAnICk7XG4gICAgXG59IiwidmFyIFByb21pc2UgPSByZXF1aXJlKCAndXRpbHMvUHJvbWlzZScgKTtcbnZhciBzY29wZSA9IHJlcXVpcmUoICdjb21tb24vc2NvcGUnICk7XG5cbnZhciByZWFkeSA9IG5ldyBQcm9taXNlKCk7XG5cbmlmICggc2NvcGUuYWRkRXZlbnRMaXN0ZW5lciApIHtcbiAgICBzY29wZS5hZGRFdmVudExpc3RlbmVyKCAnbG9hZCcsIHJlYWR5LnJlc29sdmUgKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSByZWFkeTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcyB9KCk7IiwidmFyIGdsICAgICAgPSByZXF1aXJlKCAnY29tbW9uL2dsJyApO1xudmFyIGF1ZGlvICAgPSByZXF1aXJlKCAnY29tbW9uL2F1ZGlvJyApO1xuXG52YXIgc3RyaW5nICA9IG5hdmlnYXRvci51c2VyQWdlbnQ7XG52YXIgZ3B1ICAgICA9IGdsID8gZ2wuZ2V0UGFyYW1ldGVyKCBnbC5WRVJTSU9OICkgOiBudWxsO1xuXG52YXIgdWEgPSBtb2R1bGUuZXhwb3J0cyA9IHsgXG5cbiAgICBzdHJpbmc6ICAgICBzdHJpbmcsXG5cbiAgICBwaXhlbFJhdGlvOiB+fndpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDEsIFxuXG4gICAgYW5kcm9pZDogICAgISFzdHJpbmcubWF0Y2goIC9BbmRyb2lkL2lnICksIFxuICAgIGJsYWNrYmVycnk6ICEhc3RyaW5nLm1hdGNoKCAvQmxhY2tCZXJyeS9pZyApLCBcbiAgICBpb3M6ICAgICAgICAhIXN0cmluZy5tYXRjaCggL2lQaG9uZXxpUGFkfGlQb2QvaWcgKSAmJiAhd2luZG93Lk1TU3RyZWFtLCBcbiAgICBvcGVyYW1pbmk6ICAhIXN0cmluZy5tYXRjaCggL09wZXJhIE1pbmkvaWcgKSwgXG4gICAgd2Vib3M6ICAgICAgISFzdHJpbmcubWF0Y2goIC93ZWJPUy9pZyApLCBcbiAgICBjaHJvbWU6ICAgICAhIXN0cmluZy5tYXRjaCggL0Nocm9tZS9pZyApLCBcbiAgICBmaXJlZm94OiAgICAhIXN0cmluZy5tYXRjaCggL0ZpcmVmb3gvaWcgKSwgXG4gICAgaWU6ICAgICAgICAgISFzdHJpbmcubWF0Y2goIC9NU0lFL2lnICksIFxuICAgIG9wZXJhOiAgICAgICEhc3RyaW5nLm1hdGNoKCAvT3BlcmEvaWcgKSwgXG4gICAgc2FmYXJpOiAgICAgISFzdHJpbmcubWF0Y2goIC9TYWZhcmkvaWcgKSwgXG5cbiAgICB0b3VjaDogICAgICAnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3csIFxuICAgIGF1ZGlvOiAgICAgIGF1ZGlvLCBcblxuICAgIGdsOiAgICAgICAgIGdsLCBcbiAgICBncHU6ICAgICAgICBncHUsIFxuXG59O1xuXG51YS5oYW5kaGVsZCA9IHVhLmFuZHJvaWQgfHwgdWEuYmxhY2tiZXJyeSB8fCB1YS5pb3MgfHwgdWEub3BlcmFtaW5pIHx8IHVhLndlYm9zOyIsInZhciBocmVmID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XG52YXIgaCA9IGhyZWYuaW5kZXhPZiggJyMnICk7XG52YXIgcSA9IGhyZWYuaW5kZXhPZiggJz8nICk7XG52YXIgc2VhcmNoID0gaCA9PSAtMSA/IGhyZWYuc3Vic3RyaW5nKCBxICkgOiBocmVmLnN1YnN0cmluZyggcSwgaCApO1xuXG52YXIgdXJsID0ge1xuXG4gICAgaGFzaDogaCA9PSAtMSA/IHVuZGVmaW5lZCA6IGhyZWYuc3Vic3RyaW5nKCBoKzEgKSxcblxuICAgIGJvb2xlYW46IGZ1bmN0aW9uKCBuYW1lLCBkZWZhdWx0VmFsdWUgKSB7XG4gICAgICAgIGlmICggIXVybC5oYXNPd25Qcm9wZXJ0eSggbmFtZSApIClcbiAgICAgICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XG4gICAgICAgIHJldHVybiB1cmxbIG5hbWUgXSAhPT0gJ2ZhbHNlJztcbiAgICB9LFxuICAgIFxuICAgIG51bWJlcjogZnVuY3Rpb24oIG5hbWUsIGRlZmF1bHRWYWx1ZSApIHtcbiAgICAgICAgdmFyIHIgPSBwYXJzZUZsb2F0KCB1cmxbIG5hbWUgXSApO1xuICAgICAgICBpZiAoIHIgIT0gciApIFxuICAgICAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICAgICAgcmV0dXJuIHI7XG4gICAgfSxcbiAgICBcbiAgICBwcm9wOiBmdW5jdGlvbiggcHJvcCwgdmFsdWUgKSB7XG4gICAgICAgIHZhciBzdHIgPSBwcm9wICsgJz0nICsgdmFsdWU7XG4gICAgICAgIGlmICggcSA9PSAtMSApIHJldHVybiAnPycgKyBzdHI7XG4gICAgICAgIHZhciBwcmV2ID0gcHJvcCArICc9JyArIHVybFsgcHJvcCBdO1xuICAgICAgICB2YXIgc3RyO1xuICAgICAgICBpZiAoIHNlYXJjaC5pbmRleE9mKCBwcmV2ICkgPT0gLTEgKSB7XG4gICAgICAgICAgICBzdHIgPSBzZWFyY2ggKyAnJicgKyBzdHI7XG4gICAgICAgIH0gZWxzZSB7IFxuICAgICAgICAgICAgc3RyID0gc2VhcmNoLnJlcGxhY2UoIHByZXYsIHN0ciApO1xuICAgICAgICB9XG4gICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKCAvXFwmKyQvLCAnJyApLnJlcGxhY2UoIC8mKy9nLCAnJicgKTtcbiAgICAgICAgcmV0dXJuIHN0cjtcbiAgICB9LFxuXG4gICAgcmVtb3ZlUHJvcDogZnVuY3Rpb24oIHByb3AgKSB7XG4gICAgICAgIHZhciBzdHIgPSBzZWFyY2gucmVwbGFjZSggbmV3IFJlZ0V4cCggcHJvcCArICcoPShbXiZdKykpPycsICdnbScgKSwgJycgKTtcbiAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UoIC9cXCYrJC8sICcnICkucmVwbGFjZSggLyYrL2csICcmJyApO1xuICAgICAgICByZXR1cm4gc3RyO1xuICAgIH0gXG5cbn07XG5cbnNlYXJjaC5yZXBsYWNlKFxuICAgIC8oW14/PSZdKykoPShbXiZdKykpPy9nLFxuICAgIGZ1bmN0aW9uKCAkMCwgJDEsICQyLCAkMyApIHtcbiAgICAgIHVybFsgJDEgXSA9IGRlY29kZVVSSUNvbXBvbmVudCggJDMgKTtcbiAgICB9XG4pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHVybDsiLCJ2YXIgbG9vcCA9IHJlcXVpcmUoICdjb21tb24vbG9vcCcgKTtcbnZhciByZWFkeSA9IHJlcXVpcmUoICdjb21tb24vcmVhZHknICk7XG52YXIgaW5pdCA9IHJlcXVpcmUoICdjb21tb24vaW5pdCcgKTtcbnZhciBQcm9taXNlID0gcmVxdWlyZSggJ3V0aWxzL1Byb21pc2UnICk7XG52YXIgYXNzZXRzID0gcmVxdWlyZSggJ2Fzc2V0cycgKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggYXBwICkge1xuXG4gICAgdmFyIGxvYWRlZCA9IGFzc2V0cy5sb2FkKCB7XG5cbiAgICAgICAgYXNzZXRzOiBhcHAuYXNzZXRzLFxuICAgICAgICBsb2FkZXI6IGFwcC5sb2FkZXJcblxuICAgIH0gKTtcblxuICAgIFByb21pc2UuYWxsKCBbIGxvYWRlZCwgcmVhZHkgXSApLnRoZW4oIGZ1bmN0aW9uKCkge1xuICAgICAgICBcbiAgICAgICAgYXNzZXRzLnByb2Nlc3MoKTtcbiAgICAgICAgaW5pdC5yZXNvbHZlKCk7XG4gICAgICAgIGFwcC5pbml0KCk7XG5cbiAgICAgICAgaWYgKCBhcHAubG9vcCApIHtcbiAgICAgICAgICAgIGxvb3Auc3RhcnQoIGFwcC5sb29wICk7XG4gICAgICAgIH1cblxuICAgIH0gKTtcbiAgICBcbn07IiwidmFyIG5vb3AgPSByZXF1aXJlKCAnY29tbW9uL25vb3AnICk7XG5cbm1vZHVsZS5leHBvcnRzID0gS2V5cGF0aDtcblxuZnVuY3Rpb24gS2V5cGF0aCggb2JqZWN0LCBwYXRoICkge1xuXG4gICAgaWYgKCAhcGF0aCApIHRocm93ICdNaXNzaW5nIHBhdGggcGFyYW1hdGVyIGZvciBLZXlwYXRoJ1xuXG4gICAgdGhpcy5wYXRoID0gcGF0aDtcbiAgICB0aGlzLmtleSA9IGdldEtleSggdGhpcy5wYXRoICk7XG5cbiAgICB0aGlzLm9iamVjdCA9IG51bGw7XG4gICAgdGhpcy5rZXlPYmplY3QgPSBudWxsO1xuXG4gICAgdGhpcy5iaW5kKCBvYmplY3QgKTtcblxufTtcblxuXG5LZXlwYXRoLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24oIG9iamVjdCApIHtcbiAgICBcbiAgICB0aGlzLm9iamVjdCA9IG9iamVjdCB8fCBudWxsO1xuICAgIHRoaXMua2V5T2JqZWN0ID0gZ2V0S2V5T2JqZWN0KCB0aGlzLm9iamVjdCwgdGhpcy5wYXRoICk7XG5cbn07XG5cbktleXBhdGgucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKCB2YWx1ZSApIHtcblxuICAgIGlmICggdGhpcy5rZXlPYmplY3QgKSB7XG4gICAgICAgIHRoaXMua2V5T2JqZWN0WyB0aGlzLmtleSBdID0gdmFsdWU7XG4gICAgfVxuXG59O1xuXG5LZXlwYXRoLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbigpIHtcblxuICAgIGlmICggdGhpcy5rZXlPYmplY3QgKSB7IFxuICAgICAgICByZXR1cm4gdGhpcy5rZXlPYmplY3RbIHRoaXMua2V5IF07ICBcbiAgICB9XG5cbn07XG5cbmZ1bmN0aW9uIGdldEtleSggcGF0aCApIHtcblxuICAgIGlmICggcGF0aC5pbmRleE9mKCAnLicgKSA9PT0gLTEgKSB7XG4gICAgICAgIHJldHVybiBwYXRoO1xuICAgIH0gZWxzZSB7IFxuICAgICAgICByZXR1cm4gcGF0aC5zdWJzdHJpbmcoIHBhdGgubGFzdEluZGV4T2YoICcuJyApICsgMSApO1xuICAgIH1cblxufVxuXG5cbmZ1bmN0aW9uIGdldEtleU9iamVjdCggb2JqZWN0LCBwYXRoICkge1xuICAgIFxuICAgIGlmICggIW9iamVjdCApIHJldHVybiBudWxsO1xuXG4gICAgaWYgKCBwYXRoLmluZGV4T2YoICcuJyApID09PSAtMSApIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICB9XG5cbiAgICB2YXIgcGF0aHMgPSBwYXRoLnNwbGl0KCAnLicgKTtcbiAgICB2YXIgcGFyZW50ID0gb2JqZWN0O1xuICAgIFxuICAgIGZvciAoIHZhciBpID0gMCwgbCA9IHBhdGhzLmxlbmd0aCAtIDE7IGkgPCBsOyBpKysgKSB7IFxuICAgICAgICBwYXJlbnQgPSBwYXJlbnRbIHBhdGhzWyBpIF0gXTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIHBhcmVudDtcblxufSIsInZhciBTaWduYWxUeXBlID0gcmVxdWlyZSggJ21hcDIvU2lnbmFsVHlwZScgKTtcbnZhciBTaWduYWwgICAgID0gcmVxdWlyZSggJ21hcDIvU2lnbmFsJyApO1xudmFyIE5vZGUgICAgICAgPSByZXF1aXJlKCAnbWFwMi9Ob2RlJyApO1xudmFyIEtleXBhdGggICAgPSByZXF1aXJlKCAnbWFwL0tleXBhdGgnICk7XG52YXIgZXh0ZW5kICAgICA9IHJlcXVpcmUoICd1dGlscy9leHRlbmQnICk7XG5cbi8vIERlZmF1bHQgU2lnbmFsc1xuXG5yZXF1aXJlKCAnbWFwMi9zaWduYWxzL2NhbGwnICk7XG5yZXF1aXJlKCAnbWFwMi9zaWduYWxzL251bWJlcicgKTtcblxuLy8gRGVmYXVsdCBub2Rlc1xuXG5yZXF1aXJlKCAnbWFwMi9ub2Rlcy9hcmdzJyApO1xucmVxdWlyZSggJ21hcDIvbm9kZXMvYmxhbmsnICk7XG5yZXF1aXJlKCAnbWFwMi9ub2Rlcy9jbG9jaycgKTtcbnJlcXVpcmUoICdtYXAyL25vZGVzL2Vhc2UnICk7XG5yZXF1aXJlKCAnbWFwMi9ub2Rlcy9lbGFzdGljJyApO1xucmVxdWlyZSggJ21hcDIvbm9kZXMvbXVsdGlwbHknICk7XG5yZXF1aXJlKCAnbWFwMi9ub2Rlcy9udW1iZXInICk7XG5yZXF1aXJlKCAnbWFwMi9ub2Rlcy9wb2ludGVyJyApO1xucmVxdWlyZSggJ21hcDIvbm9kZXMvdGhyZXNoJyApO1xuXG5mdW5jdGlvbiBNYXAoKSB7XG5cbiAgICB0aGlzLm5vZGVzID0ge307XG5cbiAgICB0aGlzLmFjdGl2ZVNpZ25hbHMgPSB7fTtcbiAgICB0aGlzLnNpZ25hbHMgPSB7fTtcblxufVxuXG5NYXAucHJvdG90eXBlLmFkZE5vZGUgPSBmdW5jdGlvbiggbm9kZSApIHtcbiAgICBcbiAgICB0aGlzLm5vZGVzWyBub2RlLmlkIF0gPSBub2RlO1xuXG4gICAgcmV0dXJuIG5vZGU7XG5cbn07XG5cbk1hcC5wcm90b3R5cGUubWFrZU5vZGUgPSBmdW5jdGlvbiggdHlwZSwgbmFtZSApIHtcbiAgICBcbiAgICB2YXIgbm9kZSA9IG5ldyBOb2RlKCB0aGlzLCB0eXBlLCBuYW1lICk7XG5cbiAgICByZXR1cm4gdGhpcy5hZGROb2RlKCBub2RlICk7XG5cbn07XG5cbk1hcC5wcm90b3R5cGUuZXhwb3NlID0gZnVuY3Rpb24oIG5hbWUsIG9iamVjdCwgc2lnbmFscyApIHtcbiAgICBcbiAgICBpZiAoICFzaWduYWxzICkge1xuICAgICAgICBcbiAgICAgICAgc2lnbmFscyA9IE9iamVjdC5rZXlzKCBvYmplY3QgKTtcbiAgICAgICAgXG4gICAgICAgIGlmICggb2JqZWN0Ll9fcHJvdG9fXyApIHtcbiAgICAgICAgICAgIHNpZ25hbHMgPSBzaWduYWxzLmNvbmNhdCggT2JqZWN0LmtleXMoIG9iamVjdC5fX3Byb3RvX18gKSApO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICB2YXIgbm9kZSA9IG5ldyBOb2RlKCB0aGlzLCBOb2RlLnR5cGVzLmJsYW5rLCBuYW1lICk7XG5cbiAgICBmb3IgKCB2YXIgaSA9IDAsIGwgPSBzaWduYWxzLmxlbmd0aDsgaSA8IGw7IGkrKyApIHsgXG5cbiAgICAgICAgdmFyIGtleXBhdGggPSBuZXcgS2V5cGF0aCggb2JqZWN0LCBzaWduYWxzWyBpIF0gKTtcbiAgICAgICAgbm9kZS5tYWtlU2lnbmFsRnJvbUtleXBhdGgoIGtleXBhdGggKTtcblxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmFkZE5vZGUoIG5vZGUgKTtcblxufTtcblxuTWFwLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgXG4gICAgZm9yICggdmFyIGkgaW4gdGhpcy5ub2RlcyApIHtcbiAgICAgICAgdGhpcy5ub2Rlc1sgaSBdLnVwZGF0ZSgpO1xuICAgIH1cblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBNYXA7XG4iLCJ2YXIgU2lnbmFsVHlwZSA9IHJlcXVpcmUoICdtYXAyL1NpZ25hbFR5cGUnICk7XG52YXIgU2lnbmFsID0gcmVxdWlyZSggJ21hcDIvU2lnbmFsJyApO1xuXG52YXIgaXMgPSByZXF1aXJlKCAndXRpbHMvaXMnICk7XG52YXIgZXh0ZW5kID0gcmVxdWlyZSggJ3V0aWxzL2V4dGVuZCcgKTtcblxuTm9kZS50eXBlcyA9IHt9O1xuTm9kZS50eXBlQ291bnRzID0ge307XG5cbk5vZGUuYXV0b0lEID0gZnVuY3Rpb24oIHR5cGUgKSB7XG4gICAgXG4gICAgdmFyIG5hbWUgPSB0eXBlLnR5cGU7IC8vIDotXFxcbiAgICBcblxuICAgIE5vZGUudHlwZUNvdW50c1sgbmFtZSBdID0gKytOb2RlLnR5cGVDb3VudHNbIG5hbWUgXSB8fCAxO1xuXG4gICAgdmFyIGNvdW50ID0gTm9kZS50eXBlQ291bnRzWyBuYW1lIF07XG5cbiAgICBpZiAoIGNvdW50ID09PSAxICkge1xuICAgICAgICByZXR1cm4gbmFtZTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG5hbWUgKyAoIGNvdW50IC0gMSApLnRvU3RyaW5nKCk7XG5cbn07XG5cbmZ1bmN0aW9uIE5vZGUoIG1hcCwgdHlwZSwgbmFtZSApIHtcblxuICAgIGlmICggIXR5cGUgKSB7IFxuICAgICAgICB0aHJvdyAnVW5kZWZpbmVkIHR5cGUnO1xuICAgIH1cblxuICAgIHRoaXMubWFwID0gbWFwO1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgdGhpcy5pZCA9IG5hbWUgfHwgTm9kZS5hdXRvSUQoIHR5cGUgKTtcbiAgICB0aGlzLm5hbWUgPSBuYW1lIHx8IHRoaXMuaWQ7XG5cbiAgICB0aGlzLnNpZ25hbHMgPSB7fTtcblxuICAgIGZvciAoIHZhciBzaWduYWxOYW1lIGluIHRoaXMudHlwZS5zaWduYWxzICkge1xuICAgICAgICBcbiAgICAgICAgdmFyIHNpZ25hbFBhcmFtcyA9IHRoaXMudHlwZS5zaWduYWxzWyBzaWduYWxOYW1lIF07XG4gICAgICAgIHZhciBzaWduYWxUeXBlID0gU2lnbmFsVHlwZS5tYWtlRnJvbVBhcmFtcyggc2lnbmFsUGFyYW1zICk7XG5cbiAgICAgICAgdmFyIHNpZ25hbCA9IHRoaXMubWFrZVNpZ25hbCggc2lnbmFsTmFtZSwgc2lnbmFsVHlwZSApO1xuXG4gICAgICAgIGlmICggc2lnbmFsUGFyYW1zLnN5bm9ueW1zICkge1xuXG4gICAgICAgICAgICBmb3IgKCB2YXIgaSA9IDAsIGwgPSBzaWduYWxQYXJhbXMuc3lub255bXMubGVuZ3RoOyBpIDwgbDsgaSsrICkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHZhciBzeW5vbnltID0gc2lnbmFsUGFyYW1zLnN5bm9ueW1zWyBpIF07XG4gICAgICAgICAgICAgICAgdGhpcy5zaWduYWxzWyBzeW5vbnltIF0gPSBzaWduYWw7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cblxuICAgIH1cbiAgICBcbiAgICBpZiAoIHRoaXMudHlwZS51cGRhdGUgKSB7IFxuICAgICAgICB0aGlzLnVwZGF0ZVNpZ25hbHMgPSB0aGlzLnR5cGUudXBkYXRlO1xuICAgIH1cblxuICAgIHRoaXMuZGlzcGxheSA9IHsgXG4gICAgICAgIHg6IDAsIFxuICAgICAgICB5OiAwLCBcbiAgICAgICAgb3BlbjogdHJ1ZSBcbiAgICB9O1xuXG4gICAgaWYgKCB0aGlzLnR5cGUuaW5pdCApe1xuICAgICAgICB0aGlzLnR5cGUuaW5pdC5jYWxsKCB0aGlzICk7XG4gICAgfVxuXG59O1xuXG5Ob2RlLnByb3RvdHlwZSA9IHtcblxuICAgIGdldCBpZCgpIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5faWQ7XG5cbiAgICB9LCBcblxuICAgIHNldCBpZCggdmFsdWUgKSB7XG5cbiAgICAgICAgaWYgKCB0aGlzLm1hcC5ub2Rlc1sgdmFsdWUgXSApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciggJ05vZGUgaWQgXCInICsgdmFsdWUgKyAnXCIgY29sbGlkZXMgd2l0aCBhbm90aGVyIG5vZGUgaW4gdGhpcyBtYXAuJyApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCB0aGlzLl9pZCApIGRlbGV0ZSB0aGlzLm1hcC5ub2Rlc1sgdGhpcy5faWQgXTtcblxuICAgICAgICB0aGlzLl9pZCA9IHZhbHVlO1xuXG4gICAgICAgIHRoaXMubWFwLm5vZGVzWyB0aGlzLl9pZCBdID0gdGhpcztcblxuICAgIH1cblxufTtcblxuTm9kZS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oIHNpZ25hbHMgKSB7XG4gICAgXG4gICAgZm9yICggdmFyIGkgaW4gc2lnbmFscyApIHtcbiAgICAgICAgdGhpcy5zaWduYWxzWyBpIF0uc2V0KCBzaWduYWxzWyBpIF0gKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcblxufTtcblxuTm9kZS5wcm90b3R5cGUuYWRkU2lnbmFsID0gZnVuY3Rpb24oIHNpZ25hbCApIHtcblxuICAgIHRoaXMuc2lnbmFsc1sgc2lnbmFsLm5hbWUgXSA9IHNpZ25hbDtcblxuICAgIHJldHVybiBzaWduYWw7XG5cbn07XG5cbk5vZGUucHJvdG90eXBlLm1ha2VTaWduYWwgPSBmdW5jdGlvbiggbmFtZSwgdHlwZSApIHtcblxuICAgIHZhciBzaWduYWwgPSBuZXcgU2lnbmFsKCB0aGlzLCBuYW1lLCB0eXBlICk7XG5cbiAgICByZXR1cm4gdGhpcy5hZGRTaWduYWwoIHNpZ25hbCApO1xuXG59O1xuXG5Ob2RlLnByb3RvdHlwZS5tYWtlU2lnbmFsRnJvbUtleXBhdGggPSBmdW5jdGlvbigga2V5cGF0aCApIHtcblxuICAgIHZhciB2YWx1ZSA9IGtleXBhdGguZ2V0KCk7XG4gICAgdmFyIHBhcmFtcyA9IHsgdmFsdWU6IHZhbHVlIH07XG4gICAgdmFyIHR5cGU7XG5cbiAgICBpZiAoIGlzLm51bWJlciggdmFsdWUgKSApIHtcbiAgICAgICAgXG4gICAgICAgIHR5cGUgPSBuZXcgU2lnbmFsVHlwZS50eXBlcy5udW1iZXIoIHBhcmFtcyApO1xuXG4gICAgfSBlbHNlIHtcblxuICAgICAgICB0eXBlID0gbmV3IFNpZ25hbFR5cGUoIHBhcmFtcyApO1xuXG4gICAgfVxuXG4gICAgdmFyIHNpZ25hbCA9IG5ldyBTaWduYWwoIHRoaXMsIGtleXBhdGgucGF0aCwgdHlwZSApO1xuICAgIHNpZ25hbC5iaW5kKCBrZXlwYXRoICk7XG5cbiAgICByZXR1cm4gdGhpcy5hZGRTaWduYWwoIHNpZ25hbCApO1xuXG59O1xuXG5Ob2RlLnByb3RvdHlwZS5jb21wdXRlTnVtQW5jZXN0b3JzID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgbWF4ID0gMDtcbiAgICBcbiAgICBmb3IgKCB2YXIgaiBpbiB0aGlzLnNpZ25hbHMgKSB7XG4gICAgICAgIG1heCA9IE1hdGgubWF4KCB0aGlzLnNpZ25hbHNbIGogXS5nZXROdW1BbmNlc3RvcnMoKSwgbWF4ICk7XG4gICAgfVxuXG4gICAgdGhpcy5udW1BbmNlc3RvcnMgPSBtYXg7XG4gIFxufTtcblxuTm9kZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gIFxuICAgIGlmICggdGhpcy51cGRhdGVTaWduYWxzICkge1xuICAgICAgICBcbiAgICAgICAgdGhpcy51cGRhdGVTaWduYWxzKCB0aGlzLnNpZ25hbHMgKTsgICAgICAgIFxuXG4gICAgfVxuXG4gICAgZm9yICggdmFyIGkgaW4gdGhpcy5zaWduYWxzICkge1xuXG4gICAgICAgIHZhciBzaWduYWwgPSB0aGlzLnNpZ25hbHNbIGkgXTtcblxuICAgICAgICBzaWduYWwudXBkYXRlZCA9IHNpZ25hbC5uZWVkc1VwZGF0ZTtcblxuICAgICAgICBpZiAoIHNpZ25hbC51cGRhdGVkICkge1xuICAgICAgICAgICAgc2lnbmFsLnNlbmQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNpZ25hbC5uZWVkc1VwZGF0ZSA9IGZhbHNlO1xuXG4gICAgfVxuXG5cblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBOb2RlOyIsInZhciBTaWduYWxUeXBlID0gcmVxdWlyZSggJ21hcDIvU2lnbmFsVHlwZScgKTtcbnZhciBpcyA9IHJlcXVpcmUoICd1dGlscy9pcycgKTtcbnZhciBhcnJheSA9IHJlcXVpcmUoICd1dGlscy9hcnJheScgKTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaWduYWw7XG5cbmZ1bmN0aW9uIFNpZ25hbCggbm9kZSwgbmFtZSwgdHlwZSwgcGFyZW50ICkge1xuXG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLm5vZGUgPSBub2RlO1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG5cbiAgICB0aGlzLmlkID0gdGhpcy5ub2RlLmlkICsgJy8nICsgdGhpcy5uYW1lO1xuXG4gICAgdGhpcy5tYXAgPSB0aGlzLm5vZGUubWFwO1xuICAgIHRoaXMubWFwLnNpZ25hbHNbIHRoaXMuaWQgXSA9IHRoaXM7XG5cbiAgICAvL1xuXG4gICAgdGhpcy5rZXlwYXRoID0gdW5kZWZpbmVkO1xuXG4gICAgdGhpcy5zZW5kZXIgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5yZWNlaXZlcnMgPSBbXTtcbiAgICBcbiAgICB0aGlzLm5lZWRzVXBkYXRlID0gZmFsc2U7XG5cbiAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICB0aGlzLmNoaWxkcmVuID0gW107XG4gICAgdGhpcy5uYW1lZENoaWxkcmVuID0ge307XG5cbiAgICB0aGlzLnZhbHVlID0gdGhpcy50eXBlLmdldERlZmF1bHRWYWx1ZSgpO1xuICAgIHRoaXMuaW5pdGlhbFZhbHVlID0gdGhpcy52YWx1ZTtcbiAgICBcbiAgICB0aGlzLnR5cGUuaW5pdCggdGhpcyApO1xuXG59O1xuXG5TaWduYWwucHJvdG90eXBlLm1ha2VDaGlsZCA9IGZ1bmN0aW9uKCBuYW1lLCB0eXBlICkge1xuICAgIFxuICAgIHR5cGUgPSB0eXBlIHx8IG5ldyBTaWduYWxUeXBlKCk7XG4gICAgbmFtZSA9IG5hbWUgfHwgdGhpcy5jaGlsZHJlbi5sZW5ndGg7XG5cbiAgICB2YXIgc2lnbmFsID0gbmV3IFNpZ25hbCggdGhpcy5ub2RlLCBuYW1lLCB0eXBlLCB0aGlzICk7XG5cbiAgICB0aGlzLmNoaWxkcmVuLnB1c2goIHNpZ25hbCApO1xuICAgIHRoaXMubmFtZWRDaGlsZHJlblsgbmFtZSBdID0gc2lnbmFsO1xuXG4gICAgcmV0dXJuIHNpZ25hbDtcblxufTtcblxuU2lnbmFsLnByb3RvdHlwZS5yZW1vdmVDaGlsZCA9IGZ1bmN0aW9uKCBzaWduYWwgKSB7XG5cbn07XG5cblNpZ25hbC5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uKCBpbnB1dCApIHtcblxuICAgIGlmICggaW5wdXQgKSB7IFxuXG4gICAgICAgIHRoaXMudHlwZS5zZW5kKCB0aGlzLCBpbnB1dCApO1xuXG4gICAgfSBlbHNlIHtcblxuICAgICAgICBmb3IgKCB2YXIgaSA9IDAsIGwgPSB0aGlzLnJlY2VpdmVycy5sZW5ndGg7IGkgPCBsOyBpKysgKSB7IFxuICAgICAgICAgICAgdGhpcy50eXBlLnNlbmQoIHRoaXMsIHRoaXMucmVjZWl2ZXJzWyBpIF0gKTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG59O1xuXG5TaWduYWwucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbigga2V5cGF0aCApIHtcbiAgICBcbiAgICB0aGlzLmtleXBhdGggPSBrZXlwYXRoO1xuXG4gICAgdGhpcy52YWx1ZSA9IHRoaXMua2V5cGF0aC5nZXQoKTtcblxuICAgIGlmICggaXMuZnVuY3Rpb24oIHRoaXMudmFsdWUgKSApIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMudmFsdWUuYmluZCggdGhpcy5rZXlwYXRoLmtleU9iamVjdCApO1xuICAgIH1cblxufTtcblxuU2lnbmFsLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiggdmFsdWUgKSB7XG4gICAgXG4gICAgdGhpcy5wcmV2VmFsdWUgPSB0aGlzLnZhbHVlO1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcblxuICAgIGlmICggdGhpcy5rZXlwYXRoICkge1xuICAgICAgICB0aGlzLmtleXBhdGguc2V0KCB0aGlzLnZhbHVlICk7XG4gICAgfVxuXG4gICAgdGhpcy5uZWVkc1VwZGF0ZSA9IHRydWU7XG5cbn07XG5cblNpZ25hbC5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uKCBpbnB1dCApIHtcblxuICAgIGlmICggaW5wdXQuc2VuZGVyICkgeyBcbiAgICAgICAgaW5wdXQuc2VuZGVyLmRpc2Nvbm5lY3QoIGlucHV0ICk7XG4gICAgfVxuXG4gICAgdGhpcy5tYXAuYWN0aXZlU2lnbmFsc1sgaW5wdXQuaWQgXSA9IGlucHV0O1xuXG4gICAgaW5wdXQuc2VuZGVyID0gdGhpcztcblxuICAgIHRoaXMucmVjZWl2ZXJzLnB1c2goIGlucHV0ICk7XG5cbiAgICB0aGlzLm5lZWRzVXBkYXRlID0gdHJ1ZTtcblxuICAgIFxufTtcblxuU2lnbmFsLnByb3RvdHlwZS5kaXNjb25uZWN0ID0gZnVuY3Rpb24oIGlucHV0ICkge1xuXG4gICAgZGVsZXRlIHRoaXMubWFwLmFjdGl2ZVNpZ25hbHNbIGlucHV0LmlkIF07XG5cbiAgICBhcnJheS5yZW1vdmUoIHRoaXMucmVjZWl2ZXJzLCBpbnB1dCApO1xuXG4gICAgaW5wdXQuc2VuZGVyID0gdW5kZWZpbmVkO1xuXG59O1xuXG5TaWduYWwucHJvdG90eXBlLmdldE51bUFuY2VzdG9ycyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgaWYgKCB0aGlzLnNlbmRlciApIHtcbiAgICAgICAgdmFyIG1heCA9IDA7XG4gICAgICAgIGZvciAoIHZhciBpIGluIHRoaXMuc2VuZGVyLm5vZGUuc2lnbmFscyApIHtcbiAgICAgICAgICAgIG1heCA9IE1hdGgubWF4KCB0aGlzLnNlbmRlci5ub2RlLnNpZ25hbHNbIGkgXS5nZXROdW1BbmNlc3RvcnMoKSwgbWF4ICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDEgKyBtYXg7XG4gICAgfVxuXG4gICAgcmV0dXJuIDA7XG5cbn07IiwidmFyIGlzID0gcmVxdWlyZSggJ3V0aWxzL2lzJyApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNpZ25hbFR5cGU7XG5cblNpZ25hbFR5cGUudHlwZXMgPSB7fTtcblxuZnVuY3Rpb24gU2lnbmFsVHlwZSggcGFyYW1zICkge1xuXG4gICAgcGFyYW1zID0gcGFyYW1zIHx8IHt9O1xuXG4gICAgdGhpcy5uYW1lID0gJ2FueSc7XG4gICAgdGhpcy5kZWZhdWx0VmFsdWUgPSBwYXJhbXMuaGFzT3duUHJvcGVydHkoICd2YWx1ZScgKSA/IHBhcmFtcy52YWx1ZSA6IHVuZGVmaW5lZDtcblxuICAgIHRoaXMuaW5wdXQgPSBwYXJhbXMuaW5wdXQgIT09IHVuZGVmaW5lZCA/IHBhcmFtcy5pbnB1dCA6IHRydWU7XG5cblxufTtcblxuU2lnbmFsVHlwZS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCBzaWduYWwgKSB7XG4gICAgXG5cbn07XG5cblNpZ25hbFR5cGUucHJvdG90eXBlLmdldERlZmF1bHRWYWx1ZSA9IGZ1bmN0aW9uKCkge1xuICAgIFxuICAgIHJldHVybiB0aGlzLmRlZmF1bHRWYWx1ZTtcblxufTtcblxuU2lnbmFsVHlwZS5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uKCBzaWduYWwsIGRlc3QgKSB7XG4gICAgXG4gICAgZGVzdC5zZXQoIHNpZ25hbC52YWx1ZSApO1xuXG59O1xuXG5TaWduYWxUeXBlLm1ha2VGcm9tUGFyYW1zID0gZnVuY3Rpb24oIHBhcmFtcyApIHtcblxuICAgIHZhciBUeXBlO1xuXG4gICAgaWYgKCBwYXJhbXMudHlwZSApIHsgXG4gICAgICAgIFR5cGUgPSBTaWduYWxUeXBlLnR5cGVzWyBwYXJhbXMudHlwZSBdIFxuICAgICAgICBpZiAoICFUeXBlICkge1xuICAgICAgICAgICAgdGhyb3cgJ1RyaWVkIHRvIGNyZWF0ZSBzaWduYWwgb2YgdW5yZWNvZ25pemVkIHR5cGUgXCInICsgcGFyYW1zLnR5cGUgKyAnXCInO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHsgXG4gICAgICAgIFR5cGUgPSBTaWduYWxUeXBlO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgVHlwZSggcGFyYW1zICk7XG4gICAgXG59O1xuIiwidmFyIE5vZGUgPSByZXF1aXJlKCAnbWFwMi9Ob2RlJyApO1xuXG5Ob2RlLnR5cGVzLmFyZ3MgPSB7XG5cbiAgICB0eXBlOiAnYXJncycsIFxuICAgIGdyb3VwOiAndXRpbHMnLCBcblxuICAgIHNpZ25hbHM6IHsgXG4gICAgICAgIG1haW46IHsgXG4gICAgICAgICAgICB0eXBlOiAnY2FsbCcsIFxuICAgICAgICAgICAgYXJnczogW11cbiAgICAgICAgfVxuICAgIH1cblxufTsiLCJ2YXIgTm9kZSA9IHJlcXVpcmUoICdtYXAyL05vZGUnICk7XG5cbk5vZGUudHlwZXMuYmxhbmsgPSB7XG5cbiAgICB0eXBlOiAnbm9kZScsIFxuICAgIHNpZ25hbHM6IHt9XG5cbn07IiwidmFyIE5vZGUgPSByZXF1aXJlKCAnbWFwMi9Ob2RlJyApO1xudmFyIGxvb3AgPSByZXF1aXJlKCAnY29tbW9uL2xvb3AnICk7XG5cbk5vZGUudHlwZXMuY2xvY2sgPSB7XG5cbiAgICB0eXBlOiAnY2xvY2snLFxuICAgIGdyb3VwOiAnZ2VuZXJhdG9ycycsIFxuXG4gICAgc2lnbmFsczogeyBcbiAgICAgICAgc3BlZWQ6IHsgXG4gICAgICAgICAgICB0eXBlOiAnbnVtYmVyJywgXG4gICAgICAgICAgICB2YWx1ZTogMVxuICAgICAgICB9LCBcbiAgICAgICAgb3V0OiB7IFxuICAgICAgICAgICAgdHlwZTogJ251bWJlcicsIFxuICAgICAgICAgICAgaW5wdXQ6IGZhbHNlXG4gICAgICAgIH1cbiAgICB9LCBcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24oIHNpZ25hbHMgKSB7XG5cbiAgICAgICAgc2lnbmFscy5vdXQuc2V0KCBzaWduYWxzLm91dC52YWx1ZSArICggbG9vcC5kZWx0YSB8fCAwICkgKiBzaWduYWxzLnNwZWVkLnZhbHVlICk7XG5cbiAgICB9XG5cbn07IiwidmFyIE5vZGUgPSByZXF1aXJlKCAnbWFwMi9Ob2RlJyApO1xuXG5Ob2RlLnR5cGVzLmVhc2UgPSB7XG5cbiAgICB0eXBlOiAnZWFzZScsIFxuICAgIGdyb3VwOiAnZWFzaW5nJywgXG5cbiAgICBzaWduYWxzOiB7IFxuICAgICAgICBpbjogeyBcbiAgICAgICAgICAgIHR5cGU6ICdudW1iZXInXG4gICAgICAgIH0sIFxuICAgICAgICBrOiB7IFxuICAgICAgICAgICAgdHlwZTogJ251bWJlcicsIFxuICAgICAgICAgICAgbWluOiAwLCBcbiAgICAgICAgICAgIG1heDogMSwgXG4gICAgICAgICAgICB2YWx1ZTogMC4wNSwgXG4gICAgICAgIH0sIFxuICAgICAgICBlcHM6IHsgXG4gICAgICAgICAgICB0eXBlOiAnbnVtYmVyJywgXG4gICAgICAgICAgICBtaW46IDAsIFxuICAgICAgICAgICAgc3RlcDogMC4wMDAwMSwgXG4gICAgICAgICAgICB2YWx1ZTogMC4wMDAxXG4gICAgICAgIH0sIFxuICAgICAgICBvdXQ6IHsgXG4gICAgICAgICAgICB0eXBlOiAnbnVtYmVyJywgXG4gICAgICAgICAgICBpbnB1dDogZmFsc2VcbiAgICAgICAgfVxuICAgIH0sIFxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbiggc2lnbmFscyApIHtcbiAgICAgXG4gICAgICAgIHZhciBkMCA9IHNpZ25hbHMuaW4udmFsdWUgLSBzaWduYWxzLm91dC52YWx1ZTtcbiAgICAgICAgdmFyIG91dCA9IHNpZ25hbHMub3V0LnZhbHVlICsgZDAgKiBzaWduYWxzLmsudmFsdWU7XG5cbiAgICAgICAgdmFyIGQgPSBNYXRoLmFicyggc2lnbmFscy5pbi52YWx1ZSAtIG91dCApO1xuXG4gICAgICAgIGlmICggZCA+IDAgfHwgZDAgIT09IDAgKSB7XG4gICAgICAgICBcbiAgICAgICAgICAgIGlmICggZCA8IHNpZ25hbHMuZXBzLnZhbHVlICkge1xuICAgICAgICAgICAgICAgIHNpZ25hbHMub3V0LnNldCggc2lnbmFscy5pbi52YWx1ZSApO1xuICAgICAgICAgICAgfSBlbHNlIHsgXG4gICAgICAgICAgICAgICAgc2lnbmFscy5vdXQuc2V0KCBvdXQgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9XG5cbn07IiwidmFyIE5vZGUgPSByZXF1aXJlKCAnbWFwMi9Ob2RlJyApO1xuXG5Ob2RlLnR5cGVzLmVsYXN0aWMgPSB7XG5cbiAgICB0eXBlOiAnZWxhc3RpYycsIFxuICAgIGdyb3VwOiAnZWFzaW5nJywgXG5cbiAgICBzaWduYWxzOiB7IFxuICAgICAgICBpbjogeyBcbiAgICAgICAgICAgIHR5cGU6ICdudW1iZXInXG4gICAgICAgIH0sIFxuICAgICAgICBrOiB7IFxuICAgICAgICAgICAgdHlwZTogJ251bWJlcicsIFxuICAgICAgICAgICAgbWluOiAwLFxuICAgICAgICAgICAgdmFsdWU6IDEgXG4gICAgICAgIH0sIFxuICAgICAgICBkYW1waW5nOiB7IFxuICAgICAgICAgICAgdHlwZTogJ251bWJlcicsIFxuICAgICAgICAgICAgbWluOiAwLCBcbiAgICAgICAgICAgIG1heDogMSwgXG4gICAgICAgICAgICB2YWx1ZTogMC41LCBcbiAgICAgICAgICAgIHN5bm9ueW1zOiBbICdkJyBdXG4gICAgICAgIH0sIFxuICAgICAgICBlcHM6IHsgXG4gICAgICAgICAgICB0eXBlOiAnbnVtYmVyJywgXG4gICAgICAgICAgICBtaW46IDAsIFxuICAgICAgICAgICAgdmFsdWU6IDFlLThcbiAgICAgICAgfSwgXG4gICAgICAgIG91dDogeyBcbiAgICAgICAgICAgIHR5cGU6ICdudW1iZXInLCBcbiAgICAgICAgICAgIGlucHV0OiBmYWxzZVxuICAgICAgICB9LCBcbiAgICAgICAgYWNjZWw6IHsgXG4gICAgICAgICAgICB0eXBlOiAnbnVtYmVyJywgXG4gICAgICAgICAgICBpbnB1dDogZmFsc2VcbiAgICAgICAgfSwgXG4gICAgICAgIHZlbDogeyBcbiAgICAgICAgICAgIHR5cGU6ICdudW1iZXInLCBcbiAgICAgICAgICAgIGlucHV0OiBmYWxzZVxuICAgICAgICB9XG4gICAgfSwgXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCBzaWduYWxzICkge1xuICAgICBcbiAgICAgICAgdmFyIGQwID0gc2lnbmFscy5pbi52YWx1ZSAtIHNpZ25hbHMub3V0LnZhbHVlO1xuICAgICAgICB2YXIgYWNjZWwgPSBzaWduYWxzLmsudmFsdWUgKiBkMDtcblxuICAgICAgICB2YXIgdmVsID0gKCBzaWduYWxzLnZlbC52YWx1ZSArIGFjY2VsICkgKiBzaWduYWxzLmRhbXBpbmcudmFsdWU7XG4gICAgICAgIHZhciBvdXQgPSBzaWduYWxzLm91dC52YWx1ZSArIHZlbDtcblxuICAgICAgICB2YXIgZCA9IE1hdGguYWJzKCBzaWduYWxzLmluLnZhbHVlIC0gb3V0ICk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCBzaWduYWxzLmluLnZhbHVlLCBzaWduYWxzLm91dC52YWx1ZSApO1xuXG4gICAgICAgIGlmICggZCA+IDAgfHwgZDAgIT09IDAgKSB7XG4gICAgICAgICBcbiAgICAgICAgICAgIGlmICggZCA8IHNpZ25hbHMuZXBzLnZhbHVlICYmIHZlbCA8IHNpZ25hbHMuZXBzLnZhbHVlICkge1xuICAgICAgICAgICAgICAgIHNpZ25hbHMub3V0LnNldCggc2lnbmFscy5pbi52YWx1ZSApO1xuICAgICAgICAgICAgICAgIHNpZ25hbHMuYWNjZWwuc2V0KCAwICk7XG4gICAgICAgICAgICAgICAgc2lnbmFscy52ZWwuc2V0KCAwICk7XG4gICAgICAgICAgICB9IGVsc2UgeyBcbiAgICAgICAgICAgICAgICBzaWduYWxzLm91dC5zZXQoIG91dCApO1xuICAgICAgICAgICAgICAgIHNpZ25hbHMuYWNjZWwuc2V0KCBhY2NlbCApO1xuICAgICAgICAgICAgICAgIHNpZ25hbHMudmVsLnNldCggdmVsICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG5cbiAgICB9XG5cbn07IiwidmFyIE5vZGUgPSByZXF1aXJlKCAnbWFwMi9Ob2RlJyApO1xuXG5Ob2RlLnR5cGVzLm11bHRpcGx5ID0ge1xuXG4gICAgdHlwZTogJ211bHRpcGx5JywgXG4gICAgZ3JvdXA6ICdtYXRoJywgXG5cbiAgICBzaWduYWxzOiB7IFxuICAgICAgICBhOiB7IFxuICAgICAgICAgICAgdHlwZTogJ251bWJlcicsIFxuICAgICAgICAgICAgdmFsdWU6IDFcbiAgICAgICAgfSwgXG4gICAgICAgIGI6IHsgXG4gICAgICAgICAgICB0eXBlOiAnbnVtYmVyJywgXG4gICAgICAgICAgICB2YWx1ZTogMVxuICAgICAgICB9LCBcbiAgICAgICAgYzogeyBcbiAgICAgICAgICAgIHR5cGU6ICdudW1iZXInLCBcbiAgICAgICAgICAgIHZhbHVlOiAxXG4gICAgICAgIH0sIFxuICAgICAgICBvdXQ6IHsgXG4gICAgICAgICAgICB0eXBlOiAnbnVtYmVyJywgXG4gICAgICAgICAgICBpbnB1dDogZmFsc2VcbiAgICAgICAgfVxuICAgIH0sIFxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbiggc2lnbmFscyApIHtcbiAgICAgICAgaWYgKCBzaWduYWxzLmEudXBkYXRlZCA9PT0gdHJ1ZSB8fCBzaWduYWxzLmIudXBkYXRlZCA9PT0gdHJ1ZSB8fCBzaWduYWxzLmMudXBkYXRlZCA9PT0gdHJ1ZSApIHsgXG4gICAgICAgICAgICBzaWduYWxzLm91dC5zZXQoIHNpZ25hbHMuYS52YWx1ZSAqIHNpZ25hbHMuYi52YWx1ZSAqIHNpZ25hbHMuYy52YWx1ZSApO1xuICAgICAgICB9XG4gICAgfVxuXG59OyIsInZhciBOb2RlID0gcmVxdWlyZSggJ21hcDIvTm9kZScgKTtcblxuTm9kZS50eXBlcy5udW1iZXIgPSB7XG5cbiAgICB0eXBlOiAnbnVtYmVyJywgXG4gICAgZ3JvdXA6ICd1dGlscycsIFxuXG4gICAgc2lnbmFsczogeyBcbiAgICAgICAgbWFpbjogeyBcbiAgICAgICAgICAgIHR5cGU6ICdudW1iZXInXG4gICAgICAgIH1cbiAgICB9XG5cbn07IiwidmFyIE5vZGUgPSByZXF1aXJlKCAnbWFwMi9Ob2RlJyApO1xudmFyIHBvaW50ZXIgPSByZXF1aXJlKCAnY29tbW9uL3BvaW50ZXInICk7XG5cbk5vZGUudHlwZXMucG9pbnRlciA9IHtcblxuICAgIHR5cGU6ICdwb2ludGVyJyxcbiAgICBncm91cDogJ2Jyb3dzZXInLCBcblxuICAgIHNpZ25hbHM6IHsgXG4gICAgICAgIHg6IHsgXG4gICAgICAgICAgICB0eXBlOiAnbnVtYmVyJywgXG4gICAgICAgICAgICBpbnB1dDogZmFsc2VcbiAgICAgICAgfSwgXG4gICAgICAgIHk6IHsgXG4gICAgICAgICAgICB0eXBlOiAnbnVtYmVyJywgXG4gICAgICAgICAgICBpbnB1dDogZmFsc2VcbiAgICAgICAgfSwgXG4gICAgICAgIG54OiB7IFxuICAgICAgICAgICAgdHlwZTogJ251bWJlcicsIFxuICAgICAgICAgICAgaW5wdXQ6IGZhbHNlXG4gICAgICAgIH0sIFxuICAgICAgICBueTogeyBcbiAgICAgICAgICAgIHR5cGU6ICdudW1iZXInLCBcbiAgICAgICAgICAgIGlucHV0OiBmYWxzZVxuICAgICAgICB9LFxuICAgICAgICBpc2Rvd246IHtcbiAgICAgICAgLy8gICAgIHR5cGU6ICdib29sZWFuJywgXG4gICAgICAgICAgICBpbnB1dDogZmFsc2UsIFxuICAgICAgICAgICAgdmFsdWU6IGZhbHNlXG4gICAgICAgIH0sIFxuICAgICAgICBvbmRvd246IHsgXG4gICAgICAgICAgICB0eXBlOiAnY2FsbCdcbiAgICAgICAgfSwgXG4gICAgICAgIG9udXA6IHsgXG4gICAgICAgICAgICB0eXBlOiAnY2FsbCdcbiAgICAgICAgfSwgXG4gICAgICAgIG9ubW92ZTogeyBcbiAgICAgICAgICAgIHR5cGU6ICdjYWxsJ1xuICAgICAgICB9XG4gICAgfSwgXG5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgXG4gICAgICAgIHZhciBvbmRvd24gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuc2lnbmFscy5vbmRvd24ubmVlZHNVcGRhdGUgPSB0cnVlOyAgIFxuICAgICAgICAgICAgdGhpcy5zaWduYWxzLmlzZG93bi5zZXQoIHRydWUgKTtcbiAgICAgICAgfS5iaW5kKCB0aGlzICk7XG4gICAgICAgIFxuICAgICAgICB2YXIgb251cCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zaWduYWxzLm9udXAubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5zaWduYWxzLmlzZG93bi5zZXQoIGZhbHNlICk7XG4gICAgICAgIH0uYmluZCggdGhpcyApO1xuXG4gICAgICAgIHZhciBvbm1vdmUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuc2lnbmFscy5vbm1vdmUubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5zaWduYWxzLnguc2V0KCBwb2ludGVyLnggKTtcbiAgICAgICAgICAgIHRoaXMuc2lnbmFscy55LnNldCggcG9pbnRlci55ICk7XG4gICAgICAgICAgICB0aGlzLnNpZ25hbHMubnguc2V0KCBwb2ludGVyLnggKTtcbiAgICAgICAgICAgIHRoaXMuc2lnbmFscy5ueS5zZXQoIHBvaW50ZXIueSApO1xuICAgICAgICB9LmJpbmQoIHRoaXMgKTtcblxuICAgICAgICAvLyB1bmJpbmRpbmc/IDotXFxcbiAgICAgICAgLy8gdGhlIHdob2xlIHRoaXMgdnMuIHNpZ25hbHMgYXMgYXJndW1lbnQgdGhpbmcgaXMgZ2V0dGluZyB3ZWlyZFxuICAgICAgICBwb2ludGVyLm9uKCAnZG93bicsIG9uZG93biApO1xuICAgICAgICBwb2ludGVyLm9uKCAndXAnLCBvbnVwICk7XG4gICAgICAgIHBvaW50ZXIub24oICdtb3ZlJywgb25tb3ZlICk7XG5cbiAgICB9LCBcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24oIHNpZ25hbHMgKSB7XG5cbiAgICB9XG5cbn07IiwidmFyIE5vZGUgPSByZXF1aXJlKCAnbWFwMi9Ob2RlJyApO1xudmFyIGxvb3AgPSByZXF1aXJlKCAnY29tbW9uL2xvb3AnICk7XG5cbk5vZGUudHlwZXMudGhyZXNoID0ge1xuXG4gICAgdHlwZTogJ3RocmVzaCcsXG4gICAgZ3JvdXA6ICdsb2dpYycsIFxuXG4gICAgc2lnbmFsczogeyBcbiAgICAgICAgaW46IHsgXG4gICAgICAgICAgICB0eXBlOiAnbnVtYmVyJywgXG4gICAgICAgIH0sIFxuICAgICAgICB0aHJlc2g6IHsgXG4gICAgICAgICAgICB0eXBlOiAnbnVtYmVyJywgXG4gICAgICAgIH0sIFxuICAgICAgICBpc292ZXI6IHsgXG4gICAgICAgICAgICAvLyB0eXBlOiAnYm9vbGVhbicsIFxuICAgICAgICAgICAgdmFsdWU6IGZhbHNlXG4gICAgICAgIH0sIFxuICAgICAgICBvbm92ZXI6IHsgXG4gICAgICAgICAgICB0eXBlOiAnY2FsbCdcbiAgICAgICAgfSwgXG4gICAgICAgIG9udW5kZXI6IHsgXG4gICAgICAgICAgICB0eXBlOiAnY2FsbCdcbiAgICAgICAgfVxuICAgIH0sIFxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbiggc2lnbmFscyApIHtcblxuICAgICAgICB2YXIgZCA9IHNpZ25hbHMuaW4udmFsdWUgLSBzaWduYWxzLnRocmVzaC52YWx1ZTtcbiAgICAgICAgdmFyIGQwID0gc2lnbmFscy5pbi5wcmV2VmFsdWUgLSBzaWduYWxzLnRocmVzaC52YWx1ZTtcblxuICAgICAgICB2YXIgcGVha2luZyA9IGQgPiAwO1xuICAgICAgICB2YXIgd2FzUGVha2luZyA9IGQwID4gMDtcblxuICAgICAgICBpZiAoIHBlYWtpbmcgIT09IHdhc1BlYWtpbmcgKSB7XG4gICAgICAgICAgICBzaWduYWxzLmlzb3Zlci5zZXQoIHBlYWtpbmcgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggcGVha2luZyAmJiAhd2FzUGVha2luZyApIHtcbiAgICAgICAgICAgIHNpZ25hbHMub25vdmVyLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggIXBlYWtpbmcgJiYgd2FzUGVha2luZyApIHsgXG4gICAgICAgICAgICBzaWduYWxzLm9udW5kZXIubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICB9LCBcblxuXG5cbn07IiwidmFyIFNpZ25hbFR5cGUgPSByZXF1aXJlKCAnbWFwMi9TaWduYWxUeXBlJyApO1xuXG52YXIgcGx1Y2sgPSByZXF1aXJlKCAndXRpbHMvcGx1Y2snICk7XG52YXIgaW5oZXJpdCA9IHJlcXVpcmUoICd1dGlscy9pbmhlcml0JyApO1xuXG52YXIgc2NvcGUgPSByZXF1aXJlKCAnY29tbW9uL3Njb3BlJyApO1xuXG5TaWduYWxUeXBlLnR5cGVzLmNhbGwgPSBmdW5jdGlvbiggcGFyYW1zICkge1xuXG4gICAgU2lnbmFsVHlwZS5jYWxsKCB0aGlzLCBwYXJhbXMgKTtcblxuICAgIHRoaXMubmFtZSA9ICdjYWxsJztcblxuICAgIHRoaXMuZGVmYXVsdEFyZ3MgPSBwYXJhbXMuYXJncyB8fCBbXTtcbiAgICB0aGlzLmRlZmF1bHRDb250ZXh0ID0gcGFyYW1zLmNvbnRleHQgfHwgc2NvcGU7XG5cbn07XG5cbmluaGVyaXQoIFNpZ25hbFR5cGUudHlwZXMuY2FsbCwgU2lnbmFsVHlwZSApO1xuXG5TaWduYWxUeXBlLnR5cGVzLmNhbGwucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiggc2lnbmFsICkge1xuXG4gICAgc2lnbmFsLnZhbHVlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHNpZ25hbC5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgfTtcblxuICAgIHZhciBjb250ZXh0U2lnbmFsID0gc2lnbmFsLm1ha2VDaGlsZCggJ2NvbnRleHQnICk7XG4gICAgdmFyIGFyZ3NTaWduYWwgPSBzaWduYWwubWFrZUNoaWxkKCAnYXJncycgKTtcblxuICAgIGNvbnRleHRTaWduYWwuc2V0KCB0aGlzLmRlZmF1bHRDb250ZXh0ICk7XG5cbiAgICBmb3IgKCB2YXIgaSA9IDAsIGwgPSB0aGlzLmRlZmF1bHRBcmdzLmxlbmd0aDsgaSA8IGw7IGkrKyApIHsgXG5cbiAgICAgICAgYXJnc1NpZ25hbC5tYWtlQ2hpbGQoKS5zZXQoIHRoaXMuZGVmYXVsdEFyZ3NbIGkgXSApO1xuXG4gICAgfVxuXG59O1xuXG5TaWduYWxUeXBlLnR5cGVzLmNhbGwucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBhcmdWYWx1ZXMgPSBbXTtcblxuICAgIHJldHVybiBmdW5jdGlvbiggc2lnbmFsLCBkZXN0ICkge1xuXG4gICAgICAgIHZhciBjb250ZXh0ID0gc2lnbmFsLm5hbWVkQ2hpbGRyZW4uY29udGV4dC52YWx1ZTtcbiAgICAgICAgdmFyIGFyZ1NpZ25hbHMgPSBzaWduYWwubmFtZWRDaGlsZHJlbi5hcmdzLmNoaWxkcmVuO1xuXG4gICAgICAgIGFyZ1ZhbHVlcy5sZW5ndGggPSBhcmdTaWduYWxzLmxlbmd0aDtcbiAgICAgICAgcGx1Y2soIGFyZ1NpZ25hbHMsICd2YWx1ZScsIGFyZ1ZhbHVlcyApO1xuXG4gICAgICAgIGRlc3QudmFsdWUuYXBwbHkoIGNvbnRleHQsIGFyZ1ZhbHVlcyApO1xuICAgICAgICBcbiAgICAgICAgZGVzdC5uZWVkc1VwZGF0ZSA9IHRydWU7XG5cbiAgICB9O1xuICAgIFxufSgpO1xuIiwidmFyIFNpZ25hbFR5cGUgPSByZXF1aXJlKCAnbWFwMi9TaWduYWxUeXBlJyApO1xuXG52YXIgaW5oZXJpdCA9IHJlcXVpcmUoICd1dGlscy9pbmhlcml0JyApO1xuXG5TaWduYWxUeXBlLnR5cGVzLm51bWJlciA9IGZ1bmN0aW9uKCBwYXJhbXMgKSB7XG5cbiAgICBTaWduYWxUeXBlLmNhbGwoIHRoaXMsIHBhcmFtcyApO1xuXG4gICAgdGhpcy5uYW1lID0gJ251bWJlcic7XG5cbiAgICB0aGlzLmRlZmF1bHRWYWx1ZSA9IHBhcmFtcy52YWx1ZSA9PT0gdW5kZWZpbmVkID8gMCA6IHBhcmFtcy52YWx1ZTtcblxuICAgIHRoaXMubWluID0gcGFyYW1zLm1pbiA9PT0gdW5kZWZpbmVkID8gLUluZmluaXR5IDogcGFyYW1zLm1pbjtcbiAgICB0aGlzLm1heCA9IHBhcmFtcy5tYXggPT09IHVuZGVmaW5lZCA/ICBJbmZpbml0eSA6IHBhcmFtcy5tYXg7XG4gICAgXG4gICAgaWYgKCBwYXJhbXMuc3RlcCApIHtcbiAgICAgICAgdGhpcy5zdGVwID0gcGFyYW1zLnN0ZXA7XG4gICAgfSBlbHNlIGlmICggdGhpcy5taW4gJiYgdGhpcy5tYXggKSB7IFxuICAgICAgICB0aGlzLnN0ZXAgPSBNYXRoLmFicyggdGhpcy5tYXggLSB0aGlzLm1pbiApICogMC4wMTtcbiAgICB9IGVsc2UgeyBcbiAgICAgICAgdGhpcy5zdGVwID0gMC4wMTtcbiAgICB9XG5cblxufTtcblxuaW5oZXJpdCggU2lnbmFsVHlwZS50eXBlcy5udW1iZXIsIFNpZ25hbFR5cGUgKTsiLCJ2YXIgc2h1ZmZsZSA9IHJlcXVpcmUoICdyYW5kb20vc2h1ZmZsZScgKTtcblxuLy8gdG9kbzogYnJlYWtzIHdpdGggb25lIGl0ZW1cblxubW9kdWxlLmV4cG9ydHMgPSBTaHVmZmxlcjtcblxuZnVuY3Rpb24gU2h1ZmZsZXIoIGFyciApIHtcbiAgICB0aGlzLmFyciA9IHNodWZmbGUoIGFyciApO1xuICAgIHRoaXMuaW5kZXggPSAwO1xufTtcblxuU2h1ZmZsZXIucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoIHRoaXMuaW5kZXggPCB0aGlzLmFyci5sZW5ndGggKSB7XG4gICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICB9XG4gICAgdGhpcy5jdXIgPSB0aGlzLmFyclsgdGhpcy5pbmRleCBdXG4gICAgdGhpcy5pbmRleCsrO1xuICAgIHJldHVybiB0aGlzLmN1cjtcbn07XG5cblNodWZmbGVyLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuYXJyID0gc2h1ZmZsZSggdGhpcy5hcnIgKTtcbiAgICBpZiAoIHRoaXMuYXJyWyAwIF0gPT09IHRoaXMuY3VyICkge1xuICAgICAgICB0aGlzLmFyci5wdXNoKCB0aGlzLmFyci5zaGlmdCgpICk7XG4gICAgfVxuICAgIHRoaXMuaW5kZXggPSAwO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IG5vaXNlO1xuXG5mdW5jdGlvbiBub2lzZSh4LCB5LCB6KSB7XG4gIGlmICggbm9pc2UucHJvZmlsZS5nZW5lcmF0b3IgPT09IHVuZGVmaW5lZCApIHtcbiAgICAvLyBjYWNoaW5nXG4gICAgbm9pc2UucHJvZmlsZS5nZW5lcmF0b3IgPSBuZXcgbm9pc2UuUGVybGluTm9pc2Uobm9pc2UucHJvZmlsZS5zZWVkKTtcbiAgfVxuICB2YXIgZ2VuZXJhdG9yID0gbm9pc2UucHJvZmlsZS5nZW5lcmF0b3I7XG4gIHZhciBlZmZlY3QgPSAxLFxuICAgIGsgPSAxLFxuICAgIHN1bSA9IDA7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbm9pc2UucHJvZmlsZS5vY3RhdmVzOyArK2kpIHtcbiAgICBlZmZlY3QgKj0gbm9pc2UucHJvZmlsZS5mYWxsb3V0O1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIGNhc2UgMTpcbiAgICAgIHN1bSArPSBlZmZlY3QgKiAoMSArIGdlbmVyYXRvci5ub2lzZTFkKGsgKiB4KSkgLyAyO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAyOlxuICAgICAgc3VtICs9IGVmZmVjdCAqICgxICsgZ2VuZXJhdG9yLm5vaXNlMmQoayAqIHgsIGsgKiB5KSkgLyAyO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAzOlxuICAgICAgc3VtICs9IGVmZmVjdCAqICgxICsgZ2VuZXJhdG9yLm5vaXNlM2QoayAqIHgsIGsgKiB5LCBrICogeikpIC8gMjtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBrICo9IDI7XG4gIH1cbiAgcmV0dXJuIHN1bTtcbn07XG5cblxuLy8gdGhlc2UgYXJlIGxpZnRlZCBmcm9tIFByb2Nlc3NpbmcuanNcbi8vIHByb2Nlc3NpbmcgZGVmYXVsdHNcbm5vaXNlLnByb2ZpbGUgPSB7XG4gIGdlbmVyYXRvcjogdW5kZWZpbmVkLFxuICBvY3RhdmVzOiAyLFxuICBmYWxsb3V0OiAwLjUsXG4gIHNlZWQ6IHVuZGVmaW5lZFxufTtcblxuLy8gUHNldWRvLXJhbmRvbSBnZW5lcmF0b3Jcbm5vaXNlLk1hcnNhZ2xpYSA9IGZ1bmN0aW9uKGkxLCBpMikge1xuICAvLyBmcm9tIGh0dHA6Ly93d3cubWF0aC51bmktYmllbGVmZWxkLmRlL35zaWxsa2UvQUxHT1JJVEhNUy9yYW5kb20vbWFyc2FnbGlhLWNcbiAgdmFyIHogPSBpMSB8fCAzNjI0MzYwNjksXG4gICAgdyA9IGkyIHx8IDUyMTI4ODYyOTtcbiAgdmFyIG5leHRJbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgeiA9ICgzNjk2OSAqICh6ICYgNjU1MzUpICsgKHogPj4+IDE2KSkgJiAweEZGRkZGRkZGO1xuICAgIHcgPSAoMTgwMDAgKiAodyAmIDY1NTM1KSArICh3ID4+PiAxNikpICYgMHhGRkZGRkZGRjtcbiAgICByZXR1cm4gKCgoeiAmIDB4RkZGRikgPDwgMTYpIHwgKHcgJiAweEZGRkYpKSAmIDB4RkZGRkZGRkY7XG4gIH07XG5cbiAgdGhpcy5uZXh0RG91YmxlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBpID0gbmV4dEludCgpIC8gNDI5NDk2NzI5NjtcbiAgICByZXR1cm4gaSA8IDAgPyAxICsgaSA6IGk7XG4gIH07XG4gIHRoaXMubmV4dEludCA9IG5leHRJbnQ7XG59XG5cbm5vaXNlLk1hcnNhZ2xpYS5jcmVhdGVSYW5kb21pemVkID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbm93ID0gbmV3IERhdGUoKTtcbiAgcmV0dXJuIG5ldyBub2lzZS5NYXJzYWdsaWEoKG5vdyAvIDYwMDAwKSAmIDB4RkZGRkZGRkYsIG5vdyAmIDB4RkZGRkZGRkYpO1xufTtcblxuLy8gTm9pc2UgZnVuY3Rpb25zIGFuZCBoZWxwZXJzXG5ub2lzZS5QZXJsaW5Ob2lzZSA9IGZ1bmN0aW9uKCBzZWVkICkge1xuICB2YXIgcmFuZG9tID0gc2VlZCAhPT0gdW5kZWZpbmVkID8gbmV3IG5vaXNlLk1hcnNhZ2xpYShzZWVkKSA6IG5vaXNlLk1hcnNhZ2xpYS5jcmVhdGVSYW5kb21pemVkKCk7XG4gIHZhciBpLCBqO1xuICAvLyBodHRwOi8vd3d3Lm5vaXNlbWFjaGluZS5jb20vdGFsazEvMTdiLmh0bWxcbiAgLy8gaHR0cDovL21ybC5ueXUuZWR1L35wZXJsaW4vbm9pc2UvXG4gIC8vIGdlbmVyYXRlIHBlcm11dGF0aW9uXG4gIHZhciBwID0gbmV3IEFycmF5KDUxMik7XG4gIGZvciAoaSA9IDA7IGkgPCAyNTY7ICsraSkge1xuICAgIHBbaV0gPSBpO1xuICB9XG4gIGZvciAoaSA9IDA7IGkgPCAyNTY7ICsraSkge1xuICAgIHZhciB0ID0gcFtqID0gcmFuZG9tLm5leHRJbnQoKSAmIDB4RkZdO1xuICAgIHBbal0gPSBwW2ldO1xuICAgIHBbaV0gPSB0O1xuICB9XG4gIC8vIGNvcHkgdG8gYXZvaWQgdGFraW5nIG1vZCBpbiBwWzBdO1xuICBmb3IgKGkgPSAwOyBpIDwgMjU2OyArK2kpIHtcbiAgICBwW2kgKyAyNTZdID0gcFtpXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdyYWQzZChpLCB4LCB5LCB6KSB7XG4gICAgdmFyIGggPSBpICYgMTU7IC8vIGNvbnZlcnQgaW50byAxMiBncmFkaWVudCBkaXJlY3Rpb25zXG4gICAgdmFyIHUgPSBoIDwgOCA/IHggOiB5LFxuICAgICAgdiA9IGggPCA0ID8geSA6IGggPT09IDEyIHx8IGggPT09IDE0ID8geCA6IHo7XG4gICAgcmV0dXJuICgoaCAmIDEpID09PSAwID8gdSA6IC11KSArICgoaCAmIDIpID09PSAwID8gdiA6IC12KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdyYWQyZChpLCB4LCB5KSB7XG4gICAgdmFyIHYgPSAoaSAmIDEpID09PSAwID8geCA6IHk7XG4gICAgcmV0dXJuIChpICYgMikgPT09IDAgPyAtdiA6IHY7XG4gIH1cblxuICBmdW5jdGlvbiBncmFkMWQoaSwgeCkge1xuICAgIHJldHVybiAoaSAmIDEpID09PSAwID8gLXggOiB4O1xuICB9XG5cbiAgZnVuY3Rpb24gbGVycCh0LCBhLCBiKSB7XG4gICAgcmV0dXJuIGEgKyB0ICogKGIgLSBhKTtcbiAgfVxuXG4gIHRoaXMubm9pc2UzZCA9IGZ1bmN0aW9uICh4LCB5LCB6KSB7XG4gICAgdmFyIFggPSBNYXRoLmZsb29yKHgpICYgMjU1LFxuICAgICAgWSA9IE1hdGguZmxvb3IoeSkgJiAyNTUsXG4gICAgICBaID0gTWF0aC5mbG9vcih6KSAmIDI1NTtcbiAgICB4IC09IE1hdGguZmxvb3IoeCk7XG4gICAgeSAtPSBNYXRoLmZsb29yKHkpO1xuICAgIHogLT0gTWF0aC5mbG9vcih6KTtcbiAgICB2YXIgZnggPSAoMyAtIDIgKiB4KSAqIHggKiB4LFxuICAgICAgZnkgPSAoMyAtIDIgKiB5KSAqIHkgKiB5LFxuICAgICAgZnogPSAoMyAtIDIgKiB6KSAqIHogKiB6O1xuICAgIHZhciBwMCA9IHBbWF0gKyBZLFxuICAgICAgcDAwID0gcFtwMF0gKyBaLFxuICAgICAgcDAxID0gcFtwMCArIDFdICsgWixcbiAgICAgIHAxID0gcFtYICsgMV0gKyBZLFxuICAgICAgcDEwID0gcFtwMV0gKyBaLFxuICAgICAgcDExID0gcFtwMSArIDFdICsgWjtcbiAgICByZXR1cm4gbGVycChmeixcbiAgICBsZXJwKGZ5LCBsZXJwKGZ4LCBncmFkM2QocFtwMDBdLCB4LCB5LCB6KSwgZ3JhZDNkKHBbcDEwXSwgeCAtIDEsIHksIHopKSxcbiAgICBsZXJwKGZ4LCBncmFkM2QocFtwMDFdLCB4LCB5IC0gMSwgeiksIGdyYWQzZChwW3AxMV0sIHggLSAxLCB5IC0gMSwgeikpKSxcbiAgICBsZXJwKGZ5LCBsZXJwKGZ4LCBncmFkM2QocFtwMDAgKyAxXSwgeCwgeSwgeiAtIDEpLCBncmFkM2QocFtwMTAgKyAxXSwgeCAtIDEsIHksIHogLSAxKSksXG4gICAgbGVycChmeCwgZ3JhZDNkKHBbcDAxICsgMV0sIHgsIHkgLSAxLCB6IC0gMSksIGdyYWQzZChwW3AxMSArIDFdLCB4IC0gMSwgeSAtIDEsIHogLSAxKSkpKTtcbiAgfTtcblxuICB0aGlzLm5vaXNlMmQgPSBmdW5jdGlvbiAoeCwgeSkge1xuICAgIHZhciBYID0gTWF0aC5mbG9vcih4KSAmIDI1NSxcbiAgICAgIFkgPSBNYXRoLmZsb29yKHkpICYgMjU1O1xuICAgIHggLT0gTWF0aC5mbG9vcih4KTtcbiAgICB5IC09IE1hdGguZmxvb3IoeSk7XG4gICAgdmFyIGZ4ID0gKDMgLSAyICogeCkgKiB4ICogeCxcbiAgICAgIGZ5ID0gKDMgLSAyICogeSkgKiB5ICogeTtcbiAgICB2YXIgcDAgPSBwW1hdICsgWSxcbiAgICAgIHAxID0gcFtYICsgMV0gKyBZO1xuICAgIHJldHVybiBsZXJwKGZ5LFxuICAgIGxlcnAoZngsIGdyYWQyZChwW3AwXSwgeCwgeSksIGdyYWQyZChwW3AxXSwgeCAtIDEsIHkpKSxcbiAgICBsZXJwKGZ4LCBncmFkMmQocFtwMCArIDFdLCB4LCB5IC0gMSksIGdyYWQyZChwW3AxICsgMV0sIHggLSAxLCB5IC0gMSkpKTtcbiAgfTtcblxuICB0aGlzLm5vaXNlMWQgPSBmdW5jdGlvbiAoeCkge1xuICAgIHZhciBYID0gTWF0aC5mbG9vcih4KSAmIDI1NTtcbiAgICB4IC09IE1hdGguZmxvb3IoeCk7XG4gICAgdmFyIGZ4ID0gKDMgLSAyICogeCkgKiB4ICogeDtcbiAgICByZXR1cm4gbGVycChmeCwgZ3JhZDFkKHBbWF0sIHgpLCBncmFkMWQocFtYICsgMV0sIHggLSAxKSk7XG4gIH07XG5cbn1cbiIsInZhciBpcyA9IHJlcXVpcmUoICd1dGlscy9pcycgKTtcblxubW9kdWxlLmV4cG9ydHMgPSByYW5kb207XG5cbmZ1bmN0aW9uIHJhbmRvbSggJDEsICQyICkge1xuXG4gICAgaWYgKCBhcmd1bWVudHMubGVuZ3RoID09IDAgKSB7XG4gICAgICAgIHJldHVybiBNYXRoLnJhbmRvbSgpO1xuICAgIH1cblxuICAgIGlmICggJDEubGVuZ3RoICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIHJldHVybiAkMVsgfn4oIE1hdGgucmFuZG9tKCkgKiAkMS5sZW5ndGggKSBdO1xuICAgIH1cblxuICAgIHN3aXRjaCAoIGFyZ3VtZW50cy5sZW5ndGggKSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnJhbmRvbSgpICogJDE7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnJhbmRvbSgpICogKCAkMiAtICQxICkgKyAkMTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnJhbmRvbSgpO1xuICAgIH1cblxufTtcblxucmFuZG9tLnJhbmdlID0gZnVuY3Rpb24oICQxLCAkMiApIHtcblxuICAgIHN3aXRjaCAoIGFyZ3VtZW50cy5sZW5ndGggKSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnJhbmRvbSgpICogJDEgKiAyIC0gJDE7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHJldHVybiAoIE1hdGgucmFuZG9tKCkgKiAoICQyIC0gJDEgKSArICQxICkgKiAoIE1hdGgucmFuZG9tKCkgPCAwLjUgPyAxIDogLTEgKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnJhbmRvbSgpICogMiAtIDE7XG4gICAgfVxuXG59O1xuXG5yYW5kb20uaW50ID0gZnVuY3Rpb24oICQxLCAkMiApIHtcblxuICAgIHZhciBtaW4gPSAtMSwgbWF4ID0gMTtcblxuICAgIHN3aXRjaCAoIGFyZ3VtZW50cy5sZW5ndGggKSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIG1pbiA9IDA7XG4gICAgICAgICAgICBtYXggPSAkMTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICBtaW4gPSAkMTtcbiAgICAgICAgICAgIG1heCA9ICQyO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgcmV0dXJuIH5+KCBNYXRoLnJhbmRvbSgpICogKCBtYXggLSBtaW4gKSArIG1pbiApO1xuICAgIFxufTtcblxudmFyIFRXT19QSSA9IE1hdGguUEkgKiAyO1xuXG5yYW5kb20uYW5nbGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gTWF0aC5yYW5kb20oKSAqIFRXT19QSTsgIFxufTtcblxucmFuZG9tLmNoYW5jZSA9IGZ1bmN0aW9uKCBwZXJjZW50ICkge1xuICAgIHJldHVybiBNYXRoLnJhbmRvbSgpIDwgKCBwZXJjZW50IHx8IDAuNSApO1xufTtcblxucmFuZG9tLnNpZ24gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gTWF0aC5yYW5kb20oKSA8IDAuNSA/IDEgOiAtMTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggbyApIHtcbiAgICBmb3IgKCB2YXIgaiwgeCwgaSA9IG8ubGVuZ3RoOyBpOyBqID0gfn4oIE1hdGgucmFuZG9tKCkgKiBpICksIHggPSBvWyAtLWkgXSwgb1sgaSBdID0gb1sgaiBdLCBvWyBqIF0gPSB4ICk7XG4gICAgcmV0dXJuIG87XG59OyIsInZhciBzY29wZSA9IHJlcXVpcmUoICdjb21tb24vc2NvcGUnICk7XG5cbnZhciBtYXRoID0gcmVxdWlyZSggJ3V0aWxzL21hdGgnICk7XG5cbm1vZHVsZS5leHBvcnRzID0gc2NvcGUuYWYgPSB7XG5cbiAgICBtYWluOiAgICAgICAgICAgcmVxdWlyZSggJ21haW4nICksIFxuXG4gICAgYXNzZXRzOiAgICAgICAgIHJlcXVpcmUoICdhc3NldHMnICksIFxuXG4gICAgcmVhZHk6ICAgICAgICAgIHJlcXVpcmUoICdjb21tb24vcmVhZHknICkudGhlbiwgXG5cbiAgICBhdWRpbzogICAgICAgICAgcmVxdWlyZSggJ2NvbW1vbi9hdWRpbycgKSwgXG4gICAgZ2w6ICAgICAgICAgICAgIHJlcXVpcmUoICdjb21tb24vZ2wnICksIFxuICAgIGxvb3A6ICAgICAgICAgICByZXF1aXJlKCAnY29tbW9uL2xvb3AnICksIFxuICAgIG5vb3A6ICAgICAgICAgICByZXF1aXJlKCAnY29tbW9uL25vb3AnICksIFxuICAgIHNjb3BlOiAgICAgICAgICByZXF1aXJlKCAnY29tbW9uL3Njb3BlJyApLCBcblxuICAgIHVhOiAgICAgICAgICAgICByZXF1aXJlKCAnY29tbW9uL3VhJyApLCBcbiAgICB1cmw6ICAgICAgICAgICAgcmVxdWlyZSggJ2NvbW1vbi91cmwnICksIFxuXG4gICAgbWF0aDogICAgICAgICAgIHJlcXVpcmUoICd1dGlscy9tYXRoJyApLCBcblxuICAgIHBvaW50ZXI6ICAgICAgICByZXF1aXJlKCAnY29tbW9uL3BvaW50ZXInICksIFxuICAgIGFjY2VsZXJvbWV0ZXI6ICByZXF1aXJlKCAnY29tbW9uL2FjY2VsZXJvbWV0ZXInICksIFxuXG4gICAgcmFuZG9tOiAgICAgICAgIHJlcXVpcmUoICdyYW5kb20vcmFuZG9tJyApLCBcbiAgICBub2lzZTogICAgICAgICAgcmVxdWlyZSggJ3JhbmRvbS9ub2lzZScgKSwgXG4gICAgc2h1ZmZsZTogICAgICAgIHJlcXVpcmUoICdyYW5kb20vc2h1ZmZsZScgKSwgXG4gICAgU2h1ZmZsZXI6ICAgICAgIHJlcXVpcmUoICdyYW5kb20vU2h1ZmZsZXInICksIFxuXG4gICAgUHJvbWlzZTogICAgICAgIHJlcXVpcmUoICd1dGlscy9Qcm9taXNlJyApLCBcbiAgICBFdmVudHM6ICAgICAgICAgcmVxdWlyZSggJ3V0aWxzL0V2ZW50cycgKSwgXG5cbiAgICBhcnJheTogICAgICAgICAgcmVxdWlyZSggJ3V0aWxzL2FycmF5JyApLCBcbiAgICBpbmhlcml0OiAgICAgICAgcmVxdWlyZSggJ3V0aWxzL2luaGVyaXQnICksIFxuICAgIG5vdzogICAgICAgICAgICByZXF1aXJlKCAndXRpbHMvbm93JyApLCBcbiAgICB4aHI6ICAgICAgICAgICAgcmVxdWlyZSggJ3V0aWxzL3hocicgKSwgXG4gICAgaXM6ICAgICAgICAgICAgIHJlcXVpcmUoICd1dGlscy9pcycgKSwgXG4gICAgZGVib3VuY2U6ICAgICAgIHJlcXVpcmUoICd1dGlscy9kZWJvdW5jZScgKSwgXG4gICAgYmluZEFsbDogICAgICAgIHJlcXVpcmUoICd1dGlscy9iaW5kQWxsJyApLCBcblxuICAgIGRlZmF1bHRzOiAgICAgICByZXF1aXJlKCAndXRpbHMvZGVmYXVsdHMnICksIFxuICAgIHBsdWNrOiAgICAgICAgICByZXF1aXJlKCAndXRpbHMvcGx1Y2snICksIFxuICAgIGV4dGVuZDogICAgICAgICByZXF1aXJlKCAndXRpbHMvZXh0ZW5kJyApLCBcbiAgICB2YWx1ZXM6ICAgICAgICAgcmVxdWlyZSggJ3V0aWxzL3ZhbHVlcycgKSwgXG5cbiAgICBTYW1wbGU6ICAgICAgICAgcmVxdWlyZSggJ2F1ZGlvL1NhbXBsZScgKSwgXG5cbiAgICBNYXA6ICAgICAgICAgICAgcmVxdWlyZSggJ21hcDIvTWFwJyApLCBcbiAgICBOb2RlOiAgICAgICAgICAgcmVxdWlyZSggJ21hcDIvTm9kZScgKSxcblxuICAgIHRocmVlOiB7XG5cbiAgICAgICAgdG1wOiByZXF1aXJlKCAndGhyZWUvdG1wJyApXG5cbiAgICB9XG5cbn07XG5cbmZvciAoIHZhciBpIGluIG1hdGggKSB7XG4gICAgaWYgKCBzY29wZS5hZlsgaSBdICkge1xuICAgICAgICB0aHJvdyAnQ29uZmxpY3Qgd2hpbGUgZ2xvYmFsaXppbmcgbWF0aDogJyArIGk7XG4gICAgfVxuICAgIHNjb3BlLmFmWyBpIF0gPSBtYXRoWyBpIF07XG59XG5cbi8vIExlZ2FjeSBzeW5vbnltXG5cbnNjb3BlLmFmLnV0aWxzID0geyBcbiAgICBkZWZhdWx0czogc2NvcGUuYWYuZGVmYXVsdHMsXG4gICAgRXZlbnRzOiBzY29wZS5hZi5FdmVudHMsXG4gICAgZXh0ZW5kOiBzY29wZS5hZi5leHRlbmQsXG4gICAgbWF0aDogc2NvcGUuYWYubWF0aCxcbiAgICBhcnJheTogc2NvcGUuYWYuYXJyYXlcbn07XG5cbnNjb3BlLmFmLmNvbW1vbiA9IHsgXG4gICAgdXJsOiBzY29wZS5hZi51cmwsXG4gICAgdWE6IHNjb3BlLmFmLnVhLFxuICAgIHBvaW50ZXI6IHNjb3BlLmFmLnBvaW50ZXIsXG4gICAgbG9vcDogc2NvcGUuYWYubG9vcFxufVxuXG5zY29wZS5hYWYgPSBzY29wZS5hZjsiLCJtb2R1bGUuZXhwb3J0cyA9IFRleHR1cmVBdGxhcztcblxuZnVuY3Rpb24gVGV4dHVyZUF0bGFzKCBzaGVldHMgKSB7XG5cbiAgICB0aGlzLnNoZWV0cyA9IHNoZWV0cztcbiAgICBcbiAgICB0aGlzLnBhdGhzID0ge307XG4gICAgdGhpcy5mcmFtZXMgPSBbXTtcblxuICAgIGZvciAoIHZhciBpID0gMCwgbCA9IHRoaXMuc2hlZXRzLmxlbmd0aDsgaSA8IGw7IGkrKyApIHsgXG4gICAgICAgIHZhciBzID0gdGhpcy5zaGVldHNbIGkgXTtcbiAgICAgICAgZm9yICggdmFyIHBhdGggaW4gcy5wYXRocyApIHtcbiAgICAgICAgICAgIHRoaXMucGF0aHNbIHBhdGggXSA9IHM7XG4gICAgICAgICAgICB0aGlzLmZyYW1lcy5wdXNoKCBwYXRoICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLm1pblVWID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcbiAgICB0aGlzLm1heFVWID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcbiAgICB0aGlzLm9mZnNldCA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG4gICAgdGhpcy5zY2FsZSA9IG5ldyBUSFJFRS5WZWN0b3IyKCAxLCAxICk7XG5cbiAgICB0aGlzLnVuaWZvcm1zID0geyBcblxuICAgICAgICB1QXRsYXNTaGVldDoge1xuICAgICAgICAgICAgdHlwZTogJ3QnLCBcbiAgICAgICAgICAgIHZhbHVlOiBudWxsXG4gICAgICAgIH0sIFxuXG4gICAgICAgIHVBdGxhc01pblVWOiB7XG4gICAgICAgICAgICB0eXBlOiAndjInLCBcbiAgICAgICAgICAgIHZhbHVlOiB0aGlzLm1pblVWXG4gICAgICAgIH0sIFxuXG4gICAgICAgIHVBdGxhc01heFVWOiB7XG4gICAgICAgICAgICB0eXBlOiAndjInLCBcbiAgICAgICAgICAgIHZhbHVlOiB0aGlzLm1heFVWXG4gICAgICAgIH0sIFxuXG4gICAgICAgIHVBdGxhc09mZnNldDoge1xuICAgICAgICAgICAgdHlwZTogJ3YyJywgXG4gICAgICAgICAgICB2YWx1ZTogdGhpcy5vZmZzZXRcbiAgICAgICAgfSwgXG5cbiAgICAgICAgdUF0bGFzU2NhbGU6IHtcbiAgICAgICAgICAgIHR5cGU6ICd2MicsIFxuICAgICAgICAgICAgdmFsdWU6IHRoaXMuc2NhbGVcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIHRoaXMuYWN0aXZlU2hlZXQgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5zZXRGcmFtZSggMCApO1xuXG59O1xuXG5UZXh0dXJlQXRsYXMucHJvdG90eXBlLnNldFBhdGggPSBmdW5jdGlvbiggcGF0aCApIHtcbiAgICBcbiAgICB0aGlzLl9zZXRQYXRoKCBwYXRoICk7XG4gICAgdGhpcy5mcmFtZSA9IHRoaXMuZnJhbWVzLmluZGV4T2YoIHBhdGggKTtcblxufTtcblxuVGV4dHVyZUF0bGFzLnByb3RvdHlwZS5zZXRGcmFtZSA9IGZ1bmN0aW9uKCBmcmFtZSApIHtcbiAgICBcbiAgICB0aGlzLl9zZXRQYXRoKCB0aGlzLmZyYW1lc1sgZnJhbWUgXSApO1xuICAgIHRoaXMuZnJhbWUgPSBmcmFtZTtcblxufTtcblxuVGV4dHVyZUF0bGFzLnByb3RvdHlwZS5uZXh0RnJhbWUgPSBmdW5jdGlvbigpIHtcbiAgXG4gICAgdGhpcy5zZXRGcmFtZSggKCB0aGlzLmZyYW1lICsgMSApICUgdGhpcy5mcmFtZXMubGVuZ3RoICk7XG5cbn07XG5cblRleHR1cmVBdGxhcy5wcm90b3R5cGUuX3NldFBhdGggPSBmdW5jdGlvbiggcGF0aCApIHtcbiAgICBcbiAgICB0aGlzLnBhdGggPSBwYXRoO1xuICAgIHRoaXMuYWN0aXZlU2hlZXQgPSB0aGlzLnBhdGhzWyBwYXRoIF07XG4gICAgdGhpcy5hY3RpdmVTaGVldC5zZXRCb3VuZHMoIHBhdGgsIHRoaXMubWluVVYsIHRoaXMubWF4VVYgKTtcbiAgICB0aGlzLnVuaWZvcm1zLnVBdGxhc1NoZWV0LnZhbHVlID0gdGhpcy5hY3RpdmVTaGVldC50ZXh0dXJlO1xuICAgIHRoaXMuYWN0aXZlU2hlZXQudGV4dHVyZS5yZXBlYXQuc2V0KCA0LCA0ICk7XG4gICAgLy8gdGhpcy5hY3RpdmVTaGVldC50ZXh0dXJlLl9uZWVkc1VwZGF0ZSA9IHRydWU7XG5cbn07XG5cblRleHR1cmVBdGxhcy5TaGVldCA9IGZ1bmN0aW9uKCB0ZXh0dXJlLCB0ZXh0dXJlUGFja2VyRGF0YSApIHtcblxuICAgIHRoaXMudGV4dHVyZSA9IHRleHR1cmU7XG4gICAgLy8gdGhpcy50ZXh0dXJlLmdlbmVyYXRlTWlwbWFwcyA9IGZhbHNlO1xuICAgIC8vIHRoaXMudGV4dHVyZS5tYWdGaWx0ZXIgPSBUSFJFRS5OZWFyZXN0RmlsdGVyO1xuICAgIHRoaXMudGV4dHVyZS5taW5GaWx0ZXIgPSBUSFJFRS5OZWFyZXN0RmlsdGVyO1xuXG4gICAgdGhpcy5wYXRocyA9IHRleHR1cmVQYWNrZXJEYXRhLmZyYW1lcztcbiAgICB0aGlzLmZyYW1lcyA9IFtdO1xuXG4gICAgZm9yICggdmFyIGkgaW4gdGhpcy5wYXRocyApIHtcbiAgICAgICAgdGhpcy5mcmFtZXMucHVzaCggdGhpcy5wYXRoc1sgaSBdICk7XG4gICAgfVxuXG4gICAgdGhpcy53aWR0aCA9IHRleHR1cmVQYWNrZXJEYXRhLm1ldGEuc2l6ZS53O1xuICAgIHRoaXMuaGVpZ2h0ID0gdGV4dHVyZVBhY2tlckRhdGEubWV0YS5zaXplLmg7XG5cbn07XG5cblRleHR1cmVBdGxhcy5TaGVldC5wcm90b3R5cGUuc2V0Qm91bmRzID0gZnVuY3Rpb24oIHBhdGgsIG1pbiwgbWF4ICkge1xuICAgIFxuICAgIHZhciBmcmFtZSA9IHRoaXMucGF0aHNbIHBhdGggXS5mcmFtZTtcblxuICAgIG1pbi54ID0gZnJhbWUueCAvIHRoaXMud2lkdGg7XG4gICAgbWF4LnkgPSAxLjAgLSBmcmFtZS55IC8gdGhpcy5oZWlnaHQ7XG5cbiAgICBtYXgueCA9ICggZnJhbWUueCArIGZyYW1lLncgKSAvIHRoaXMud2lkdGg7XG4gICAgbWluLnkgPSAxLjAgLSAoIGZyYW1lLnkgKyBmcmFtZS5oICkgLyB0aGlzLmhlaWdodDtcblxufTsiLCJ2YXIgcmVhZHkgPSByZXF1aXJlKCAnY29tbW9uL3JlYWR5JyApXG52YXIgdG1wID0ge307XG5tb2R1bGUuZXhwb3J0cyA9IHRtcDtcblxucmVhZHkudGhlbiggZnVuY3Rpb24oKSB7XG5cbiAgICBpZiAoICF3aW5kb3cuVEhSRUUgKSByZXR1cm47XG5cbiAgICB0bXAudmVjID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcbiAgICB0bXAudmVjMSA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG4gICAgdG1wLnZlYzIgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuICAgIHRtcC5tYXQgPSBuZXcgVEhSRUUuTWF0cml4NCgpO1xuXG4gICAgdG1wLnF1YXQgPSBuZXcgVEhSRUUuUXVhdGVybmlvbigpO1xuICAgIHRtcC5xdWF0MiA9IG5ldyBUSFJFRS5RdWF0ZXJuaW9uKCk7XG5cbn0gKTsiLCJtb2R1bGUuZXhwb3J0cyA9IEV2ZW50cztcblxuLy8gRXZlbnRzXG4vLyAtLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhhbmtzIHRvOlxuLy8gIC0gaHR0cHM6Ly9naXRodWIuY29tL2RvY3VtZW50Y2xvdWQvYmFja2JvbmUvYmxvYi9tYXN0ZXIvYmFja2JvbmUuanNcbi8vICAtIGh0dHBzOi8vZ2l0aHViLmNvbS9qb3llbnQvbm9kZS9ibG9iL21hc3Rlci9saWIvZXZlbnRzLmpzXG5cblxuLy8gUmVndWxhciBleHByZXNzaW9uIHVzZWQgdG8gc3BsaXQgZXZlbnQgc3RyaW5nc1xudmFyIGV2ZW50U3BsaXR0ZXIgPSAvXFxzKy9cblxuXG4vLyBBIG1vZHVsZSB0aGF0IGNhbiBiZSBtaXhlZCBpbiB0byAqYW55IG9iamVjdCogaW4gb3JkZXIgdG8gcHJvdmlkZSBpdFxuLy8gd2l0aCBjdXN0b20gZXZlbnRzLiBZb3UgbWF5IGJpbmQgd2l0aCBgb25gIG9yIHJlbW92ZSB3aXRoIGBvZmZgIGNhbGxiYWNrXG4vLyBmdW5jdGlvbnMgdG8gYW4gZXZlbnQ7IGB0cmlnZ2VyYC1pbmcgYW4gZXZlbnQgZmlyZXMgYWxsIGNhbGxiYWNrcyBpblxuLy8gc3VjY2Vzc2lvbi5cbi8vXG4vLyAgICAgdmFyIG9iamVjdCA9IG5ldyBFdmVudHMoKTtcbi8vICAgICBvYmplY3Qub24oJ2V4cGFuZCcsIGZ1bmN0aW9uKCl7IGFsZXJ0KCdleHBhbmRlZCcpOyB9KTtcbi8vICAgICBvYmplY3QudHJpZ2dlcignZXhwYW5kJyk7XG4vL1xuZnVuY3Rpb24gRXZlbnRzKCkge1xufVxuXG5cbi8vIEJpbmQgb25lIG9yIG1vcmUgc3BhY2Ugc2VwYXJhdGVkIGV2ZW50cywgYGV2ZW50c2AsIHRvIGEgYGNhbGxiYWNrYFxuLy8gZnVuY3Rpb24uIFBhc3NpbmcgYFwiYWxsXCJgIHdpbGwgYmluZCB0aGUgY2FsbGJhY2sgdG8gYWxsIGV2ZW50cyBmaXJlZC5cbkV2ZW50cy5wcm90b3R5cGUub24gPSBmdW5jdGlvbihldmVudHMsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gIHZhciBjYWNoZSwgZXZlbnQsIGxpc3RcbiAgaWYgKCFjYWxsYmFjaykgcmV0dXJuIHRoaXNcblxuICBjYWNoZSA9IHRoaXMuX19ldmVudHMgfHwgKHRoaXMuX19ldmVudHMgPSB7fSlcbiAgZXZlbnRzID0gZXZlbnRzLnNwbGl0KGV2ZW50U3BsaXR0ZXIpXG5cbiAgd2hpbGUgKGV2ZW50ID0gZXZlbnRzLnNoaWZ0KCkpIHtcbiAgICBsaXN0ID0gY2FjaGVbZXZlbnRdIHx8IChjYWNoZVtldmVudF0gPSBbXSlcbiAgICBsaXN0LnB1c2goY2FsbGJhY2ssIGNvbnRleHQpXG4gIH1cblxuICByZXR1cm4gdGhpc1xufVxuXG5FdmVudHMucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbihldmVudHMsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gIHZhciB0aGF0ID0gdGhpc1xuICB2YXIgY2IgPSBmdW5jdGlvbigpIHtcbiAgICB0aGF0Lm9mZihldmVudHMsIGNiKVxuICAgIGNhbGxiYWNrLmFwcGx5KGNvbnRleHQgfHwgdGhhdCwgYXJndW1lbnRzKVxuICB9XG4gIHJldHVybiB0aGlzLm9uKGV2ZW50cywgY2IsIGNvbnRleHQpXG59XG5cbi8vIFJlbW92ZSBvbmUgb3IgbWFueSBjYWxsYmFja3MuIElmIGBjb250ZXh0YCBpcyBudWxsLCByZW1vdmVzIGFsbCBjYWxsYmFja3Ncbi8vIHdpdGggdGhhdCBmdW5jdGlvbi4gSWYgYGNhbGxiYWNrYCBpcyBudWxsLCByZW1vdmVzIGFsbCBjYWxsYmFja3MgZm9yIHRoZVxuLy8gZXZlbnQuIElmIGBldmVudHNgIGlzIG51bGwsIHJlbW92ZXMgYWxsIGJvdW5kIGNhbGxiYWNrcyBmb3IgYWxsIGV2ZW50cy5cbkV2ZW50cy5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24oZXZlbnRzLCBjYWxsYmFjaywgY29udGV4dCkge1xuICB2YXIgY2FjaGUsIGV2ZW50LCBsaXN0LCBpXG5cbiAgLy8gTm8gZXZlbnRzLCBvciByZW1vdmluZyAqYWxsKiBldmVudHMuXG4gIGlmICghKGNhY2hlID0gdGhpcy5fX2V2ZW50cykpIHJldHVybiB0aGlzXG4gIGlmICghKGV2ZW50cyB8fCBjYWxsYmFjayB8fCBjb250ZXh0KSkge1xuICAgIGRlbGV0ZSB0aGlzLl9fZXZlbnRzXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGV2ZW50cyA9IGV2ZW50cyA/IGV2ZW50cy5zcGxpdChldmVudFNwbGl0dGVyKSA6IGtleXMoY2FjaGUpXG5cbiAgLy8gTG9vcCB0aHJvdWdoIHRoZSBjYWxsYmFjayBsaXN0LCBzcGxpY2luZyB3aGVyZSBhcHByb3ByaWF0ZS5cbiAgd2hpbGUgKGV2ZW50ID0gZXZlbnRzLnNoaWZ0KCkpIHtcbiAgICBsaXN0ID0gY2FjaGVbZXZlbnRdXG4gICAgaWYgKCFsaXN0KSBjb250aW51ZVxuXG4gICAgaWYgKCEoY2FsbGJhY2sgfHwgY29udGV4dCkpIHtcbiAgICAgIGRlbGV0ZSBjYWNoZVtldmVudF1cbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuXG4gICAgZm9yIChpID0gbGlzdC5sZW5ndGggLSAyOyBpID49IDA7IGkgLT0gMikge1xuICAgICAgaWYgKCEoY2FsbGJhY2sgJiYgbGlzdFtpXSAhPT0gY2FsbGJhY2sgfHxcbiAgICAgICAgICBjb250ZXh0ICYmIGxpc3RbaSArIDFdICE9PSBjb250ZXh0KSkge1xuICAgICAgICBsaXN0LnNwbGljZShpLCAyKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzXG59XG5cblxuLy8gVHJpZ2dlciBvbmUgb3IgbWFueSBldmVudHMsIGZpcmluZyBhbGwgYm91bmQgY2FsbGJhY2tzLiBDYWxsYmFja3MgYXJlXG4vLyBwYXNzZWQgdGhlIHNhbWUgYXJndW1lbnRzIGFzIGB0cmlnZ2VyYCBpcywgYXBhcnQgZnJvbSB0aGUgZXZlbnQgbmFtZVxuLy8gKHVubGVzcyB5b3UncmUgbGlzdGVuaW5nIG9uIGBcImFsbFwiYCwgd2hpY2ggd2lsbCBjYXVzZSB5b3VyIGNhbGxiYWNrIHRvXG4vLyByZWNlaXZlIHRoZSB0cnVlIG5hbWUgb2YgdGhlIGV2ZW50IGFzIHRoZSBmaXJzdCBhcmd1bWVudCkuXG5FdmVudHMucHJvdG90eXBlLnRyaWdnZXIgPSBFdmVudHMucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbihldmVudHMpIHtcbiAgdmFyIGNhY2hlLCBldmVudCwgYWxsLCBsaXN0LCBpLCBsZW4sIHJlc3QgPSBbXSwgYXJncywgcmV0dXJuZWQgPSB0cnVlO1xuICBpZiAoIShjYWNoZSA9IHRoaXMuX19ldmVudHMpKSByZXR1cm4gdGhpc1xuXG4gIGV2ZW50cyA9IGV2ZW50cy5zcGxpdChldmVudFNwbGl0dGVyKVxuXG4gIC8vIEZpbGwgdXAgYHJlc3RgIHdpdGggdGhlIGNhbGxiYWNrIGFyZ3VtZW50cy4gIFNpbmNlIHdlJ3JlIG9ubHkgY29weWluZ1xuICAvLyB0aGUgdGFpbCBvZiBgYXJndW1lbnRzYCwgYSBsb29wIGlzIG11Y2ggZmFzdGVyIHRoYW4gQXJyYXkjc2xpY2UuXG4gIGZvciAoaSA9IDEsIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIHJlc3RbaSAtIDFdID0gYXJndW1lbnRzW2ldXG4gIH1cblxuICAvLyBGb3IgZWFjaCBldmVudCwgd2FsayB0aHJvdWdoIHRoZSBsaXN0IG9mIGNhbGxiYWNrcyB0d2ljZSwgZmlyc3QgdG9cbiAgLy8gdHJpZ2dlciB0aGUgZXZlbnQsIHRoZW4gdG8gdHJpZ2dlciBhbnkgYFwiYWxsXCJgIGNhbGxiYWNrcy5cbiAgd2hpbGUgKGV2ZW50ID0gZXZlbnRzLnNoaWZ0KCkpIHtcbiAgICAvLyBDb3B5IGNhbGxiYWNrIGxpc3RzIHRvIHByZXZlbnQgbW9kaWZpY2F0aW9uLlxuICAgIGlmIChhbGwgPSBjYWNoZS5hbGwpIGFsbCA9IGFsbC5zbGljZSgpXG4gICAgaWYgKGxpc3QgPSBjYWNoZVtldmVudF0pIGxpc3QgPSBsaXN0LnNsaWNlKClcblxuICAgIC8vIEV4ZWN1dGUgZXZlbnQgY2FsbGJhY2tzIGV4Y2VwdCBvbmUgbmFtZWQgXCJhbGxcIlxuICAgIGlmIChldmVudCAhPT0gJ2FsbCcpIHtcbiAgICAgIHJldHVybmVkID0gdHJpZ2dlckV2ZW50cyhsaXN0LCByZXN0LCB0aGlzKSAmJiByZXR1cm5lZFxuICAgIH1cblxuICAgIC8vIEV4ZWN1dGUgXCJhbGxcIiBjYWxsYmFja3MuXG4gICAgcmV0dXJuZWQgPSB0cmlnZ2VyRXZlbnRzKGFsbCwgW2V2ZW50XS5jb25jYXQocmVzdCksIHRoaXMpICYmIHJldHVybmVkXG4gIH1cblxuICByZXR1cm4gcmV0dXJuZWRcbn1cblxuRXZlbnRzLnByb3RvdHlwZS5lbWl0ID0gRXZlbnRzLnByb3RvdHlwZS50cmlnZ2VyXG5cblxuLy8gSGVscGVyc1xuLy8gLS0tLS0tLVxuXG52YXIga2V5cyA9IE9iamVjdC5rZXlzXG5cbmlmICgha2V5cykge1xuICBrZXlzID0gZnVuY3Rpb24obykge1xuICAgIHZhciByZXN1bHQgPSBbXVxuXG4gICAgZm9yICh2YXIgbmFtZSBpbiBvKSB7XG4gICAgICBpZiAoby5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICByZXN1bHQucHVzaChuYW1lKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cbn1cblxuLy8gTWl4IGBFdmVudHNgIHRvIG9iamVjdCBpbnN0YW5jZSBvciBDbGFzcyBmdW5jdGlvbi5cbkV2ZW50cy5taXhUbyA9IGZ1bmN0aW9uKHJlY2VpdmVyKSB7XG4gIHZhciBwcm90byA9IEV2ZW50cy5wcm90b3R5cGVcblxuICBpZiAoaXNGdW5jdGlvbihyZWNlaXZlcikpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gcHJvdG8pIHtcbiAgICAgIGlmIChwcm90by5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgIHJlY2VpdmVyLnByb3RvdHlwZVtrZXldID0gcHJvdG9ba2V5XVxuICAgICAgfVxuICAgIH1cbiAgICBPYmplY3Qua2V5cyhwcm90bykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgIHJlY2VpdmVyLnByb3RvdHlwZVtrZXldID0gcHJvdG9ba2V5XVxuICAgIH0pXG4gIH1cbiAgZWxzZSB7XG4gICAgdmFyIGV2ZW50ID0gbmV3IEV2ZW50c1xuICAgIGZvciAodmFyIGtleSBpbiBwcm90bykge1xuICAgICAgaWYgKHByb3RvLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgY29weVByb3RvKGtleSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjb3B5UHJvdG8oa2V5KSB7XG4gICAgcmVjZWl2ZXJba2V5XSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcHJvdG9ba2V5XS5hcHBseShldmVudCwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSlcbiAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuICB9XG59XG5cbi8vIEV4ZWN1dGUgY2FsbGJhY2tzXG5mdW5jdGlvbiB0cmlnZ2VyRXZlbnRzKGxpc3QsIGFyZ3MsIGNvbnRleHQpIHtcbiAgdmFyIHBhc3MgPSB0cnVlXG5cbiAgaWYgKGxpc3QpIHtcbiAgICB2YXIgaSA9IDAsIGwgPSBsaXN0Lmxlbmd0aCwgYTEgPSBhcmdzWzBdLCBhMiA9IGFyZ3NbMV0sIGEzID0gYXJnc1syXVxuICAgIC8vIGNhbGwgaXMgZmFzdGVyIHRoYW4gYXBwbHksIG9wdGltaXplIGxlc3MgdGhhbiAzIGFyZ3VcbiAgICAvLyBodHRwOi8vYmxvZy5jc2RuLm5ldC96aGVuZ3lpbmh1aTEwMC9hcnRpY2xlL2RldGFpbHMvNzgzNzEyN1xuICAgIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcbiAgICAgIGNhc2UgMDogZm9yICg7IGkgPCBsOyBpICs9IDIpIHtwYXNzID0gbGlzdFtpXS5jYWxsKGxpc3RbaSArIDFdIHx8IGNvbnRleHQpICE9PSBmYWxzZSAmJiBwYXNzfSBicmVhaztcbiAgICAgIGNhc2UgMTogZm9yICg7IGkgPCBsOyBpICs9IDIpIHtwYXNzID0gbGlzdFtpXS5jYWxsKGxpc3RbaSArIDFdIHx8IGNvbnRleHQsIGExKSAhPT0gZmFsc2UgJiYgcGFzc30gYnJlYWs7XG4gICAgICBjYXNlIDI6IGZvciAoOyBpIDwgbDsgaSArPSAyKSB7cGFzcyA9IGxpc3RbaV0uY2FsbChsaXN0W2kgKyAxXSB8fCBjb250ZXh0LCBhMSwgYTIpICE9PSBmYWxzZSAmJiBwYXNzfSBicmVhaztcbiAgICAgIGNhc2UgMzogZm9yICg7IGkgPCBsOyBpICs9IDIpIHtwYXNzID0gbGlzdFtpXS5jYWxsKGxpc3RbaSArIDFdIHx8IGNvbnRleHQsIGExLCBhMiwgYTMpICE9PSBmYWxzZSAmJiBwYXNzfSBicmVhaztcbiAgICAgIGRlZmF1bHQ6IGZvciAoOyBpIDwgbDsgaSArPSAyKSB7cGFzcyA9IGxpc3RbaV0uYXBwbHkobGlzdFtpICsgMV0gfHwgY29udGV4dCwgYXJncykgIT09IGZhbHNlICYmIHBhc3N9IGJyZWFrO1xuICAgIH1cbiAgfVxuICAvLyB0cmlnZ2VyIHdpbGwgcmV0dXJuIGZhbHNlIGlmIG9uZSBvZiB0aGUgY2FsbGJhY2tzIHJldHVybiBmYWxzZVxuICByZXR1cm4gcGFzcztcbn1cblxuZnVuY3Rpb24gaXNGdW5jdGlvbihmdW5jKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZnVuYykgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSdcbn1cbiIsIi8vIEZ1Y2sgYWxsIHRoYXQgb3RoZXIgcHJvbWlzZSBzaGl0LiBUaGlzIGlzIGFsbCB5b3UgbmVlZC5cblxubW9kdWxlLmV4cG9ydHMgPSBQcm9taXNlO1xuXG5mdW5jdGlvbiBQcm9taXNlKCkge1xuXG4gICAgdmFyIGNhbGxiYWNrcyA9IFtdO1xuICAgIHZhciByZXNvbHZlZCA9IGZhbHNlO1xuXG4gICAgdGhpcy5yZXNvbHZlID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgaWYgKCByZXNvbHZlZCApIHJldHVybjtcbiAgICBcbiAgICAgICAgcmVzb2x2ZWQgPSB0cnVlO1xuICAgICAgICBjYWxsYmFja3MuZm9yRWFjaCggZnVuY3Rpb24oIGZuYyApIHsgZm5jKCkgfSApO1xuXG4gICAgfTtcblxuICAgIHRoaXMudGhlbiA9IGZ1bmN0aW9uKCBmbmMgKSB7XG5cbiAgICAgICAgcmVzb2x2ZWQgPyBmbmMoKSA6IGNhbGxiYWNrcy5wdXNoKCBmbmMgKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgIH0uYmluZCggdGhpcyApOyBcblxuXG59XG5cblByb21pc2UuYWxsID0gZnVuY3Rpb24oIGFyciApIHtcblxuICAgIHZhciBhbGwgPSBuZXcgUHJvbWlzZSgpO1xuICAgIHZhciByZXNvbHZlZCA9IDA7XG5cbiAgICB2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVzb2x2ZWQrKztcbiAgICAgICAgaWYgKCByZXNvbHZlZCA9PT0gYXJyLmxlbmd0aCApIHtcbiAgICAgICAgICAgIGFsbC5yZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgYXJyLmZvckVhY2goIGZ1bmN0aW9uKCB2YWwgKSB7IFxuICAgICAgICB2YWwudGhlbiggY2FsbGJhY2sgKTtcbiAgICB9ICk7XG5cbiAgICByZXR1cm4gYWxsO1xuXG59OyIsImV4cG9ydHMucmVtb3ZlID0gZnVuY3Rpb24oIGFycmF5LCBvYmplY3QgKSB7XG4gICAgdmFyIGkgPSBhcnJheS5pbmRleE9mKCBvYmplY3QgKTtcbiAgICBpZiAoIGkgPiAtMSApIGFycmF5LnNwbGljZSggaSwgMSApO1xufTtcblxuZXhwb3J0cy5lbnN1cmUgPSBmdW5jdGlvbiggYXJyYXksIG9iamVjdCApIHtcbiAgICBpZiAoIGFycmF5LmluZGV4T2YoIG9iamVjdCApID09PSAtMSApIGFycmF5LnB1c2goIG9iamVjdCApO1xufTtcblxuZXhwb3J0cy5jb250YWlucyA9IGZ1bmN0aW9uKCBhcnJheSwgb2JqZWN0ICkge1xuICAgIHJldHVybiBhcnJheS5pbmRleE9mKCBvYmplY3QgKSAhPT0gLTE7ICBcbn07XG5cbmV4cG9ydHMuZmlsbCA9IGZ1bmN0aW9uKCBhcnJheSwgdmFsdWUsIGJlZ2luLCBlbmQgKSB7XG4gICAgYmVnaW4gPSBiZWdpbiB8fCAwO1xuICAgIGVuZCA9IGVuZCB8fCBhcnJheS5sZW5ndGg7XG4gICAgZm9yICggdmFyIGkgPSBiZWdpbjsgaSA8IGVuZDsgaSsrICkgeyBcbiAgICAgICAgYXJyYXlbIGkgXSA9IHZhbHVlO1xuICAgIH0gIFxuICAgIHJldHVybiBhcnJheTtcbn07IiwidmFyIGlzID0gcmVxdWlyZSggJ3V0aWxzL2lzJyApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBvYmogKSB7XG5cbiAgICBmb3IgKCB2YXIgaSBpbiBvYmogKSB7XG4gICAgICAgIHZhciBwcm9wID0gb2JqWyBpIF07XG4gICAgICAgIGlmICggaXMuZnVuY3Rpb24oIHByb3AgKSApIHtcbiAgICAgICAgICAgIG9ialsgaSBdID0gb2JqWyBpIF0uYmluZCggb2JqICk7XG4gICAgICAgIH1cbiAgICB9XG5cbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihmdW5jLCB3YWl0LCBpbW1lZGlhdGUpIHtcbiAgICB2YXIgdGltZW91dDtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjb250ZXh0ID0gdGhpcywgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgdmFyIGxhdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgICAgIGlmICghaW1tZWRpYXRlKSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgY2FsbE5vdyA9IGltbWVkaWF0ZSAmJiAhdGltZW91dDtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdCk7XG4gICAgICAgIGlmIChjYWxsTm93KSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgIH07XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIGEsIGIgKSB7XG4gICAgYSA9IGEgfHwge307XG4gICAgZm9yICggdmFyIGkgaW4gYiApIHtcbiAgICAgICAgaWYgKCAhYS5oYXNPd25Qcm9wZXJ0eSggaSApICkge1xuICAgICAgICAgICAgYVsgaSBdID0gYlsgaSBdOyAgXG4gICAgICAgIH0gXG4gICAgfVxuICAgIHJldHVybiBhO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBhLCBiICkge1xuICAgIGZvciAoIHZhciBpIGluIGIgKSB7XG4gICAgICAgIGFbIGkgXSA9IGJbIGkgXTtcbiAgICB9XG4gICAgcmV0dXJuIGE7XG59OyIsInZhciBleHRlbmQgPSByZXF1aXJlKCAndXRpbHMvZXh0ZW5kJyApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBjaGlsZCwgcGFyZW50ICkge1xuXG4gICAgdmFyIHByb3RvdHlwZSA9IGNoaWxkLnByb3RvdHlwZTtcbiAgICBcbiAgICBjaGlsZC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBwYXJlbnQucHJvdG90eXBlICk7XG4gICAgY2hpbGQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY2hpbGQ7XG5cbiAgICBmb3IgKCB2YXIgaSBpbiBwcm90b3R5cGUgKSB7XG4gICAgICAgIGNoaWxkLnByb3RvdHlwZVsgaSBdID0gcHJvdG90eXBlWyBpIF07XG4gICAgfVxuXG59OyIsIi8vIGNob2ljZSBsaWZ0cyBmcm9tIHVuZGVyc2NvcmVcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxubW9kdWxlLmV4cG9ydHMgPSB7IFxuXG4gICAgc3RyaW5nOiBmdW5jdGlvbiggb2JqICkge1xuICAgICAgICByZXR1cm4gdG9TdHJpbmcuY2FsbCggb2JqICkgPT09ICdbb2JqZWN0IFN0cmluZ10nO1xuICAgIH0sIFxuXG4gICAgZnVuY3Rpb246IGZ1bmN0aW9uKCBvYmogKSB7XG4gICAgICAgIHJldHVybiB0b1N0cmluZy5jYWxsKCBvYmogKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbiAgICB9LCBcblxuICAgIG51bWJlcjogZnVuY3Rpb24oIG9iaiApIHtcbiAgICAgICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoIG9iaiApID09PSAnW29iamVjdCBOdW1iZXJdJztcbiAgICB9LCBcblxuICAgIGFycmF5OiBmdW5jdGlvbiggb2JqICkge1xuICAgICAgICByZXR1cm4gQXJyYXkuaXNBcnJheSggb2JqICk7XG4gICAgfSwgXG5cbiAgICBvYmplY3Q6IGZ1bmN0aW9uKCBvYmogKSB7XG4gICAgICAgIHJldHVybiBvYmogPT09IE9iamVjdCggb2JqICk7XG4gICAgfVxuXG59IiwidmFyIG1hdGggPSBtb2R1bGUuZXhwb3J0cyA9IHsgXG5cbiAgICBUV09fUEk6IE1hdGguUEkgKiAyLCBcbiAgICBIQUxGX1BJOiBNYXRoLlBJIC8gMiwgXG4gICAgU1FSVF9UV086IE1hdGguc3FydCggMiApLCBcbiAgICBSQUQ6IE1hdGguUEkgLyAxODAsIFxuICAgIFxuICAgIG1hcDogZnVuY3Rpb24oIHQsIGEsIGIsIGMsIGQgKSB7XG4gICAgICAgIFxuICAgICAgICBpZiAoIGEgPT09IGIgKSB7XG4gICAgICAgICAgICByZXR1cm4gYzsgIFxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGMgKyAoIGQgLSBjICkgKiAoIHQgLSBhICkgLyAoIGIgLSBhICk7XG5cbiAgICB9LCBcblxuICAgIGxlcnA6IGZ1bmN0aW9uKCBhLCBiLCB0ICkge1xuXG4gICAgICAgIHJldHVybiAoIGIgLSBhICkgKiB0ICsgYTtcblxuICAgIH0sIFxuXG4gICAgbm9ybWFsaXplOiBmdW5jdGlvbiggYSwgYiwgdCApIHtcblxuICAgICAgICByZXR1cm4gKCB0IC0gYSApIC8gKCBiIC0gYSApO1xuXG4gICAgfSwgXG5cbiAgICBzbW9vdGhzdGVwOiBmdW5jdGlvbiggYSwgYiwgdCApIHtcblxuICAgICAgICBpZiAoIGEgPT09IGIgKSB7XG4gICAgICAgICAgICByZXR1cm4gYzsgIFxuICAgICAgICB9XG5cbiAgICAgICAgdCA9IE1hdGgubWluKCBNYXRoLm1heCggKCB0IC0gYSApIC8gKCBiIC0gYSApLCAwICksIDEgKTtcbiAgICAgICAgcmV0dXJuIHQgKiB0ICogKCAzIC0gMiAqIHQgKTtcblxuICAgIH0sIFxuXG4gICAgc21vb3RoZXJzdGVwOiBmdW5jdGlvbiggYSwgYiwgdCApIHtcbiAgICAgICAgXG4gICAgICAgIHQgPSBNYXRoLm1pbiggTWF0aC5tYXgoICggdCAtIGEgKSAvICggYiAtIGEgKSwgMCApLCAxICk7XG4gICAgICAgIHJldHVybiB0ICogdCAqIHQgKiAoIHQgKiAoIHQgKiA2IC0gMTUgKSArIDEwICk7XG5cbiAgICB9LCBcblxuICAgIGNsYW1wOiBmdW5jdGlvbiggdCwgYSwgYiApIHtcblxuICAgICAgICB2YXIgbWluID0gTWF0aC5taW4oIGEsIGIgKTtcbiAgICAgICAgdmFyIG1heCA9IE1hdGgubWF4KCBhLCBiICk7XG4gICAgICAgIHJldHVybiBNYXRoLm1heCggbWluLCBNYXRoLm1pbiggbWF4LCB0ICkgKTtcbiAgICAgICAgXG4gICAgfSwgIFxuXG4gICAgY21hcDogZnVuY3Rpb24oIHQsIGEsIGIsIGMsIGQgKSB7XG5cbiAgICAgICAgcmV0dXJuIG1hdGgubWFwKCBtYXRoLmNsYW1wKCB0LCBhLCBiICksIGEsIGIsIGMsIGQgKTtcbiAgICAgICAgXG4gICAgfSwgXG5cbiAgICBjbm9ybWFsaXplOiBmdW5jdGlvbiggYSwgYiwgdCApIHtcblxuICAgICAgICByZXR1cm4gbWF0aC5ub3JtYWxpemUoIGEsIGIsIG1hdGguY2xhbXAoIHQsIDAsIDEgKSApO1xuXG4gICAgfSwgXG5cbiAgICBjbGVycDogZnVuY3Rpb24oIGEsIGIsIHQgKSB7XG5cbiAgICAgICAgcmV0dXJuIG1hdGgubGVycCggYSwgYiwgbWF0aC5jbGFtcCggdCwgYSwgYiApICk7XG5cbiAgICB9LCBcblxuICAgIGRpc3RTcTogZnVuY3Rpb24oIGEsIGIsIGMsIGQgKSB7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gKCBjIC0gYSApICogKCBjIC0gYSApICsgKCBkIC0gYiApICogKCBkIC0gYiApO1xuXG4gICAgfSwgXG5cbiAgICBkaXN0OiBmdW5jdGlvbiggYSwgYiwgYywgZCApIHtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQoICggYyAtIGEgKSAqICggYyAtIGEgKSArICggZCAtIGIgKSAqICggZCAtIGIgKSApO1xuXG4gICAgfSwgXG5cbiAgICBzcXVhcmVkOiBmdW5jdGlvbiggeCApIHtcblxuICAgICAgICByZXR1cm4geCAqIHg7XG4gICAgICAgIFxuICAgIH0sIFxuXG4gICAgc2lnbjogZnVuY3Rpb24oIHYgKSB7XG5cbiAgICAgICAgcmV0dXJuIHYgPj0gMCA/IDEgOiAtMTtcblxuICAgIH1cblxufSIsInZhciBpcyA9IHJlcXVpcmUoICd1dGlscy9pcycgKTtcblxudmFyIHN0YXJ0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCkgKiAwLjAwMTtcblxubW9kdWxlLmV4cG9ydHMgPSAoIGZ1bmN0aW9uKCkge1xuXG4gICAgaWYgKCB3aW5kb3cucGVyZm9ybWFuY2UgJiYgaXMuZnVuY3Rpb24oIHdpbmRvdy5wZXJmb3JtYW5jZS5ub3cgKSApIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHBlcmZvcm1hbmNlLm5vdygpICogMC4wMDE7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCBpcy5mdW5jdGlvbiggRGF0ZS5ub3cgKSApIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIERhdGUubm93KCkgKiAwLjAwMSAtIHN0YXJ0O1xuICAgICAgICB9XG4gICAgfSBlbHNlIHsgXG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKSAqIDAuMDAxIC0gc3RhcnQ7XG4gICAgICAgIH1cbiAgICB9XG5cbn0gKSgpOyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIGFycmF5LCBwcm9wZXJ0eSwgb3V0cHV0ICkge1xuXG4gICAgb3V0cHV0ID0gb3V0cHV0IHx8IFtdO1xuXG4gICAgZm9yICggdmFyIGkgPSAwLCBsID0gYXJyYXkubGVuZ3RoOyBpIDwgbDsgaSsrICkgeyBcbiAgICAgICAgb3V0cHV0WyBpIF0gPSBhcnJheVsgaSBdWyBwcm9wZXJ0eSBdO1xuICAgIH1cblxuICAgIHJldHVybiBvdXRwdXQ7XG5cbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggb2JqICkge1xuICAgIFxuICAgIHZhciB2YWx1ZXMgPSBbXTtcblxuICAgIGZvciAoIHZhciBpIGluIG9iaiApIHtcbiAgICAgICAgdmFsdWVzLnB1c2goIG9ialsgaSBdICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbHVlcztcblxufSIsImV4cG9ydHMuZ2V0ID0gZnVuY3Rpb24oIHVybCwgc3VjY2VzcywgZXJyb3IgKSB7XG4gICAgdmFyIHhociA9IG1ha2VSZXF1ZXN0KCAncmVzcG9uc2VUZXh0Jywgc3VjY2VzcywgZXJyb3IgKTtcbiAgICB4aHIub3BlbiggJ0dFVCcsIHVybCwgdHJ1ZSApO1xuICAgIHhoci5zZW5kKCk7XG59O1xuXG5leHBvcnRzLmdldFdpdGhIZWFkZXJzID0gZnVuY3Rpb24oIHVybCwgaGVhZGVycywgc3VjY2VzcywgZXJyb3IgKSB7XG4gICAgdmFyIHhociA9IG1ha2VSZXF1ZXN0KCAncmVzcG9uc2VUZXh0Jywgc3VjY2VzcywgZXJyb3IgKTtcbiAgICB4aHIub3BlbiggJ0dFVCcsIHVybCwgdHJ1ZSApO1xuICAgIGZvciAoIHZhciBpIGluIGhlYWRlcnMgKSB7XG4gICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCBpLCBoZWFkZXJzWyBpIF0gKTtcbiAgICB9XG4gICAgeGhyLnNlbmQoKTtcbn07XG5cbmV4cG9ydHMuZ2V0QnVmZmVyID0gZnVuY3Rpb24oIHVybCwgc3VjY2VzcywgZXJyb3IgKSB7XG4gICAgdmFyIHhociA9IG1ha2VSZXF1ZXN0KCAncmVzcG9uc2UnLCBzdWNjZXMsIGVycm9yICk7XG4gICAgeGhyLm9wZW4oICdHRVQnLCB1cmwsIHRydWUgKTtcbiAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJztcbiAgICB4aHIuc2VuZCgpO1xufTtcblxuZnVuY3Rpb24gbWFrZVJlcXVlc3QoIHJlc3BvbnNlS2V5LCBzdWNjZXNzLCBlcnJvciApIHsgXG4gICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiggZSApIHtcbiAgICAgICAgaWYgKCB4aHIucmVhZHlTdGF0ZSA9PSA0ICkge1xuICAgICAgICAgICAgaWYgKCB4aHIuc3RhdHVzID09IDIwMCApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3VjY2VzcyggeGhyWyByZXNwb25zZUtleSBdICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIGVycm9yICkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlcnJvciggeGhyLnN0YXR1cyArICcgJyArIHhoci5zdGF0dXNUZXh0ICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHhocjtcbn0iXX0=
