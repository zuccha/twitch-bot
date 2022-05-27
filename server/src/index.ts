import chalk from "chalk";
import dotenv from "dotenv";
import { Server } from "socket.io";
import tmi from "tmi.js";
import { loadConfig } from "./core/Config";
import FeatureManager from "./core/FeatureManager";
import Subscription from "./core/Subscription";
import { GenericNotification } from "./core/types";
import QuizFeature from "./features/quiz/QuizFeature";
import TestFeature from "./features/test/TestFeature";
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
    console.log(chalk.hex("#9147FF")(message));
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
    const info = { channel, tags };

    if (!command.startsWith("!")) {
      return;
    }

    if (config.channel !== channel) {
      const subscription = subscriptions.byId(channel);
      subscription?.handleCommand(command, params, info);
      return;
    }

    const username = tags.username;
    if (!username) {
      return;
    }

    if (command === "!join") {
      if (!subscriptions.has(username)) {
        const subscription = new Subscription(
          username,
          config,
          notifier,
          featureManager
        );
        subscriptions.add(username, subscription);
        twitch.join(username);
        notifyTwitch(channel, `${username} has joined!`);
      } else {
        notifyTwitch(channel, `${username} is already joined!`);
      }
    }

    if (command === "!leave") {
      if (subscriptions.has(username)) {
        subscriptions.remove(username);
        twitch.part(username);
        notifyTwitch(channel, `${username} has left!`);
      } else {
        notifyTwitch(channel, `${username} is not joined!`);
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
        socket.send(feature.initialNotification);
      }
    });
  });
};

main();
