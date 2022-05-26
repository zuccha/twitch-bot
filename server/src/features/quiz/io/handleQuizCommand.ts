import Failure from "../../../utils/Failure";
import { CommandHandlerArgs } from "../../../utils/CommandHandlerArgs";
import QuizEngine from "../engine/QuizEngine";
import { QuizNotification } from "./QuizNotification";

export type QuizContext = { quizEngine: QuizEngine };

export type QuizCommandHandlerArgs = CommandHandlerArgs<
  QuizNotification,
  QuizContext
>;

const handleStartQuizCommand = (args: QuizCommandHandlerArgs) => {
  if (args.tags.username !== args.config.channel) {
    args.say("You don't have permissions to start a quiz :(");
    return;
  }

  const maybeFailure = args.context.quizEngine.startQuiz();
  if (maybeFailure instanceof Failure) {
    args.say(maybeFailure.message);
    return;
  }

  const question = args.context.quizEngine.quizQuestion;
  args.notify({ type: "QUIZ_STARTED", payload: { question } });
  args.say(`Quiz time! ${question} Answer with !answer <value>`);
};

const handleStopQuizCommand = (args: QuizCommandHandlerArgs) => {
  if (args.tags.username !== args.config.channel) {
    args.say("You don't have permissions to stop the quiz :(");
    return;
  }

  const answerOrFailure = args.context.quizEngine.stopQuiz();
  if (answerOrFailure instanceof Failure) {
    args.say(answerOrFailure.message);
    return;
  }

  args.notify({ type: "QUIZ_ENDED", payload: { answer: answerOrFailure } });
  args.say(`Nobody guessed the correct answer, it was "${answerOrFailure}"!`);
};

const handleAnswerQuizCommand = (args: QuizCommandHandlerArgs) => {
  const answer = args.params.join(" ");
  const user = `@${args.tags["display-name"]}`;

  const resultOrFailure = args.context.quizEngine.evaluateQuizAnswer(answer);
  if (resultOrFailure instanceof Failure) {
    args.say(resultOrFailure.message);
    return;
  }

  if (resultOrFailure === undefined) {
    args.say(`Wrong ${user}! Give it another try :)`);
    return;
  }

  args.notify({ type: "QUIZ_GUESSED", payload: { answer: resultOrFailure } });
  args.say(`You guessed it ${user}, the answer was "${resultOrFailure}"!`);
};

const handleHelpQuizCommand = (args: QuizCommandHandlerArgs) => {
  args.say(`Usage:
 • !quiz: starts a quiz
 • !quiz-stop - stops the current quiz
 • !answer <value> - answers the current quiz question
 • !quiz-help - print this message`);
};

const handleQuizCommand = (args: QuizCommandHandlerArgs) => {
  switch (args.command) {
    case "!quiz":
      handleStartQuizCommand(args);
      break;

    case "!quiz-stop":
      handleStopQuizCommand(args);
      break;

    case "!answer":
      handleAnswerQuizCommand(args);
      break;

    case "!quiz-help":
      handleHelpQuizCommand(args);
      break;
  }
};

export default handleQuizCommand;
