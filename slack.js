const { RTMClient } = require("@slack/client");

// An access token (from your Slack app or custom integration - usually xoxb)
//const token = process.env.SLACK_TOKEN;
const bot_token = "xoxb-377470021462-383198135281-MVUbFLxgk0tOSZqhfIXF5Sbr";

// The client is initialized and then started to get an active connection to the platform
const rtm = new RTMClient(bot_token);
rtm.start();

// This argument can be a channel ID, a DM ID, a MPDM ID, or a group ID
// See the "Combining with the WebClient" topic below for an example of how to get this ID
const conversationId = "C1232456";
const customerInputHandler = require("./customerInputHandler.js");

// The RTM client can send simple string messages
rtm.on("message", event => {
  // For structure of `event`, see https://api.slack.com/events/message

  console.log(event);
  // Skip messages that are from a bot or my own user ID
  /*
  if (
    (message.subtype && message.subtype === "bot_message") ||
    (!message.subtype && message.user === rtm.activeUserId)
  ) {
    return;
  }*/

  customerInputHandler.handleCustomerMessage(event.user, event.text, function(
    data
  ) {
    rtm
      .sendMessage(data, event.channel)
      .then(res => {
        // `res` contains information about the posted message
        console.log("Message sent: ", res.ts);
      })
      .catch(console.error);
  });

  /*
  // Log the message
  console.log(
    `(channel:${message.channel}) ${message.user} says: ${message.text}`
  );
  */
});
