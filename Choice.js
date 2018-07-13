var uuid = require("uuid");
const option = require("./option.js");
const util = require("util");
var CHOICE_TABLE = "Choices";
var OPTIONS = new Array(26).fill(1).map((_, i) => String.fromCharCode(65 + i));
var AWS = require("aws-sdk");
const keys = require("./config/key.js");
const dynamoConfig = require("./dynamoConfig.js");
const cart = require("./cart.js");
const choiceHandler = require("./Choice.js");
const search = require("./search.js");
const order = require("./order.js");
const deliverySlot = require("./deliverySlot.js");
var chatRoomMessageSender = require("./chatroomMessageSender.js");
var MAX_CHOICES = 6;

dynamoConfig.loadDynamo();

var docClient = new AWS.DynamoDB.DocumentClient();

function Choice(optionList, customerId, choiceType, choiceHeader) {
  this.choiceId = uuid.v1();
  this.customerId = customerId;
  this.choiceType = choiceType;
  this.choiceStatus = "CREATED";
  this.choiceCreationTime = new Date().getTime();
  this.optionList = optionList;
  this.choiceHeader = choiceHeader;
}

function getOptionByOptionKey(choice, optionKey) {
  for (var i = 0; i < choice.optionList.length; i++) {
    if (choice.optionList[i].optionKey == optionKey) {
      return choice.optionList[i];
    }
  }
}

function Option(
  optionId,
  optionKey,
  optionType,
  optionDescription,
  optionMetadata
) {
  this.optionId = optionId;
  this.optionKey = optionKey;
  this.optionType = optionType;
  this.optionDescription = optionDescription;
  this.optionMetadata = optionMetadata;
}

var createDeliverySlotChoice = function(customerId) {
  var allDeliverySlots = deliverySlot.fetchDeliverySlots();
  var deliverySlotOptions = [];
  for (var i = 0; i < allDeliverySlots.length; i++) {
    var ds = allDeliverySlots[i];
    deliverySlotOptions.push(
      new Option(
        ds.slotId,
        OPTIONS[i],
        "SELECT_DELIVERY_SLOT",
        ds.displayMessage,
        ds
      )
    );
  }
  var deliverySlotChoice = new Choice(
    deliverySlotOptions,
    customerId,
    "SELECT_DELIVERY_SLOT",
    "Select one of the delivery slot."
  );
  return deliverySlotChoice;
};

function defaultMenu(cartEmpty) {
  var addToCartOption = new Option(
    uuid.v1(),
    "A",
    "VIEW_CART",
    " See current cart",
    {}
  );
  var deliverySlotOption = new Option(
    uuid.v1(),
    "B",
    "SHOW_DELIVERY_SLOT",
    "Move to deliverySlot to place order",
    {}
  );
  if (cartEmpty) {
    return [addToCartOption, deliverySlotOption];
  } else {
    return [addToCartOption, deliverySlotOption];
  }
  return defaultMenus;
}

function appendDefaultOptions(optionList, isCartEmpty) {
  var defaultMenus = defaultMenu(isCartEmpty);
  var size = optionList.length;
  var allOptions = optionList;
  for (var i = 0; i < defaultMenus.length; i++) {
    defaultMenus[i].optionKey = OPTIONS[size + i];
    allOptions.push(defaultMenus[i]);
  }
  return allOptions;
}

function ItemAddOptionMetadata(cartId, asin, quantity) {
  this.cartId = cartId;
  this.asin = asin;
  this.quantity = quantity;
}

function searchReply(searchResult) {
  if (searchResult.completeMatches.length == 1) {
    return (
      "Item " +
      searchResult.completeMatches[0].itemName +
      " added to cart" +
      " Price : " +
      searchResult.completeMatches[0].price
    );
  }

  if (
    searchResult.completeMatches.length == 0 &&
    searchResult.partialMatches.length == 0
  ) {
    return "No item avalaible";
  }

  var showSearchOptionToCustomer = [];
  if (searchResult.completeMatches.length > 0) {
    showSearchOptionToCustomer = searchResult.completeMatches;
  } else {
    showSearchOptionToCustomer = searchResult.partialMatches;
  }

  showSearchOptionToCustomer = showSearchOptionToCustomer.slice(
    0,
    Math.min(MAX_CHOICES + 1, showSearchOptionToCustomer.length)
  );

  var response = "";
  for (var i = 0; i < showSearchOptionToCustomer.length; i++) {
    response =
      response +
      "\n" +
      OPTIONS[i] +
      ".   " +
      showSearchOptionToCustomer[i].itemName +
      "  price: " +
      showSearchOptionToCustomer[i].price;
  }

  return response;
}

function persistChoice(choice, callback) {
  console.log("Persisting chpoice" + choice);

  var params = {
    TableName: "Choices",
    Item: choice
  };

  docClient.put(params, function(err, data) {
    if (err) {
      console.error(
        "Unable to add item." +
          util.inspect(params.Item, { showHidden: false, depth: null }) +
          " Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      console.log("Added item:", JSON.stringify(data, null, 2));
      callback(choice);
    }
  });
}

var createChoiceOnSearchSuggestion = function(
  customerId,
  searchResult,
  callback
) {
  var header = "";
  var optionIndex = 0;
  if (
    searchResult.completeMatches.length == 0 &&
    searchResult.partialMatches.length == 0
  ) {
    var header = "No item avalaible";
  }

  cart.getLatestCustomerCart(customerId, function(currentCart) {
    var showSearchOptionToCustomer = [];
    if (searchResult.completeMatches.length > 0) {
      showSearchOptionToCustomer = searchResult.completeMatches;
    } else {
      showSearchOptionToCustomer = searchResult.partialMatches;
    }
    showSearchOptionToCustomer = showSearchOptionToCustomer.slice(
      0,
      Math.min(MAX_CHOICES + 1, showSearchOptionToCustomer.length)
    );

    optionList = [];
    for (var i = 0; i < showSearchOptionToCustomer.length; i++) {
      var displayString =
        "Add " +
        showSearchOptionToCustomer[i].itemName +
        " to cart. Price " +
        showSearchOptionToCustomer[i].price;
      optionList.push(
        new Option(
          uuid.v1(),
          OPTIONS[optionIndex++],
          "CART_ADD",
          displayString,
          new ItemAddOptionMetadata(
            "cart",
            showSearchOptionToCustomer[i].asin,
            1
          )
        )
      );
    }
    var allOptions = optionList;
    console.log("currentCart" + currentCart);
    var isCartEmpty = false;
    if (
      currentCart == null ||
      Object.keys(currentCart.itemQuantityMap).length == 0
    ) {
      isCartEmpty = true;
    }
    console.log("XXXX isCartEmpty", isCartEmpty);

    allOptions = appendDefaultOptions(optionList, isCartEmpty);
    var choice = new Choice(allOptions, customerId, "CART_ADD");
    callback(choice);
  });

  //Now persist choice and then send it across to the user.
};

var getDisplayChoice = function(choice) {
  var optionKeyValues = [];
  for (var i = 0; i < choice.optionList.length; i++) {
    optionKeyValues.push(
      choice.optionList[i].optionKey +
        ".  " +
        choice.optionList[i].optionDescription
    );
  }
  var displayString = "";
  if (!choice.choiceHeader) {
  } else {
    displayString = choice.choiceHeader + " \n\n";
  }
  displayString = displayString + optionKeyValues.join("\n\n");
  return displayString;
};

function getLatestCustomerChoice(customerId, callback) {
  var params = {
    TableName: "Choices",
    IndexName: "CustomerIndex",

    KeyConditionExpression: "#customerId = :customerId",
    ExpressionAttributeNames: {
      "#customerId": "customerId"
    },
    ScanIndexForward: false,
    Limit: 1,
    ExpressionAttributeValues: {
      ":customerId": customerId
    }
  };

  docClient.query(params, function(err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      console.log("Query succeeded.");
      data.Items.forEach(function(item) {
        console.log(
          " getLatestCustomerChoice :  " +
            util.inspect(item, { showHidden: false, depth: null })
        );
        callback(item);
      });
    }
  });
}

function getDefaultOptionsUsingPreviousChoice(choice) {
  return "Add more items or Proceed to Select Delivery Slot";
}

function executeOption(customerId, optionValue, callback) {
  //Get the latest option for the customer Id

  console.log("In execute function with " + optionValue);
  getLatestCustomerChoice(customerId, function(choice) {
    if (choice == null) {
      console.log("Choice is null in executeOption. Returning");
      return;
    }
    var selectedOption = getOptionByOptionKey(choice, optionValue);
    if (!selectedOption) {
      console.log("Invalid choice selected");

      var newChoice = new Choice(
        choice.optionList,
        choice.customerId,
        choice.choiceType,
        "Invalid Option Selected. Select again."
      );
      createAndNotifyChoice(newChoice, callback);
      return;
      //Invalid selection. Ask customer about the choice again.
    }
    console.log("SelectedOption" + selectedOption);
    var choiceType = choice.choiceType;
    if (choiceType == "CART_ADD") {
      if (selectedOption == "undefined") {
        //RANDOM ANS GIVEN
      } else {
        if (selectedOption.optionType == "CART_ADD") {
          //Get the metadata and add to cart.

          var cartId = selectedOption.optionMetadata.cartId;
          var asin = selectedOption.optionMetadata.asin;
          var asinQuantityMap = {};
          asinQuantityMap[asin] = 1;
          cart.getLatestCustomerCart(customerId, function(currentCart) {
            cart.addItemsToCart(currentCart.cartId, asinQuantityMap);
          });
          var inv = search.getInventoryByAsin(asin);
          
          // fetch view cart and move delivery slot option.
          var defaultOptionsWhenItemAdded = getDefaultOptionsUsingPreviousChoice(choice);
          console.log("Item " + inv.itemName + " added to cart.\n" + defaultOptionsWhenItemAdded);
          callback("Item " + inv.itemName + " added to cart.\n\n" + defaultOptionsWhenItemAdded + "\n\n");
        } else if (selectedOption.optionType == "SHOW_DELIVERY_SLOT") {
          //show delivery sliot
          cart.getLatestCustomerCart(customerId, function(currentCart) {
            //If cart is empty show cart empty message.
            if (
              currentCart == null ||
              currentCart.asinQuantityMap ||
              Object.keys(currentCart.itemQuantityMap).length == 0
            ) {
              callback("\nCart is currently empty. Fill the Cart.\n\n");
            } else {
              var deliverySlotChoice = createDeliverySlotChoice(customerId);
              createAndNotifyChoice(deliverySlotChoice, callback);
            }
          });
        } else if (selectedOption.optionType == "VIEW_CART") {
          viewCartAction(customerId, callback);
        }
      }
    } else if (choiceType == "SELECT_DELIVERY_SLOT") {
      if (selectedOption == "undefined") {
        //RANDOM ANS GIVEN
      } else {
        cart.getLatestCustomerCart(customerId, function(updatedCart) {
          console.log("Placing order for custoemr");
          order.placeOrder(updatedCart, callback);
        });
        //Get the selected delivery slot. //Update the order with the delivery
        // Just place the orde for now with the delivery slot. (Ask for confirmation next stage)
      }
    }
  });
}

function viewCartAction(customerId, callback) {
  cart.getLatestCustomerCart(customerId, function(currentCart) {
    callback(cart.displayCart(currentCart));
  });
}

function createAndNotifyChoice(choice, callback) {
  choiceHandler.persistChoice(choice, function(choice) {
    var choiceMessage = choiceHandler.getDisplayChoice(choice);
    console.log("choice is " + choiceMessage);
    callback(choiceMessage);
  });
}

module.exports.createChoiceOnSearchSuggestion = createChoiceOnSearchSuggestion;
module.exports.getDisplayChoice = getDisplayChoice;
module.exports.persistChoice = persistChoice;
module.exports.executeOption = executeOption;
module.exports.createDeliverySlotChoice = createDeliverySlotChoice;
