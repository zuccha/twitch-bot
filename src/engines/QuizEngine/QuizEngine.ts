import Collection from "../../utils/Collection";
import Failure from "../../utils/Failure";
import Quiz from "./base/Quiz";
import { CountryQuizGenerator } from "./quizGenerators/country/CountryQuizGenerator";

export default class QuizEngine {
  private _maybeQuiz: Quiz | undefined;
  private _quizGenerators = new Collection({
    country: new CountryQuizGenerator(),
  });

  constructor() {
    this._maybeQuiz = undefined;
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

  get quizQuestion(): string {
    return this._maybeQuiz
      ? this._maybeQuiz.question
      : "<No quiz is in progress>";
  }

  startQuiz(): Failure | undefined {
    if (this._maybeQuiz) {
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

    this._maybeQuiz = quizOrFailure;
  }

  stopQuiz(): Failure | undefined {
    if (!this._maybeQuiz) {
      return new Failure("Engine.stopQuiz", "No quiz is in progress");
    }

    this._maybeQuiz = undefined;
  }

  evaluateQuizAnswer(answer: string): Failure | boolean {
    if (!this._maybeQuiz) {
      return new Failure("Engine.evaluateQuizAnswer", "No quiz is in progress");
    }

    if (this._maybeQuiz.isAnswerCorrect(answer)) {
      this._maybeQuiz = undefined;
      return true;
    }

    return false;
  }
}
