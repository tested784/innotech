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

if (page.indexOf('/room') > -1) {
    var participants = [];

    (function init() {


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
        socket.on('connection', function () {
            participants = [];
            var sessionId = socket.io.engine.id;
            window.sessionId = sessionId;
            socket.emit('newUser', {
                id: sessionId
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
            var user = _.findWhere(participants, {id: data.id});
            if (user) {
                if (user.hasOwnProperty('sequencer')) {
                    user.sequencer.stop();
                }
            }

            participants = _.without(participants, _.findWhere(participants, {id: data.id}));
        });


        /*
         When receiving a new chat message with the "incomingMessage" event,
         we'll prepend it to the messages section
         */
        socket.on('incomingSequence', function (data) {
            var user = _.findWhere(participants, {id: data.user});
            if (user) {
                var sequence = data.sequence;
                var opts = window.musicbox.config[user.instrument].sequencer;
                opts.tracks = sequence;
                if (user.hasOwnProperty('sequencer')) {
                    // user.sequencer.stop();
                }
                user.sequencer = new window.musicbox.Sequencer(opts);
                user.sequencer.start();
            }
        });

        /*
         Log an error if unable to connect to server
         */
        socket.on('error', function (reason) {
            console.log('Unable to connect to server', reason);
        });
    })();


    (function () {


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

        };


        function update() {

            for (var i = 0; i < participants; i++) {
                participants[i].sequencer.update();
            }

        }


    })();
}