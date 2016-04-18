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
                var opts = window.musicbox.config[user.instrument].sequencer;
                opts.tracks = sequence;
                if (user.hasOwnProperty('sequencer')) {
                    user.sequencer.setTracks(sequence);
                }
                else {
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