import { Config } from "../../core/Config";
import Failure from "../../utils/Failure";
import CommandHandler, {
  Notifier,
  TwitchInfo,
} from "../../core/CommandHandler";
import { QuizContext, QuizNotification } from "./types";

export default class QuizCommandHandler extends CommandHandler<
  QuizContext,
  QuizNotification
> {
  constructor(
    context: QuizContext,
    config: Config,
    notifier: Notifier<QuizNotification>
  ) {
    super(context, config, notifier);
  }

  handle(command: string, params: string[], info: TwitchInfo): void {
    switch (command) {
      case "!quiz":
        this._handleStartQuiz(command, params, info);
        break;
      case "!quiz-stop":
        this._handleStopQuiz(command, params, info);
        break;
      case "!answer":
        this._handleAnswerQuiz(command, params, info);
        break;
      case "!quiz-help":
        this._handleHelpQuiz(command, params, info);
        break;
    }
  }

  private _handleStartQuiz(
    command: string,
    params: string[],
    info: TwitchInfo
  ) {
    if (info.tags.username !== this._config.channel) {
      const message = "You don't have permissions to start a quiz :(";
      this._notifier.notifyTwitch(message);
      return;
    }

    const quizOrFailure = this._context.quizEngine.startQuiz();
    if (quizOrFailure instanceof Failure) {
      this._notifier.notifyTwitch(quizOrFailure.message);
      return;
    }

    const question = quizOrFailure.question;

    const message = `Quiz time! ${question} Answer with !answer <value>`;
    this._notifier.notifyTwitch(message);
    this._notifier.notifyWebSocket({
      type: "QUIZ_STARTED",
      payload: { question },
    });
  }

  private _handleStopQuiz(command: string, params: string[], info: TwitchInfo) {
    if (info.tags.username !== this._config.channel) {
      const message = "You don't have permissions to stop the quiz :(";
      this._notifier.notifyTwitch(message);
      return;
    }

    const answerOrFailure = this._context.quizEngine.stopQuiz();
    if (answerOrFailure instanceof Failure) {
      this._notifier.notifyTwitch(answerOrFailure.message);
      return;
    }

    const message = `Nobody guessed the correct answer, it was "${answerOrFailure}"!`;
    this._notifier.notifyTwitch(message);
    this._notifier.notifyWebSocket({
      type: "QUIZ_ENDED",
      payload: { answer: answerOrFailure },
    });
  }

  private _handleAnswerQuiz(
    command: string,
    params: string[],
    info: TwitchInfo
  ) {
    const answer = params.join(" ");
    const user = `@${info.tags["display-name"]}`;

    const resultOrFailure = this._context.quizEngine.evaluateQuizAnswer(answer);
    if (resultOrFailure instanceof Failure) {
      this._notifier.notifyTwitch(resultOrFailure.message);
      return;
    }

    if (resultOrFailure === undefined) {
      this._notifier.notifyTwitch(`Wrong ${user}! Give it another try :)`);
      return;
    }

    const message = `You guessed it ${user}, the answer was "${resultOrFailure}"!`;
    this._notifier.notifyTwitch(message);
    this._notifier.notifyWebSocket({
      type: "QUIZ_GUESSED",
      payload: { answer: resultOrFailure },
    });
  }

  private _handleHelpQuiz(command: string, params: string[], info: TwitchInfo) {
    this._notifier.notifyTwitch(`Usage:
 • !quiz: starts a quiz
 • !quiz-stop - stops the current quiz
 • !answer <value> - answers the current quiz question
 • !quiz-help - print this message`);
  }
}
