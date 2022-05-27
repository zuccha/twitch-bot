import Failure from "../utils/Failure";

export type Config = {
  /**
   * Channel hosting the server.
   *
   * This is the channel where user will have to run commands in order to sign
   * up for the different features provided by the bot.
   */
  channel: string;

  /**
   * Credentials for the user that bot user that will write in channels' chats.
   */
  credentials: {
    username: string;
    password: string;
  };

  /**
   * Address for the client.
   *
   * This is needed to allow CORS towards the client if running locally.
   */
  client: {
    protocol: string;
    host: string;
    port: number;
  };

  /**
   * Address for exposing the websocket server.
   *
   * The websocket server is used to communicate with the client.
   */
  websocket: {
    protocol: string;
    host: string;
    port: number;
  };
};

export const loadConfig = (): Config | Failure => {
  const channel = process.env["TWITCH_BOT_CHANNEL"];
  if (!channel) {
    return new Failure("loadConfig", "No channel specified");
  }

  const credentialsUsername = process.env["TWITCH_BOT_CREDENTIALS_USERNAME"];
  if (!credentialsUsername) {
    return new Failure("loadConfig", "No username specified");
  }

  const credentialsPassword = process.env["TWITCH_BOT_CREDENTIALS_PASSWORD"];
  if (!credentialsPassword) {
    return new Failure("loadConfig", "No OAuth token specified");
  }

  const clientProtocol = process.env["TWITCH_BOT_CLIENT_PROTOCOL"];
  if (!clientProtocol) {
    return new Failure("loadConfig", "No client protocol specified");
  }

  const clientHost = process.env["TWITCH_BOT_CLIENT_HOST"];
  if (!clientHost) {
    return new Failure("loadConfig", "No client host specified");
  }

  const clientPort = Number(process.env["TWITCH_BOT_CLIENT_PORT"]);
  if (!clientPort) {
    return new Failure("loadConfig", "No client port specified");
  }

  const websocketProtocol = process.env["TWITCH_BOT_WEBSOCKET_PROTOCOL"];
  if (!websocketProtocol) {
    return new Failure("loadConfig", "No websocket protocol specified");
  }

  const websocketHost = process.env["TWITCH_BOT_WEBSOCKET_HOST"];
  if (!websocketHost) {
    return new Failure("loadConfig", "No websocket host specified");
  }

  const websocketPort = Number(process.env["TWITCH_BOT_WEBSOCKET_PORT"]);
  if (!websocketPort) {
    return new Failure("loadConfig", "No websocket port specified");
  }

  return {
    channel,

    credentials: {
      username: credentialsUsername,
      password: credentialsPassword,
    },

    client: {
      protocol: clientProtocol,
      host: clientHost,
      port: clientPort,
    },

    websocket: {
      protocol: websocketProtocol,
      host: websocketHost,
      port: websocketPort,
    },
  };
};
