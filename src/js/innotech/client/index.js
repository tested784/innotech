var $ = require('jquery');
var io = require('socket.io-client');
var _ = require("underscore");
require('../../vendor/pixi');
require('gsap');
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
var instrument = "";

if (page === "/") {
    $(document).ready(function () {
        initInstrumentSelection();
    });
}

function initJamSession() {

    var participants = [];

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
        $('#participants').append('<ul id="participants-list">');
        for (var i = 0; i < participants.length; i++) {
            $('#participants-list').append('<li>' + participants[i].id + '</li>');
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
        var sessionId = socket.io.engine.id;
        window.sessionId = sessionId;
        socket.emit('newUser', {
            id: sessionId,
            instrument: instrument
        });
    });

    /*
     When the server emits the "newConnection" event, we'll reset
     the participants section and display the connected clients.
     Note we are assigning the sessionId as the span ID.
     */
    socket.on('newConnection', function (user) {
        participants.push(user);
        updateParticipants(participants);
    });

    /*
     When the server emits the "userDisconnected" event, we'll
     remove the span element from the participants element
     */
    socket.on('userDisconnected', function (data) {
        participants = _.without(participants, _.findWhere(participants, {id: data.id}));
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


    changePage();

    var multiSequencer;

    var assets = [

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

    aaf.main({
        assets: assets,
        init: init
    });

    function init() {

        var sequencers = [];
        var configKeys = [];

        for (var key in window.musicbox.config) {

            var config = window.musicbox.config[key];
            configKeys.push(key);

            var sequencerConfig = config.sequencer;

            var sequencer = new window.musicbox.Sequencer(sequencerConfig);

            sequencers.push(sequencer);
        }

        multiSequencer = new window.musicbox.MultiSequencer(sequencers);
        if (instrument !== "") {
            multiSequencer.setActiveSequencer(sequencers[configKeys.indexOf(instrument)]);
        }

        container.appendChild(multiSequencer.domElement);

        Tone.Buffer.on('load', function () {

            aaf.common.loop.add(update);
            aaf.common.loop.start();

            window.parent.postMessage('loaded', '*');
            window.parent.postMessage('ready', '*');

        });
    }

    function update() {
        multiSequencer.update();
    }
}

function initInstrumentSelection() {
    $('.choose').on('click', function () {
        console.log('hey');
        instrument = $(this).data('type');
        $('#sequencePage').addClass('instrument-' + instrument);
        initJamSession();
    });
}

function changePage() {
    $('#selectionPage').toggleClass('hide');
    $('#sequencePage').toggleClass('hide');
}
