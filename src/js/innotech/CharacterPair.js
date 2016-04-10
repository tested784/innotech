window.musicbox.CharacterPair = function( charBig, charSmall ) {
  
    this.characterBig = charBig;
    this.characterSmall = charSmall;

    this.container = new PIXI.Container();

    this.container.addChild( this.characterBig.container );
    this.container.addChild( this.characterSmall.container );

    this.left = this.left.bind( this );
    this.right = this.right.bind( this );
    this.small = this.small.bind( this );


    this.adoringLookTimeline = new TimelineMax( {
        onComplete: this.onAdoringLookComplete, 
        onCompleteScope: this
    } );

    if ( aaf.common.url.look ) {
        this.adoringLookTimeline.delay( 1 );
    } else { 
        this.adoringLookTimeline.delay( 5 );
    }

    this.adoringLookTimeline.to( this.characterBig.lookDirection, 1.2, { x: 25 * 2, y: 9 * 2, ease: Quad.inOut }, 0 );
    this.adoringLookTimeline.to( this.characterBig.lookDirection, 1.0, { x: 0, y: 0, ease: Quad.inOut }, 3.0 );

    this.adoringLookTimeline.to( this.characterSmall.lookDirection, 1.0, { x: -20 * 2, y: -5 * 2, ease: Quad.inOut }, 0 );
    this.adoringLookTimeline.to( this.characterSmall.lookDirection, 1.0, { x: 0, y: 0, ease: Quad.inOut }, 3.0 );

};

window.musicbox.CharacterPair.prototype.onAdoringLookComplete = function() {

    if ( aaf.common.url.look ) {
        this.adoringLookTimeline.delay( 1 );
    } else { 
        this.adoringLookTimeline.delay( aaf.random( 15, 30 ) );
    }

    this.adoringLookTimeline.restart( true );

};

window.musicbox.CharacterPair.prototype.left = function( t ) {
    this.characterBig.strikeLeft( t );
};

window.musicbox.CharacterPair.prototype.right = function( t ) {
    this.characterBig.strikeRight( t );
};

window.musicbox.CharacterPair.prototype.small = function( t ) {
    this.characterSmall.strikeBoth( t );
};

