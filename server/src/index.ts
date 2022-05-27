import chalk from "chalk";
import dotenv from "dotenv";
import { Server } from "socket.io";
import tmi from "tmi.js";
import { loadConfig } from "./core/Config";
import FeatureManager from "./core/FeatureManager";
import Subscription from "./core/Subscription";
import { GenericNotification } from "./core/types";
import Collection from "./utils/Collection";
import Failure from "./utils/Failure";

dotenv.config({ path: "../.env" });

const main = async () => {
  let maybeFailure: Failure | undefined;

  /**
   * Load config
   */

  const config = loadConfig();
  if (config instanceof Failure) {
    console.log(chalk.red(config.message));
    console.log(chalk.red("Closing..."));
    return;
  }

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

  const featureManager = new FeatureManager(config, notifier);

  maybeFailure = await featureManager.setup();
  if (maybeFailure) {
    console.log(chalk.red(maybeFailure.message));
    console.log(chalk.red("Closing..."));
    return;
  }

  /**
   * Subscriptions
   */

  const subscriptions = new Collection<Subscription>();

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

    // The message comes from a channel of a user subscribed to the bot
    if (info.isUserChannel) {
      const subscription = subscriptions.byId(info.user.name);
      subscription?.handleCommand(command, params, info);
      return;
    }

    // The message comes from the bot's own chat
    if (command === "!join") {
      if (!subscriptions.has(info.user.name)) {
        const subscription = new Subscription(
          info.user.name,
          config,
          notifier,
          featureManager
        );
        subscriptions.add(info.user.name, subscription);
        // TODO: Check if already joined.
        twitch.join(info.user.name);
        notifyTwitch(info.channel, `${info.user.displayName} has joined!`);
      } else {
        const message = `${info.user.displayName} is already joined!`;
        notifyTwitch(info.channel, message);
      }
    }

    if (command === "!leave") {
      if (subscriptions.has(info.user.name)) {
        subscriptions.remove(info.user.name);
        // TODO: Check if not joined.
        twitch.part(info.user.name);
        notifyTwitch(info.channel, `${info.user.displayName} has left!`);
      } else {
        const message = `${info.user.displayName} is not joined!`;
        notifyTwitch(info.channel, message);
      }
    }
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

    const subscription = subscriptions.byId(channel);
    if (!subscription) {
      return;
    }

    subscription.features.forEach((feature) => {
      if (feature.id === featureId) {
        socket.send(feature.getInitialNotification(channel));
      }
    });
  });
};

main();
