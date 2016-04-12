var $ = require('jquery');
var io = require('socket.io-client');
var _ = require("underscore");
var Tone = require('tone');

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

        socket.on('connection', function () {
            participants = [];
            var sessionId = socket.io.engine.id;
            window.sessionId = sessionId;
            socket.emit('newUser', {
                id: sessionId
            });
        });

        socket.on('newConnection', function (user) {
            participants.push(user);
            updateParticipants(participants);
        });

        socket.on('userDisconnected', function (data) {
            var user = _.findWhere(participants, {id: data.id});
            if (user) {
                if (user.hasOwnProperty('sequencer')) {
                    user.sequencer.stop();
                }
            }

            participants = _.without(participants, _.findWhere(participants, {id: data.id}));
        });

        socket.on('incomingSequence', function (data) {
            var user = _.findWhere(participants, {id: data.user});
            if (user) {
                var sequence = data.sequence;
                var opts = window.musicbox.config[user.instrument].sequencer;
                opts.tracks = sequence;
                if (user.hasOwnProperty('sequencer')) {
                    user.sequencer.stop();
                    user.sequencer.setTracks(sequence);
                    user.sequencer.start();
                }
                else {
                    user.sequencer = new window.musicbox.Sequencer(opts);
                    user.sequencer.start();
                }
            }
        });

        /*
         Log an error if unable to connect to server
         */
        socket.on('error', function (reason) {
            console.log('Unable to connect to server', reason);
        });
    })();
}