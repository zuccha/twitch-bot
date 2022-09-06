import chalk from "chalk";
import sqlite3 from "sqlite3";
import Logger from "../utils/Logger";

const sqlite3Verbose = sqlite3.verbose();

type ResultError = { error: Error };
type ResultValue<T> = { value: T };
type Result<T> = ResultError | ResultValue<T>;

const makeError = (error: Error): ResultError => ({ error });
const makeValue = <T>(value: T): ResultValue<T> => ({ value });

export default class DB {
  _filename: string;
  _db: sqlite3.Database;

  constructor(filename: string) {
    this._filename = filename;
    this._db = new sqlite3Verbose.Database(filename, (error) => {
      if (error) {
        Logger.error("Failed to setup the database");
        Logger.error(error.message);
      }
    });
  }

  run: sqlite3.Database["run"] = (...args) => {
    return this._db.run(...args);
  };

  serialize: sqlite3.Database["serialize"] = (...args) => {
    return this._db.serialize(...args);
  };

  get(
    query: string,
    params: Record<string, unknown> = {}
  ): Promise<Result<unknown>> {
    return new Promise((resolve) => {
      this._db.get(query, params, (error, row) =>
        error ? resolve(makeError(error)) : resolve(makeValue(row))
      );
    });
  }

  all(
    query: string,
    params: Record<string, unknown> = {}
  ): Promise<Result<unknown[]>> {
    return new Promise((resolve) => {
      this._db.all(query, params, (error, rows) =>
        error ? resolve(makeError(error)) : resolve(makeValue(rows))
      );
    });
  }

  error = (scope: string) => (message: string) => (err: Error | null) => {
    if (err) {
      Logger.error(chalk.hex("#FFC0CB")(`DB: ${this._filename}`));
      Logger.error(chalk.hex("#FFC0CB")(`Scope: ${scope}`));
      Logger.error(chalk.hex("#FFC0CB")(`Info: ${message}`));
      Logger.error(err.message);
    }
  };
}
