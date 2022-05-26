import $String from "../../../../../../utils/String";
import Quiz from "../../../base/Quiz";
import { Country } from "../Country";

export default class CountryCapitalQuiz extends Quiz {
  private _country: Country;

  constructor(country: Country) {
    super(`What is the capital of ${country.name}?`);
    this._country = country;
  }

  get answer(): string {
    return this._country.capitals.join(", ");
  }

  isAnswerCorrect(answer: string): boolean {
    const normalizedAnswer = $String.normalize(answer);
    return (
      (this._country.capitals.length === 0 && normalizedAnswer === "") ||
      this._country.capitals.some(
        (capital) => $String.normalize(capital) === normalizedAnswer
      )
    );
  }
}
