import Collection from "../../../utils/Collection";
import Failure from "../../../utils/Failure";
import Quiz from "./base/Quiz";
import { CountryQuizGenerator } from "./generators/country/CountryQuizGenerator";

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

  get quizQuestion(): string | undefined {
    return this._maybeQuiz?.question;
  }

  startQuiz(): Failure | Quiz {
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
    return quizOrFailure;
  }

  stopQuiz(): Failure | string {
    if (!this._maybeQuiz) {
      return new Failure("Engine.stopQuiz", "No quiz is in progress");
    }

    const answer = this._maybeQuiz.answer;
    this._maybeQuiz = undefined;

    return answer;
  }

  evaluateQuizAnswer(answer: string): Failure | string | undefined {
    if (!this._maybeQuiz) {
      return new Failure("Engine.evaluateQuizAnswer", "No quiz is in progress");
    }

    if (this._maybeQuiz.isAnswerCorrect(answer)) {
      const realAnswer = this._maybeQuiz.answer;
      this._maybeQuiz = undefined;
      return realAnswer;
    }
  }
}