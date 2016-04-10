window.musicbox.CharacterEyes = function() {

    this.container = new PIXI.Container();

    this.sprite = new PIXI.Sprite( aaf.assets( 'texture/slices_eyes.png' ) );
    this.sprite.pivot.x = this.sprite.texture.width / 2;
    this.sprite.pivot.y = this.sprite.texture.height / 2;

    this.mask = new PIXI.Graphics();
    this.mask.beginFill();
    this.mask.drawRect( 0, 0, this.sprite.texture.width, this.sprite.texture.height );
    this.mask.endFill();

    aaf.utils.extend( this.mask.pivot, this.sprite.pivot );

    this.container.addChild( this.mask );
    this.container.addChild( this.sprite );

    this.sprite.mask = this.mask;

    var blink = 1;

    Object.defineProperty( this, 'blink', {

        get: function() {
            return blink;
        }, 

        set: function( b ) {
            blink = b;
            this.mask.scale.y = blink;
        }

    } );

    this.blinkTimeline = new TimelineMax( {
        onComplete: this.onComplete, 
        onCompleteScope: this
    } );

    this.blinkTimeline.to( this, 0.075, { blink: 0 } );
    this.blinkTimeline.to( this, 0.1, { blink: 1 }, '+=0.1' );

};

window.musicbox.CharacterEyes.prototype.getRepeatDelay = function() {

    var r = aaf.random();

    return aaf.utils.math.lerp( 4.0, 0.5, r * r * r );
  
};

window.musicbox.CharacterEyes.prototype.onComplete = function() {
  
    if ( aaf.random.chance( 0.1 ) ) {

        // double blink
        this.blinkTimeline.timeScale( 1.2 );
        this.blinkTimeline.delay( 0 );

    } else { 

        this.blinkTimeline.timeScale( aaf.random( 0.8, 1.1 ) );
        this.blinkTimeline.delay( this.getRepeatDelay() );

    }


    this.blinkTimeline.restart( true );

};