var $ = require('jquery');
var io = require('socket.io-client');
require('../../vendor/pixi');
require('gsap');
require('hammerjs');
require('../../vendor/af.js');

require('../musicbox');
require('../Animation');
require('../Carousel');
require('../Character');
require('../CharacterEyes');
require('../CharacterPair');
require('../EasyPIXI');
require('../MultiSequencer');
require('../PressListener');
require('../Sequencer');
require('../config/config');

function init() {


    var serverBaseUrl = document.domain;

    if (serverBaseUrl === "localhost") {
        serverBaseUrl += ":8080";
    }

    /*
     On client init, try to connect to the socket.IO server.
     Note we don't specify a port since we set up our server
     to run on port 8080
     */
    var socket = io.connect(serverBaseUrl);


    //We'll save our session ID in a variable for later
    var sessionId = '';

    //Helper function to update the participants' list
    function updateParticipants(participants) {
        $('#participants').html('');
        for (var i = 0; i < participants.length; i++) {
            $('#participants').append('<span id="' + participants[i].id + '">' + participants[i].name + ' ' + (participants[i].id === sessionId ? '(You)' : '') + '<br /></span>');
        }
    }

    /*
     When the client successfully connects to the server, an
     event "connect" is emitted. Let's get the session ID and
     log it. Also, let the socket.IO server there's a new user
     with a session ID and a name. We'll emit the "newUser" event
     for that.
     */
    socket.on('connect', function () {
        window.sessionId = socket.io.engine.id;
        console.log('Connected ' + sessionId);
        socket.emit('newUser', {
            id: sessionId,
            name: $('#name').val()
        });
    });

    /*
     When the server emits the "newConnection" event, we'll reset
     the participants section and display the connected clients.
     Note we are assigning the sessionId as the span ID.
     */
    socket.on('newConnection', function (data) {
        updateParticipants(data.participants);
    });

    /*
     When the server emits the "userDisconnected" event, we'll
     remove the span element from the participants element
     */
    socket.on('userDisconnected', function (data) {
        $('#' + data.id).remove();
    });

    /*
     When the server fires the "nameChanged" event, it means we
     must update the span with the given ID accordingly
     */
    socket.on('nameChanged', function (data) {
        $('#' + data.id).html(data.name + ' ' + (data.id === sessionId ? '(You)' : '') + '<br />');
    });

    /*
     When receiving a new chat message with the "incomingMessage" event,
     we'll prepend it to the messages section
     */
    socket.on('incomingSequence', function (data) {
        var sequence = data.sequence;
        var user = data.sequence;
        console.log('sequence sent and recieved!');
    });

    /*
     Log an error if unable to connect to server
     */
    socket.on('error', function (reason) {
        console.log('Unable to connect to server', reason);
    });

    /*
     "sendMessage" will do a simple ajax POST call to our server with
     whatever message we have in our textarea
     */
    function sendMessage() {
        var outgoingMessage = $('#outgoingMessage').val();
        var name = $('#name').val();
        $.ajax({
            url: '/band',
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({
                message: outgoingMessage,
                name: name
            })
        });
    }

    /*
     If user presses Enter key on textarea, call sendMessage if there
     is something to share
     */
    function outgoingMessageKeyDown(event) {
        if (event.which == 13) {
            event.preventDefault();
            if ($('#outgoingMessage').val().trim().length <= 0) {
                return;
            }
            sendMessage();
            $('#outgoingMessage').val('');
        }
    }

    /*
     Helper function to disable/enable Send button
     */
    function outgoingMessageKeyUp() {
        var outgoingMessageValue = $('#outgoingMessage').val();
        $('#send').attr('disabled', (outgoingMessageValue.trim()).length > 0 ? false : true);
    }

    /*
     When a user updates his/her name, let the server know by
     emitting the "nameChange" event
     */
    function nameFocusOut() {
        var name = $('#name').val();
        socket.emit('nameChange', {
            id: sessionId,
            name: name
        });
    }

    /* Elements setup */
    $('#outgoingMessage').on('keydown', outgoingMessageKeyDown);
    $('#outgoingMessage').on('keyup', outgoingMessageKeyUp);
    $('#name').on('focusout', nameFocusOut);
    $('#send').on('click', sendMessage);

}

$(document).on('ready', init);

(function () {

    var pixi, carousel, multiSequencer, pairs, characterContainer, scale;

    // Preload assets
    // -------------------------------

    var assets = [

        'texture/slices_eyes.png',

        'image/ui_congas1.svg',
        'image/ui_congas2.svg',
        'image/ui_congas3.svg',

        'image/ui_drums1.svg',
        'image/ui_drums2.svg',
        'image/ui_drums3.svg',

        'image/ui_pause.svg',
        'image/ui_play.svg',
        'image/ui_arrow.svg',

        'image/ui_timpani1.svg',
        'image/ui_timpani2.svg',
        'image/ui_timpani3.svg',

        'image/ui_woodblocks1.svg',
        'image/ui_woodblocks2.svg',
        'image/ui_woodblocks3.svg'

    ];

    var charAssets = [];

    for (var i in window.musicbox.config) {
        var config = window.musicbox.config[i];
        charAssets = charAssets.concat(window.musicbox.Character.getAssetList(config.characterBig));
        charAssets = charAssets.concat(window.musicbox.Character.getAssetList(config.characterSmall));
    }

    assets = assets.concat(charAssets);

    aaf.main({
        assets: assets,
        init: init
    });


    // Main
    // -------------------------------

    var CHILD_WIDTH = 1900; // hacky

    function init() {

        pixi = new window.musicbox.EasyPIXI({
            fullscreen: false,
            transparent: false,
            width: container.offsetWidth,
            height: 280,
            resolution: 2
        });

        pairs = [];

        var pairContainers = [];
        var sequencers = [];


        // Collect character pairs and sequencers
        // -------------------------------

        for (var key in window.musicbox.config) {

            var config = window.musicbox.config[key];


            // Make character pairs
            // -------------------------------

            var characterBig = new window.musicbox.Character(config.characterBig);
            var characterSmall = new window.musicbox.Character(config.characterSmall);

            aaf.utils.extend(characterBig.container.position, config.characterBig.position);
            aaf.utils.extend(characterSmall.container.position, config.characterSmall.position);

            var pair = new window.musicbox.CharacterPair(characterBig, characterSmall);

            // birds look weird when they look at eachother.
            if (key === 'conga') {
                pair.adoringLookTimeline.clear()
            }

            // for clicking the characters, remember which arm is which track.
            pair.armToTrackIndex = {};
            ['left', 'right', 'small'].forEach(function (arm) {
                pair.armToTrackIndex[arm] = config.sequencer.order.indexOf(arm);
            });

            pairs.push(pair);


            // Make sequencers
            // -------------------------------

            var sequencerConfig = config.sequencer;

            // Turns 'right' 'left' 'small' into their respective animation methods:
            sequencerConfig.listeners = config.sequencer.order.map(function (animation) {
                return pair[animation];
            });


            var sequencer = new window.musicbox.Sequencer(sequencerConfig);

            pairContainers.push(pair.container);
            sequencers.push(sequencer);

        }


        // Make character carousel
        // -------------------------------

        characterContainer = new PIXI.Container();
        characterContainer.position.y = 5;

        pixi.stage.addChild(characterContainer);

        carousel = new window.musicbox.Carousel({
            children: pairContainers,
            childWidth: CHILD_WIDTH,
        });

        characterContainer.addChild(carousel.container);


        // Make multi sequencer
        // -------------------------------

        multiSequencer = new window.musicbox.MultiSequencer(sequencers);
        multiSequencer.on('pause', function () {

            for (var i = 0, l = pairs.length; i < l; i++) {
                pairs[i].characterSmall.stopBobbing();
                pairs[i].characterBig.stopBobbing();
            }

        });

        multiSequencer.on('change', function (index, prev) {
            var pair = pairs[prev];

            if (pair) {
                pair.characterBig.stopBobbing();
                pair.characterSmall.stopBobbing();
            }

        });

        container.appendChild(multiSequencer.domElement);


        // Get going!
        // -------------------------------

        Tone.Buffer.on('load', function () {

            // I hate having more async in here as that's what aaf.init is 
            // supposed to get rid of, but it don't quite work w/ Tone yet

            bindListeners();

            aaf.common.loop.add(update);
            aaf.common.loop.start();
            container.appendChild(pixi.renderer.view);

            window.parent.postMessage('loaded', '*');
            window.parent.postMessage('ready', '*');

        });


    };

    // UI
    // -------------------------------

    function bindListeners() {

        window.addEventListener('touchstart', function (e) {
            e.preventDefault();
        }, false);


        // Left right buttons


        var nextListener = new window.musicbox.PressListener(carousel.nextButton, next);
        var prevListener = new window.musicbox.PressListener(carousel.prevButton, prev);


        // Carousel panning
        // -------------------------------

        var SWIPE_THRESH = 0.2;

        var grabbedPosition;
        var dragged = false;

        var $carousel = new Hammer.Manager(pixi.renderer.view, {
            recognizers: [
                [Hammer.Pan, {direction: Hammer.DIRECTION_HORIZONTAL, event: 'pan'}],
                [Hammer.Press, {time: 5, event: 'press'}],
            ]
        });

        $carousel.on('press', function () {

            dragged = false;

            carousel.grab();
            carousel.grabTarget = carousel.container.position.x;

            grabbedPosition = carousel.grabTarget;

        });

        $carousel.on('pressup', function () {
            carousel.release();

        });

        $carousel.on('panend', function (e) {

            carousel.release();

            var delta = e.deltaX / scale;

            if (-delta > carousel.childWidth / 2 || e.velocityX > SWIPE_THRESH) {
                next();
            } else if (delta > carousel.childWidth / 2 || e.velocityX < -SWIPE_THRESH) {
                prev();
            }

        });

        $carousel.on('pan', function (e) {

            e.preventDefault();

            dragged = true;

            carousel.grabTarget = grabbedPosition + e.deltaX / scale;

        });

        pairs.forEach(function (pair, i) {

            var sequencer = multiSequencer.sequencers[i];
            var trigger = function (anim) {

                // PIXI offers ontap and onclick but both are triggered
                // even if the user dragged. Gotta manage that ourselves.
                if (i === multiSequencer.activeSequencerIndex && !dragged) {

                    //multiSequencer.pause();

                    pair[anim](0.085);
                    sequencer.triggerSample(pair.armToTrackIndex[anim]);

                }

            };

            pair.characterBig.on('up', trigger);
            pair.characterSmall.on('up', trigger);

        });


        // Resize
        // -------------------------------

        window.addEventListener('resize', resize, false);
        resize();


    }

    function resize() {

        // They layout's "native" width is 360px:
        // behaves like background-size: contain

        // lotta magic numbers in here that should be constants

        var width = Math.min(850, container.offsetHeight, container.offsetWidth);

        var ratio = ( width / 360 );
        scale = 0.17 * ratio;

        pixi.setSize(container.offsetWidth, 280 * ratio);
        pixi.renderer.view.style.top = ( container.offsetHeight - 240 - pixi.height ) / 2 + 'px';


        carousel.setChildWidth(CHILD_WIDTH * ratio);
        characterContainer.position.x = container.offsetWidth / 2 - width / 2;
        characterContainer.scale.set(scale);

    }

    function next() {
        if (carousel.activeChildIndex < carousel.children.length - 1) {
            var wasPlaying = multiSequencer.playing;//Tone.Transport.state === Tone.State.Started;
            if (wasPlaying) multiSequencer.pause();
            carousel.next();
            multiSequencer.setActiveSequencer(multiSequencer.sequencers[carousel.activeChildIndex]);
            if (wasPlaying) {
                setTimeout(function () {
                    multiSequencer.play();
                }, 50)
            }

        }
    }

    function prev() {
        if (carousel.activeChildIndex > 0) {
            var wasPlaying = multiSequencer.playing;//Tone.Transport.state === Tone.State.Started;
            if (wasPlaying) multiSequencer.pause();
            carousel.prev();
            multiSequencer.setActiveSequencer(multiSequencer.sequencers[carousel.activeChildIndex]);

            if (wasPlaying) {
                setTimeout(function () {
                    multiSequencer.play();
                }, 50)
            }

        }
    }

    function update() {

        pixi.render();
        carousel.update();
        multiSequencer.update();

        for (var i = 0, l = pairs.length; i < l; i++) {

            var pair = pairs[i];

            var b = multiSequencer.activeSequencer.position * multiSequencer.activeSequencer.timeSignature;

            if (multiSequencer.playing && multiSequencer.activeSequencerIndex === i) {
                pair.characterBig.setBob(b);
                pair.characterSmall.setBob(b + 0.075); // offset so they're not perfectly in sync
            }

            pair.characterBig.update();
            pair.characterSmall.update();

        }

    }


})();
