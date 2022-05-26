import chalk from "chalk";
import { Server } from "socket.io";
import tmi from "tmi.js";
import { QuizEngine, handleQuizCommand } from "./features/quiz";
import { loadConfig } from "./utils/Config";
import Failure from "./utils/Failure";
import "dotenv/config";

const main = async () => {
  const config = loadConfig();

  if (config instanceof Failure) {
    console.log(config.message);
    return;
  }

  const quizEngine = new QuizEngine();
  await quizEngine.setupQuizGenerators();

  const twitch = new tmi.Client({
    channels: [config.channel],
    identity: config.identity,
  });

  const io = new Server(3001);

  const say = (message: string) => {
    twitch.say(config.channel, message);
    console.log(chalk.hex("#9147FF")(message));
  };

  const notify = (message: { type: string; payload: unknown }) => {
    io.send(message);
    const output = `${message.type}: ${JSON.stringify(message.payload)}`;
    console.log(chalk.hex("#CD3762")(output));
  };

  twitch.connect();

  twitch.on("message", (channel, tags, message) => {
    const [command = "", ...params] = message.split(" ").filter(Boolean);
    const args = { command, params, config, tags, say, notify };

    if (!command.startsWith("!")) {
      return;
    }

    handleQuizCommand({ ...args, context: { quizEngine } });
  });
};

main();
