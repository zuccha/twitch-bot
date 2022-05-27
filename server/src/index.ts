import chalk from "chalk";
import dotenv from "dotenv";
import { Server } from "socket.io";
import tmi from "tmi.js";
import { loadConfig } from "./core/Config";
import { GenericNotification } from "./core/types";
import QuizFeature from "./features/quiz/QuizFeature";
import TestFeature from "./features/test/TestFeature";
import Collection from "./utils/Collection";
import Failure from "./utils/Failure";

dotenv.config({ path: "../.env" });

const main = async () => {
  /**
   * Load config
   */

  const config = loadConfig();
  if (config instanceof Failure) {
    console.log(config.message);
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
   * Initialize websocket server
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
   * Initialize features
   */

  const notifier = { notifyTwitch, notifyWebSocket };

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

    features.forEach((feature) => {
      feature.handleCommand(command, params, info);
    });
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
