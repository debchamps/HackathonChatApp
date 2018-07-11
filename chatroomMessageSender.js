var app = require('express')();
var http = require('http').Server(app);
var ios = require('socket.io')(http);
/*
app.get('/', function(req, res){
  	res.sendFile(__dirname + '/index.html');
 });


var sendMessage = function(msg, delayInMillis = 0) {
  setTimeout(
     function() {
       console.log("Senfing message from new moduke" + msg);
       ios.emit('chat message', "<strong>" + "ChatBot"  + "</strong>  : " + msg);
  }
  , delayInMillis);
}



module.exports.sendMessage = sendMessage;
*/
