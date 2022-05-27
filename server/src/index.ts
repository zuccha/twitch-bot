import chalk from "chalk";
import dotenv from "dotenv";
import { Server } from "socket.io";
import tmi from "tmi.js";
import { loadConfig } from "./core/Config";
import { GenericNotification } from "./core/types";
import QuizFeature from "./features/quiz/QuizFeature";
import TestFeature from "./features/test/TestFeature";
import Subscription from "./subscriptions/Subscription";
import Collection from "./utils/Collection";
import Failure from "./utils/Failure";

dotenv.config({ path: "../.env" });

const main = async () => {
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

  const notifyTwitch = (message: string) => {
    twitch.say(config.channel, message);
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
   * Subscriptions
   */

  const subscriptions = new Collection<Subscription>();

  /**
   * Feature manager
   */

  const features = new Collection({
    [QuizFeature.ID]: new QuizFeature(config, notifier),
    [TestFeature.ID]: new TestFeature(config, notifier),
  });

  await Promise.all(features.map((feature) => feature.setup()));

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

    if (command === "!join") {
      if (!subscriptions.has(channel)) {
        const subscription = new Subscription(channel, config, notifier);
        subscriptions.add(channel, subscription);
        notifyTwitch(`${channel} has joined!`);
      } else {
        notifyTwitch(`${channel} is already joined!`);
      }
    }

    if (command === "!leave") {
      if (subscriptions.has(channel)) {
        subscriptions.remove(channel);
        notifyTwitch(`${channel} has left!`);
      } else {
        notifyTwitch(`${channel} is not joined!`);
      }
    }
  });

  io.on("connection", (socket) => {
    const id = socket.handshake.query["id"];
    features.forEach((feature) => {
      if (feature.id === id) {
        socket.send(feature.initialNotification);
      }
    });
  });
};

main();
