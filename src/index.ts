import tmi from "tmi.js";
import QuizEngine from "./engines/QuizEngine/QuizEngine";
import handleQuiz from "./handlers/handleQuiz";

// TODO: Read config from command line.
const config = {
  channel: "zuccha",
};

const main = async () => {
  const quizEngine = new QuizEngine();
  await quizEngine.setupQuizGenerators();

  const client = new tmi.Client({ channels: [config.channel] });

  client.connect();

  client.on("message", (channel, tags, message) => {
    const [command = "", ...params] = message.split(" ").filter(Boolean);

    handleQuiz({ command, params, context: { quizEngine }, config, tags });
  });
};

main();
