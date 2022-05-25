import $String from "../../../../../utils/String";
import Quiz from "../../../base/Quiz";
import { Country } from "../Country";

export default class CountryCapitalQuiz extends Quiz {
  private _country: Country;

  constructor(country: Country) {
    super(`What is the capital of ${country.name}?`);
    this._country = country;
  }

  isAnswerCorrect(answer: string): boolean {
    const normalizedAnswer = $String.normalize(answer);
    const normalizedCapital = $String.normalize(this._country.capital);
    return normalizedCapital === normalizedAnswer;
  }
}
