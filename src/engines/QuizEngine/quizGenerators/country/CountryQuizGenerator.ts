import Collection from "../../../../utils/Collection";
import Failure from "../../../../utils/Failure";
import Quiz from "../../base/Quiz";
import QuizGenerator from "../../base/QuizGenerator";
import CountryCapitalQuiz from "./quizzes/CountryCapitalQuiz";
import CountryFlagQuiz from "./quizzes/CountryFlagQuiz";
import { Country } from "./Country";

export class CountryQuizGenerator extends QuizGenerator {
  private _countries: Collection<Country>;
  private _quizzes = new Collection({
    capital: CountryCapitalQuiz,
    flag: CountryFlagQuiz,
  });

  constructor() {
    super();
    this._countries = new Collection();
  }

  async setup(): Promise<void> {
    // TODO: Load countries from a API.
    this._countries.add("CH", {
      code: "CH",
      name: "Switzerland",
      flag: "🇨🇭",
      capital: "Bern",
    });
  }

  generate(): Quiz | Failure {
    const countryOrFailure = this._countries.random();
    if (countryOrFailure instanceof Failure) {
      return countryOrFailure.extend(
        "CountryQuizGenerator.generate",
        "Failed to get a country"
      );
    }

    const quizOrFailure = this._quizzes.random();
    if (quizOrFailure instanceof Failure) {
      return quizOrFailure.extend(
        "CountryQuizGenerator.generate",
        "Failed to get a quiz"
      );
    }

    return new quizOrFailure(countryOrFailure);
  }
}
