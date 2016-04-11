
window.musicbox.MultiSequencer = function (sequencers) {

    this.sequencers = [];
    this.activeSequencerIndex = 0;
    this.activeSequencer = undefined;

    this.domElement = document.createElement('div');
    this.domElement.className = 'multi-sequencer';

    for (var i = 0, l = sequencers.length; i < l; i++) {
        var sequencer = sequencers[i];
        sequencer.active = false;
        this.sequencers.push(sequencer);
        this.domElement.appendChild(sequencer.domElement);
    }

    this.setActiveSequencer(this.sequencers[0]);

    this.playPause = document.createElement('div');
    this.playPause.className = 'puck-button play-pause';


    this.playPauseListener = new window.musicbox.PressListener(this.playPause, function () {

        // ios needs Transport.start() in a touch event.

        if (!this.transportStarted) {

            this.transportStarted = true;
            Tone.Transport.swing = aaf.common.url.number('swing', 0.0);
            // Tone.Transport.start();
            // just play it reaaaalllly quiet ( ios hack )
            this.activeSequencer.triggerSample(2, 0.001);
            // console.log( this.activeSequencer.trackNames );
        }

        this.playing ? this.pause() : this.play();


    }.bind(this));

    this.saveSequence = document.createElement('div');
    this.saveSequence.className = 'puck-button save';


    this.saveSequenceListener = new window.musicbox.PressListener(this.saveSequence, function () {

        


    }.bind(this));

    this.domElement.appendChild(this.playPause);
    this.domElement.appendChild(this.saveSequence);

    this.playing = false;

    this.play = this.play.bind(this);

    Tone.Transport.loop = true;

    this.transportStarted = false;


};

aaf.utils.Events.mixTo(window.musicbox.MultiSequencer.prototype);

window.musicbox.MultiSequencer.prototype.update = function () {

    if (this.playing) this.activeSequencer.update();

};

window.musicbox.MultiSequencer.prototype.setActiveSequencer = function (seq) {

    var playing = this.playing;

    clearTimeout(this.playTimeout);

    if (playing) {
        this.pause(true);
    }

    if (this.activeSequencer) {
        this.activeSequencer.active = false;
        this.activeSequencer.domElement.classList.remove('active');
    }

    this.activeSequencer = seq;
    this.activeSequencer.domElement.classList.add('active');

    if (playing) {
        this.play();
    }

    var prevIndex = this.activeSequencerIndex;

    this.fire('change', this.activeSequencerIndex, prevIndex);


    this.activeSequencerIndex = this.sequencers.indexOf(seq);

    this.activeSequencer.active = true;

};

window.musicbox.MultiSequencer.prototype.prev = function () {

};

window.musicbox.MultiSequencer.prototype.next = function () {

    var i = ( this.activeSequencerIndex + 1 ) % this.sequencers.length;
    this.setActiveSequencer(this.sequencers[i]);

};

window.musicbox.MultiSequencer.prototype.play = function () {

    this.domElement.classList.add('playing');
    this.domElement.classList.remove('suspended');
    this.activeSequencer.start();
    this.playing = true;

    this.fire('play');


};

window.musicbox.MultiSequencer.prototype.pause = function (suspend) {


    if (suspend) {
        this.domElement.classList.add('suspended');
    }

    this.domElement.classList.remove('playing');

    if (this.activeSequencer) this.activeSequencer.stop();


    this.playing = false;

    this.fire('pause');


};