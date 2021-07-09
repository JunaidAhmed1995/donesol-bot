require("dotenv").config();
import request from "request";

//setup the environment variables
const MY_VERIFY_TOKEN = process.env.MY_VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

//function for get-started and persistant Menu
let getInitialSetup = () => {
  return new Promise((resolve, reject) => {
    try {
      let url = `https://graph.facebook.com/v11.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`;
      //construct the message body
      let request_body = {
        get_started: {
          payload: "GET_STARTED_PAYLOAD",
        },
        persistent_menu: [
          {
            locale: "default",
            composer_input_disabled: false,
            call_to_actions: [
              {
                type: "web_url",
                title: "Visit Me",
                url: "https://www.google.com/",
                webview_height_ratio: "full",
              },
              {
                type: "web_url",
                title: "Shop Now",
                url: "https://www.google.com/",
                webview_height_ratio: "full",
              },
            ],
          },
        ],
      };

      // Send the HTTP request to the Messenger Platform
      request(
        {
          uri: url,
          method: "GET",
          json: request_body,
        },
        (err, response, body) => {
          if (!err) {
            resolve("setup successfully!");
          } else {
            reject(
              "Unable to setup get-started button and persistent menu:" + err
            );
          }
        }
      );
    } catch (e) {
      reject(e);
    }
  });
};

//for getting facebook username
let getFacebookUsername = (sender_psid) => {
  return new Promise((resolve, reject) => {
    try {
      let url = `https://graph.facebook.com/${sender_psid}?fields=first_name,last_name,profile_pic&access_token=${PAGE_ACCESS_TOKEN}`;
      // Send the HTTP request to the Messenger Platform
      request(
        {
          uri: url,
          method: "GET",
        },
        (err, response, body) => {
          if (!err) {
            //convert string [body] to json object here
            body = JSON.parse(body);
            let username = `${body.first_name} ${body.last_name}`;
            resolve(username);
          } else {
            reject("Unable to get username from FB Profile" + err);
          }
        }
      );
    } catch (e) {
      reject(e);
    }
  });
};

//show typing animation
let showTypingAnimation = (sender_psid) => {
  return new Promise((resolve, reject) => {
    try {
      //construct the message body
      let request_body = {
        recipient: {
          id: sender_psid,
        },
        sender_action: "typing_on",
      };

      let url = `https://graph.facebook.com/v7.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;
      // Send the HTTP request to the Messenger Platform
      request(
        {
          uri: url,
          method: "POST",
          json: request_body,
        },
        (err, response, body) => {
          if (!err) {
            resolve("Animation is Showing!");
          } else {
            reject("Unable to show typing Animation" + err);
          }
        }
      );
    } catch (e) {
      reject(e);
    }
  });
};

//marked the message seen during chat
let markedMessageAsSeen = (sender_psid) => {
  return new Promise((resolve, reject) => {
    try {
      //construct the message body
      let request_body = {
        recipient: {
          id: sender_psid,
        },
        sender_action: "mark_seen",
      };

      let url = `https://graph.facebook.com/v7.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;
      // Send the HTTP request to the Messenger Platform
      request(
        {
          uri: url,
          method: "POST",
          json: request_body,
        },
        (err, response, body) => {
          if (!err) {
            resolve("Message is marked as Seen!");
          } else {
            reject("Unable to marked message as seen" + err);
          }
        }
      );
    } catch (e) {
      reject(e);
    }
  });
};

// Sends response messages to user via the Send API
let callSendAPI = (sender_psid, response) => {
  return new Promise(async (resolve, reject) => {
    try {
      //for marked message as seen
      await markedMessageAsSeen(sender_psid);

      //for show typing animation
      await showTypingAnimation(sender_psid);

      // Construct the message body
      let request_body = {
        recipient: {
          id: sender_psid,
        },
        message: response,
      };

      // Send the HTTP request to the Messenger Platform
      request(
        {
          uri: "https://graph.facebook.com/v7.0/me/messages",
          qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
          method: "POST",
          json: request_body,
        },
        (err, res, body) => {
          if (!err) {
            resolve("message sent!");
          } else {
            reject("Unable to send message:" + err);
          }
        }
      );
    } catch (e) {
      reject(e);
    }
  });
};

//welcome new user who started with Get-Started button
let welcomeNewUser = (sender_psid) => {
  return new Promise(async (resolve, reject) => {
    try {
      let username = await getFacebookUsername(sender_psid);

      //multiple responses against Get-Started Button
      let response1 = { text: `Hi, ${username}! Welcome to Donesol-bot` };
      let response2 = {
        attachment: {
          type: "image",
          payload: {
            url: "http://www.messenger-rocks.com/image.jpg",
          },
        },
      };
      let response3 = {
        text: "How May I Help You?",
        quick_replies: [
          {
            content_type: "text",
            title: "Categories",
            payload: "CATEGORIES_PAYLOAD",
          },
          {
            content_type: "text",
            title: "Lookup Order",
            payload: "LOOKUP_ORDER_PAYLOAD>",
          },
          {
            content_type: "text",
            title: "Talk to an Agent",
            payload: "TALK_AGENT_PAYLOAD",
          },
        ],
      };

      await callSendAPI(sender_psid, response1);
      await callSendAPI(sender_psid, response1);
      await callSendAPI(sender_psid, response3);
      resolve("All Responses are send to CallSendAPI");
    } catch (e) {
      reject(e);
    }
  });
};

//now exporting functions as a object [property: value]
module.exports = {
  getInitialSetup: getInitialSetup,
  getFacebookUsername: getFacebookUsername,
  showTypingAnimation: showTypingAnimation,
  markedMessageAsSeen: markedMessageAsSeen,
  callSendAPI: callSendAPI,
  welcomeNewUser: welcomeNewUser,
};