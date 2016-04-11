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

/*
 The list of participants in our chatroom.
 The format of each participant will be:
 {
 id: "sessionId",
 name: "participantName"
 }
 */
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

//POST method to create a chat message
app.post("/band", function (request, response) {

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

/* Socket.IO events */
io.on("connection", function (socket) {
    socket.join('music-jam');

    /*
     When a new user connects to our server, we expect an event called "newUser"
     and then we'll emit an event called "newConnection" with a list of all
     participants to all connected clients
     */
    socket.on("newUser", function (data) {
        participants.push({id: data.id});
        io.to('music-jam').emit("newConnection", {participants: participants});
    });

    /*
     When a user changes his name, we are expecting an event called "nameChange"
     and then we'll emit an event called "nameChanged" to all participants with
     the id and new name of the user who emitted the original message
     */
    socket.on("nameChange", function (data) {
        _.findWhere(participants, {id: socket.id}).name = data.name;
        io.to('music-jam').emit("nameChanged", {id: data.id, name: data.name});
    });

    /*
     When a client disconnects from the server, the event "disconnect" is automatically
     captured by the server. It will then emit an event called "userDisconnected" to
     all participants with the id of the client that disconnected
     */
    socket.on("disconnect", function () {
        socket.leave('music-jam');
        participants = _.without(participants, _.findWhere(participants, {id: socket.id}));
        io.to('music-jam').emit("userDisconnected", {id: socket.id, sender: "system"});
    });

});

//Start the http server at port and IP defined before
http.listen(process.env.PORT || 8080);
