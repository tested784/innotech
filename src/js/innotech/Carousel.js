window.musicbox.Carousel = function( opts ) {
  
    opts = aaf.utils.defaults( opts, {

        children: [], 
        childWidth: 300, 
        restEasing: 0.145, 
        grabEasing: 1

    } );

    this.container = new PIXI.Container();
    this.children = opts.children;
    //this.childWidth = opts.childWidth;

    this.grabEasing = opts.grabEasing;
    this.restEasing = opts.restEasing;

    this.easing = this.restEasing;

    this.grabbed = false;

    this.grabTarget = 0;

    for ( var i = 0, l = this.children.length; i < l; i++ ) { 
        var child = this.children[ i ];
        this.container.addChild( child );
    }

    this.nextButton = document.createElement( 'div' );
    this.nextButton.className = 'puck-button next';

    this.prevButton = document.createElement( 'div' );
    this.prevButton.className = 'puck-button prev';
    container.appendChild( this.nextButton );
    container.appendChild( this.prevButton );

    this.setChildWidth( opts.childWidth );

    this.setActive( 0 );

};

window.musicbox.Carousel.prototype.setChildWidth = function( w ) {
    this.childWidth = w;

    for ( var i = 0, l = this.children.length; i < l; i++ ) { 
        var child = this.children[ i ];
        child.position.x = i * this.childWidth;
    }

    this.setActive( this.activeChildIndex );
    this.container.position.x = this.targetXPosition;

}

window.musicbox.Carousel.prototype.setActive = function( index ) {
    
    this.activeChildIndex = index;
    this.targetXPosition = -this.activeChildIndex * this.childWidth;

    this.prevButton.classList.toggle( 'hidden', this.activeChildIndex === 0 );
    this.nextButton.classList.toggle( 'hidden', this.activeChildIndex === this.children.length - 1 );

};

window.musicbox.Carousel.prototype.grab = function() {

    this.grabbed = true;
    this.easing = this.grabEasing;

};

window.musicbox.Carousel.prototype.release = function() {
    
    this.grabbed = false;
    this.easing = this.restEasing;

};

window.musicbox.Carousel.prototype.grabMove = function( x ) {
    
    this.container.position.x = x;

};

window.musicbox.Carousel.prototype.next = function() {
    
    var index = this.activeChildIndex + 1;
    index %= this.children.length;

    this.setActive( index );

};

window.musicbox.Carousel.prototype.prev = function() {
    
    var index = this.activeChildIndex - 1;
    if ( index < 0 ) { 
        index += this.children.length;
    }

    this.setActive( index );

};

window.musicbox.Carousel.prototype.update = function() {
  
    var target = this.grabbed ? this.grabTarget : this.targetXPosition;



    var delta = ( target - this.container.position.x );
    var ad = Math.abs( delta );

    if ( ad > 0 && ad < 1 ) {
        this.container.position.x = target;
    } else { 
        this.container.position.x += delta * this.easing;
    }





};