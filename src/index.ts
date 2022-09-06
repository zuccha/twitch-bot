import chalk from "chalk";
import dotenv from "dotenv";
import { Server } from "socket.io";
import tmi from "tmi.js";
import { loadConfig } from "./core/Config";
import DB from "./core/DB";
import FeatureManager from "./core/FeatureManager";
import SubscriptionManager from "./core/SubscriptionManager";
import { GenericNotification } from "./core/types";
import Failure from "./utils/Failure";
import Logger from "./utils/Logger";

dotenv.config({ path: "../.env" });

const main = async () => {
  let maybeFailure: Failure | undefined;

  /**
   * Load config
   */

  const config = loadConfig();
  if (config instanceof Failure) {
    return Logger.fail(config);
  }

  /**
   * Initialize DB
   */

  const db = new DB(config.dbFilename);

  /**
   * Initialize Twitch client
   */

  const twitch = new tmi.Client({
    channels: [config.channel],
    identity: {
      username: config.credentials.username,
      password: config.credentials.password,
    },
  });

  await twitch.connect();

  const notifyTwitch = (channel: string, message: string) => {
    twitch.say(channel, message);
    console.log(chalk.hex("#9147FF")(`[${channel}] ${message}`));
  };

  const twitchSession = {
    join: (channel: string) =>
      twitch.join(channel).catch((error) => Logger.error(error?.message)),
    part: (channel: string) =>
      twitch.part(channel).catch((error) => Logger.error(error?.message)),
  };

  /**
   * Initialize WebSocket server
   */

  const io = new Server(config.websocket.port, {
    cors: {
      origin: `${config.client.protocol}://${config.client.host}:${config.client.port}`,
      methods: ["GET", "POST"],
    },
  });

  const notifyWebSocket = (notification: GenericNotification) => {
    io.send(notification);
    const payload = JSON.stringify(notification.payload);
    console.log(chalk.hex("#CD3762")(`${notification.type}: ${payload}`));
  };

  /**
   * Notifier
   */

  const notifier = { notifyTwitch, notifyWebSocket };

  /**
   * Feature manager
   */

  const featureManager = new FeatureManager(config, notifier, db);

  maybeFailure = await featureManager.setup();
  if (maybeFailure) {
    return Logger.fail(maybeFailure);
  }

  /**
   * Subscription manager
   */

  const subscriptionManager = new SubscriptionManager(
    notifier,
    featureManager,
    db,
    twitchSession
  );

  maybeFailure = await subscriptionManager.setup();
  if (maybeFailure) {
    return Logger.fail(maybeFailure);
  }

  /**
   * Setup listeners
   */

  twitch.on("message", (channel, tags, message) => {
    const [command = "", ...params] = message.split(" ").filter(Boolean);
    const info = {
      channel: channel.replace("#", ""),
      isUserChannel:
        channel.toLowerCase() !== `#${config.channel.toLowerCase()}`,
      user: {
        name: tags.username?.toLowerCase() ?? "",
        displayName: tags["display-name"] ?? "",
        isMod: Boolean(tags.mod),
        isSubscriber: Boolean(tags.subscriber),
        isBroadcaster:
          channel.toLowerCase() === `#${tags.username?.toLowerCase()}`,
      },
    };

    // Not a command
    if (!command.startsWith("!")) {
      return;
    }

    // Not a valid user
    if (!info.user.name) {
      return;
    }

    // Bot is writing commands in its own chat
    if (info.user.name === config.channel) {
      return;
    }

    // Subscription command
    subscriptionManager.handleCommand(command, params, info);
  });

  io.on("connection", (socket) => {
    const channel = socket.handshake.query["channel"];
    if (typeof channel !== "string") {
      return;
    }

    const featureId = socket.handshake.query["featureId"];
    if (typeof featureId !== "string") {
      return;
    }

    const subscription = subscriptionManager.get(channel);
    if (!subscription) {
      return;
    }

    subscription.features.forEach((feature) => {
      if (feature.id === featureId) {
        socket.send(feature.getInitialNotification(channel));
      }
    });
  });

  console.log(chalk.green("Server started!"));
};

main();
