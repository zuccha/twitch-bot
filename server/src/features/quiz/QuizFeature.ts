import { Config } from "../../core/Config";
import Feature from "../../core/Feature";
import { Notifier } from "../../core/types";
import Failure from "../../utils/Failure";
import QuizCommandHandler from "./QuizCommandHandler";
import QuizEngine from "./engine/QuizEngine";
import { QuizContext, QuizNotification } from "./types";

export default class QuizFeature extends Feature<
  QuizContext,
  QuizNotification
> {
  static ID = "quiz";

  protected _commandHandler: QuizCommandHandler;

  constructor(config: Config, notifier: Notifier<QuizNotification>) {
    const context = { quizEngine: new QuizEngine() };
    super(QuizFeature.ID, context);
    this._commandHandler = new QuizCommandHandler(context, config, notifier);
  }

  getInitialNotification(channel: string): QuizNotification {
    return {
      type: "QUIZ",
      payload: { question: this._context.quizEngine.getQuizQuestion(channel) },
    };
  }

  setup(): Promise<Failure | undefined> {
    return this._context.quizEngine.setupQuizGenerators();
  }
}
