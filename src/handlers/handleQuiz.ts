import QuizEngine from "../engines/QuizEngine/QuizEngine";
import Failure from "../utils/Failure";
import { HandlerArgs } from "./HandlerArgs";

type QuizHandlerArgs = HandlerArgs<{ quizEngine: QuizEngine }>;

const handleStartQuiz = (args: QuizHandlerArgs) => {
  if (args.tags.username !== args.config.channel) {
    args.say("You don't have permissions to start a quiz");
    return;
  }

  const maybeFailure = args.context.quizEngine.startQuiz();
  if (maybeFailure instanceof Failure) {
    args.say(maybeFailure.message);
    return;
  }

  args.say(args.context.quizEngine.quizQuestion);
};

const handleStopQuiz = (args: QuizHandlerArgs) => {
  if (args.tags.username !== args.config.channel) {
    args.say("You don't have permissions to stop the quiz");
    return;
  }

  const maybeFailure = args.context.quizEngine.stopQuiz();
  if (maybeFailure instanceof Failure) {
    args.say(maybeFailure.message);
    return;
  }

  args.say("Quiz interrupted...");
};

const handleAnswerQuiz = (args: QuizHandlerArgs) => {
  const answer = args.params[0] ?? "";

  const resultOrFailure = args.context.quizEngine.evaluateQuizAnswer(answer);
  if (resultOrFailure instanceof Failure) {
    args.say(resultOrFailure.message);
    return;
  }

  args.say(resultOrFailure ? "Correct!" : "Wrong...");
};

const handleQuiz = (args: QuizHandlerArgs) => {
  switch (args.command) {
    case "!quiz":
      handleStartQuiz(args);
      break;

    case "!stop":
      handleStopQuiz(args);
      break;

    case "!answer":
      handleAnswerQuiz(args);
      break;
  }
};

export default handleQuiz;
