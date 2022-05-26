import chalk from "chalk";
import dotenv from "dotenv";
import { Server } from "socket.io";
import tmi from "tmi.js";
import QuizFeature from "./features/quiz";
import { loadConfig } from "./utils/Config";
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
   * Initialize features
   */

  const features = [new QuizFeature()];

  await Promise.all(features.map((feature) => feature.setup()));

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

  const say = (message: string) => {
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

  const notify = (notification: { type: string; payload: unknown }) => {
    io.send(notification);
    const payload = JSON.stringify(notification.payload);
    console.log(chalk.hex("#CD3762")(`${notification.type}: ${payload}`));
  };

  /**
   * Setup listeners
   */

  twitch.on("message", (channel, tags, message) => {
    const [command = "", ...params] = message.split(" ").filter(Boolean);
    const args = { command, params, config, tags, context: {}, say, notify };

    if (!command.startsWith("!")) {
      return;
    }

    features.forEach((feature) => {
      feature.handleCommand(args);
    });
  });

  io.on("connection", (socket) => {
    const id = socket.handshake.query["id"];
    if (typeof id !== "string") {
      return;
    }

    features.forEach((feature) => {
      const notification = feature.getInitialNotification(id);
      if (notification) {
        socket.send(notification);
      }
    });
  });
};

main();
