window.musicbox.Character = function( opts ) {
 
    aaf.utils.Events.mixTo( this );

    this.scale = 300 / 72;

    this.groups = {};
    this.sprites = {};
    this.animations = {};
    this.timelines = {};
    this.hitboxes = {};

    this.container = new PIXI.Container();

    this.lookDirection = {
        x: 0, 
        y: 0
    }


    // Build the groups and sprites
    // -------------------------------

    if ( opts.legs ) {
        this.makeLegs( opts );
    }

    this.groups.body = new PIXI.Container();
    this.container.addChild( this.groups.body );

    if ( opts.body ) {
        this.makeBody( opts );
    }

    if ( opts.face ) { 
        this.makeFace( opts );
    }

    this.makeEyes( opts );

    if ( opts.front && !opts.front.behindArms ) {
        this.makeFront( opts );
    }

    // hitboxes

    if ( opts.hitbox ) { 
        for ( var key in opts.hitbox ) {
            this.defineHitbox( opts.hitbox[ key ], key );
        }
    }

    // arms, strike animations

    if ( opts.armLeft ) {
        this.makeArm( opts, 'Left' );
    }

    if ( opts.armRight ) {
        this.makeArm( opts, 'Right' );
    }

    if ( opts.front && opts.front.behindArms ) {
        this.makeFront( opts );
    }

    if ( opts.armLeft && opts.armRight.back ) { 
        this.groups.body.addChild( this.groups.armLeft )
    }


    // Make both-armed strike GSAP timelines
    // -------------------------------

    if ( opts.strikeBoth && !aaf.common.url.defaultPose ) { 
        
        this.timelines.strikeBoth = new TimelineLite( { paused: true } );
        
        if ( opts.armLeft ) { 
            var tl = this.makeStrikeTimeline( opts, 'Left', false );
            this.timelines.strikeBoth.add( tl, 0 );
        }

        if ( opts.armRight ) { 
            var tr = this.makeStrikeTimeline( opts, 'Right', false );
            this.timelines.strikeBoth.add( tr, 0 );

        }

        this.timelines.strikeBoth.time( 0.0001 );
        this.anticipationBoth = opts.strikeBoth.anticipation;

    }
    
    // kick in the first animation frames
    
    if ( opts.strikeLeft && !aaf.common.url.defaultPose ) {
        this.timelines.strikeLeft.time( 0.0001 );
        this.anticipationLeft = opts.strikeLeft.anticipation;
    }

    if ( opts.strikeRight && !aaf.common.url.defaultPose ) {
        this.timelines.strikeRight.time( 0.0001 );
        this.anticipationRight = opts.strikeRight.anticipation;
    }

    // values for update method, programmatic gyrating etc ...

    this.bob = 0;
    this.bobInfluence = 0;
    this.targetBobInfluence = 0;

    this.breatheSpeed = aaf.random( 0.8, 1.2 ) * 2 ;
    this.breatheOffset = aaf.random();

    this.breathe = 0;
    this.breatheInfluence = 1;



};

window.musicbox.Character.getAssetList = function( charOpts ) {
    
    var assets = [];

    for ( var i in charOpts ) {
        
        var layer = charOpts[ i ];

        if ( layer.texture ) { 
            assets.push( layer.texture );
        }

        if ( layer.animation ) {

            if ( layer.animation.rotation ) {

                assets.push( layer.animation.rotation.file );

            }

            if ( layer.animation.position ) {

                assets.push( layer.animation.position.file );

            }

        }

    }

    return assets;

};

// Per-frame animation functions
// -------------------------------

window.musicbox.Character.prototype.setBob = function( pct ) {
    
    this.targetBobInfluence = 1;
    this.bob = pct;

};

window.musicbox.Character.prototype.stopBobbing = function( pct ) {
    
    this.targetBobInfluence = 0;

};

window.musicbox.Character.prototype.update = function() {
  
    this.groups.body.position.y = 0;
    this.groups.armLeft.position.y = this.armLeftRestY;
    this.groups.armRight.position.y = this.armRightRestY;
    this.eyes.sprite.position.x = 0;
    this.eyes.sprite.position.y = 0;

    // Bob
    // -------------------------------
    
    // made from several abs'd sine waves with different amplitudes and phase

    var t = ( this.bob - 0.1 ) * Math.PI;
    this.bobInfluence += ( this.targetBobInfluence - this.bobInfluence ) * 0.05;

    this.groups.body.position.y += - Math.abs( Math.sin( t ) * 2 ) * 5 * this.bobInfluence;
    this.groups.armLeft.position.y += - Math.abs( Math.sin( t - 0.35 ) * 2 ) * 5 * this.bobInfluence;
    this.groups.armRight.position.y += - Math.abs( Math.sin( t - 0.3 ) * 2 ) * 5 * this.bobInfluence;
    this.eyes.sprite.position.y += - Math.abs( Math.sin( t + 0.35 ) * 2 ) * 1.5 * this.bobInfluence;


    // Breathe
    // -------------------------------

    // similar but way smaller amplitude and not abs'd

    this.breathe += aaf.common.loop.delta * this.breatheSpeed;
    var breatheInfluence = 1 - this.bobInfluence;
    var t = this.breathe + this.breatheOffset;

    this.groups.body.position.y += - Math.sin( t ) * 2.75;
    this.groups.armLeft.position.y += - Math.sin( t - 0.35 ) * 2.75;
    this.groups.armRight.position.y += - Math.sin( t - 0.3 ) * 2.75;
    this.eyes.sprite.position.y += - Math.sin( t + 0.35 ) * 1.5;



    // Look direction
    // -------------------------------

//     this.lookDirection.x = window.innerWidth / 2 - aaf.common.pointer.x;
//     this.lookDirection.y = window.innerHeight / 2 - aaf.common.pointer.y;
// // 
    this.eyes.sprite.position.x += this.lookDirection.x;
    this.eyes.sprite.position.y += this.lookDirection.y;

    this.eyes.mask.position.x = this.eyes.sprite.position.x;
    this.eyes.mask.position.y = this.eyes.sprite.position.y;
    

    if ( this.sprites.face ) { 
        this.sprites.face.x = this.eyes.sprite.position.x * 0.5 * this.eyes.container.scale.x;
        this.sprites.face.y = this.eyes.sprite.position.y * 0.7 * this.eyes.container.scale.y;
    }


    // the "front" layer is annoying because it needs to be between
    // arms and in front of body. but it doesn't respect any of this
    // bouncing motion ....

    if ( this.sprites.front ) {
        this.sprites.front.position.y = this.frontRestY - this.groups.body.position.y;
    }

};

// Construct character
// -------------------------------


window.musicbox.Character.prototype.defineHitbox = function( opts, key ) {
    
    var hitbox = new PIXI.Graphics();

    hitbox.alpha = aaf.common.url.boolean( 'hitbox' ) ? 0.5 : 0;

    hitbox.beginFill( ~~( Math.random() * 0xffffff ) );
    hitbox.drawRect( opts.x, opts.y, opts.width, opts.height );
    hitbox.endFill();

    hitbox.hitArea = new PIXI.Rectangle( opts.x, opts.y, opts.width, opts.height )

    hitbox.interactive = true;

    var _this = this;

    var down = function() {
        _this.fire( 'down', key );
        _this.fire( key + 'down' );
    };

    var up = function() {
        _this.fire( 'up', key );
        _this.fire( key + 'up' );

    };

    hitbox.mousedown = down;
    hitbox.mouseup = up;

    hitbox.touchstart = down;
    hitbox.touchend = up;

    this.hitboxes[ key ] = hitbox;

    this.container.addChild( hitbox );

};

window.musicbox.Character.prototype.makeFace = function( opts ) {

    this.groups.face = new PIXI.Container();
    this.sprites.face = new PIXI.Sprite( aaf.assets( opts.face.texture ) );

    this.groups.face.addChild( this.sprites.face );
    this.groups.body.addChild( this.groups.face );

    this.groups.face.pivot.x = this.sprites.face.texture.width / 2;
    this.groups.face.pivot.y = this.sprites.face.texture.height / 2;

    aaf.utils.extend( this.groups.face.position, opts.face.position );

    this.groups.face.position.x += this.sprites.body.position.x;

};

window.musicbox.Character.prototype.makeBody = function( opts ) {
  
    this.sprites.body = new PIXI.Sprite( aaf.assets( opts.body.texture ) );

    this.groups.body.addChild( this.sprites.body );

    this.sprites.body.pivot.x = this.sprites.body.texture.width / 2;
    this.sprites.body.pivot.y = this.sprites.body.texture.height / 2;

    this.sprites.body.position.x = opts.body.position.x;
    this.sprites.body.position.y = opts.body.position.y;



};

window.musicbox.Character.prototype.makeEyes = function( opts ) {
  
    this.eyes = new window.musicbox.CharacterEyes();

    if ( opts.eyes && opts.eyes.position ) { 
        
        aaf.utils.extend( this.eyes.container.position, opts.eyes.position );
        this.eyes.container.position.x += opts.body.position.x; // eyes to be relative

        if ( opts.eyes.scale ) { 
            this.eyes.container.scale.set( opts.eyes.scale );
        }

        if ( opts.eyes.color !== undefined ) {
            this.eyes.sprite.tint = opts.eyes.color;
        }

    } else { 
        
        this.eyes.container.position.x = opts.body.position.x;
        this.eyes.container.position.y = -200;

    }

    this.groups.body.addChild( this.eyes.container );

};


window.musicbox.Character.prototype.makeLegs = function( opts ) {
  
    this.sprites.legs = new PIXI.Sprite( aaf.assets( opts.legs.texture ) );

    this.container.addChild( this.sprites.legs );

    this.sprites.legs.pivot.x = this.sprites.legs.texture.width / 2;
    this.sprites.legs.pivot.y = this.sprites.legs.texture.height / 2;

    this.sprites.legs.position.x = opts.legs.position.x;
    this.sprites.legs.position.y = opts.legs.position.y;


};

window.musicbox.Character.prototype.makeFront = function( opts ) {
  
    this.sprites.front = new PIXI.Sprite( aaf.assets( opts.front.texture ) );

    this.groups.body.addChild( this.sprites.front );

    this.sprites.front.pivot.x = this.sprites.front.texture.width / 2;
    this.sprites.front.pivot.y = this.sprites.front.texture.height / 2;

    this.sprites.front.position.x = opts.front.position.x;
    this.sprites.front.position.y = opts.front.position.y;

    this.frontRestY = opts.front.position.y;
  

};

// Arms and their animations
// -------------------------------

window.musicbox.Character.prototype.makeArm = function( opts, side ) {

    var stickOpts = opts[ 'stick' + side ];
    var strikeOpts = opts[ 'strike' + side ];
    var armOpts   = opts[ 'arm' + side ];

    var groupArm  = this.groups[ 'arm' + side ] = new PIXI.Container();
    var spriteArm = this.sprites[ 'arm' + side ] = new PIXI.Sprite( aaf.assets( armOpts.texture ) );

    groupArm.position.x = armOpts.position.x * this.scale;
    groupArm.position.y = armOpts.position.y * this.scale;

    this[ 'arm' + side + 'RestY' ] = groupArm.position.y * this.scale;

    spriteArm.pivot.x = spriteArm.texture.width / 2;
    spriteArm.pivot.y = spriteArm.texture.height / 2;

    if ( !stickOpts || !stickOpts.behindArms ) {
        groupArm.addChild( spriteArm );
    }

    if ( stickOpts ) {

        var groupStick  = this.groups[ 'stick' + side ] = new PIXI.Container();
        var spriteStick = this.sprites[ 'stick' + side ] = new PIXI.Sprite( aaf.assets( stickOpts.texture ) );


        spriteStick.pivot.x = spriteStick.texture.width / 2;
        spriteStick.pivot.y = spriteStick.texture.height / 2;

        groupStick.position.x = stickOpts.position.x * this.scale;
        groupStick.position.y = stickOpts.position.y * this.scale;

        groupArm.addChild( groupStick );
        groupStick.addChild( spriteStick );

    }

    if ( stickOpts && stickOpts.behindArms ) {
        groupArm.addChild( spriteArm );
    }

    this.groups.body.addChild( groupArm );

    if ( strikeOpts ) {

        var timeline = this.timelines[ 'strike' + side ] = this.makeStrikeTimeline( opts, side, true );

    }

};

window.musicbox.Character.prototype.makeStrikeTimeline = function( opts, side, paused ) {
    
    var armOpts = opts[ 'arm' + side ];
    var stickOpts = opts[ 'stick' + side ];
    var strikeOpts = opts.strikeBoth || opts[ 'strike' + side ];

    var progress = { t: 0 }
    var timeline = new TimelineLite( { paused: paused } );
    var _this = this;

    var armRotationJson = aaf.assets( armOpts.animation.rotation.file );
    var armRotationLayer = armOpts.animation.rotation.layer;
    var armRotationAnimation = new window.musicbox.Animation( armRotationJson[ armRotationLayer ] );

    var stickRotationAnimation;

    if ( stickOpts && stickOpts.animation.rotation ) {
        var stickRotationJson = aaf.assets( stickOpts.animation.rotation.file );
        var stickRotationLayer = stickOpts.animation.rotation.layer;
        stickRotationAnimation = new window.musicbox.Animation( stickRotationJson[ stickRotationLayer ] );
    }

    timeline.to( 
        
        progress, 
        
        armRotationAnimation.duration, 
        
        { 
        
            t: armRotationAnimation.duration, 
            
            onUpdate: function() {

                _this.groups[ 'arm' + side ].rotation = armRotationAnimation.at( progress.t, 0 ) * Math.PI / 180;

                if ( stickRotationAnimation ) {
                    _this.groups[ 'stick' + side ].rotation = stickRotationAnimation.at( progress.t, 0 ) * Math.PI / 180;
                }

                // if ( armOpts.animation.position ) {
                    // _this.groups[ 'arm' + side ].position.x = armOpts.animation.position.at( progress.t, 0 );
                    // _this.groups[ 'arm' + side ].position.y = armOpts.animation.position.at( progress.t, 1 );
                // }

            }

        } 

    );

    return timeline;

};

// GSAP strike timelines
// -------------------------------

window.musicbox.Character.prototype.strikeLeft = function( time ) {

    time = time || this.anticipationLeft;
    this.timelines.strikeLeft && this.timelines.strikeLeft.timeScale( this.anticipationLeft / time ).restart();

};

window.musicbox.Character.prototype.strikeRight = function( time ) {

    time = time || this.anticipationRight;
    this.timelines.strikeRight && this.timelines.strikeRight.timeScale( this.anticipationRight / time ).restart();

};

window.musicbox.Character.prototype.strikeBoth = function( time ) {

    time = time || this.anticipationBoth;
    this.timelines.strikeBoth && this.timelines.strikeBoth.timeScale( this.anticipationBoth / time ).restart();

};
