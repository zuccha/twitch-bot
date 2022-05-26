import Failure from "./Failure";

export type Config = {
  channel: string;
  identity: {
    username: string;
    password: string;
  };
};

export const loadConfig = (): Config | Failure => {
  const maybeChannel = process.env["TWITCH_SERVER_CHANNEL"];
  const maybeOAuthToken = process.env["TWITCH_SERVER_OAUTH_TOKEN"];

  if (!maybeChannel) {
    return new Failure("loadConfig", "No channel specified");
  }

  if (!maybeOAuthToken) {
    return new Failure("loadConfig", "No OAuth token specified");
  }

  return {
    channel: maybeChannel,
    identity: { username: maybeChannel, password: maybeOAuthToken },
  };
};
