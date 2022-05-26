# Twitch Bot

Just another bot for Twitch.

This bot provides the following features:

- [Quiz](#quiz)

For each feature, a set of commands will be made available on a Twitch channel of your choosing.

The bot provides both a server (that handles all the logic) and a client (for the presentation). The client is optional and is only needed to be used as a browser source overlay on OBS.

## Features

The bot currently supports the following features.

### Quiz

The quiz functionality allows the host of channel to start random quizzes in the chat, and user will have to guess the answer.

For the time being, no points system has been implemented.

The quiz bot will randomly ask one of the following questions:

- Given a country, guess it's capital
- Given a flag, guess it's country

The supported commands are:

- `!quiz` (host only): Create a new random quiz in chat. A quiz can be created only by the host of the channel, and only if there is not other ongoing quiz.
- `!quiz-stop` (host only): Stop the current quiz, if there is one. A quiz can be stopped only by the host of the channel. When the quiz is stopped, the bot will reply with the answer to the question.
- `!answer <value>`: Answer to the quiz's question. Any user can answer the quiz. Upon receiving the first correct answer, the quiz will stop. Answers will be trimmed and normalized to ease the guessing process (e.g., special characters will be converted to their more readable counterpart, "è" becomes "e" and "ç" becomes "c").
- `!quiz-help`: Print information about the quiz commands.

The web interface of the quiz feature shows the current question in real time (if there is one).

## How this works

First of all, we choose a channel where the bot is gonna operate, monitoring it's chat.

The server listens for messages in the chat, when it finds a supported command it will operate accordingly. The bot will reply in the chat with an appropriate answer.

In addition to chat conversation, the bot also communicates via websocket with a presentation client, that will display information in a nice web interface.

## Setup guide

This section will guide you through the process for running this bot (server and client) on your machine.

### Prerequisites

To run both the server and the client, you need to have the following installed on your machine:

- [Node](https://nodejs.org/en/) (tested with v18.0.0)
- [NPM](https://www.npmjs.com/) (tested with v8.6.0)

### Environment

To configure the application, you need to create an `.env` file in the root of the project containing all the variables needed to connect to Twitch

```bash
# Name of the channel where the bot is gonna be operating.
TWITCH_BOT_CHANNEL=<channel>

# Credentials for the bot user that's going to send messages in
# the channel's chat.
TWITCH_BOT_CREDENTIALS_USERNAME=<username>
TWITCH_BOT_CREDENTIALS_PASSWORD=<oauth_token>

# Address coordinates for the client, you can use these values
# if you are running the bot locally, or change them if you
# want to deploy it.
TWITCH_BOT_CLIENT_PROTOCOL=http
TWITCH_BOT_CLIENT_HOST=localhost
TWITCH_BOT_CLIENT_PORT=3000

# Address coordinates for the websocket, you can use these
# values if you are running the bot locally, or change them if
# you want to deploy it. The websocket is used for communication
# between the client and the server.
TWITCH_BOT_WEBSOCKET_PROTOCOL=ws
TWITCH_BOT_WEBSOCKET_HOST=localhost
TWITCH_BOT_WEBSOCKET_PORT=3001
```

Notice that this file should not be versioned!

### Server

The server handles all the logic for running custom features.

When the server is up and running, the commands will be available in the channel's chat.

#### Installation

To setup the server, from the root of the project do:

```bash
cd server
npm install
```

#### Running

To start the server, run

```bash
npm start
```

If you want to start it in development mode (hot reload active), run

```bash
npm run dev
```

### Client

The client provides some nicely displayed information about the features provided by the bot. Such info can be used as an overlay on your stream.

Whenever a command is executed, the server notifies the client and the information displayed will be updated.

#### Installation

To setup the client, from the root of the project do:

```bash
cd client
npm install
```

#### Running

To start the client, run

```bash
npm run build
npm run preview
```

If you want to start it in development mode (hot reload active), run

```bash
npm run dev
```
