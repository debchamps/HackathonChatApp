var OPTIONS = new Array(26).fill(1).map((_, i) => String.fromCharCode(65 + i));
var intersection = require("array-intersection");
const choiceHandler = require("./Choice.js");
const cartHandler = require("./cart.js");
const util = require("util");
const chatRoomMessageSender = require("./chatroomMessageSender.js");
var welocomeKeys = ["hi", "hello", "hi amazon"];
var addItemKeys = ["add "];
var removeItemKeys = ["remove ", "delete "];
var viewCartItemKeys = [
  "view cart",
  "show cart",
  "display cart",
  "view",
  "display",
  "cart"
];
var commonWords = ["please", "can you"];
var Tesseract = require("tesseract.js");
var InventoryListing = [];

const inventoryReader = require("./search.js");

var handleCustomerMessage = function(customerId, custRequest, callback) {
  //TODO: THIS IS HACK// Create crat in appropiate place.
  cartHandler.createCart(customerId);

  console.log("IN categorizeRequest" + customerId);
  if (OPTIONS.includes(custRequest)) {
    console.log("Execution of executeOption");
    choiceHandler.executeOption(customerId, custRequest, function(
      customerReply
    ) {
      callback(customerReply);
    });
    return;
  }

  var custRequest = custRequest.toLowerCase();
  var terms = custRequest.split(" ");

  for (value of addItemKeys) {
    if (custRequest.includes(value)) {
      console.log("Request is a addItemKeys");
      return "ADD";
    }
  }

  for (value of removeItemKeys) {
    if (custRequest.includes(value)) {
      console.log("Request is a removeItemKeys");
      return "REMOVE";
    }
  }

  cartHandler.getLatestCustomerCart(customerId, function(cart) {
    if (cart != null) {
      var cartId = cart.cartId;
      var numOfItems = Object.keys(cart.itemQuantityMap).length;
      console.log("XXXXX numOfItems", numOfItems);
    }
  });

  //Get current choice and see if it is live. If it is live execute the options.
  var searchResult = inventoryReader.searchInventory(custRequest);
  console.log(
    "SearchResault is " +
      util.inspect(searchResult, { showHidden: false, depth: null })
  );

  var addItemChoice = choiceHandler.createChoiceOnSearchSuggestion(
    customerId,
    searchResult,
    function(addItemChoice) {
      console.log(
        "addItemChoice is " +
          util.inspect(addItemChoice, { showHidden: false, depth: null })
      );
      choiceHandler.persistChoice(addItemChoice, function(addItemChoice) {
        var choiceMessage = choiceHandler.getDisplayChoice(addItemChoice);
        console.log("choiceMessage is " + choiceMessage);
        callback(choiceMessage);
      });
    }
  );

  removeItemKeys.forEach(function(value) {
    if (custRequest.includes(value)) {
      console.log("Request is a removeItemKeys");
      return "REMOVE";
    }
  });

  return "DEFAULT";
};

module.exports.handleCustomerMessage = handleCustomerMessage;
