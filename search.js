//1.
var csv = require("csv");
var intersection = require("array-intersection");
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
const util = require("util");
var InventoryListing = [];
var InventoryMap = {};
var COMPLETE_MATCH_THRESHOLD = 0.8;
var PARTIAL_MATCH_THRESHOLD = 0.5;

loadInventory();
//2.
//3.
function Inventory(asin, itemName, price, quantity) {
  this.asin = asin.trim();
  this.itemName = itemName.toLowerCase().trim();
  this.price = price.trim();
  this.quantity = quantity;
}

function SearchInventoryResult(completeMatches, partialMatches) {
  this.completeMatches = completeMatches;
  this.partialMatches = partialMatches;
}
//4.

var categorizeRequest = function(custRequest) {
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

  //Get current choice and see if it is live. If it is live execute the options.

  removeItemKeys.forEach(function(value) {
    if (custRequest.includes(value)) {
      console.log("Request is a removeItemKeys");
      return "REMOVE";
    }
  });

  return "DEFAULT";
};

function intersect(array1, array2) {
  var intersectArray = [];
  j = 0;
  for (var i = 0; i < array1.length; ++i)
    if (array2.indexOf(array1[i]) != -1) intersectArray[j++] = array1[i];
  return intersectArray;
}

var searchInventory = function(query) {
  var completeMatches = [];
  var partialMatches = [];
  var completeMatchIndex = 0;
  var partialMatchIndex = 0;

  query = query.toLowerCase().trim();
  console.log("In searchInventory " + query);
  var queryTerms = query.split(" ");
  for (var index = 0; index < InventoryListing.length; index++) {
    var itemDesc = InventoryListing[index].itemName;
    //console.log(itemDesc);
    var itemTerms = itemDesc.split(" ");
    var commonItems = intersect(itemTerms, queryTerms);
    //console.log("itemTerms" + itemTerms + " queryTerms" + queryTerms);
    var matchRation = commonItems.length / queryTerms.length;
    if (matchRation > COMPLETE_MATCH_THRESHOLD) {
      completeMatches[completeMatchIndex] = InventoryListing[index];
      console.log(
        "commonItems: " +
          commonItems +
          " , matchRation " +
          matchRation +
          " Item : " +
          itemDesc
      );
      completeMatchIndex = completeMatchIndex + 1;
    }
    if (matchRation >= PARTIAL_MATCH_THRESHOLD) {
      partialMatches[partialMatchIndex] = InventoryListing[index];
      partialMatchIndex = partialMatchIndex + 1;
    }
  }

  completeMatches.sort(function(a, b) {
    // ASC  -> a.length - b.length
    // DESC -> b.length - a.length
    return a.itemName.length - b.itemName.length;
  });

  partialMatches.sort(function(a, b) {
    // ASC  -> a.length - b.length
    // DESC -> b.length - a.length
    return a.itemName.length - b.itemName.length;
  });

  return new SearchInventoryResult(completeMatches, partialMatches);
  //Returns either single match //Or list of matches //Or no match.
};

function wordMatch(searchTerm, inventory) {}
function loadInventory() {
  var obj = csv();

  obj.from.path("./inventory.csv").to.array(function(data) {
    for (var index = 0; index < data.length; index++) {
      var inventory = new Inventory(
        data[index][0],
        data[index][1],
        data[index][2],
        1
      );
      InventoryListing.push(inventory);
      InventoryMap[inventory.asin] = inventory;
    }
    console.log(
      "Loaded inventory completely of size " + InventoryListing.length
    );
  });
}

var getInventoryByAsin = function(asin) {
  console.log("Asin is " + asin);
  return InventoryMap[asin];
};

exports.categorizeRequest = categorizeRequest;
exports.searchInventory = searchInventory;
exports.getInventoryByAsin = getInventoryByAsin;
