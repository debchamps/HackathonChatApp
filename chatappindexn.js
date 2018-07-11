var cookieParser = require("cookie-parser");
var session = require("express-session");

var app = require("express")();

var http = require("http").Server(app);
var ios = require("socket.io")(http);

var chatRoomMessageSender = require("./chatroomMessageSender.js");
const customerInputHandler = require("./customerInputHandler.js");
var users = {};
var OPTIONS = new Array(26).fill(1).map((_, i) => String.fromCharCode(65 + i));
var MAX_OPTIONS = 5;

const inventoryReader = require("./search.js");
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

var users = {};
var InventoryListing = inventoryReader.InventoryListing;

exports.handler = function(event, context, callback) {};

ios.on("connection", function(socket) {
  console.log("a user connected");
  socket.on("chat message", function(msg) {
    console.log("XXXXXXXX" + msg);
    ios.emit(
      "chat message",
      "<strong>" + users[socket.id] + "</strong>  : " + msg
    );

    customerInputHandler.handleCustomerMessage(users[socket.id], msg, function(
      data
    ) {
      ios.emit(
        "chat message",
        "<strong>" + "ChatBot" + "</strong>  : " + data + "</br>"
      );
    });
  });

  socket.on("disconnect", function() {
    console.log("user disconnected");
  });

  socket.on("join", function(name) {
    users[socket.id] = name;
  });
});

http.listen(process.env.PORT || 5000, function() {
  console.log("listening on *:5000");
});
