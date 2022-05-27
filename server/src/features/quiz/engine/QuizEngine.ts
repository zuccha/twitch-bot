import Collection from "../../../utils/Collection";
import Failure from "../../../utils/Failure";
import Quiz from "./base/Quiz";
import { CountryQuizGenerator } from "./generators/country/CountryQuizGenerator";

export default class QuizEngine {
  private _quizzes: Collection<Quiz>;
  private _quizGenerators = new Collection({
    country: new CountryQuizGenerator(),
  });

  constructor() {
    this._quizzes = new Collection();
  }

  async setupQuizGenerators(): Promise<Failure | undefined> {
    const results = await Promise.all(
      this._quizGenerators.map((quizGenerator) => quizGenerator.setup())
    );

    const maybeFailure = results.find((result) => result instanceof Failure);
    if (maybeFailure) {
      return maybeFailure.extend(
        "Engine.setupQuizGenerators",
        "Failed to setup quiz generators"
      );
    }
  }

  getQuizQuestion(id: string): string | undefined {
    return this._quizzes.byId(id)?.question;
  }

  startQuiz(id: string): Failure | Quiz {
    const quiz = this._quizzes.byId(id);

    if (quiz) {
      return new Failure("Engine.startQuiz", "A quiz is already in progress");
    }

    const quizGeneratorOrFailure = this._quizGenerators.random();
    if (quizGeneratorOrFailure instanceof Failure) {
      return quizGeneratorOrFailure.extend(
        "Engine.startQuiz",
        "Failed to get a quiz generator"
      );
    }

    const quizOrFailure = quizGeneratorOrFailure.generate();
    if (quizOrFailure instanceof Failure) {
      return quizOrFailure.extend(
        "Engine.startQuiz",
        "Failed to generate a quiz"
      );
    }

    this._quizzes.add(id, quizOrFailure);
    return quizOrFailure;
  }

  stopQuiz(id: string): Failure | string {
    const quiz = this._quizzes.byId(id);

    if (!quiz) {
      return new Failure("Engine.stopQuiz", "No quiz is in progress");
    }

    const answer = quiz.answer;
    this._quizzes.remove(id);

    return answer;
  }

  evaluateQuizAnswer(id: string, answer: string): Failure | string | undefined {
    const quiz = this._quizzes.byId(id);

    if (!quiz) {
      return new Failure("Engine.evaluateQuizAnswer", "No quiz is in progress");
    }

    if (quiz.isAnswerCorrect(answer)) {
      const realAnswer = quiz.answer;
      this._quizzes.remove(id);
      return realAnswer;
    }
  }
}
