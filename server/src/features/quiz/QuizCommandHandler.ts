import { Config } from "../../core/Config";
import CommandHandler from "../../core/CommandHandler";
import DB from "../../core/DB";
import { Notifier, TwitchInfo } from "../../core/types";
import Failure from "../../utils/Failure";
import QuizPersistence from "./QuizPersistence";
import { Leaderboard, QuizContext, QuizNotification } from "./types";

export default class QuizCommandHandler extends CommandHandler<
  QuizContext,
  QuizNotification
> {
  private _persistence: QuizPersistence;

  constructor(
    context: QuizContext,
    config: Config,
    notifier: Notifier<QuizNotification>,
    db: DB
  ) {
    super(context, config, notifier);
    this._persistence = new QuizPersistence(db);
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
      case "!quiz-score":
        this._handleGetScore(command, params, info);
        break;
      case "!quiz-leaderboard":
        this._handleGetLeaderboard(command, params, info);
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
    if (!info.user.isBroadcaster) {
      const message = "You don't have permissions to start a quiz :(";
      this._notifier.notifyTwitch(info.channel, message);
      return;
    }

    const quizOrFailure = this._context.quizEngine.startQuiz(
      info.user.name,
      params[0]
    );
    if (quizOrFailure instanceof Failure) {
      this._notifier.notifyTwitch(info.channel, quizOrFailure.message);
      return;
    }

    const question = quizOrFailure.question;

    const message = `Quiz time! ${question} Answer with !answer <value>`;
    this._notifier.notifyTwitch(info.channel, message);
    this._notifier.notifyWebSocket({
      type: "QUIZ_STARTED",
      payload: { question },
    });
  }

  private _handleStopQuiz(command: string, params: string[], info: TwitchInfo) {
    if (!info.user.isBroadcaster) {
      const message = "You don't have permissions to stop the quiz :(";
      this._notifier.notifyTwitch(info.channel, message);
      return;
    }

    const answerOrFailure = this._context.quizEngine.stopQuiz(info.user.name);
    if (answerOrFailure instanceof Failure) {
      this._notifier.notifyTwitch(info.channel, answerOrFailure.message);
      return;
    }

    const message = `Nobody guessed the correct answer, it was "${answerOrFailure}"!`;
    this._notifier.notifyTwitch(info.channel, message);
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

    const resultOrFailure = this._context.quizEngine.evaluateQuizAnswer(
      info.user.name,
      answer
    );
    if (resultOrFailure instanceof Failure) {
      this._notifier.notifyTwitch(info.channel, resultOrFailure.message);
      return;
    }

    if (resultOrFailure === undefined) {
      const message = `Wrong ${info.user.displayName}! Give it another try :)`;
      this._notifier.notifyTwitch(info.channel, message);
      return;
    }

    const message = `You guessed it ${info.user.displayName}, the answer was "${resultOrFailure}"!`;
    this._persistence.incrementScore(info.channel, info.user.name, 1);
    this._notifier.notifyTwitch(info.channel, message);
    this._notifier.notifyWebSocket({
      type: "QUIZ_GUESSED",
      payload: { answer: resultOrFailure },
    });
  }

  private async _handleGetScore(
    command: string,
    params: string[],
    info: TwitchInfo
  ) {
    const score =
      params[0] === "global"
        ? await this._persistence.getGlobalScore(info.user.name)
        : await this._persistence.getChannelScore(info.channel, info.user.name);
    if (score instanceof Failure) {
      this._notifier.notifyTwitch(info.channel, score.message);
      return;
    }

    const message =
      params[0] === "global"
        ? `@${info.user.displayName}, your current global score is ${score}`
        : `@${info.user.displayName}, your current score is ${score}`;
    this._notifier.notifyTwitch(info.channel, message);
  }

  private async _handleGetLeaderboard(
    command: string,
    params: string[],
    info: TwitchInfo
  ) {
    const leaderboard =
      params[0] === "global"
        ? await this._persistence.getGlobalLeaderboard()
        : await this._persistence.getChannelLeaderboard(info.channel);
    if (leaderboard instanceof Failure) {
      this._notifier.notifyTwitch(info.channel, leaderboard.message);
      return;
    }

    const formattedLeaderboard = this._formatLeaderboard(leaderboard);
    const message =
      params[0] === "global"
        ? `Global leaderboard: ${formattedLeaderboard}`
        : `Leaderboard: ${formattedLeaderboard}`;
    this._notifier.notifyTwitch(info.channel, message);
  }

  private _handleHelpQuiz(command: string, params: string[], info: TwitchInfo) {
    this._notifier.notifyTwitch(
      info.channel,
      `Usage:
 • !quiz: starts a quiz
 • !quiz-stop - stops the current quiz
 • !answer <value> - answers the current quiz question
 • !quiz-score [global] - get you channel or global score
 • !quiz-leaderboard [global] - get the channel or global leaderboard
 • !quiz-help - print this message`
    );
  }

  private _formatLeaderboard(leaderboard: Leaderboard): string {
    return (
      leaderboard.positions
        .map((position, index) => {
          const usernames = position.usernames.join(", ");
          return `${index + 1}. ${usernames} (${position.score})`;
        })
        .join(" ") || "No one has played yet :("
    );
  }
}
