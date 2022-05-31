import { z } from "zod";
import Collection from "../../../../../utils/Collection";
import Failure from "../../../../../utils/Failure";
import Quiz from "../../base/Quiz";
import QuizGenerator from "../../base/QuizGenerator";
import CountryCapitalQuiz from "./quizzes/CountryCapitalQuiz";
import CountryFlagQuiz from "./quizzes/CountryFlagQuiz";
import { Country } from "./Country";
import countriesJson from "./data/countries.json";
import CountryContinentQuiz from "./quizzes/CountryContinentQuiz";
import CountryLanguageQuiz from "./quizzes/CountryLanguageQuiz";
import $Array from "../../../../../utils/Array";

const countryResponseSchema = z.array(
  z.object({
    capital: z.array(z.string()),
    cca2: z.string(),
    flag: z.string(),
    name: z.object({
      common: z.string(),
    }),
    languages: z.record(z.string(), z.string()),
    continents: z.array(z.string()),
  })
);

export class CountryQuizGenerator extends QuizGenerator {
  private _countries: Collection<Country>;
  private _quizzes = [
    CountryCapitalQuiz,
    CountryContinentQuiz,
    CountryFlagQuiz,
    CountryLanguageQuiz,
  ];

  constructor() {
    super();
    this._countries = new Collection();
  }

  async setup(): Promise<Failure | undefined> {
    try {
      // Load from API
      // const url = "https://restcountries.com/v3.1/all";
      // const params = "fields=capital,cca2,continents,name,flag,languages";
      // const response = await fetch(`${url}?${params}`);
      // const responseJson = await response.json();
      // const countries = countryResponseSchema.parse(responseJson);

      // Load from JSON file
      const countries = countryResponseSchema.parse(countriesJson);

      countries.forEach((country) => {
        this._countries.add(country.cca2, {
          code: country.cca2,
          name: country.name.common,
          flag: country.flag,
          capitals: country.capital,
          languages: Object.values(country.languages),
          continents: country.continents,
        });
      });
    } catch (error) {
      return new Failure(
        "CountryQuizGenerator.setup",
        "Failed to load countries"
      );
    }
  }

  generate(): Quiz | Failure {
    const country = this._countries.random();
    if (country instanceof Failure) {
      return country.extend(
        "CountryQuizGenerator.generate",
        "Failed to get a country"
      );
    }

    const quiz = $Array.randomItem(this._quizzes);
    if (!quiz) {
      return new Failure(
        "CountryQuizGenerator.generate",
        "Failed to get a quiz"
      );
    }

    return new quiz(country);
  }
}
