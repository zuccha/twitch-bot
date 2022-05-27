import { CommandHandlerArgs } from "../../utils/CommandHandlerArgs";
import Failure from "../../utils/Failure";
import Feature from "../Feature";
import QuizEngine from "./engine/QuizEngine";
import { QuizNotification } from "./io/QuizNotification";
import handleQuizCommand from "./io/handleQuizCommand";

type QuizContext = { quizEngine: QuizEngine };

export default class QuizFeature extends Feature<
  QuizContext,
  QuizNotification
> {
  static ID = "quiz";

  constructor() {
    super(QuizFeature.ID, { quizEngine: new QuizEngine() });
  }

  get initialNotification(): QuizNotification {
    return {
      type: "QUIZ",
      payload: { question: this._context.quizEngine.quizQuestion },
    };
  }

  setup(): Promise<Failure | undefined> {
    return this._context.quizEngine.setupQuizGenerators();
  }

  handleCommand(args: CommandHandlerArgs<QuizNotification>): void {
    handleQuizCommand({ ...args, context: this._context });
  }
}
