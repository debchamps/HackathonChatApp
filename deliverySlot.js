var OPTIONS = new Array( 26 ).fill( 1 ).map( ( _, i ) => String.fromCharCode( 65 + i ) );
const option = require('./option.js');
const uuid = require('uuid');
var rushEnabled = 1;
var showMaxSlots = 6;
var rushCost = "49 ₹";
var scheduleCost = "29 ₹";
var scheduledSlotStartTime = [10, 12, 14, 16, 18, 20];

var slotDisplayMap = {
  "10": "10:00 - 12:00 PM",
  "12": "12:00 - 2:00 PM",
  "14": "2:00 - 4:00 PM",
  "16": "4:00 - 6:00 PM",
  "18": "6:00 - 8:00 PM",
  "20": "8:00 - 10:00 PM"
};

function DeliverySlot(slotId, slotType, slotStartTime, slotEndTime, displayMessage) {
  this.slotId = slotId;
  this.slotStartTime = slotStartTime;
  this.displayMessage = displayMessage;
  this.slotEndTime = slotEndTime;
  this.slotType = slotType;
}

 var fetchDeliverySlots  = function () {

      var slotMessages = [];
      var rushSlot = getRushSlot();

      allDeliverySlots = [];
      allDeliverySlots.push(rushSlot);
      var currentDate = new Date();

      var todaysSlots = getTodaysScheduledSlots();
      for(var i = 0; i < todaysSlots.length ; i++ ) {
        var ds =  new DeliverySlot(uuid.v1(), "SCHEDULED", currentDate.getTime(), currentDate.getTime() + 2 * 60 * 60 * 1000, "Today  " + slotDisplayMap[todaysSlots[i]]);
        allDeliverySlots.push(ds);
      }

      var tomorrowsSlots = [];
      if(todaysSlots.length < 5) {
          tomorrowsSlots = getTomorrowsSlots(showMaxSlots - slotMessages.length);
          for(var i = 0; i < tomorrowsSlots.length ; i++ ) {
            var ds =  new DeliverySlot(uuid.v1(), "SCHEDULED", currentDate.getTime(), currentDate.getTime() + 2 * 60 * 60 * 1000, "Tomorrow  " + slotDisplayMap[tomorrowsSlots[i]]);
            allDeliverySlots.push(ds);
          }
      }

      return allDeliverySlots;

}




 function getRushSlot() {
  var currentDate = new Date();
  var currentHours = currentDate.getHours();
  var currentMinutes = currentDate.getHours();
  var deliverSlotEndHour = (currentHours + 2) % 24;
  var timeType = "AM";
  if(deliverSlotEndHour >=12) {
    timeType = "PM";
  }
  if(deliverSlotEndHour >= 13 ) {
    deliverSlotEndHour = deliverSlotEndHour - 12;
  }

  return new DeliverySlot(uuid.v1(), "RUSH", currentDate.getTime(), currentDate.getTime() + 2 * 60 * 60 * 1000, "Get it by " + deliverSlotEndHour + ":" + currentMinutes + " " + timeType)
}

function getTomorrowsSlots(numSlot) {
  var tomorrowsSlots = [];
  var currentDate = new Date();
  //TODO: FIX the start time end time of schedeuled slots
  for(var i = 0; i < numSlot; i++ ) {


    tomorrowsSlots.push(scheduledSlotStartTime[i]);
  }
  return tomorrowsSlots;

}

 function getTodaysScheduledSlots() {
  var currentDate = new Date();
  var currentHours = currentDate.getHours();
  var todaysSlots = [];
  for(var i = 0; i < scheduledSlotStartTime.length; i++ ) {
    if(scheduledSlotStartTime[i] > 1 + currentHours) {
      todaysSlots.push(scheduledSlotStartTime[i]);
    }
  }
  return todaysSlots;
}

exports.fetchDeliverySlots = fetchDeliverySlots;
