# Chatist

🐱 A chat system built with [Nest.js](https://nestjs.com/)

> Documentation is still being worked on, if you find any issue or questions you can reach me out at [sergio@mipigu.com](mailto:sergio@mipigu.com) 👋

## Demo

A working demo can be seen here: https://mipigu.com (click on "Say hello")

## Getting Started

To have a completely working project you only need to complete two steps: setup your own Telegram integration and deploy the project.

> Disclaimer: Explanation is easy to follow and altough it may seem quite some steps long, I can admit you will learn a lot in the process, because as explained here you are following the exact same steps other developers need to follow to setup their integrations, so you may expect no abstraction at all, but an unique opportunity to learn new things!

Let's start with the Telegram integration by creating our own bot and bootstrap the chat room we'll use later on to connect to Chatist.

### Create and setup your bot

1. Login or create Telegram account, and open Telegram app

2. Follow this link to add BotFather: https://telegram.me/BotFather

3. Inside the BotFather conversation, click start

4. We'll now create a new bot, write /newbot

5. Write your bot name, this could be whatever you like, for example ChatBot

6. Write your bot username, this name needs to be available and must end in "bot"

7. Your bot has been created, BotFather will return you a token, it is very important as we'll need it later on to setup the chatbox.

### Create the chat room

1. Start a conversation with your newly created bot, you can search for it via the username in the global search, or just follow this link t.me/your_bot_username, where you need to replace "your_bot_username" with your actual bot username.

2. Click start, and write /setup

3. From your browser, visit this link: https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates, you must replace <YOUR_BOT_TOKEN> with your actual bot token from Step 1, an example of how the link should be is lik the following: https://api.telegram.org/bot925151832:AEEFGlaRhlvj2adppRvchbFps4sdQ0NeA_t/getUpdates

4. You will receive a response like the following, find your chat id and write it down for later use.

```js
{
  "ok":true,
  "result": [
    {
      "update_id": 920130777,
      "message": {
        "message_id": 2,
        "from": {
          "id": 523419118,
          "is_bot": false,
          "first_name": "Sergio",
          "last_name": "M\u00e1rquez",
          "username": "undervane",
          "language_code": "en"
          },
        "chat": {
          "id": 523419118, // <-- We are interested in this number
          "first_name": "Sergio",
          "last_name": "M\u00e1rquez",
          "username": "undervane",
          "type": "private"
          },
        "date": 1568202859,
        "text": "f"
      }
    }
  ]
}
```

We have now finished with the Telegram setup and we can start setting up the integration with Chatist. Keep your bot token and chat id near you because we'll use them shortly.

### Setup your project for deployment

Now it's time to choose an option for deployment, you should consider that you'll need to provide your own SSL certificate because Telegram integration needs a secured endpoint to setup a webhook.

You can use Firecamp (from here: https://firecamp.app/) to simulate a client for your Chatist distribution.

> Documentation to simulate with Firecamp and manual deployment is currently in progress
