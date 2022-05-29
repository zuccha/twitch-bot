# Twitch Bot

Just another bot for Twitch.

This bot provides the following features:

- [Quiz](#quiz)

For each feature, a set of commands will be made available on a Twitch channel of your choosing.

The bot consists in a server that connects to chats of channels that decide to
join.

## How this works

The bot runs on one host channel (the channel that will also write in chats).
Users can join the bot by typing the `!join` command in the bot's chat.

Once a user joined the bot, it will monitor their chat. When the bot intercepts
a command known to it, it will react accordingly and respond in the user's chat.

Users that joined will be able to activate features provided by the bot in their own chat. Check the [feature](#features) section for more.

Users can leave the bot by typing in its chat `!leave`.

## Features

Once a user joined the bot, they can activate features in their own chat. To manage features, users can run the following commands in their chat:

- `!add-feature <feature_name>`: The user can activate a particular feature. Available features are: "quiz".
- `!add-all-features`: The user can activate all features provided by the bot in one go.
- `!remove-feature <feature_name>`: The user can turn off a particular feature. Available features are: "quiz".
- `!remove-all-features`: The user can turn off all features provided by the bot in one go.
- `!features`: List all active features provided by the bot.

The bot currently supports the following features.

### Quiz

The quiz functionality allows the host of channel to start random quizzes in the chat, and users will have to guess the answer. Whenever a user guesses the correct answer, they are awarded one point.

The quiz bot will randomly ask one of the following questions:

- Given a country, guess it's capital
- Given a flag, guess it's country

The supported commands are:

Commands that can be issued only by the host of the channel:

- `!quiz [<domain>]`: Create a new random quiz in chat. There can only be one ongoing quiz at the time. The `domain` parameter determines what kind of quiz will be generated. Available domains include:
  - "country": Geography related quizzes.
    If no domain parameter is specified, one will be selected randomly.
- `!quiz-stop`: Stop the current quiz, if there is one. When the quiz is stopped, the bot will reply with the answer to the question.

Commands that can be issued by anyone:

- `!answer <value>`: Answer to the quiz's question. Any user can answer the quiz. Upon receiving the first correct answer, the quiz will stop. Answers will be trimmed and normalized to ease the guessing process (e.g., special characters will be converted to their more readable counterpart, "è" becomes "e" and "ç" becomes "c"). When answering correctly, the user will be awarded one point.
- `!quiz-score [global]`: Get the user's score (correct answers) in the current channel. If the "global" parameter is given, it will return the score across all Twitch.
- `!quiz-leaderboard [global]`: Return the three users with the most points in the channel. If the "global" parameter is given, it will return the leaderboard of all Twitch.
- `!quiz-help`: Print information about the quiz commands.

The web interface of the quiz feature shows the current question in real time (if there is one).

## Setup guide

This section will guide you through the process for running this bot (server and client) on your machine.

### Prerequisites

To run both the server and the client, you need to have the following installed on your machine:

- [Node](https://nodejs.org/en/) (tested with v18.0.0)
- [NPM](https://www.npmjs.com/) (tested with v8.6.0)
- [SQLite](https://www.sqlite.org/index.html) (tested with v3.37.0)

### Environment

To configure the application, you need to create an `.env` file in the root of the project containing all the variables needed to connect to Twitch

```bash
# Name of the channel where the bot is gonna be operating.
TWITCH_BOT_CHANNEL=<channel>

# Filename for the DB used by the bot.
TWITCH_BOT_DB_FILENAME=./twitch_bot.db

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
