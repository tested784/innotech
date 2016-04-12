var $ = require('jquery');
var io = require('socket.io-client');
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
if (page === "/") {

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
                instrument: 'conga'
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
    }

    $(document).on('ready', init);

    (function () {

        var multiSequencer;

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

        aaf.main({
            assets: assets,
            init: init
        });


        // Main
        // -------------------------------

        function init() {

            var sequencers = [];

            // Collect character pairs and sequencers
            // -------------------------------

            for (var key in window.musicbox.config) {

                var config = window.musicbox.config[key];

                // Make sequencers
                // -------------------------------

                var sequencerConfig = config.sequencer;


                var sequencer = new window.musicbox.Sequencer(sequencerConfig);

                sequencers.push(sequencer);

            }


            // Make multi sequencer
            // -------------------------------

            multiSequencer = new window.musicbox.MultiSequencer(sequencers);

            container.appendChild(multiSequencer.domElement);


            // Get going!
            // -------------------------------

            Tone.Buffer.on('load', function () {

                // I hate having more async in here as that's what aaf.init is
                // supposed to get rid of, but it don't quite work w/ Tone yet

                aaf.common.loop.add(update);
                aaf.common.loop.start();

                window.parent.postMessage('loaded', '*');
                window.parent.postMessage('ready', '*');

            });


        };


        function update() {

            multiSequencer.update();

        }


    })();
}
