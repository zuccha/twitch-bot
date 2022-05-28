import chalk from "chalk";
import sqlite3 from "sqlite3";
import Failure from "../utils/Failure";
import Logger from "../utils/Logger";

const sqlite3Verbose = sqlite3.verbose();

const CREATE_USERS_TABLE = `CREATE TABLE IF NOT EXISTS users (channel TEXT PRIMARY KEY)`;
const INSERT_USER = `INSERT INTO users (channel) VALUES ($channel)`;
const DELETE_USER_BY_CHANNEL = `DELETE FROM users WHERE channel = $channel`;

const CREATE_FEATURES_TABLE = `CREATE TABLE IF NOT EXISTS features (channel TEXT, featureId TEXT, PRIMARY KEY (channel, featureId))`;
const INSERT_FEATURE = `INSERT INTO features (channel, featureId) VALUES ($channel, $featureId)`;
const DELETE_FEATURE_BY_CHANNEL = `DELETE FROM features WHERE channel = $channel`;
const DELETE_FEATURE_BY_CHANNEL_AND_FEATURE_ID = `DELETE FROM features WHERE channel = $channel AND featureId = $featureId`;

const GET_USERS_WITH_FEATURES = `\
SELECT users.channel, group_concat(features.featureId) AS featureIds
FROM users
LEFT OUTER JOIN features ON users.channel = features.channel
GROUP BY features.channel`;

export default class DB {
  static USERS_TABLE = "users";
  static FEATURES_TABLE = "features";

  _db: sqlite3.Database;

  constructor(filename: string) {
    const handleError = DB._makeHandleError(`DB: ${filename}`);

    this._db = new sqlite3Verbose.Database(filename, handleError);

    this._db.serialize(() => {
      this._db.run(CREATE_USERS_TABLE, handleError);
      this._db.run(CREATE_FEATURES_TABLE, handleError);
    });
  }

  async getUsers(): Promise<
    { channel: string; featureIds: string[] }[] | Failure
  > {
    return DB._each(this._db, GET_USERS_WITH_FEATURES, (row) => ({
      channel: row.channel,
      featureIds: row.featureIds ? row.featureIds.split(",") : [],
    }));
  }

  addUser($channel: string): void {
    const handleError = DB._makeHandleError(`Channel: ${$channel}`);

    this._db.run(INSERT_USER, { $channel }, handleError);
  }

  removeUser($channel: string): void {
    const handleError = DB._makeHandleError(`Channel: ${$channel}`);

    this._db.serialize(() => {
      this._db.run(DELETE_USER_BY_CHANNEL, { $channel }, handleError);
      this._db.run(DELETE_FEATURE_BY_CHANNEL, { $channel }, handleError);
    });
  }

  addFeatureToUser($channel: string, $featureId: string): void {
    const errorMessage = `Channel: ${$channel} | Feature: ${$featureId}`;
    const handleError = DB._makeHandleError(errorMessage);

    this._db.run(INSERT_FEATURE, { $channel, $featureId }, handleError);
  }

  removeFeatureFromUser($channel: string, $featureId: string): void {
    const errorMessage = `Channel: ${$channel} | Feature: ${$featureId}`;
    const handleError = DB._makeHandleError(errorMessage);

    this._db.run(
      DELETE_FEATURE_BY_CHANNEL_AND_FEATURE_ID,
      { $channel, $featureId },
      handleError
    );
  }

  private static _makeHandleError =
    (message: string) => (err: Error | null) => {
      if (err) {
        Logger.error(chalk.hex("#FFC0CB")(message));
        Logger.error(err.message);
      }
    };

  private static _each<T>(
    db: sqlite3.Database,
    query: string,
    mapRow: (row: any) => T = (row) => row
  ): Promise<T[] | Failure> {
    return new Promise((resolve) => {
      const items: T[] = [];

      const handleCallback = (error: Error | null, row: any) =>
        error
          ? resolve(new Failure("DB._each", error.message))
          : items.push(mapRow(row));

      const handleComplete = (error: Error | null) =>
        error
          ? resolve(new Failure("DB._each", error.message))
          : resolve(items);

      db.each(query, handleCallback, handleComplete);
    });
  }
}
