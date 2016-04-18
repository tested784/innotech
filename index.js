/*
 Module dependencies:

 - Express
 - Http (to run Express)
 - Body parser (to parse JSON requests)
 - Underscore (because it's cool)
 - Socket.IO

 It is a common practice to name the variables after the module name.
 Ex: http is the "http" module, express is the "express" module, etc.
 The only exception is Underscore, where we use, conveniently, an
 underscore. Oh, and "socket.io" is simply called io. Seriously, the
 rest should be named after its module name.

 */
var express = require("express")
    , app = express()
    , http = require("http").createServer(app)
    , bodyParser = require("body-parser")
    , io = require("socket.io").listen(http)
    , _ = require("underscore");


var participants = [];

/* Server config */

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
    next();
});

//Specify the views folder
app.set("views", __dirname + "/views");

app.set("view engine", "jade");

//Specify where the static content is
app.use(express.static("public", __dirname + "/public"));

//Tells server to support JSON requests
app.use(bodyParser.json());

/* Server routing */

//Handle route "GET /", as in "http://localhost:8080/"
app.get("/", function (request, response) {

    //Render the view called "index"
    response.render("index");

});

//Handle route "GET /", as in "http://localhost:8080/"
app.get("/rooms/:name", function (request, response) {

    var roomName = request.params.name;
    var room = io.nsps['/'].adapter.rooms['music-jam'];
    if (room) {
        response.render("room");
    }
    else {
        response.json(JSON.stringify({message: "No room exists with the name " + roomName}));
    }

});

//POST method to create a chat message
app.post("/sequence", function (request, response) {

    //The request body expects a param named "message"
    var sequence = request.body.sequence;
    var user = request.body.user;

    //If the message is empty or wasn't sent it's a bad request
    if (_.isUndefined(sequence) || ( _.isUndefined(user) || _.isEmpty(user.trim()))) {
        return response.json(400, {error: "Sequence is invalid"});
    }

    //Let our chatroom know there was a new message
    io.to('music-jam').emit("incomingSequence", {sequence: sequence, user: user});

    //Looks good, let the client know
    response.json(200, {message: "Sequence received"});

});

//POST method to create a chat message
app.post("/instrumentSelected", function (request, response) {

    //The request body expects a param named "message"
    var instrument = request.body.instrument;
    var user = request.body.id;
    _.findWhere(participants, {id: user}).instrument = instrument;

    //If the message is empty or wasn't sent it's a bad request
    if (_.isUndefined(instrument) || ( _.isUndefined(user) || _.isEmpty(user.trim()))) {
        return response.json(400, {error: "Sequence is invalid"});
    }

    //Let our chatroom know there was a new message
    io.to('music-jam').emit("instrumentSelected", {instrument: instrument, user: user});

    //Looks good, let the client know
    response.json(200, {message: "Instrument received"});

});

/* Socket.IO events */
io.on("connection", function (socket) {
    // kijk of de room music-jam bestaat
    var room = io.nsps['/'].adapter.rooms['music-jam'];
    if (room) {
        var roomSize = Object.keys(room).length;
    }
    // max aantal clients in room = 4
    if (room === undefined || roomSize < 4) {
        socket.join('music-jam');

        io.to('music-jam').emit("roomInit", {participants: participants});

        /*
         When a new user connects to our server, we expect an event called "newUser"
         and then we'll emit an event called "newConnection" with a list of all
         participants to all connected clients
         */
        socket.on("newUser", function (data) {
            participants.push({id: data.id, instrument: data.instrument});
            io.to('music-jam').emit("newConnection", {id: data.id, instrument: data.instrument});
        });

        /*
         When a client disconnects from the server, the event "disconnect" is automatically
         captured by the server. It will then emit an event called "userDisconnected" to
         all participants with the id of the client that disconnected
         */
        socket.on("disconnect", function () {
            socket.leave('music-jam');
            var participant =  _.findWhere(participants, {id: socket.id});
            participants = _.without(participants, participant);
            io.to('music-jam').emit("userDisconnected", {id: socket.id, instrument: participant.instrument, sender: "system"});
        });
    }
    else {
        socket.disconnect();
    }


});

//Start the http server at port and IP defined before
http.listen(process.env.PORT || 8080);
