var defaults = aaf.utils.defaults;

window.musicbox.EasyPIXI = function( options ) {
    
    options = defaults( options, {
        
        fullscreen: true, 

        width: window.innerWidth,   // ignored if fullscreen is true
        height: window.innerHeight, // ignored if fullscreen is true

        antialiasing: aaf.common.ua.pixelRatio === 1, 
        resolution: aaf.common.ua.pixelRatio, 
        backgroundColor: 0xffffff,
        transparent: false,

        container: document.getElementById( 'container' )

    } );

    PIXI.ticker.shared.autoStart = false;
    PIXI.ticker.shared.stop();

    this.renderer = PIXI.autoDetectRenderer( options.width, options.height, {
        antialiasing: options.antialiasing, 
        transparent: options.transparent, 
        resolution: options.resolution, 
        backgroundColor: options.backgroundColor
    } );

    this.stage = new PIXI.Container();

    if ( options.fullscreen ) {
        
        window.addEventListener( 'resize', this.resizeFullscreen.bind( this ) );
        this.resizeFullscreen();

    } else { 
        this.setSize( options.width, options.height );
    }

    this.render();
    // options.container.appendChild( this.renderer.view );

};

window.musicbox.EasyPIXI.prototype.resizeFullscreen = function() {
    
    this.setSize( window.innerWidth, window.innerHeight );

};

window.musicbox.EasyPIXI.prototype.setSize = function( width, height ) {
    
    this.width = width;
    this.height = height;

    this.renderer.resize( width, height );
    this.renderer.view.style.width = width + 'px';
    this.renderer.view.style.height = height + 'px';

};

window.musicbox.EasyPIXI.prototype.render = function() {
  
    this.renderer.render( this.stage );

};