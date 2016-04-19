var $ = require('jquery');
var io = require('socket.io-client');
var _ = require("underscore");
var Tone = require('tone');

require('../../vendor/pixi');
require('hammerjs');
require('../../vendor/af.js');

require('../musicbox');
require('../Animation');
require('../EasyPIXI');
require('../MultiSequencer');
require('../PressListener');
require('../Sequencer');
require('../config/config');

var page = $(location).attr('pathname');

if (page.indexOf('/room') > -1) {

    var participants = [];

    (function init() {


        var serverBaseUrl = document.domain;

        if (serverBaseUrl === "localhost") {
            serverBaseUrl += ":8080";
        }

        var socket = io.connect(serverBaseUrl);

        socket.on('newConnection', function (user) {
            participants.push(user);
        });

        socket.on('userDisconnected', function (data) {
            var user = _.findWhere(participants, {id: data.id});
            if (user) {
                if (user.hasOwnProperty('sequencer')) {
                    user.sequencer.onDisconnect();
                }
                $('.' + user.instrument).toggleClass('unavailable');
            }
            participants = _.without(participants, _.findWhere(participants, {id: data.id}));
        });

        socket.on('incomingSequence', function (data) {
            var user = _.findWhere(participants, {id: data.user});
            if (user) {
                var sequence = data.sequence;

                if (user.hasOwnProperty('sequencer')) {
                    user.sequencer.setTracks(sequence);
                }
                else {
                    var opts = window.musicbox.config[user.instrument].sequencer;
                    opts.tracks = sequence;
                    opts.instrument = user.instrument;
                    user.sequencer = new window.musicbox.Sequencer(opts);
                    user.sequencer.start();
                }
            }
        });

        socket.on('instrumentSelected', function (user) {
            _.findWhere(participants, {id: user.user}).instrument = user.instrument;
            $('.' + user.instrument).toggleClass('unavailable');
        });

        socket.on('error', function (reason) {
            console.log('Unable to connect to server', reason);
        });
    })();
}
$(document).ready(function(){
    $(window).on('instrumentPlayed', function(e){
        var details = e.detail;
        animateInstrument(details);
    });

    /*
    Drums
     */

    crashCymbolAll = document.getElementById('Crash');
    crashCymbol = document.getElementById('Crash-Cymbol');
    rightTomDrumAll = document.getElementById('Tom-Right-All');
    rightTomDrum = document.getElementById('Tom-Right-Drum');
    leftTomDrumAll = document.getElementById('Tom-Left-All');
    leftTomDrum = document.getElementById('Tom-Left-Drum');
    hiHatAll = document.getElementById('Hi-Hat');
    hiHatTop = document.getElementById('Hi-Hat-Top');
    hiHatBottom = document.getElementById('Hi-Hat-Bottom');
    hiHatStandTop = document.getElementById('Hi-Hat-Stand-Top');
    floorTomDrumAll = document.getElementById('Floor-Tom');
    snareDrumAll = document.getElementById('Snare');
    snareDrum = document.getElementById('Snare-Drum');
    kickDrumAll = document.getElementById('Kick');

    var crashtl = new TimelineMax({
        paused: true
    });
    crashtl.to(crashCymbol, 0.1, {rotation: 8, transformOrigin: "50% 50%"})
        .to(crashCymbol,1.5, {rotation: 0, transformOrigin: "50% 50%", ease: Elastic.easeOut.config(2.5, 0.3)});

    function crash(){
        crashtl.restart();
        crashtl.play();
    }

    var snaretl = new TimelineMax({
        paused: true
    });
    snaretl.to(snareDrum, 0.1, {scaleX: 1.04, transformOrigin: "50% 50%", ease: Expo.easeOut})
        .to(snareDrum, 0.1, {scaleY: 0.9, transformOrigin: "50% 100%", ease: Expo.easeOut}, '0')
        .to(snareDrum, 0.4, {scale: 1, transformOrigin: "50% 100%", ease: Elastic.easeOut});

    function snare(){
        snaretl.restart();
        snaretl.play();
    }

    var kicktl = new TimelineMax({
        paused: true
    });
    kicktl.to(kickDrumAll, 0.1, {scale: 1.02, transformOrigin: "50% 100%", ease: Expo.easeOut})
        .to(kickDrumAll, 0.4, {scale: 1, transformOrigin: "50% 100%", ease: Elastic.easeOut});

    function kick(){
        kicktl.restart();
        kicktl.play();
    }


    var hiHattl = new TimelineMax({
        paused: true
    });
    hiHattl.to([hiHatTop, hiHatBottom], 0.1, {rotation: -4, transformOrigin: "50% 50%"})
        .to([hiHatTop, hiHatBottom], 0.6, {rotation: 0, transformOrigin: "50% 50%", ease: Elastic.easeOut.config(1.5, 0.2)});

    hiHati = 0;
    function hiHat() {
        ++hiHati;
        hiHattl.restart();
        hiHattl.play();
    }

    /*
    End of drums
     */

    /*
    Guitar
     */
    //Convert circle elements to paths
    MorphSVGPlugin.convertToPath("circle");

    stringStringyness = 2;
    guitar = document.getElementById('guitar_2_');
    stringStraight_6_ = document.getElementById('stringStraight_6_');
    stringPlucked_6_ = document.getElementById('stringPlucked_6_');
    stringStraight_7_ = document.getElementById('stringStraight_7_');
    stringPlucked_7_ = document.getElementById('stringPlucked_7_');
    stringStraight_8_ = document.getElementById('stringStraight_8_');
    stringPlucked_8_ = document.getElementById('stringPlucked_8_');
    stringStraight_9_ = document.getElementById('stringStraight_9_');
    stringPlucked_9_ = document.getElementById('stringPlucked_9_');
    stringStraight_10_ = document.getElementById('stringStraight_10_');
    stringPlucked_10_ = document.getElementById('stringPlucked_10_');
    stringStraight_11_ = document.getElementById('stringStraight_11_');
    stringPlucked_11_ = document.getElementById('stringPlucked_11_');
    speaker_1 = document.getElementById('speaker-1');
    speakerWobble_1 = document.getElementById('speaker-wobble-1');
    speaker_2 = document.getElementById('speaker-2');
    speakerWobble_2 = document.getElementById('speaker-wobble-2');
    note_1 = document.getElementById('note-1_2_');
    note_2 = document.getElementById('note-2_2_');
    note_3 = document.getElementById('note-3_2_');
    note_4 = document.getElementById('note-4_2_');
    spark_1 = document.getElementById('spark-1');
    spark_2 = document.getElementById('spark-3');
    spark_3 = document.getElementById('spark-4');

    var pluck = new TimelineMax({
        paused: true
    });

    pluck.to(stringStraight_6_, 0.1, {ease: Expo.easeOut,morphSVG: {points: stringPlucked_6_.getAttribute('points')}})
        .to(stringStraight_6_, 1, {morphSVG: {points: stringStraight_6_.getAttribute('points')},ease: Elastic.easeOut.config(stringStringyness, 0.04)})

        .to(stringStraight_7_, 0.1, {ease: Expo.easeOut,morphSVG: {points: stringPlucked_7_.getAttribute('points')}}, "-=1.1")
        .to(stringStraight_7_, 1, {morphSVG: {points: stringStraight_7_.getAttribute('points')},ease: Elastic.easeOut.config(stringStringyness,0.04)}, "-=1")

        .to(stringStraight_8_, 0.1, {ease: Expo.easeOut,morphSVG: {points: stringPlucked_8_.getAttribute('points')}}, "-=1.1")
        .to(stringStraight_8_, 1, {morphSVG: {points: stringStraight_8_.getAttribute('points')},ease: Elastic.easeOut.config(stringStringyness, 0.04)}, "-=1")

        .to(stringStraight_9_, 0.1, {ease: Expo.easeOut,morphSVG: {points: stringPlucked_9_.getAttribute('points')}}, "-=1.1")
        .to(stringStraight_9_, 1, {morphSVG: {points: stringStraight_9_.getAttribute('points')},ease: Elastic.easeOut.config(stringStringyness, 0.04)}, "-=1")

        .to(stringStraight_10_, 0.1, {ease: Expo.easeOut,morphSVG: {points: stringPlucked_10_.getAttribute('points')}}, "-=1.1")
        .to(stringStraight_10_, 1, {morphSVG: {points: stringStraight_10_.getAttribute('points')},ease: Elastic.easeOut.config(stringStringyness, 0.04)}, "-=1")

        .to(stringStraight_11_, 0.1, {ease: Expo.easeOut,morphSVG: {points: stringPlucked_11_.getAttribute('points')}}, "-=1.1")
        .to(stringStraight_11_, 1, {morphSVG: {points: stringStraight_11_.getAttribute('points')},ease: Elastic.easeOut.config(stringStringyness, 0.04)}, "-=1")

        //Note Animations
        .to(note_1, 0.4, {x:"-50%", y:"-50%"}, "-=1.1")
        .to(note_1, 0.2, {opacity:1 , ease:SlowMo.easeIn}, "-=1.1")
        .to(note_1, 0.2, {opacity:0 , ease:SlowMo.easeOut}, "-=0.9")

        .to(note_2, 0.4, {x:"50%", y:"-50%"}, "-=1.1")
        .to(note_2, 0.2, {opacity:1 , ease:SlowMo.easeIn}, "-=1.1")
        .to(note_2, 0.2, {opacity:0 , ease:SlowMo.easeOut}, "-=0.9")

        .to(note_3, 0.4, {x:"-20%", y:"-50%"}, "-=1.1")
        .to(note_3, 0.2, {opacity:1 , ease:SlowMo.easeIn}, "-=1.1")
        .to(note_3, 0.2, {opacity:0 , ease:SlowMo.easeOut}, "-=0.9")

        .to(note_4, 0.4, {x:"50%", y:"-25%"}, "-=1.1")
        .to(note_4, 0.2, {opacity:1 , ease:SlowMo.easeIn}, "-=1.1")
        .to(note_4, 0.2, {opacity:0 , ease:SlowMo.easeOut}, "-=0.9")

        //Sparks Animations
        .to(spark_1, 0.4, {x:"-50%", y:"50%"}, "-=1.1")
        .to(spark_1, 0.2, {opacity:1 , ease:SlowMo.easeIn}, "-=1.1")
        .to(spark_1, 0.2, {opacity:0 , ease:SlowMo.easeOut}, "-=0.9")

        .to(spark_2, 0.4, {x:"-50%", y:"-50%"}, "-=1.1")
        .to(spark_2, 0.2, {opacity:1 , ease:SlowMo.easeIn}, "-=1.1")
        .to(spark_2, 0.2, {opacity:0 , ease:SlowMo.easeOut}, "-=0.9")

        .to(spark_3, 0.4, {x:"50%", y:"-50%"}, "-=1.1")
        .to(spark_3, 0.2, {opacity:1 , ease:SlowMo.easeIn}, "-=1.1")
        .to(spark_3, 0.2, {opacity:0 , ease:SlowMo.easeOut}, "-=0.9")

        //Speaker Animtaions
        .to(speaker_1, 0.1, {ease: Expo.easeOut,morphSVG:speakerWobble_1}, "-=1.1")
        .to(speaker_1, 0.4, {morphSVG:speaker_1,ease: Elastic.easeOut}, "-=1")

        .to(speaker_2, 0.1, {ease: Expo.easeOut,morphSVG:speakerWobble_2}, "-=1.05")
        .to(speaker_2, 0.4, {morphSVG:speaker_2,ease: Elastic.easeOut}, "-=0.95");

    function rockOutGuitar() {
        pluck.restart();
        pluck.play();
    }
    /*
    End of guitar
     */

    /*
    Bass
     */

    stringStringyness = 2;
    guitar = document.getElementById('Bass_Guitar_1_');
    stringStraight_1 = document.getElementById('stringStraight_1');
    stringPlucked_1 = document.getElementById('stringPlucked_1');
    stringStraight_2 = document.getElementById('stringStraight_2');
    stringPlucked_2 = document.getElementById('stringPlucked_2');
    stringStraight_3 = document.getElementById('stringStraight_3');
    stringPlucked_3 = document.getElementById('stringPlucked_3');
    stringStraight_4 = document.getElementById('stringStraight_4');
    stringPlucked_4 = document.getElementById('stringPlucked_4');
    speaker_1 = document.getElementById('speaker-1');
    note_1 = document.getElementById('note-1_1_');
    note_2 = document.getElementById('note-2_1_');
    note_3 = document.getElementById('note-3_1_');
    note_4 = document.getElementById('note-4_1_');
    spark_1 = document.getElementById('spark-1_2_');
    spark_2 = document.getElementById('spark-3_2_');
    spark_3 = document.getElementById('spark-4_2_');
    speaker_1 = document.getElementById('bass-Amp-Speaker');

//Declare timeline
    var pluck = new TimelineMax({
        paused: true
    })

//String Animtaions
    pluck.to(stringStraight_1, 0.1, {ease: Expo.easeOut,morphSVG: {points: stringPlucked_1.getAttribute('points')}})
        .to(stringStraight_1, 1, {morphSVG: {points: stringStraight_1.getAttribute('points')},ease: Elastic.easeOut.config(stringStringyness, 0.04)})

        .to(stringStraight_2, 0.1, {ease: Expo.easeOut,morphSVG: {points: stringPlucked_2.getAttribute('points')}}, "-=1.1")
        .to(stringStraight_2, 1, {morphSVG: {points: stringStraight_2.getAttribute('points')},ease: Elastic.easeOut.config(stringStringyness,0.04)}, "-=1")

        .to(stringStraight_3, 0.1, {ease: Expo.easeOut,morphSVG: {points: stringPlucked_3.getAttribute('points')}}, "-=1.1")
        .to(stringStraight_3, 1, {morphSVG: {points: stringStraight_3.getAttribute('points')},ease: Elastic.easeOut.config(stringStringyness, 0.04)}, "-=1")

        .to(stringStraight_4, 0.1, {ease: Expo.easeOut,morphSVG: {points: stringPlucked_4.getAttribute('points')}}, "-=1.1")
        .to(stringStraight_4, 1, {morphSVG: {points: stringStraight_4.getAttribute('points')},ease: Elastic.easeOut.config(stringStringyness, 0.04)}, "-=1")

        //Note Animations
        .to(note_1, 0.4, {x:"-50%", y:"-50%"}, "-=1.1")
        .to(note_1, 0.2, {opacity:1 , ease:SlowMo.easeIn}, "-=1.1")
        .to(note_1, 0.2, {opacity:0 , ease:SlowMo.easeOut}, "-=0.9")

        .to(note_2, 0.4, {x:"50%", y:"-50%"}, "-=1.1")
        .to(note_2, 0.2, {opacity:1 , ease:SlowMo.easeIn}, "-=1.1")
        .to(note_2, 0.2, {opacity:0 , ease:SlowMo.easeOut}, "-=0.9")

        .to(note_3, 0.4, {x:"-20%", y:"-50%"}, "-=1.1")
        .to(note_3, 0.2, {opacity:1 , ease:SlowMo.easeIn}, "-=1.1")
        .to(note_3, 0.2, {opacity:0 , ease:SlowMo.easeOut}, "-=0.9")

        .to(note_4, 0.4, {x:"50%", y:"-25%"}, "-=1.1")
        .to(note_4, 0.2, {opacity:1 , ease:SlowMo.easeIn}, "-=1.1")
        .to(note_4, 0.2, {opacity:0 , ease:SlowMo.easeOut}, "-=0.9")

        //Sparks Animations
        .to(spark_1, 0.4, {x:"-50%", y:"50%"}, "-=1.1")
        .to(spark_1, 0.2, {opacity:1 , ease:SlowMo.easeIn}, "-=1.1")
        .to(spark_1, 0.2, {opacity:0 , ease:SlowMo.easeOut}, "-=0.9")

        .to(spark_2, 0.4, {x:"-50%", y:"-50%"}, "-=1.1")
        .to(spark_2, 0.2, {opacity:1 , ease:SlowMo.easeIn}, "-=1.1")
        .to(spark_2, 0.2, {opacity:0 , ease:SlowMo.easeOut}, "-=0.9")

        .to(spark_3, 0.4, {x:"50%", y:"-50%"}, "-=1.1")
        .to(spark_3, 0.2, {opacity:1 , ease:SlowMo.easeIn}, "-=1.1")
        .to(spark_3, 0.2, {opacity:0 , ease:SlowMo.easeOut}, "-=0.9")

        //Speaker Animtaions
        .to(speaker_1, 0.1, {scale: 1.015, transformOrigin: "50% 50%", ease: Expo.easeOut}, "-=1.1")
        .to(speaker_1, 0.3, {scale: 1, transformOrigin: "50% 50%", ease: Elastic.easeOut}, "-=1");
    /*
    End of bass
     */

    function rockOutBass() {
        pluck.restart();
        pluck.play();
        playAudio();
    }

    function animateInstrument(details){
        var instrument = details.instrument;
        var row = parseInt(details.type);

        switch(instrument){
            case 'guitar':
                rockOutGuitar();
                break;
            case 'drums':
                switch(row){
                    case 0:
                        crash();
                        break;
                    case 1:
                        hiHat();
                        break;
                    case 2:
                        snare();
                        break;
                    case 3:
                        kick();
                        break;
                }
                break;
            case 'bass':
                rockOutBass();
                break;
        }
    }
});


