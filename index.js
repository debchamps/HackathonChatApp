var cookieParser = require("cookie-parser");
var session = require("express-session");

var app = require("express")();

var http = require("http").Server(app);
var ios = require("socket.io")(http);
var chatRoomMessageSender = require("./chatroomMessageSender.js");
//var slack = require("./slack.js");
//var slackNew = require("./slackNew.js");

const bodyParser = require('body-parser');
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse requests of content-type - application/json
app.use(bodyParser.json())

var request = require("request");


const customerInputHandler = require("./customerInputHandler.js");
const customerGreetingController = require("./greetingController");

var users = {};
var OPTIONS = new Array(26).fill(1).map((_, i) => String.fromCharCode(65 + i));
var MAX_OPTIONS = 5;

const inventoryReader = require("./search.js");
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

var users = {};
var InventoryListing = inventoryReader.InventoryListing;

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
        "<strong>" + "ChatBot" + "</strong>  : " + data + "</br></br>"
      );
    });
  });

  socket.on("disconnect", function() {
    console.log("user disconnected");
  });

  socket.on("join", function(name) {
    users[socket.id] = name;

    // Greet customer
    customerGreetingController.greetCustomer(name, function (greetingMessage) {
      ios.emit("chat message", greetingMessage);
    });
  });
});
http.listen(process.env.PORT || 5000, function() {
  console.log("listening on *:5000");
});

exports.handler = function index(event, context, callback) {
  //some code
};

app.post('/message', (req, res) => {
  var text = req.body.message.text;
  var name = req.body.message.chat.first_name;
  var chatId = req.body.message.chat.id;
  console.log("received "+text+" from "+name+" chatID "+chatId);
  customerInputHandler.handleCustomerMessage(name, text, function(
    data
  ) {
    request.post({
      "headers": { "content-type": "application/json" },
      "url": "https://api.telegram.org/bot599130393:AAG6lkd-AYSZFCraUI531n1sbmkgBoKJFG8/sendMessage",
      "body": JSON.stringify({
        "chat_id":chatId,
        "text":data,
        "parse_mode":"html"
      })
  }, (error, response, body) => {
      if(error) {
          return console.dir(error);
      }
      console.dir(JSON.parse(body));
  });
  });
  
  
  res.json({"message": "Welcome to EasyNotes application. Take notes quickly. Organize and keep track of all your notes."});
  
});
