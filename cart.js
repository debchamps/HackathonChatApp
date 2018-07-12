var uuid = require("uuid");
const util = require("util");
const search = require("./search.js");
var CART_TABLE = "Carts";
var AWS = require("aws-sdk");
const dynamoConfig = require("./dynamoConfig.js");

dynamoConfig.loadDynamo();

var docClient = new AWS.DynamoDB.DocumentClient();

/*
var cart1 = createCart("newCustomer");
setTimeout(function() {
var cart2 =  createCart("newCustomer");

}, 10* 1000);
setTimeout(function() {
var cart3 =  createCart("newCustomer");

}, 20* 1000);

setTimeout(function() {
  var cart =  getLatestCustomerCart("newCustomer");
}, 2* 1000);

setTimeout(function() {
  var cart =  getLatestCustomerCart("newCustomer");
}, 12* 1000);

setTimeout(function() {
  var cart =  getLatestCustomerCart("newCustomer");
}, 22* 1000);

*/

function CartBase(customerId) {
  this.customerId = customerId;
  this.itemQuantityMap = {};
  this.cartCreationTime = new Date().getTime();
  this.cartId = uuid.v1();
  this.status = "LIVE";
}

function Cart(cartId, customerId, cartCreationTime, itemQuantityMap, status) {
  this.cartId = cartId;
  this.customerId = customerId;
  this.cartCreationTime = cartCreationTime;
  this.itemQuantityMap = itemQuantityMap;
  this.status = "LIVE";
}

var deleteCart = function(cartId) {
  getCart(cartId, function(cart) {
    console.log(
      "cart" + util.inspect(cart, { showHidden: false, depth: null })
    );
    cart.status = "DELETED";
    //cart.itemQuantityMap = {};
    saveCart(cart);
  });
};

var createCart = function(customerId) {
  console.log("In create cart for " + customerId);

  getLatestCustomerCart(customerId, function(existingCart) {
    console.log(
      "Existing cart is " +
        util.inspect(existingCart, { showHidden: false, depth: null })
    );
    if (existingCart != null && existingCart.status == "LIVE") {
      console.log("Customer already have a live cart " + customerId);
      return;
    } else {
      console.log("Creating new cart for customer" + customerId);
      var cart = new CartBase(customerId);
      saveCart(cart);
    }
  });
};

function addItemsToCart(cartId, itemQuantityToAddInCart) {
  getCart(cartId, function(cart) {
    console.log(
      "cart" + util.inspect(cart, { showHidden: false, depth: null })
    );
    var existingQuantityMap = cart.itemQuantityMap;

    if (typeof existingQuantityMap != "undefined") {
      for (item in itemQuantityToAddInCart) {
        if (item in existingQuantityMap) {
          console.log("existingQuantityMap1");
          existingQuantityMap[item] =
            existingQuantityMap[item] + itemQuantityToAddInCart[item];
        } else {
          console.log("existingQuantityMap2");
          existingQuantityMap[item] = itemQuantityToAddInCart[item];
        }
      }
    } else {
      console.log("existingQuantityMap3");
      existingQuantityMap = itemQuantityToAddInCart;
    }

    var updatedCart = new Cart(
      cartId,
      cart.customerId,
      cart.cartCreationTime,
      existingQuantityMap
    );
    saveCart(updatedCart);
  });
}

function removeItemFromCart(cartId, item, itemQuantityToRemoveFromCart) {
  getCart(cartId, function(cart) {
    console.log(
      "cart" + util.inspect(cart, { showHidden: false, depth: null })
    );
    var existingQuantityMap = cart.itemQuantityMap;

    if (typeof existingQuantityMap != "undefined") {
      for (item in itemQuantityToAddInCart) {
        if (item in existingQuantityMap) {
          console.log("existingQuantityMap1");
          existingQuantityMap[item] =
            existingQuantityMap[item] - itemQuantityToRemoveFromCart[item];
        } else {
          console.log("Item do not exist in cart. Should never happen");
        }
      }
    } else {
      console.log("existingQuantityMap3");
      console.log("Item do not exist in cart. Should never happen");
    }

    var updatedCart = new Cart(
      cartId,
      cart.customerId,
      cart.cartCreationTime,
      existingQuantityMap
    );
    saveCart(updatedCart);
  });
}

function saveCart(cart) {
  var params = {
    TableName: "Carts",
    Item: cart
  };

  docClient.put(params, function(err, data) {
    if (err) {
      console.error(
        "Unable to add item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      console.log("Added item:", JSON.stringify(data, null, 2));
    }
  });
}

function getLatestCustomerCart(customerId, callback) {
  console.log("In getLatestCustomerCart" + customerId);
  var params = {
    TableName: CART_TABLE,
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
  console.log("In getLatestCustomerCart2" + customerId);

  docClient.query(params, function(err, data) {
    console.log("Query result getLatestCustomerCart" + customerId);
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      console.log(
        "Query succeeded." +
          util.inspect(data, { showHidden: false, depth: null })
      );
      if (data.Items.length == 0) {
        callback(null);
      }
      data.Items.forEach(function(item) {
        console.log(
          " getLatestCustomerCart :  " +
            util.inspect(item, { showHidden: false, depth: null })
        );
        callback(item);
      });
    }
  });
}

var getCart = function(cartId, callback) {
  var params = {
    TableName: CART_TABLE,
    Key: {
      cartId: cartId
    }
  };
  docClient.get(params, function(err, data) {
    if (err) console.log(err);
    else callback(data.Item);
  });
};

var displayCart = function(currentCart) {
  var itemMessages = "\nCart\n";
  console.log("XXXXXX ", currentCart, "YYYYY");
  var isCartEmpty = true;
  for (asin in currentCart.itemQuantityMap) {
    isCartEmpty = false;
    var quantity = currentCart.itemQuantityMap[asin];
    //console.log(key + " = " + value);
    var itemName = search.getInventoryByAsin(asin).itemName;
    var itemPrice = search.getInventoryByAsin(asin).price;
    itemMessages =
      itemMessages +
      itemName +
      ",   Price: " +
      itemPrice +
      " Quantity: " +
      quantity +
      "\n\n";
  }
  if (isCartEmpty) {
    return "\nCart is currently empty. Fill the Cart.\n\n";
  }
  return itemMessages;
};

module.exports.getLatestCustomerCart = getLatestCustomerCart;
module.exports.getCart = getCart;
module.exports.addItemsToCart = addItemsToCart;
module.exports.createCart = createCart;
module.exports.deleteCart = deleteCart;
module.exports.displayCart = displayCart;
