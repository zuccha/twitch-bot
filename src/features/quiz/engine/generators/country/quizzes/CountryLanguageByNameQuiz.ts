import $String from "../../../../../../utils/String";
import Quiz from "../../../base/Quiz";
import { Country } from "../Country";

export default class CountryLanguageByNameQuiz extends Quiz {
  private _country: Country;

  constructor(country: Country) {
    super(`What is an official language of ${country.flag}?`);
    this._country = country;
  }

  get answer(): string {
    return this._country.name;
  }

  isAnswerCorrect(answer: string): boolean {
    const normalizedAnswer = $String.normalize(answer);
    return this._country.languages.some((language) => {
      const normalizedLanguage = $String.normalize(language);
      return normalizedLanguage === normalizedAnswer;
    });
  }
}
