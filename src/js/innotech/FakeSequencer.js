var $ = require('jquery');
var Tone = require('tone');

window.musicbox.FakeSequencer = function (opts) {

    opts = aaf.utils.defaults(opts, {

        symbols: [
            '/assets/image/ui_timpani1.svg',
            '/assets/image/ui_timpani2.svg',
            '/assets/image/ui_timpani3.svg'
        ],

        tracks: [],
        randomize: true, // ignored if tracks are provided

        beats: 8,
        timeSignature: 4,
        bpm: 100

    });

    this.samples = opts.samples;
    this.beats = opts.beats;
    this.timeSignature = opts.timeSignature;
    this.bpm = opts.bpm;

    this.tracks = [];

    this.position = 0;
    this.playing = false;

    var samplePaths = {};
    var synthParams = {
        envelope: {
            // release: 0.2
        }
    };

    this.listeners = opts.listeners;
    this.trackNames = [];

    this.animateNoteListeners = {};
    this.needsAnimate = {};

    for (var i = 0, l = this.samples.length; i < l; i++) {

        var track;

        if (opts.tracks) {

            track = opts.tracks[i];

        } else if (opts.randomize) {

            track = aaf.utils.array.fill(new Array(this.beats), false);

            for (var j = 0, k = track.length; j < k; j++) {
                track[j] = aaf.random.chance();
            }

        } else {
            track = aaf.utils.array.fill(new Array(this.beats), false);
        }

        this.tracks.push(track);

        this.trackNames.push(i.toString());
        samplePaths[i.toString()] = this.samples[i];

        this.needsAnimate[i] = aaf.utils.array.fill(new Array(this.beats), false);

        // Bound versions of each animate note method so we're not instantiating them every beat.
        var listeners = [];
        this.animateNoteListeners[i] = listeners;

        for (var b = 0; b < this.beats; b++) {
            listeners[b] = this.animateNote.bind(this, i, b);
        }

    }


    this.onInterval = this.onInterval.bind(this)

    this.stepNumber = 0;
    this.dragOperation = true;

    this.sampler = new Tone.PolySynth(1, Tone.Sampler, samplePaths, synthParams);
    this.sampler.noGC();


    this.buildDom(opts);


    // further hackiness, sequencer-padding-horizontal * 2 = 40
    // defined in sequencer.styl
    this.sequencerInnerWidth = this.domElement.offsetWidth - 40;

    this.sampler.toMaster();


};

window.musicbox.FakeSequencer.UI_MODE = aaf.common.url.ui || 'css';
window.musicbox.FakeSequencer.USE_CSS_TRANSITIONS = aaf.common.url.boolean('transition', true);


// Audio
// -------------------------------

window.musicbox.FakeSequencer.prototype.start = function () {


    // hack: belongs in resize. sequencer-padding-horizontal * 2 = 40
    // defined in sequencer.styl
    this.sequencerInnerWidth = this.domElement.offsetWidth - 40;
    this.stepNumber = 0;


    var intervalLength = ( this.beats / this.timeSignature * 4 ) + 'n';

    Tone.Transport.loopEnd = this.beats + '*8n';

    Tone.Transport.clear(this.intervalID);
    this.intervalID = Tone.Transport.scheduleRepeat(this.onInterval, '8n');
    this.time = 0;

    this.startTime = Tone.context.currentTime;
    this.prevTime = this.startTime;

    this.playing = true;

    Tone.Transport.timeSignature = this.timeSignature;
    Tone.Transport.bpm.value = this.bpm;
    this.measureLength = Tone.Transport.notationToSeconds('1m');


    this.sampler.volume.cancelScheduledValues();

    Tone.Transport.start();


    //this.sampler.volume.value = -100;
    //this.sampler.volume.setRampPoint();
    //this.sampler.volume.linearRampToValueAtTime( 0, '+4n' )

};

window.musicbox.FakeSequencer.prototype.stop = function () {

    this.playing = false;

    for (var i = 0, l = this.tracks.length; i < l; i++) {
        for (var j = 0; j < this.beats; j++) {
            this.triggerAnimation(i, j, false);
        }
    }

    this.sampler.volume.cancelScheduledValues();

    // this.sampler.volume.setRampPoint();
    // this.sampler.volume.linearRampToValueAtTime( -100, '+4n' )

    Tone.Transport.stop();


};

window.musicbox.FakeSequencer.prototype.animateNote = function (track, beat) {


    this.needsAnimate[track][beat] = true;

    setTimeout(function () {

        this.needsAnimate[track][beat] = false;

    }.bind(this), this.sampler.toSeconds('16n') * 1000);

};


window.musicbox.FakeSequencer.prototype.onInterval = function (time) {

    if (!this.playing) return;

    // see if there's any active beats at this step number
    var millis = ( time - Tone.Transport.currentTime ) * 1000;

    for (var i = 0, l = this.tracks.length; i < l; i++) {

        var track = this.tracks[i];

        if (track[this.stepNumber]) {

            // this.sampler.triggerAttackRelease(this.trackNames[i], '1n', time);

            // TODO: create these listeners up front.
            // var listener = this.animateNote.bind( this, i, this.stepNumber );

            // schedule beat animation
            setTimeout(this.animateNoteListeners[i][this.stepNumber], millis);
            // listener(0.1);

        }

    }

    // advance step number

    this.stepNumber++;
    this.stepNumber %= this.beats;

};

// UI
// -------------------------------

window.musicbox.FakeSequencer.prototype.update = function () {

    if (!this.playing) return;


    // Android gives really shitty audio update rates, makes the playhead look choppy.
    // Check to see if the audio context reports two of the same currentTimes in a row
    // and then manually smooth the playhead using loop delta.


    var t = Tone.context.currentTime;

    // if ( t === this.prevTime ) {
    //     this.time += aaf.common.loop.delta;
    // } else { 
    //     this.time = Math.max( t, this.time );
    // }

    this.prevTime = t;

    // update sequencer "position" ( 0-1 progreFs through the measure )

    this.position = Tone.Transport.progress; //( this.time - this.startTime ) / this.measureLength % 1;

    // update playhead display

    this.updateStyles();

};

window.musicbox.FakeSequencer.prototype.updateStyles = function () {

    var str = 'translate3d(';
    str += this.position * this.sequencerInnerWidth;
    str += 'px, 0, 0 )';

    for (var i in this.needsAnimate) {
        for (var j in this.needsAnimate[i]) {
            var val = this.needsAnimate[i][j];
            if (val !== undefined) {
                this.triggerAnimation(i, j, val);
            }
        }
    }

    this.playhead.style.transform =
        this.playhead.style.webkitTransform = str;

    for (var i in this.needsAnimate) {
        for (var j in this.needsAnimate[i]) {
            this.needsAnimate[i][j] = undefined;
        }
    }

};

window.musicbox.FakeSequencer.prototype.triggerAnimation = function (i, j, val) {
    var symbol = this.slotElements[i][j];

    symbol.style.webkitTransform =
        symbol.style.transform = val ? 'scale( 1.5 )' : '';

    symbol.style.webkitTransitionDuration =
        symbol.style.transitionDuration = val || !window.musicbox.FakeSequencer.USE_CSS_TRANSITIONS ? '0s' : '';
}

window.musicbox.FakeSequencer.prototype.buildDom = function (opts) {

    this.domElement = document.createElement('div');
    this.domElement.className = 'sequencer';

    this.slotElements = [];

    // create track rows

    for (var track = 0, l = this.tracks.length; track < l; track++) {

        var row = document.createElement('div');
        row.className = 'row';

        var elements = [];

        // create track beat slots

        for (var beat = 0; beat < this.beats; beat++) {

            var slot = document.createElement('div');
            slot.className = 'slot';


            // convenience access to per-beat get/setter methods
            slot.__setBeat = this.setBeat.bind(this, track, beat, slot);
            slot.__getBeat = this.getBeat.bind(this, track, beat);

            var toggle = this.touchSlot.bind(this, track, beat, slot);


            // update initial display
            slot.__setBeat(this.tracks[track][beat], true);

            row.appendChild(slot);
            elements.push(slot);


            //slot.addEventListener( aaf.common.ua.touch ? 'touchstart' : 'mousedown', toggle, false );
            // slot.addEventListener('touchstart', toggle, false);
            // slot.addEventListener('mousedown', toggle, false);
            slot.addEventListener('click', toggle, false);

        }

        this.domElement.appendChild(row);
        this.slotElements.push(elements);

    }

    // playhead

    this.playhead = document.createElement('div');
    this.playhead.className = 'playhead';

    this.domElement.appendChild(this.playhead);

    // make drag listener

    var hover, prevHover;

    // lil hacky, set by multisequencer
    this.active = true;

    aaf.common.pointer.on('drag', function (x, y) {

        if (!this.active) return;

        prevHover = hover;
        hover = document.elementFromPoint(x, y);

        // __setBeat is sort of dirty duck typing to make sure we're
        // even talking about a slot on the sequencer.
        if (hover && hover !== prevHover && hover.__setBeat) {
            hover.__setBeat(this.dragOperation);
        }

    }, this);


};

window.musicbox.FakeSequencer.prototype.touchSlot = function (track, beat, el, val) {
    var sequence = this.tracks;
    this.dragOperation = this.toggleBeat(track, beat, el, val);
    $.ajax({
        url: '/sequence',
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({
            sequence: sequence,
            user: window.sessionId
        })
    });
};

window.musicbox.FakeSequencer.prototype.setBeat = function (track, beat, el, val, suppressSample) {

    var same = this.tracks[track][beat] === val;

    this.tracks[track][beat] = val;
    el.classList.toggle('active', val);

    if (val && !same && !this.playing && suppressSample !== true) {

        // this.triggerSample(track);

    }

    return val;

};

window.musicbox.FakeSequencer.prototype.triggerSample = function (track, vel) {

    if (vel === undefined) {
        vel = 1;
    }
    Tone.Transport.clear(this.intervalID);
    this.sampler.volume.value = 0; // volume is in dB so this actually unmutes
    // this.sampler.triggerAttackRelease(this.trackNames[track], '1n', Tone.context.currentTime, vel);
};

window.musicbox.FakeSequencer.prototype.getBeat = function (track, beat) {

    return this.tracks[track][beat];

};

window.musicbox.FakeSequencer.prototype.getTracks = function () {

    return this.tracks;

};

window.musicbox.FakeSequencer.prototype.setTracks = function (tracks) {

    this.tracks = tracks;

};

window.musicbox.FakeSequencer.prototype.toggleBeat = function (track, beat, el) {
    return this.setBeat(track, beat, el, !this.getBeat(track, beat));
};
