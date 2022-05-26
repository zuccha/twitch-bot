import tmi from "tmi.js";
import QuizEngine from "./engines/QuizEngine/QuizEngine";
import handleQuiz from "./handlers/handleQuiz";
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

  const client = new tmi.Client({
    channels: [config.channel],
    identity: config.identity,
  });

  const say = (message: string) => {
    client.say(config.channel, message);
    console.log(message);
  };

  client.connect();

  client.on("message", (channel, tags, message) => {
    const [command = "", ...params] = message.split(" ").filter(Boolean);

    handleQuiz({ command, params, context: { quizEngine }, config, tags, say });
  });
};

main();
