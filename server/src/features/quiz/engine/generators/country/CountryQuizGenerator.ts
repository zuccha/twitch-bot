import { z } from "zod";
import Collection from "../../../../../utils/Collection";
import Failure from "../../../../../utils/Failure";
import Quiz from "../../base/Quiz";
import QuizGenerator from "../../base/QuizGenerator";
import CountryCapitalQuiz from "./quizzes/CountryCapitalQuiz";
import CountryFlagQuiz from "./quizzes/CountryFlagQuiz";
import { Country } from "./Country";
import countriesJson from "./countries.json";

const countryResponseSchema = z.array(
  z.object({
    capital: z.array(z.string()),
    cca2: z.string(),
    flag: z.string(),
    name: z.object({
      common: z.string(),
    }),
  })
);

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

  async setup(): Promise<Failure | undefined> {
    try {
      // Load from API
      // const url = "https://restcountries.com/v3.1/all";
      // const params = "fields=capital,cca2,name,flag";
      // const response = await fetch(`${url}?${params}`);
      // const countries = countryResponseSchema.parse(await response.json());

      // Load from JSON file
      const countries = countryResponseSchema.parse(countriesJson);

      countries.forEach((country) => {
        this._countries.add(country.cca2, {
          code: country.cca2,
          name: country.name.common,
          flag: country.flag,
          capitals: country.capital,
        });
      });
    } catch {
      return new Failure(
        "CountryQuizGenerator.setup",
        "Failed to load countries"
      );
    }
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
