window.musicbox.Animation = function( data, framerate ) {

    this.data = data;
    this.duration = data.duration / 1000;
};

window.musicbox.Animation.FRAME_DURATION = 1 / 30;

window.musicbox.Animation.prototype.at = function( t, dim ) {
    
    var frame = t / window.musicbox.Animation.FRAME_DURATION;
    var frameLowIndex = ~~frame;
    var frameHighIndex = frameLowIndex + 1;

    var l = frame - frameLowIndex;

    // console.log( frameLowIndex, frameHighIndex, l );

    var frameLow = this.data.frameData[ frameLowIndex ].val[ dim ];
    var frameHigh = this.data.frameData[ Math.min( this.data.frameData.length - 1, frameHighIndex ) ].val[ dim ];

    // console.log( frameLow, frameHigh );

    return aaf.utils.math.lerp( frameLow, frameHigh, l );

};