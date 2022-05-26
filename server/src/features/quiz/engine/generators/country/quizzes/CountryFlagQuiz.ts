import $String from "../../../../../../utils/String";
import Quiz from "../../../base/Quiz";
import { Country } from "../Country";

export default class CountryFlagQuiz extends Quiz {
  private _country: Country;

  constructor(country: Country) {
    super(`What is the name of the country with this flag ${country.flag}?`);
    this._country = country;
  }

  get answer(): string {
    return this._country.name;
  }

  isAnswerCorrect(answer: string): boolean {
    const normalizedAnswer = $String.normalize(answer);
    const normalizedCode = $String.normalize(this._country.code);
    const normalizedName = $String.normalize(this._country.name);
    return (
      normalizedCode === normalizedAnswer || normalizedName === normalizedAnswer
    );
  }
}
