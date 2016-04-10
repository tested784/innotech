window.musicbox.PressListener = function( el, listener ) {
    
    this.el = el;

    this.listener = listener;

    this.onPress = this.onPress.bind( this );
    this.onRelease = this.onRelease.bind( this );
    
    this.on();

};

window.musicbox.PressListener.prototype.onPress = function( e ) {
    
    e.preventDefault();
    this.el.classList.add( 'active' );
};

window.musicbox.PressListener.prototype.onRelease = function( e ) {
    
    e.preventDefault();

    this.listener();
    this.el.classList.remove( 'active' );
};

window.musicbox.PressListener.prototype.on = function() {

    this.active = true;
  

    this.el.addEventListener( 'touchstart', this.onPress, false );
    this.el.addEventListener( 'touchend', this.onRelease, false );

    this.el.addEventListener( 'mousedown', this.onPress, false );
    this.el.addEventListener( 'mouseup', this.onRelease, false );
};

window.musicbox.PressListener.prototype.off = function() {
    
    this.active = false;
    
    this.el.removeEventListener( 'touchstart', this.onPress, false );
    this.el.removeEventListener( 'touchend', this.onRelease, false );

    this.el.removeEventListener( 'mousedown', this.onPress, false );
    this.el.removeEventListener( 'mouseup', this.onRelease, false );
};