const cart = require('./cart.js');
const search = require('./search.js');



var placeOrder = function(orderedCart, callBack) {
  var orderId = "401-" + Math.floor(100000 + Math.random() * 900000) + "-"  + Math.floor(100000 + Math.random() * 900000);
    var cartItems = orderedCart.itemQuantityMap;

    cart.deleteCart(orderedCart.cartId);
    var orderMessage = "Congrats your order: " + orderId + " is placed \n"
      + cartItemMessage(cartItems);
    callBack(orderMessage);


    setTimeout(function() {
      callBack(" Your order with " + orderId + " is out for delivery");
    },60* 1000);
  }




  function cartItemMessage(cartItems) {
    var itemMessages =  "\nYour ordered\n";
    for(var asin in cartItems) {
      console.log("asin XXXXXX " + asin);
      var itemName = search.getInventoryByAsin(asin).itemName;
      var itemPrice = search.getInventoryByAsin(asin).price;
      itemMessages = itemMessages + itemName + ",    Price: " + itemPrice +   "\n\n";

    }
    return itemMessages;
  }

  //Clear the cart

  //set the order status to PLACED

  //set a notification for order starting fulfillment (HACK)





module.exports.placeOrder = placeOrder;
