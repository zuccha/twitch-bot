import $String from "../../../../../../utils/String";
import Quiz from "../../../base/Quiz";
import { Country } from "../Country";

export default class CountryContinentByNameQuiz extends Quiz {
  private _country: Country;

  constructor(country: Country) {
    super(`On which continent is ${country.name} located?`);
    this._country = country;
  }

  get answer(): string {
    return this._country.name;
  }

  isAnswerCorrect(answer: string): boolean {
    const normalizedAnswer = $String.normalize(answer);
    return this._country.continents.some((continent) => {
      const normalizedContinent = $String.normalize(continent);
      return normalizedContinent === normalizedAnswer;
    });
  }
}
