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
require('../FakeSequencer');
require('../config/config');

var page = $(location).attr('pathname');
var instrument = "";
var participants = [];

if (page === "/") {
    $(document).ready(function () {
        initInstrumentSelection();
    });
}

function initJamSession() {


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

            var sequencer = new window.musicbox.FakeSequencer(sequencerConfig);

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

        multiSequencer.play();
    }

    function update() {
        multiSequencer.update();
    }
}

function initInstrumentSelection() {
    var serverBaseUrl = document.domain;

    if (serverBaseUrl === "localhost") {
        serverBaseUrl += ":8080";
    }

    var socket = io.connect(serverBaseUrl);

    $('.choose').on('click', function () {
        if ($(this).hasClass('unavailable') === false) {
            instrument = $(this).data('type');
            $.ajax({
                url: '/instrumentSelected',
                type: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify({
                    instrument: instrument,
                    id: window.sessionId
                })
            });
            $('#container').addClass('instrument-' + instrument);
            $('#container .header').addClass(instrument);
            $('#container .header').append('<h2>' + instrument.capitalizeFirstLetter() + '</h2>');
            initJamSession();
        }
    });

    socket.on('connect', function () {
        var sessionId = socket.io.engine.id;
        window.sessionId = sessionId;
        socket.emit('newUser', {
            id: sessionId,
            instrument: instrument
        });
    });

    socket.on('roomInit', function (data) {
        participants = data.participants;
        for (var i = 0; i < participants.length; i++) {
            if (participants[i].instrument !== "") {
                $('.choose ' + '.' + participants[i].instrument).toggleClass('unavailable');
            }
        }
    });

    socket.on('newConnection', function (user) {
        participants.push(user);
    });

    socket.on('instrumentSelected', function (user) {
        var participant = _.findWhere(participants, {id: user.user});
        participant.instrument = user.instrument;
        var className = '.choose' + '.' + participant.instrument;

        $(className).toggleClass('unavailable');
    });

    socket.on('userDisconnected', function (data) {
        console.log(data);
        participants = _.without(participants, _.findWhere(participants, {id: data.id}));
        var className = '.choose' + '.' + data.instrument;

        $(className).toggleClass('unavailable');
    });

    socket.on('error', function (reason) {
        console.log('Unable to connect to server', reason);
    });
}

function changePage() {
    $('#selectionPage').toggleClass('hide');
    $('#sequencePage').toggleClass('hide');
}
